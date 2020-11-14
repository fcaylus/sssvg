# Super Slim SVG (sssvg)
[![npm version](https://img.shields.io/npm/v/sssvg?style=flat-square)](https://www.npmjs.com/package/sssvg)

Optimize SVGs and create Super Slim SVGs ! (based on [svgo](https://github.com/svg/svgo))

Applies 10 passes of SVGO (with agressive parameters)

## How to use it ?

- CLI
```
Usage: sssvg [options] <input> <output>

Optimize SVGs and create Super Slim SVGs !

Arguments:
  input            Input SVG file
  output           Output SVG file or directory (if it doesn't match *.svg)

Options:
  -V, --version    output the version number
  -d, --directory  Treat input as a directory and optimize all SVGs inside
  -r, --recursive  Explore input directory recursively. Requires -d or --directory
  -c, --crop       Crop SVGs to its content, and change the view box accordingly
  -h, --help       display help for command
```

- Node.js
```javascript
const { optimizeSVG } = require('sssvg');

console.log(await optimizeSVG('test.svg', svgFileData, { crop: false }));
```

## Licence

Licensed under the MIT license. See LICENSE file for more info
