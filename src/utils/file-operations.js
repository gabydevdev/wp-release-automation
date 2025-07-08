module.exports = {
    readFile: (filePath) => {
        const fs = require('fs').promises;
        return fs.readFile(filePath, 'utf8');
    },
    writeFile: (filePath, data) => {
        const fs = require('fs').promises;
        return fs.writeFile(filePath, data, 'utf8');
    },
    deleteFile: (filePath) => {
        const fs = require('fs').promises;
        return fs.unlink(filePath);
    },
    copyFile: (source, destination) => {
        const fs = require('fs').promises;
        return fs.copyFile(source, destination);
    },
    fileExists: async (filePath) => {
        const fs = require('fs').promises;
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
};