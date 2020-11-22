const SVGO = require('svgo');

function svgConfig(floatPrecision) {
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
            {
                removeOffCanvasPaths: true
            },
            {
                customRemoveRasterImages: {
                    type: 'perItem',
                    description: 'Improvement of removeRasterImages plugin. Also checks fro xlink:href attributes, and date with data:img/ mime type',
                    fn: function(item) {
                        const rasterImageHrefMatcher = /(\.|image\/|img\/)(jpg|png|gif)/;
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

function runSVGO(filePath, svg, floatPrecision = 3) {
    const svgo = new SVGO(svgConfig(floatPrecision));

    return svgo.optimize(svg, { path: filePath }).then((result) => result.data);
}

module.exports = {
    runSVGO
};
