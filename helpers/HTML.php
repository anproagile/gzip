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

use JURI;
use function preg_replace_callback;
use function strlen;

class HTMLHelper {

	public function preProcessHTML($html, array $options = []) {

		$debug = empty($options['debug']) ? '.min' : '';

		if (!empty($options['fix_invalid_html'])) {

			/*
			 * attempt to fix invalidHTML - missing space between attributes -  before minifying
			 * <div id="foo"class="bar"> => <div id="foo" class="bar">
			 */
			$html = preg_replace_callback('#<(\S+)([^>]+)>#s', function ($matches) {

				$result = '<'.$matches[1];

				if (trim($matches[2]) !== '') {

					$in_str = false;
					$quote = '';

					$j = strlen($matches[2]);

					for ($i = 0; $i < $j; $i++) {

						$result .= $matches[2][$i];

						if ($in_str) {

							if ($matches[2][$i] == $quote) {

								$in_str = false;
								$result .= ' ';
								$quote = '';
							}
						}

						else if (in_array($matches[2][$i], ['"', "'"])) {

							$in_str = true;
							$quote = $matches[2][$i];
						}
					}
				}

				return rtrim($result).'>';
			}, $html);
		}

		// quick test
		$hasScript = stripos($html, '<script') !== false || stripos($html, '<link ') !== false;

		$script = '';
		$css = '';

		if ($hasScript || !empty($options['imagesvgplaceholder'])) {

			$script .= file_get_contents(__DIR__.'/../js/dist/lib.'.(!empty($options['imagesvgplaceholder']) ? 'images' : 'ready').$debug.'.js');
			$script .= file_get_contents(__DIR__.'/../loader'.$debug.'.js');

			if (!empty($options['imagesvgplaceholder'])) {

				$script .=  file_get_contents(__DIR__.'/../imagesloader'.$debug.'.js');
				$css .= '<style type="text/css" data-position="head">'.file_get_contents(__DIR__.'/../css/images.css').'</style>';
			}
		}

		if(!empty($script)) {

			$html = str_replace('</head>', $css.'<script data-position="head" data-ignore="true">'.$script.'</script></head>', $html);
		}

		$script = '';

		if (!empty($options['instant_loading_enabled'])) {

			$script .= file_get_contents(__DIR__.'/../worker/dist/browser.prefetch'.$debug.'.js');

			$path = JPATH_SITE.'/cache/z/app/'.$_SERVER['SERVER_NAME'].'/config.php';

			if (is_file($path)) {

				include $path;
			}

			if (!empty($php_config['instantloading'])) {

				$html = str_replace('<body', '<body data-instant-'.implode(' data-instant-', $php_config['instantloading']), $html);
			}
		}

		if(!empty($script)) {

			$html = str_replace('</body>','<script>'.$script.'</script></body>', $html);
		}

		return $html;
	}

	/**
	 * html minification
	 * @param string $html
	 * @param array $options
	 * @return string
	 * @since 1.0
	 */
	public function postProcessHTML ($html, array $options = []) {

		if (empty($options['minifyhtml'])) {

			return $html;
		}

		$scripts = [];

		$self = [

			'meta',
			'link',
			'br',
			'base',
			'input'
		];

		$html = str_replace(JURI::getInstance()->getScheme().'://', '//', $html);
		$html = preg_replace_callback('#<html(\s[^>]+)?>(.*?)</head>#si', function ($matches) {

			return '<html'.$matches[1].'>'. preg_replace('#>[\r\n\t ]+<#s', '><', $matches[2]).'</head>';
		}, $html, 1);

		//remove optional ending tags (see http://www.w3.org/TR/html5/syntax.html#syntax-tag-omission )
		$remove = [
			'</rt>', '</rp>', '</caption>',
			'</option>', '</optgroup>', '</li>', '</dt>', '</dd>', '</tr>', '</th>', '</td>', '</thead>', '</tbody>', '</tfoot>', '</colgroup>'
		];

		if(stripos($html, '<!DOCTYPE html>') !== false) {

			$remove = array_merge($remove, [

				'<head>',
				'</head>',
				'<body>',
				'</body>',
				'<html>',
				'</html>'
			]);
		}

		$html = str_ireplace($remove, '', $html);

		// minify html
		//remove redundant (white-space) characters
		$replace = [

			'#<(('.implode(')|(', $self).'))(\s[^>]*?)?/>#si' => '<$1$'.(count($self) + 2).'>',
			//remove tabs before and after HTML tags
			'#<!--.*?-->#s' => '',
			'/\>[^\S ]+/s' => '>',
			'/[^\S ]+\</s' => '<',
			//shorten multiple whitespace sequences; keep new-line characters because they matter in JS!!!
			'/([\t\r\n ])+/s' => ' ',
			//remove leading and trailing spaces
			'/(^([\t ])+)|(([\t ])+$)/m' => '',
			//remove empty lines (sequence of line-end and white-space characters)
			'/[\r\n]+([\t ]?[\r\n]+)+/s' => ''
		];

		$root = JURI::root(true).'/';

		//remove quotes from HTML attributes that does not contain spaces; keep quotes around URLs!
		$html = preg_replace_callback('~([\r\n\t ])?([a-zA-Z0-9:]+)=(["\'])([^\s\3]+)\3([\r\n\t ])?~', function ($matches) use ($options, $root) {

			$result = $matches[1].$matches[2].'=';

			if (!empty($options['parse_url_attr']) && array_key_exists($matches[2], $options['parse_url_attr']) && !preg_match('#^([a-z]+:)?//#', $matches[4]) && is_file($matches[4])) {

				$result .= $root.$matches[4];
			}

			else {

				$result .= $matches[4];
			}

			return $result.$matches[5];
		}, $html);

		$html = preg_replace('#<!DOCTYPE ([^>]+)>[\n\s]+#si', '<!DOCTYPE $1>', $html, 1);
		$html = preg_replace(array_keys($replace), array_values($replace), $html);

		if (!empty($scripts)) {
			$html = str_replace(array_keys($scripts), array_values($scripts), $html);
		}

		$html = preg_replace_callback('#<([^>]+)>#s', function ($matches) {

			return '<'.rtrim($matches[1]).'>';
		}, $html);

		return $html;
	}
}