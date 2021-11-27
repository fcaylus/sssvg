const { optimize } = require('svgo');

function svgConfig(floatPrecision, removeOutsideViewBoxPath) {
    return {
        multipass: true,
        floatPrecision,
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        removeViewBox: false,
                        removeUnknownsAndDefaults: {
                            keepDataAttrs: false,
                            keepAriaAttrs: false
                        },
                        convertPathData: {
                            forceAbsolutePath: true
                        },
                        convertShapeToPath: {
                            convertArcs: true
                        },
                        cleanupIDs: {
                            // Force remove of ids on elements with `script` or `style` attr
                            force: true
                        },
                        moveElemsAttrsToGroup: false,
                        // As described here: https://medium.com/@marklynch_99372/removing-off-screen-content-in-svg-images-at-scale-d8a2babde196
                        // `mergePaths` should be disabled if `removeOffCanvasPaths` is enabled
                        ...(removeOutsideViewBoxPath ? {
                            mergePaths: false
                        } : {})
                    }
                }
            },
            'convertStyleToAttrs',
            'removeScriptElement',
            'removeStyleElement',
            'removeDimensions',
            ...(removeOutsideViewBoxPath ? ['removeOffCanvasPaths'] : []),
            {
                name: 'customRemoveRasterImages',
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
        ]
    };
}

function runSVGO(filePath, svg, floatPrecision = 3, removeOutsideViewBoxPath = false) {
    return optimize(svg, {
        path: filePath,
        ...svgConfig(floatPrecision, removeOutsideViewBoxPath)
    }).data;
}

module.exports = {
    runSVGO
};
