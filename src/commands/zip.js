const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const zipPlugin = (pluginName, outputDir) => {
    const output = fs.createWriteStream(path.join(outputDir, `${pluginName}.zip`));
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log('Zip archive has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(path.join(process.cwd(), pluginName), false);
    archive.finalize();
};

module.exports = zipPlugin;