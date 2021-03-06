<?php

/**
 * @package     GZip Plugin
 * @subpackage  System.Gzip *
 * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
 *
 * dual licensed
 *
 * @license     LGPL v3
 * @license     MIT License
 */

namespace Gzip\Helpers;

use Gzip\GZipHelper;
use TBela\CSS\Element;
use TBela\CSS\Element\Stylesheet;
use TBela\CSS\Interfaces\ElementInterface;
use TBela\CSS\Interfaces\RuleListInterface;
use TBela\CSS\Parser;
use TBela\CSS\Renderer;
use TBela\CSS\Value;
use function file_get_contents;
use function file_put_contents;
use function preg_replace_callback;

class CSSHelper
{

	/**
	 * @throws \SodiumException
	 * @throws \Exception
	 * @since
	 */
	public function preProcessHTML(array $options, $html)
	{

		if (empty($options['criticalcssenabled']) || trim($options['criticalcssviewports']) === '') {

			return $html;
		}

		$min = empty($options['minifyjs']) ? '' : '.min';

		$data = [
			'url' => $options['request_uri'],
			'dimensions' => preg_split('#\s+#s', $options['criticalcssviewports'], -1, PREG_SPLIT_NO_EMPTY)
		];

		usort($data['dimensions'], function ($a, $b) {

			$a = +explode('x', $a)[0];
			$b = +explode('x', $b)[0];

			return $b - $a;
		});

		$key = hash_hmac('sha256', $options['template'] . json_encode($data), $options['expiring_links']['secret']);
		$path = $options['cri_path'];

		$path .= $key . '_';

		$paths = [];
		$matched = [];
		$data['dimensions'] = array_values(array_filter($data['dimensions'], function ($dimension) use ($path, &$paths, &$matched) {

			$dimension = preg_replace('#[^x0-9]+#', '', $dimension);

			if (!is_file($path . $dimension . '.css')) {

				return true;
			}

			$matched[] = $dimension;
			$paths[] = $path . $dimension;
			return false;
		}));

		// filter matched resolutions
		// lower matched resolutions must be removed
		if (!empty($matched)) {

			$matched = array_filter($matched, function ($value) use ($data) {

				$value = intval($value);
				foreach ($data['dimensions'] as $dimension) {

					if (intval($dimension) >= $value) {

						return false;
					}
				}

				return true;
			});
		}

		$replace = '';
		$jsMin = !empty($options['minifyjs']) ? '.min' : '';

		if (!empty($paths)) {

			$paths = array_reverse($paths);
			$checksum = $options['cri_path'] . 'chk_' . hash('md5', json_encode($paths)) . '_' . implode('_', $data['dimensions']);

			if (!is_file($checksum . '.css')) {

				$css = '';
				$fontList = [];

				foreach ($paths as $p) {

					$css .= "\n" . file_get_contents($p . '.css');

					if (is_file($p . '.php')) {

						$fonts = [];

						require $p . '.php';

						$fontList = array_merge($fontList, $fonts);
					}
				}

				if (trim($css) !== '') {

					$parser = new Parser($css);

					file_put_contents($checksum . '.css', $parser);
					file_put_contents($checksum . '.min.css', (new Renderer(['compress' => true]))->renderAst($parser));
				}

				if (!empty($fontList)) {

					file_put_contents($checksum . '.js', str_replace('"{WEB_FONTS}"', json_encode(array_values($fontList), JSON_PRETTY_PRINT), file_get_contents(__DIR__ . '/../worker/dist/fontloader.js')), JSON_PRETTY_PRINT);
					file_put_contents($checksum . '.min.js', str_replace('"{WEB_FONTS}"', json_encode(array_values($fontList)), file_get_contents(__DIR__ . '/../worker/dist/fontloader.min.js')));
				}
			}

			if (is_file($checksum . $min . '.css')) {

				$replace .= "\n".'<style data-ignore="true">' . file_get_contents($checksum . $min . '.css') . '</style>' . "\n";
			}

			if (is_file($checksum . $jsMin . '.js')) {

				$replace .= "\n".'<script data-ignore="true">' . file_get_contents($checksum . $jsMin . '.js') . '</script>' . "\n";
			}
		}

		if (!empty($data['dimensions'])) {

			$dt = new \DateTime();
			$dt->modify('+40s');

			$nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
			$secret = bin2hex($nonce . sodium_crypto_secretbox(json_encode([
					'key' => $key,
					'duration' => $dt->getTimestamp()
				]), $nonce, hex2bin($key)));

			$data['hash'] = $secret;

			$script = '<script>' . file_get_contents(__DIR__ . '/../worker/dist/critical' . $jsMin . '.js') . '</script>' .
				'<script>' . str_replace(
					['"{CRITICAL_URL}"', '"{CRITICAL_POST_URL}"', '"{CRITICAL_DIMENSIONS}"', '"{CRITICAL_MATCHED_VIEWPORTS}"', '"{CRITICAL_HASH}"'],
					[json_encode($data['url']), json_encode(GZipHelper::CRITICAL_PATH_URL), json_encode($data['dimensions']), json_encode($matched), json_encode($data['hash'])],
					file_get_contents(__DIR__ . '/../worker/dist/critical-extract' . $jsMin . '.js')) . '
</script>';

			$replace .= $script . "\n";
		}

		if (!empty($replace)) {

			$search = '</head>';

			if (preg_match('#(<meta\s*charset=[^>]+>)#', $html, $match)) {

				return str_replace($match[1], $match[1] . $replace, $html);
			}

			return str_replace('</head>', $replace . '</head>', $html);
		}

		return $html;
	}

