const SVGO = require('svgo');
const autocrop = require('svg-autocrop');

function runSVGO(filePath, svg) {
    const svgo = new SVGO({
        multipass: true,
        plugins: [
            {
                removeViewBox: false
            },
            {
                convertPathData: {
                    forceAbsolutePath: true
                }
            },
            {
                convertShapeToPath: {
                    convertArcs: true
                }
            },
            {
                removeRasterImages: true
            },
            {
                removeScriptElement: true
            },
            {
                removeStyleElement: true
            },
            {
                removeDimensions: true
            },
            {
                removeOffCanvasPaths: true
            }
        ]
    });

    return svgo.optimize(svg, { path: filePath }).then((result) => result.data);
}

async function optimizeSVG(filePath, svg, options) {
    let result = await runSVGO(filePath, svg);

    if (options.crop) {
        result = (await autocrop(result)).result;
        // Rerun svgo, just in case ^^
        result = await runSVGO(filePath, result);
    }

    return result;
}

module.exports = {
    optimizeSVG
};
