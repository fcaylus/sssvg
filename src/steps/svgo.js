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
            },
            {
                name: 'removeText',
                type: 'perItem',
                description: 'Remove all text elements',
                fn: function(item) {
                    return !item.isElem('text')
                        && !item.isElem('textPath')
                        && !item.isElem('tref')
                        && !item.isElem('tspan')
                        && !item.isElem('altGlyph')
                        && !item.isElem('altGlyphDef')
                        && !item.isElem('altGlyphItem')
                        && !item.isElem('glyph')
                        && !item.isElem('glyphRef')
                        && !item.isElem('font')
                        && !item.isElem('font-face')
                        && !item.isElem('font-face-format')
                        && !item.isElem('font-face-name')
                        && !item.isElem('font-face-src')
                        && !item.isElem('font-face-uri')
                        && !item.isElem('hkern')
                        && !item.isElem('vkern');
                }
            },
            {
                name: 'removeAnimation',
                type: 'perItem',
                description: 'Remove all animation elements',
                fn: function(item) {
                    return !item.isElem('animate')
                        && !item.isElem('animateMotion')
                        && !item.isElem('animateTransform')
                        && !item.isElem('animateColor')
                        && !item.isElem('discard')
                        && !item.isElem('set');
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
