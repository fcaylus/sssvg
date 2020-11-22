const { runSVGO } = require('./steps/svgo');
const { fixViewBox } = require('./steps/viewbox');
const { cropSvg } = require('./steps/crop');
const { isSvgEmpty } = require('./svg-utils');
const fs = require('fs');

function writeDebugFile(data, step, text) {
    if (process.env.SSSVG_DEBUG) {
        fs.writeFileSync(`debug/${step}-${text}.svg`, data);
    }
}

async function optimizeSVG(filePath, svg, options) {
    const opts = {
        crop: false,
        viewBox: undefined,
        backgroundColor: 'default',
        ...options
    };

    if (process.env.SSSVG_DEBUG) {
        if (!fs.existsSync('debug/')) {
            fs.mkdirSync('debug/');
        }
    }
    writeDebugFile(svg, 0, 'initial');

    let result = await runSVGO(filePath, svg);
    writeDebugFile(result, 1, 'after-svgo');
    if (await isSvgEmpty(result)) {
        return result;
    }

    if (opts.crop) {
        result = await cropSvg(result, opts.backgroundColor);
        writeDebugFile(result, 3, 'after-crop');
    }

    if (opts.viewBox) {
        result = await fixViewBox(result, opts.viewBox);
        writeDebugFile(result, 4, 'after-viewbox');
    }

    if (opts.crop || opts.viewBox) {
        // Rerun svgo, just in case ^^
        result = await runSVGO(filePath, result, 2);
        writeDebugFile(result, 5, 'after-svgo-again');
    }

    return result;
}

module.exports = {
    optimizeSVG
};
