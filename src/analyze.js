const { parseViewBox, containsElements, listColors } = require('./svg-utils');
const svgson = require('svgson');

function analyzeSVG(svg) {
    const svgJson = svgson.parseSync(svg);
    svgJson.children;

    const analysis = {};
    analysis.viewBox = parseViewBox(svgJson.attributes.viewBox);
    if (analysis.viewBox) {
        analysis.viewBox.ratio = analysis.viewBox.width / analysis.viewBox.height;
    } else {
        analysis.viewBox = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            ratio: 0
        };
    }

    analysis.containsText = containsElements(svgJson, ['text']);
    analysis.containsRasterImage = containsElements(svgJson, ['image', 'img']);

    analysis.colors = listColors(svgJson);

    return analysis;
}

module.exports = {
    analyzeSVG
};
