
# view-interpolate

  Plugin for view to add interpolation. This will allow views to interpolate expressions in strings using the view state. Whenever the state changes the string will be re-rendered.

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripples/view-interpolate

## Usage

Add this as a plugin for the view:

```js
View.use(interpolate);
```

## API

This plugin adds a number of methods to the view for interpolating expressions in strings.

### Static Properties

```js
View.filter('foo', fn);
```

Add a [new filter](https://github.com/ripplejs/interpolate#getting-started) that can be used in expressions.

```js
View.delimiters(regex)
```

Set the regex used for finding expressions in strings. By default this looks for `{{ expression }}`

### Instance Properties

```js
view.interpolate('Hello {{planet}}', callback)
```

Interpolate a string using values on the view's state. In this case it will lookup the `planet` property on the views state. If it can't find it on the current view, it will look at the views owner and trace back up the tree.

If a property can't be found it will throw an error.

## License

  The MIT License (MIT)

  Copyright (c) 2014 <copyright holders>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.