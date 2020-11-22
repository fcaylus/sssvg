const fs = require('fs');
const path = require('path');

/**
 * Detect if output is an SVG file or not, and write the svg data
 * (if it's not a svg file, consider it's a directory)
 * @param inputDir The input directory of the SVG file
 * @param input The input SVG file name
 * @param output The output file or directory
 * @param svg The svg data
 */
function writeOutput(inputDir, input, output, svg) {
    const writeFile = (path, data) => new Promise(((resolve, reject) => {
        fs.writeFile(path, data, { encoding: 'utf8' }, (error) => {
            if (error) {
                reject(`Could not write SVG file to ${path}: ${error.code} ${error.message}`);
            } else {
                resolve(path);
            }
        });
    }));

    // If it's not a directory, write the file directly
    if (output.endsWith('.svg')) {
        return writeFile(output, svg);
    }

    let inputFileName = path.basename(input);
    if (!inputDir.endsWith('/')) {
        inputDir += '/';
    }
    inputDir = path.normalize(inputDir);

    if (path.normalize(input).startsWith(inputDir)) {
        inputFileName = input.replace(inputDir, '');
    }

    const outputFile = path.join(output, inputFileName);
    const outputDir = path.dirname(outputFile);

    if (fs.existsSync(outputDir)) {
        if (fs.statSync(outputDir).isDirectory()) {
            return writeFile(outputFile, svg);
        } else {
            return Promise.reject(`Output directory is not a directory: ${outputDir}`);
        }
    }

    // Create directory
    return new Promise(async (resolve, reject) => {
        fs.mkdir(outputDir, { recursive: true }, (error) => {
            if (!error) {
                writeFile(outputFile, svg).then(resolve).catch(reject);
            } else {
                reject(`Could not create directory ${outputDir}: ${error.code} ${error.message}`);
            }
        });
    });
}

function listFilesInDir(dir, recursive) {
    const result = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
        if (file.isDirectory() && recursive) {
            result.push(...listFilesInDir(path.join(dir, file.name), recursive));
        } else if (file.isFile() && file.name.endsWith('.svg')) {
            result.push(path.join(dir, file.name));
        }
    });
    return result;
}

function displayErrors(error) {
    console.error(`❌  ${error}`);
}

module.exports = {
    writeOutput,
    displayErrors,
    listFilesInDir
};
