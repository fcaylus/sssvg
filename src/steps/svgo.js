const SVGO = require('svgo');

function svgConfig(floatPrecision, removeOutsideViewBoxPath) {
    return {
        multipass: true,
        floatPrecision,
        plugins: [
            {
                removeViewBox: false
            },
            {
                removeUnknownsAndDefaults: {
                    keepDataAttrs: false,
                    keepAriaAttrs: false
                }
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
                removeScriptElement: true
            },
            {
                removeStyleElement: true
            },
            {
                removeDimensions: true
            },
            // As described here: https://medium.com/@marklynch_99372/removing-off-screen-content-in-svg-images-at-scale-d8a2babde196
            // `mergePaths` should be disabled if `removeOffCanvasPaths` is enabled
            ...(removeOutsideViewBoxPath ? [
                {
                    mergePaths: false
                },
                {
                    removeOffCanvasPaths: true
                }
            ] : [
                {
                    mergePaths: true
                },
                {
                    removeOffCanvasPaths: false
                }
            ]),
            {
                customRemoveRasterImages: {
                    type: 'perItem',
                    description: 'Improvement of removeRasterImages plugin. Also checks fro xlink:href attributes, and data with data:img/ mime type',
                    fn: function(item) {
                        const rasterImageHrefMatcher = /(\.|image\/|img\/)(jpg|jpeg|png|gif)/;
                        if (item.isElem('image')
                            && (item.hasAttrLocal('href', rasterImageHrefMatcher)
                                || item.hasAttrLocal('xlink:href', rasterImageHrefMatcher))) {
                            return false;
                        }
                    }
                }
            }
        ]
    };
}

function runSVGO(filePath, svg, floatPrecision = 3, removeOutsideViewBoxPath = false) {
    const svgo = new SVGO(svgConfig(floatPrecision, removeOutsideViewBoxPath));
    return svgo.optimize(svg, { path: filePath }).then((result) => result.data);
}

module.exports = {
    runSVGO
};
