const svgson = require('svgson');
const svgPathParser = require('svg-path-parser');
const { parseViewBox, pathToString } = require('../svg-utils');

function fixViewBox(svg, newViewBox) {
    let oldViewBox;

    // fix a value based on its axis
    const fix = (x, axis) => {
        if (axis === 'x') {
            return (x - oldViewBox.x) * newViewBox.width / oldViewBox.width + newViewBox.x;
        }
        return (x - oldViewBox.y) * newViewBox.height / oldViewBox.height + newViewBox.y;
    };
    const fixLength = (l, axis) => {
        if (axis === 'x') {
            return l * newViewBox.width / oldViewBox.width;
        }
        return l * newViewBox.height / oldViewBox.height;
    };

    // Convert to JSON AST
    const svgJSON = svgson.parseSync(svg);
    oldViewBox = parseViewBox(svgJSON.attributes.viewBox);

    // Merge values from the old view box, if not specified in the new one
    if (newViewBox.x === undefined) {
        newViewBox.x = oldViewBox.x;
    }
    if (newViewBox.y === undefined) {
        newViewBox.y = oldViewBox.y;
    }
    if (newViewBox.width === undefined && newViewBox.height === undefined) {
        newViewBox.width = oldViewBox.width;
        newViewBox.height = oldViewBox.height;
    } else {
        // Compute width/height ratio, and apply it to the missing value
        const ratio = oldViewBox.width / oldViewBox.height;
        if (newViewBox.width === undefined && newViewBox.height !== undefined) {
            newViewBox.width = newViewBox.height * ratio;
        } else if (newViewBox.height === undefined && newViewBox.width !== undefined) {
            newViewBox.height = newViewBox.width / ratio;
        }
    }

    svgJSON.attributes.viewBox = `${newViewBox.x} ${newViewBox.y} ${newViewBox.width} ${newViewBox.height}`;

    const loopThrough = (ast) => {
        if (ast.type === 'element') {
            if (ast.name === 'path') {
                let d = svgPathParser.parseSVG(ast.attributes.d, {});
                svgPathParser.makeAbsolute(d);

                // Fix path data based on the new viewBox
                for (let i = 0; i < d.length; i++) {
                    d[i].x0 = fix(d[i].x0, 'x');
                    d[i].y0 = fix(d[i].y0, 'y');
                    d[i].x = fix(d[i].x, 'x');
                    d[i].y = fix(d[i].y, 'y');

                    // 'moveto', 'lineto', 'horizontal lineto', 'vertical lineto', 'closepath'
                    // and 'smooth quadratic curveto' only have x0, y0, x, y
                    switch (d[i].command) {
                        case 'curveto':
                            d[i].x1 = fix(d[i].x1, 'x');
                            d[i].y1 = fix(d[i].y1, 'y');
                            d[i].x2 = fix(d[i].x2, 'x');
                            d[i].y2 = fix(d[i].y2, 'y');
                            break;
                        case 'smooth curveto':
                            d[i].x2 = fix(d[i].x2, 'x');
                            d[i].y2 = fix(d[i].y2, 'y');
                            break;
                        case 'quadratic curveto':
                            d[i].x1 = fix(d[i].x1, 'x');
                            d[i].y1 = fix(d[i].y1, 'y');
                            break;
                        case 'elliptical arc':
                            d[i].rx = fixLength(d[i].rx, 'x');
                            d[i].ry = fixLength(d[i].ry, 'y');
                            break;
                    }
                }

                ast.attributes.d = pathToString(d);
            }
        }

        if (ast.children && ast.children.length > 0) {
            ast.children = ast.children.map(child => loopThrough(child));
        }

        return ast;
    };

    const modifiedSvg = loopThrough(svgJSON);
    return svgson.stringify(modifiedSvg);
}

module.exports = {
    fixViewBox
};
