const { runSVGO } = require('./steps/svgo');
const { fixViewBox } = require('./steps/viewbox');
const { cropSvg } = require('./steps/crop');
const fs = require('fs');

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
        fs.writeFileSync('debug/0-initial.svg', svg);
    }

    let result = await runSVGO(filePath, svg);

    if (process.env.SSSVG_DEBUG) {
        fs.writeFileSync('debug/1-after-svgo.svg', result);
    }

    if (opts.crop) {
        result = await cropSvg(result, options.backgroundColor);

        if (process.env.SSSVG_DEBUG) {
            fs.writeFileSync('debug/3-after-crop.svg', result);
        }

        // Rerun svgo, just in case ^^
        result = await runSVGO(filePath, result);

        if (process.env.SSSVG_DEBUG) {
            fs.writeFileSync('debug/4-after-svgo-again.svg', result);
        }
    }

    if (opts.viewBox) {
        result = await fixViewBox(result, opts.viewBox);

        if (process.env.SSSVG_DEBUG) {
            fs.writeFileSync('debug/5-after-viewbox.svg', result);
        }

        // Rerun svgo, just in case ^^
        result = await runSVGO(filePath, result, 2);

        if (process.env.SSSVG_DEBUG) {
            fs.writeFileSync('debug/6-after-svgo-again-again.svg', result);
        }
    }

    return result;
}

module.exports = {
    optimizeSVG
};
