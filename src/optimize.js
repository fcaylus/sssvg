const SVGO = require('svgo');

function optimizeSVG(filePath, svg) {
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

module.exports = {
    optimizeSVG
};
