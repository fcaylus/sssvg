const SVGO = require('svgo');

function runSVGO(filePath, svg, floatPrecision = 3) {
    const svgo = new SVGO({
        multipass: true,
        floatPrecision: floatPrecision,
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

module.exports = {
    runSVGO
};
