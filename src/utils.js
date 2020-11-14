const fs = require('fs');
const path = require('path');

/**
 * Detect if output is an SVG file or not, and write the svg data
 * (if it's not a svg file, consider it's a directory)
 * @param input The input SVG file name
 * @param output The output file or directory
 * @param svg The svg data
 */
function writeOutput(input, output, svg) {
    const writeFile = (path, data) => new Promise(((resolve, reject) => {
        fs.writeFile(path, data, { encoding: 'utf8' }, (error) => {
            if (error) {
                reject(`Could not write SVG file to ${path}: ${error.code} ${error.message}`);
            } else {
                resolve(path);
            }
        });
    }));

    if (output.endsWith('.svg')) {
        return writeFile(output, svg);
    }

    const inputFile = path.basename(input);

    if (fs.existsSync(output)) {
        if (fs.statSync(output).isDirectory()) {
            return writeFile(path.join(output, inputFile), svg);
        } else {
            return Promise.reject(`Output directory is not a directory: ${output}`);
        }
    }

    // Create directory
    return new Promise(async (resolve, reject) => {
        fs.mkdir(output, { recursive: true }, (error) => {
            if (!error) {
                writeFile(path.join(output, inputFile), svg).then(resolve).catch(reject);
            } else {
                reject(`Could not create directory ${output}: ${error.code} ${error.message}`);
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
