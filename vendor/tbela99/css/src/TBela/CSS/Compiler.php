<?php

namespace TBela\CSS;

use Exception;
use TBela\CSS\Interfaces\ElementInterface;

/**
 * Css Compiler
 * @package TBela\CSS
 */
class Compiler {

    /**
     *
     * @var array|string[]
     * @ignore
     */
    protected $properties = [
        'indent',
        'glue',
        'separator',
        'charset',
        'convert_color',
        'compress',
        'css_level',
        'remove_comments',
        'compute_shorthand',
        'remove_empty_nodes',
        'allow_duplicate_declarations'
    ];

    /**
     * @var array
     * @ignore
     */
    protected $options = [];

    /**
     * @var ElementInterface
     * @ignore
     */
    protected $data;

    /**
     * Compiler constructor.
     * @param array $options
     */
    public function __construct (array $options = []) {

        $this->setOptions($options);
    }

    /**
     * set compiler options
     * @param array $options
     * @return $this
     */
    public function setOptions (array $options) {

        foreach ($options as $key => $value) {

            if (in_array($key, $this->properties)) {

                $this->options[$key] = $value;
            }
        }

        return $this;
    }

    public function getOptions() {

        return $this->options;
    }

    /**
     * set css content
     * @param string $css
     * @param array $options
     * @return Compiler
     * @throws Parser\SyntaxError
     */
    public function setContent ($css, array $options = []) {

        $this->data = (new Parser($css, $options))->parse();
        return $this;
    }

    /**
     * load css content from a file
     * @param string $file
     * @param string $media
     * @param array $options
     * @return $this
     * @throws Parser\SyntaxError
     */

    public function load ($file, array $options = [], $media = '') {

        $this->data = (new Parser('', $options))->load($file, $media)->parse();
        return $this;
    }

    /**
     * load content from an element or AST
     * @param ElementInterface|object $ast
     * @return Compiler
     */
    public function setData ($ast) {

        $this->data = $ast instanceof ElementInterface ? $ast : Element::getInstance($ast);
        return $this;
    }

    /**
     * return the element generated by the css parser
     * @return ElementInterface
     */
    public function getData () {

        return $this->data;
    }

    /**
     * compile css
     * @return string
     * @throws Exception
     */
    public function compile () {

        if (isset($this->data)) {

            return (new Renderer($this->options))->render($this->data);
        }

        return '';
    }
}