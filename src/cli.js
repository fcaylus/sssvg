#!/usr/bin/env node

const fs = require('fs');
const program = require('commander').program;
const packageJson = require('../package.json');
const { optimizeSVG } = require('./optimize');
const { analyzeSVG } = require('./analyze');
const { parseViewBox } = require('./svg-utils');
const { writeOutput, displayErrors, listFilesInDir } = require('./utils');

program.name(packageJson.name);
program.version(packageJson.version);

program
    .arguments('<input> <output>')
    .option('-d, --directory', 'Treat input as a directory and optimize all SVGs inside')
    .option('-r, --recursive', 'Explore input directory recursively. Requires -d or --directory')
    .option('-c, --crop', 'Crop SVGs to its content, and change the view box accordingly')
    .option('-b, --background <background-color>', 'Background color. Used for cropping to content. Can be either "transparent", an HTML color name or a HEX string (starting with #)', 'default')
    .option('--view-box <viewBox>', 'Change the viewBox to match the one provided (and resize the SVG accordingly). Shorthand for --x, --y, --width and --height together')
    .option('--x <x>', 'Change the x value of the viewBox')
    .option('--y <y>', 'Change the y value of the viewBox')
    .option('--width <width>', 'Change the width value of the viewBox')
    .option('--height <height>', 'Change the height value of the viewBox')
    .option('-a, --analyze', 'Display analysis information about the SVG')
    .description(packageJson.description, {
        input: 'Input SVG file',
        output: 'Output SVG file or directory (if it doesn\'t match *.svg)'
    })
    .action(async (input, output, cmdObj) => {
        const handleFile = async (inputDir, fileName) => {
            const hasViewBoxParam = () => {
                return cmdObj.x !== undefined
                    || cmdObj.y !== undefined
                    || cmdObj.width !== undefined
                    || cmdObj.height !== undefined
                    || cmdObj.viewBox !== undefined;
            };

            console.log(`🔵  Optimize SVG ${fileName}`);

            const fileData = fs.readFileSync(fileName, 'utf8');

            if (cmdObj.analyze) {
                const analysis = analyzeSVG(fileData);
                console.log('  ⚪️  Analysis');
                console.log(`      - Colors: ${analysis.colors.join(' | ')}`);
                console.log(`      - View box: (x: ${analysis.viewBox.x}, y: ${analysis.viewBox.y}, w: ${analysis.viewBox.width}, h: ${analysis.viewBox.height}, ratio: ${analysis.viewBox.ratio})`);
                console.log(`      - Raster images: ${analysis.containsRasterImage ? '✅' : '❌'}  `);
                console.log(`      - Text: ${analysis.containsText ? '✅' : '❌'}  `);
            }

            const svg = await optimizeSVG(fileName, fileData, {
                crop: !!cmdObj.crop,
                backgroundColor: cmdObj.background,
                viewBox: hasViewBoxParam() ? {
                    x: cmdObj.x ? parseFloat(cmdObj.x) : undefined,
                    y: cmdObj.y ? parseFloat(cmdObj.y) : undefined,
                    width: cmdObj.width ? parseFloat(cmdObj.width) : undefined,
                    height: cmdObj.height ? parseFloat(cmdObj.height) : undefined,
                    ...parseViewBox(cmdObj.viewBox)
                } : undefined
            }).catch(displayErrors);

            return await writeOutput(inputDir, fileName, output, svg)
                .then((res) => console.log(`✅  SVG optimized (${res})`))
                .catch(displayErrors);
        };

        if (!cmdObj.directory) {
            await handleFile('', input);
            return;
        }

        // Read each file in the input directory, and optimize the SVGs
        for (const file of listFilesInDir(input, !!cmdObj.recursive)) {
            await handleFile(input, file);
        }
    });

program.parse(process.argv);
