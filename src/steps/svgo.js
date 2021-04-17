const { optimize, extendDefaultPlugins } = require('svgo');

function svgConfig(floatPrecision, removeOutsideViewBoxPath) {
    return {
        multipass: true,
        floatPrecision,
        plugins: extendDefaultPlugins([
            {
                name: 'removeViewBox',
                active: false
            },
            {
                name: 'removeUnknownsAndDefaults',
                params: {
                    keepDataAttrs: false,
                    keepAriaAttrs: false
                }
            },
            {
                name: 'convertPathData',
                params: {
                    forceAbsolutePath: true
                }
            },
            {
                name: 'convertStyleToAttrs'
            },
            {
                name: 'convertShapeToPath',
                params: {
                    convertArcs: true
                }
            },
            {
                name: 'removeScriptElement'
            },
            {
                name: 'removeStyleElement'
            },
            {
                name: 'removeDimensions'
            },
            // As described here: https://medium.com/@marklynch_99372/removing-off-screen-content-in-svg-images-at-scale-d8a2babde196
            // `mergePaths` should be disabled if `removeOffCanvasPaths` is enabled
            ...(removeOutsideViewBoxPath ? [
                {
                    name: 'mergePaths',
                    active: false
                },
                {
                    name: 'removeOffCanvasPaths'
                }
            ] : [
                {
                    name: 'mergePaths'
                },
                {
                    name: 'removeOffCanvasPaths',
                    active: false
                }
            ]),
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
        ])
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