	/**
	 * @param array $options
	 * @param string $html
	 * @return string
	 *
	 * @throws Parser\SyntaxError
	 * @since
	 */
	public function processHTML(array $options, $html)
	{

		$path = $options['css_path'];

		$fetch_remote = !empty($options['fetchcss']);

		$links = [];
		$ignore = !empty($options['cssignore']) ? $options['cssignore'] : [];
		$remove = !empty($options['cssremove']) ? $options['cssremove'] : [];

		$async = !empty($options['asynccss']) || !empty($options['criticalcssenabled']);

		$css_renderer_options = isset($options['css_renderer']) ? $options['css_renderer'] : [
			'compress' => !empty($options['minifycss'])
		];

		$css_parser_options = isset($options['css_parser']) ? $options['css_parser'] : [];

		$hashFile = GZipHelper::getHashMethod($options);
		$cssParser = new Parser('', $css_parser_options);
		$cssRenderer = new Renderer($css_renderer_options);
		$headStyle = new Stylesheet();

		$fetchFonts = function ($node) use ($options, $headStyle) {

			/**
			 * @var Element\AtRule $node
			 */

			if ((string)$node['name'] == 'font-face') {

				$query = $node->query('./[@name=src]');

				/**
				 * @var ElementInterface $query
				 */

				$query = end($query);

				if ($query) {

					foreach ($query as $q) {

						$q->getValue()->map(function ($value) {

							/**
							 * @var Value $value
							 */

							if ($value->type == 'css-url') {

								$name = GZipHelper::getName(preg_replace('#(^["\'])([^\1]+)\1#', '$2', trim($value->arguments->{0})));

								if (GZipHelper::isFile($name)) {

									return Value::getInstance((object)[
										'name' => 'url',
										'type' => 'css-url',
										'arguments' => new Value\Set([
											Value::getInstance((object)[
												'type' => 'css-string',
												'value' => GZipHelper::url($name)
											])
										])
									]);
								}
							}

							return $value;
						});
					}

					$copy = $query->copy();

					$declaration = new Element\Declaration();
					$declaration->setName('font-display');
					$declaration->setValue($options['fontdisplay']);

					/**
					 * @var RuleListInterface
					 */
					$copy->getParent()->insert($declaration, 0);

					$headStyle->append($copy->getRoot());
				}
			}
		};

		$parseUrls = function ($css) use ($path) {

			return preg_replace_callback('~url\(([^)]+)\)~', function ($matches) use ($path) {

				$url = preg_replace('~^(["\'])?([^\1]+)\1~', '$2', trim($matches[1]));

				if (strpos($matches[0], 'data:') !== false) {

					return $matches[0];
				}

				if (preg_match_all('~^(https?:)?//~', $url)) {

					$parts = explode('/', parse_url($url)['path']);
					$localName = $path . GZipHelper::shorten(crc32($url)) . '-' . GZipHelper::sanitizeFileName(end($parts));

					if (!is_file($localName)) {

						$data = Parser\Helper::fetchContent($url);

						if ($data !== false) {

							file_put_contents($localName, $data);
						}
					}

					if (is_file($localName)) {

						return 'url(' . GZipHelper::url($localName) . ')';
					}
				}

				if (substr($url, 0, 1) != '/') {

					return 'url(' . GZipHelper::url($url) . ')';
				}

				return $matches[0];
			}, $css);
		};

		$profiler = \JProfiler::getInstance('Application');
		$profiler->mark('CssInit');

		$html = preg_replace_callback('#<(' . (empty($options['parseinlinecss']) ? 'link' : '[^\s>]+') . ')([^>]*)>#', function ($matches) use ($css_renderer_options, $cssRenderer, $parseUrls, &$links, $ignore, $remove, $cssParser, $path, $fetch_remote, $options) {

			$attributes = [];

			if (preg_match_all(GZipHelper::regexAttr, $matches[2], $attr)) {

				foreach ($attr[2] as $k => $att) {

					$attributes[$att] = $attr[6][$k];
				}
			}

			if ($matches[1] != 'link' && $matches[1] != 'style') {

				// parsing css can be expansive
				// let do it only when needed
				if (!empty($options['parseinlinecss']) &&
					!empty($attributes['style']) &&
					strpos($attributes['style'], 'background') !== false &&
					strpos($attributes['style'], 'url(') !== false &&
					!empty($attributes['style'])) {

					$attributes['style'] = str_replace("\n", '', trim(preg_replace('~^\.foo\s*\{([^}]+)\}~s', '$1', $cssRenderer->render((new Parser('.foo { ' . preg_replace_callback('~url\(([^)]+)\)~', function ($matches) use ($options) {

							$name = GZipHelper::getName(ImagesHelper::fetchRemoteImage(preg_replace('#(^["\'])([^\1]+)\1#', '$2', trim($matches[1])), $options));

							if (strpos($matches[0], 'data:') !== false || !GZipHelper::isFile($name)) {

								return $matches[0];
							}

							return 'url(' . GZipHelper::url($name) . ')';

						}, $attributes['style']) . ' }', $css_renderer_options))->parse()))));

					$result = '<' . $matches[1] . ' ';

					foreach ($attributes as $key => $value) {

						$result .= $key . '="' . $value . '" ';
					}

					return rtrim($result) . '>';
				}

				return $matches[0];
			}

			if (!empty($attributes)) {

				if (isset($attributes['rel']) && in_array($attributes['rel'], ['stylesheet', 'lazy-stylesheet']) && isset($attributes['href'])) {

					$name = GZipHelper::getName($attributes['href']);
					$position = isset($attributes['data-position']) && $attributes['data-position'] == 'head' ? 'head' : 'body';

					unset($attributes['data-position']);

					foreach ($remove as $r) {

						if (strpos($name, $r) !== false) {

							return '';
						}
					}

					foreach ($ignore as $i) {

						if (strpos($name, $i) !== false) {

							return $matches[0];
						}
					}

					if ($fetch_remote && preg_match('#^((https?:)?)//#', $name)) {

						$remote = $attributes['href'];

						if (strpos($name, '//') === 0) {

							$remote = $options['scheme'] . ':' . $name;
						}

						$parts = parse_url($remote);
						$local = $path . GZipHelper::shorten(crc32($remote)) . '-' . GZipHelper::sanitizeFileName(basename($parts['path'])) . '.css';

						if (!is_file($local)) {

							$clone = clone $cssParser;
							$clone->load($remote);

							file_put_contents($local, $parseUrls($clone->parse()));
						}

						if (is_file($local)) {

							$name = $local;
						}
					}

					if (GZipHelper::isFile($name)) {

						$attributes['href'] = $name;
						$links[$position]['links'][$name] = $attributes;
						return '';
					}
				}
			}

			return $matches[0];
		}, $html);

		$profiler->mark('CssParseHTML');

		if (!empty($options['mergecss'])) {

			foreach ($links as $position => $blob) {

				$hash = '';

				if (!empty($blob['links'])) {

					foreach ($blob['links'] as $attr) {

						$hash .= $hashFile($attr['href']);
						$media = isset($attr['media']) && $attr['media'] != 'all' ? $attr['media'] : '';

						$hash .= $media;
					}

					$file = $path . GZipHelper::shorten(crc32($hash)) . '-main' . (!empty($css_renderer_options['compress']) ? '.min' : '') . '.css';

					if (!is_file($file)) {

						foreach ($blob['links'] as $key => $attr) {

							$cssParser->append($attr['href'], isset($attr['media']) && $attr['media'] != 'all' && $attr['media'] !== '' ? $attr['media'] : '');
						}

						file_put_contents($file, $parseUrls($cssRenderer->render($this->parseBackgroundImages($cssParser->parse()->traverse($fetchFonts, 'enter'), $options))));
					}

					$links[$position]['links'] = [
						[
							'href' => $file,
							'rel' => 'stylesheet'
						]
					];
				}
			}
		}

		$profiler->mark('CssMergeFile');

		if (empty($options['mergecss']) && !empty($css_renderer_options['compress'])) {

			foreach ($links as $position => $blob) {

				if (!empty($blob['links'])) {

					$file = '';

					foreach ($blob['links'] as $attr) {

						$hash = $hashFile($attr['href']) . (isset($attr['media']) && $attr['media'] != 'all' ? $attr['media'] : '');

						$file = $path . GZipHelper::shorten(crc32($hash)) . '-' .
							GZipHelper::sanitizeFileName(pathinfo($attr['href'], PATHINFO_BASENAME)) .
							(!empty($css_renderer_options['compress']) ? '.min' : '') . '.css';

						if (!is_file($file)) {

							$cssParser->load($attr['href'], isset($attr['media']) && $attr['media'] != 'all' && $attr['media'] !== '' ? $attr['media'] : '');
							file_put_contents($file, $parseUrls($cssRenderer->render($this->parseBackgroundImages($cssParser->parse()->traverse($fetchFonts, 'enter'), $options))));
						}
					}

					$links[$position] = [
						[
							'href' => $file
						]
					];
				}
			}
		}

		$profiler->mark('CssMergeStyle');
		$cssParser->setContent('');

		$css_hash = '';
		$stylesheets = [];

		foreach ($links as $values) {

			foreach ($values['links'] as $value) {

				if (isset($value['href']) && GZipHelper::isFile($value['href']) && isset($value['rel']) && $value['rel'] == 'stylesheet') {

					$media = !empty($link['media']) && $link['media'] != 'all' ? $link['media'] : '';
					$css_hash .= $value['href'] . ($media ? '-' . $media : '');
					$stylesheets[] = [$value['href'], $media];
				}
			}
		}

		$html = preg_replace_callback('#(<style[^>]*>)(.*?)</style>#si', function ($matches) use (&$links, $css_renderer_options, $parseUrls) {

			$attributes = [];

			if (preg_match_all(GZipHelper::regexAttr, $matches[1], $attr)) {

				foreach ($attr[2] as $k => $att) {

					$attributes[$att] = $attr[6][$k];
				}
			}

			if ((isset($attributes['type']) && $attributes['type'] != 'text/css')) {

				return $matches[0];
			}

			if (isset($attributes['data-ignore'])) {

				unset($attributes['style']);
				unset($attributes['data-ignore']);

				$result = '<style';

				foreach ($attributes as $key => $value) {

					$result .= " $key=\"$value\"";
				}

				return $result.'>'.$matches[2].'</style>';
			}

			$position = isset($attributes['data-position']) && $attributes['data-position'] == 'head' ? 'head' : 'body';
			$matches[2] = $parseUrls($matches[2]);
			$links[$position]['style'][] = !empty($css_renderer_options['compress']) ? (new Renderer($css_renderer_options))->renderAst(new Parser($matches[2])) : $parseUrls($matches[2]);

			return '';
		}, $html);

		$profiler->mark('CssParseStyle');

		// resize background images
		if (!empty($options['imagecssresize']) && !empty($options['css_sizes'])) {

			$css_hash .= '|parseCssResize' . json_encode($options['css_sizes']);

			$css_hash = $path . GZipHelper::shorten(crc32($css_hash)) . (empty($options['compress']) ? '' : '.min') . '.css';

			if (!is_file($css_hash) && !empty($stylesheets)) {

				foreach ($stylesheets as $stylesheet) {

					$cssParser->append($stylesheet[0], $stylesheet[1]);
				}

				$profiler->mark('CssParseObject');
				$headStyle->deduplicate();

				file_put_contents($css_hash, $cssRenderer->render($this->parseBackgroundImages($headStyle, $options)));

				$profiler->mark('CssDedup');
			}

			if (is_file($css_hash)) {

				if (!isset($links['head']['style'])) {

					$links['head']['style'] = [];
				}

				array_unshift($links['head']['style'], file_get_contents($css_hash));
			}
		}

		$headStyle->removeChildren();
		$style = '';

		foreach ($links as $key => $blob) {

			if (!empty($blob['style'])) {

				$style .= implode('', $blob['style']);
				unset($links[$key]['style']);
			}
		}

		$search = [];
		$replace = [];

		$head_string = '';
		$body_string = '';
		$noscript = '';

		if ($style !== '') {

			$headStyle->append($this->parseBackgroundImages((new Parser($style, $css_renderer_options))->parse(), $options));

			if ($headStyle->hasChildren()) {

				$profiler->mark('CssStyle');
				$headStyle->deduplicate();
				$profiler->mark('CssRender');
				$head_string .= '<style>' . $cssRenderer->render($headStyle) . '</style>' . "\n";
			}
		}

		$profiler->mark('CssHead');

		foreach ($links as $position => $blob) {

			if (isset($blob['links'])) {

				foreach ($blob['links'] as $key => $link) {

					if ($async) {

						$link['data-media'] = isset($link['media']) ? $link['media'] : 'all';
						$link['media'] = 'print';
					}

					//
					$css = '<link';
					reset($link);

					foreach ($link as $attr => $value) {

						$css .= ' ' . $attr . '="' . $value . '"';
					}

					$css .= '>' . "\n";

					if ($async) {

						if (isset($link['media'])) {

							$noscript .= str_replace([' media="print"', 'data-media'], ['', 'media'], $css);
						} else {

							$noscript .= $css;
						}
					}

					$links[$position]['links'][$key] = $css;
				}

				${$position . '_string'} .= implode('', $links[$position]['links']);
			}

			if (!empty($blob['style'])) {

				$style = trim(implode('', $blob['style']));

				if ($style !== '') {

					${$position . '_string'} .= '<style>' . $style . '</style>' . "\n";
				}
			}
		}

		if ($head_string !== '' || $noscript != '') {

			if ($noscript != '') {

				$head_string .= '<noscript>' . $noscript . '</noscript>' . "\n";
			}

			$search[] = '</head>';
			$replace[] = $head_string . "\n" . '</head>';
		}

		if ($body_string !== '') {

			$search[] = '</body>';
			$replace[] = $body_string . '</body>';
		}

		if (!empty($search)) {

			$search[] = '<noscript></noscript>';
			$replace[] = '';

			$html = str_replace($search, $replace, $html);
		}

		$profiler->mark('CssWrapUp');
		return $html;
	}

