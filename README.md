# Super Slim SVG (sssvg)
[![npm version](https://img.shields.io/npm/v/sssvg?style=flat-square)](https://www.npmjs.com/package/sssvg)

Optimize SVGs and create Super Slim SVGs ! (based on [svgo](https://github.com/svg/svgo))

Applies 10 passes of SVGO (with agressive parameters), crop the svg to its content, and resize the viewBox as you want !

Note: The crop feature is based on [svg-autocrop](https://github.com/cncf/svg-autocrop) and requires a transparent or white background.

## Features
- Optimize SVGs
- Crop the SVG to its content
- Resize the viewBox (with the same aspect ratio, or not, as you want !)

## How to use it ?

- CLI
```
Usage: sssvg [options] <input> <output>

Optimize SVGs and create Super Slim SVGs !

Arguments:
  input                 Input SVG file
  output                Output SVG file or directory (if it doesn't match *.svg)

Options:
  -V, --version         output the version number
  -d, --directory       Treat input as a directory and optimize all SVGs inside
  -r, --recursive       Explore input directory recursively. Requires -d or --directory
  -c, --crop            Crop SVGs to its content, and change the view box accordingly
  --view-box <viewBox>  Change the viewBox to match the one provided (and resize the SVG accordingly). Shorthand for --x, --y, --width and --height together
  --x <x>               Change the x value of the viewBox
  --y <y>               Change the y value of the viewBox
  --width <width>       Change the width value of the viewBox
  --height <height>     Change the height value of the viewBox
  -h, --help            display help for command
```

- Node.js
```javascript
const fs = require('fs');
const { optimizeSVG } = require('sssvg');

const svgFileData = fs.readFileSync('test.svg', 'utf8');
console.log(await optimizeSVG('test.svg', svgFileData, { 
    crop: false,
    viewBox: {
        x: 0,
        y: 0,
        height: 1000,
        // Will preserve aspect ratio
        width: undefined
    }
}));
```

## Licence

Licensed under the MIT license. See LICENSE file for more info.
