const svg2img = require('svg2img');
const { parseViewBox } = require('../svg-utils');
const { fixViewBox } = require('./viewbox');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const svgson = require('svgson');
const colorConvert = require('color-convert');

function isBackground(r, g, b, a, bgColor) {
    if (bgColor === 'default') {
        // Checks for transparent or white color
        return a === 0 || (r === 255 && g === 255 && b === 255);
    } else if (bgColor === 'transparent') {
        return a === 0;
    }

    const color = bgColor.startsWith('#') ? colorConvert.hex.rgb(bgColor.substring(1)) : colorConvert.keyword.rgb(bgColor);
    return r === color[0] && g === color[1] && b === color[2];
}

function isPixelBackground(png, x, y, bgColor) {
    const idx = (png.width * y + x) << 2;
    return isBackground(png.data[idx], png.data[idx + 1], png.data[idx + 2], png.data[idx + 3], bgColor);
}

function isRowOnlyBackground(png, y, bgColor) {
    for (let x = 0; x < png.width; x++) {
        if (!isPixelBackground(png, x, y, bgColor)) {
            return false;
        }
    }
    return true;
}

function isColumnOnlyBackground(png, x, bgColor) {
    for (let y = 0; y < png.height; y++) {
        if (!isPixelBackground(png, x, y, bgColor)) {
            return false;
        }
    }
    return true;
}

function getContentBoundingBox(png, bgColor) {
    let bb = {
        x1: 0,
        x2: png.width - 1,
        y1: 0,
        y2: png.height - 1
    };

    // Find top border
    for (let y = 0; y < png.height; y++) {
        if (!isRowOnlyBackground(png, y, bgColor)) {
            break;
        }
        bb.y1 += 1;
    }

    // Find bottom border
    for (let y = png.height - 1; y >= 0; y--) {
        if (!isRowOnlyBackground(png, y, bgColor)) {
            break;
        }
        bb.y2 -= 1;
    }

    // Find left border
    for (let x = 0; x < png.width; x++) {
        if (!isColumnOnlyBackground(png, x, bgColor)) {
            break;
        }
        bb.x1 += 1;
    }

    // Find right border
    for (let x = png.width - 1; x >= 0; x--) {
        if (!isColumnOnlyBackground(png, x, bgColor)) {
            break;
        }
        bb.x2 -= 1;
    }

    return {
        x: bb.x1,
        y: bb.y1,
        width: bb.x2 - bb.x1 + 1,
        height: bb.y2 - bb.y1 + 1
    };
}

async function cropSvg(svg, backgroundColor) {
    const originalSvgJson = svgson.parseSync(svg);
    const viewBox = parseViewBox(originalSvgJson.attributes.viewBox);

    const width = viewBox.width;
    const height = viewBox.height;

    // Compute the PNG ratio so the width or height are at least 1000px
    let ratio = 1;
    while (width * ratio < 1000 && height * ratio < 1000) {
        ratio *= 2;
    }

    if (ratio > 1) {
        svg = fixViewBox(svg, {
            x: viewBox.x,
            y: viewBox.y,
            width: width * ratio,
            height: height * ratio
        });
    }

    const pngRawData = await (new Promise((resolve) => {
        svg2img(svg, {
            preserveAspectRatio: true,
            height: height * ratio,
            width: width * ratio
        }, (error, buffer) => {
            if (error) {
                console.error(error);
            }
            resolve(buffer);
        });
    }));

    if (process.env.SSSVG_DEBUG) {
        fs.writeFileSync('debug/2-convert-to-png.png', pngRawData);
    }

    const png = PNG.sync.read(pngRawData, {
        filterType: -1
    });

    const contentBoundingBox = getContentBoundingBox(png, backgroundColor);

    if (process.env.SSSVG_DEBUG) {
        console.log(`Content bounding box (PNG): ${JSON.stringify(contentBoundingBox)}`);
    }

    const svgContentBoundingBox = {
        x: contentBoundingBox.x / ratio,
        y: contentBoundingBox.y / ratio,
        width: contentBoundingBox.width / ratio,
        height: contentBoundingBox.height / ratio
    };

    if (process.env.SSSVG_DEBUG) {
        console.log(`Content bounding box (SVG viewBox): ${JSON.stringify(svgContentBoundingBox)}`);
    }

    // Set the new viewBox of the cropped SVG
    originalSvgJson.attributes.viewBox = `${svgContentBoundingBox.x} ${svgContentBoundingBox.y} ${svgContentBoundingBox.width} ${svgContentBoundingBox.height}`;
    return svgson.stringify(originalSvgJson);
}

module.exports = {
    cropSvg
};
