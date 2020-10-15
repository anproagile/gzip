# Parser

Parse CSS and convert it to a Stylesheet element.

## Usage

Load CSS string

```php

$parser = new \TBela\CSS\Parser();
$parser->setContent('
@import "css/style.css";
body { border: 0px; }');

$parser->setOptions([
    'flatten_import' => true,
    'allow_duplicate_declarations' => true,
    'allow_duplicate_rules' => true
]);

// return an Element
$stylesheet = $parser->parse();

//
echo $stylesheet;
```

Load CSS file

```php

$parser = new \TBela\CSS\Parser();
$parser->load($css_file);

$parser->setOptions([
    'flatten_import' => true,
    'allow_duplicate_declarations' => true,
    'allow_duplicate_rules' => true
]);

// return an Element
$stylesheet = $parser->parse();

//
echo $stylesheet;
```

Allow duplicate rules

```php

use \TBela\CSS\Parser;

$parser = new Parser();

$parser->setOptions(['allow_duplicate_rules' => true, 'allow_duplicate_declarations' => ['background-image']]);

$parser->setContent('
h1 {
  color: green;
  color: blue;
  color: black;
}

h1 {
  color: aliceblue;
  color: #000;
}');

echo $parser->parse();

```

Result

```css
h1 {
  color: #000;
}
h1 {
  color: #f0f8ff;
}
```

Merge duplicate rules


```php
$parser->setOptions(['allow_duplicate_rules' => false]);
echo $parser->parse();
```

Result

```css
h1 {
  color: #f0f8ff;
}
```

## Parser Options

### flatten_import

_boolean_. Default _['@font-face']_. Replace the @import directive with actual content

### allow_duplicate_rules

_boolean_. Default _false_. allow duplicate rules or merge them into one rule

### allow_duplicate_declarations

_boolean_|_string_|_array_. Default _['font-face']_. Remove duplicate declarations under the same rule. If you want to preserve multiple declarations for some properties, you can specify them as a string or an array.

### sourcemap

_boolean_. Include source location. Useful if you intend to build sourcemap (which is not implemented).

## Parser Methods

### Constructor

Constructor

#### Parameters

- \$css: _string_. css string or file path or url
- \$options: _array_. see [parser options](#parser-options)

### Parse

Parse CSS and return the CSS stylesheet

#### Parameters

none

#### Return type

\TBela\Element

#### Throws

\TBela\CSS\Parser\SyntaxError

### SetOptions

Configure the parser options.

#### Parameters

- \$options: _array_. see [parser options](#parser-options)

#### Return type

\TBela\CSS\Parser instance

### Load

#### Parameters

- \$file: _string_. load a css file
- \$media: _string_. optional the css media type

#### Return type

\TBela\CSS\Parser instance

### SetContent

#### Parameters

- \$css: _string_. Css string
- \$media: _string_. optional, the css media

#### Return type

\TBela\CSS\Parser instance

### GetContent

#### Parameters

none

#### Return type

string. the css content that will be parsed

### Append

Parse a css file and append the result to the existing ast

#### Parameters

- $file: _string_. the file to parse
- $media: _string_. optional, the css media type

#### Return type

\TBela\CSS\Parser

#### Throws

\TBela\CSS\Parser\SyntaxError

### appendContent

Parse css content and append the result to the existing ast

#### Parameters

- \$css: _string_. the css to parse
- \$media: _string_. optional, the css media

#### Return type

\TBela\CSS\Parser

#### Throws

\TBela\CSS\Parser\SyntaxError

### Merge

Merge ast of the specified parser instance into this instance ast

#### Parameters

- $parser: _\TBela\CSS\Parser_. 

#### Return type

\TBela\CSS\Parser

#### Throws

\TBela\CSS\Parser\SyntaxError

### GetErrors

#### Parameters

- none

#### Return type

\\Exception[]. an array of exceptions encountered while parsing css.

The parser documentation automatically generated by phpdoc can be found [here](https://htmlpreview.github.io/?https://raw.githubusercontent.com/tbela99/css/master/docs/api/html/index.html)