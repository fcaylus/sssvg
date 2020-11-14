#!/usr/bin/env node

const fs = require('fs');
const program = require('commander').program;
const packageJson = require('../package.json');
const { optimizeSVG } = require('./index');
const { writeOutput, displayErrors, listFilesInDir } = require('./utils');

program.name(packageJson.name);
program.version(packageJson.version);

program
    .arguments('<input> <output>')
    .option('-d, --directory', 'Treat input as a directory and optimize all SVGs inside')
    .option('-r, --recursive', 'Explore input directory recursively. Requires -d or --directory')
    .description(packageJson.description, {
        input: 'Input SVG file',
        output: 'Output SVG file or directory (if it doesn\'t match *.svg)'
    })
    .action(async (input, output, cmdObj) => {
        const handleFile = async (fileName) => {
            console.log(`🔵  Optimize SVG ${fileName}`);
            const fileData = fs.readFileSync(fileName, 'utf8');
            const svg = await optimizeSVG(fileName, fileData);

            return await writeOutput(fileName, output, svg)
                .then((res) => console.log(`✅  SVG optimized (${res})`))
                .catch(displayErrors);
        };

        if (!cmdObj.directory) {
            await handleFile(input);
            return;
        }

        // Read each file in the input directory, and optimize the SVGs
        for (const file of listFilesInDir(input, !!cmdObj.recursive)) {
            console.log(file)
            await handleFile(file);
        }
    });

program.parse(process.argv);
