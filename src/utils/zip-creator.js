const fs = require('fs');
const archiver = require('archiver');

function createZip(sourceDir, outPath) {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log(`Created zip file: ${outPath} (${archive.pointer()} total bytes)`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
}

module.exports = {
    createZip
};