	/**
	 * @param array $options
	 * @throws \SodiumException
	 * @since 3.0
	 */
	public function afterInitialise(array $options)
	{

		if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['REQUEST_URI'] == GZipHelper::CRITICAL_PATH_URL && isset($_SERVER['HTTP_X_SIGNATURE'])) {

			$dimensions = preg_split('#\s+#s', $options['criticalcssviewports'], -1, PREG_SPLIT_NO_EMPTY);

			usort($dimensions, function ($a, $b) {

				$a = +explode('x', $a)[0];
				$b = +explode('x', $b)[0];

				return $b - $a;
			});

			$signatures = explode('.', $_SERVER['HTTP_X_SIGNATURE']);

			$raw = file_get_contents('php://input');
			$post = json_decode($raw, JSON_OBJECT_AS_ARRAY);

			if (count($signatures) != 2 ||
				!is_array($post) ||
				!isset($post['url']) ||
				!isset($post['css']) ||
				!isset($post['fonts']) ||
				!is_array($post['fonts']) ||
				!isset($_SERVER['HTTP_X_SIGNATURE']) ||
				!isset($post['dimension']) ||
				!in_array($post['dimension'], $dimensions)) {

				http_response_code(400);
				exit;
			}

			$data = [

				'url' => $post['url'],
				'dimensions' => $dimensions
			];

			// compute the key used to sign data
			$hash = hash_hmac('sha256', $options['template'] . json_encode($data), $options['expiring_links']['secret']);

			if ($_SERVER['HTTP_X_SIGNATURE'] != $signatures[0] . '.' . hash('sha256', $signatures[0] . $raw)) {

				http_response_code(400);
				exit;
			}

			$raw_message = hex2bin($signatures[0]);
			$nonce = substr($raw_message, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
			$encrypted_message2 = substr($raw_message, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
			$decrypted_message = sodium_crypto_secretbox_open($encrypted_message2, $nonce, hex2bin($hash));

			$encrypted_data = json_decode($decrypted_message, JSON_OBJECT_AS_ARRAY);

			if (!is_array($encrypted_data) ||
				!isset($encrypted_data['key']) ||
				$encrypted_data['key'] != $hash ||
				!isset($encrypted_data['duration'])) {

				http_response_code(400);
				exit;
			}

			if ($encrypted_data['duration'] > time()) {

				http_response_code(410);
				exit;
			}

			$path = $options['cri_path'];

			if (!is_dir($path)) {

				$old_mask = umask();

				umask(022);
				mkdir($path, 0755, true);
				umask($old_mask);
			}

			header('Content-Type: application/json; charset=utf-8');
			file_put_contents($path . '/' . $hash . '_' . $post['dimension'] . '.css', new Parser($post['css']));

			$fonts = [];

			foreach ($post['fonts'] as $font) {

				$fonts[md5(json_encode($font))] = $font;
			}

			$fontFile = $path . '/' . $hash . '_' . $post['dimension'] . '.php';

			if (!empty($fonts)) {

				file_put_contents($fontFile, '<?php' . "\n
defined('JPATH_PLATFORM') or die;
\$fonts = " . var_export($fonts, true) . ';');
			} else if (is_file($fontFile)) {

				unlink($fontFile);
			}

			echo 1;
			exit;
		}
	}

	/** generate responsive background images
	 * @param Element $headStyle
	 * @param array $options
	 *
	 * @return Element|RuleListInterface
	 *
	 * @throws Parser\SyntaxError
	 * @since version
	 */
	public function parseBackgroundImages(Element $headStyle, array $options = [])
	{

		if (empty($options['imagecssresize']) || empty($options['css_sizes'])) {

			return $headStyle;
		}

		$stylesheet = new Stylesheet();

		/**
		 * @var Element\Declaration $property
		 */
		foreach ($headStyle->query('[@name="background"]|[@name="background-image"]') as $property) {

			$images = [];
			$property->getValue()->map(function ($value) use (&$images) {

				/**
				 * @var Value $value
				 */

				if ($value->type == 'css-url') {

					$name = GZipHelper::getName(preg_replace('#(^["\'])([^\1]+)\1#', '$2', trim($value->arguments->{0})));

					// honor the "ignore image" setting
					if ((empty($options['imageignore']) ||
							strpos($name, $options['imageignore']) === false) &&
						in_array(strtolower(pathinfo($name, PATHINFO_EXTENSION)), ['jpg', 'png', 'webp'])) {

						$images[] = $name;
					}

					if (GZipHelper::isFile($name)) {

						return Value::getInstance((object)[
							'name' => 'url',
							'type' => 'css-url',
							'arguments' => new Value\Set([
								Value::getInstance((object)[
									'type' => 'css-string',
									'value' => GZipHelper::url($name)
								])
							])
						]);
					}
				}

				return $value;
			});

			// ignore multiple backgrounds for now
			if (count($images) == 1) {

				foreach ($images as $file) {

					$set = array_reverse(ImagesHelper::generateSrcSet($file, $options['css_sizes'], $options), true);

					$keys = array_keys($set);
					$values = array_values($set);
					$property->setValue('url(' . array_shift($values) . ')');

					while ($value = array_shift($values)) {

						$rule = $stylesheet->addAtRule('media', Element\AtRule::ELEMENT_AT_RULE_LIST);

						$prop = $property->copy();
						$prop->setValue('url(' . $value . ')');
						$rule->setValue('(min-width: ' . (array_shift($keys) + 1) . 'px)');
						$rule->append($prop->getRoot());
					}
				}

				/**
				 * @var RuleListInterface $headStyle
				 */
				$headStyle->append($stylesheet);
			}
		}

		$headStyle->append($stylesheet);
		return $headStyle;
	}
}