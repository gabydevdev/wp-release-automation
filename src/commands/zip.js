const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const chalk = require('chalk');

async function zipCommand(options) {
    try {
        console.log(chalk.blue('📦 Creating ZIP archive...'));
        
        // Load configuration
        const configPath = path.join(process.cwd(), 'wp-release.config.js');
        if (!fs.existsSync(configPath)) {
            console.log(chalk.red('❌ No configuration found. Run wp-release init first.'));
            return;
        }
        
        const config = require(configPath);
        const buildDir = path.join(process.cwd(), config.buildDir);
        
        if (!fs.existsSync(buildDir)) {
            console.log(chalk.red('❌ Build directory not found. Run wp-release build first.'));
            return;
        }
        
        // Get version from package.json
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const version = options.version || packageJson.version;
        
        // Generate ZIP filename
        const zipName = config.zipName
            .replace('{{name}}', config.pluginName)
            .replace('{{version}}', version);
        
        const zipPath = path.join(process.cwd(), zipName);
        
        await createZipArchive(buildDir, zipPath, config.pluginName);
        
        console.log(chalk.green(`✅ ZIP archive created: ${zipName}`));
        
    } catch (error) {
        console.error(chalk.red('❌ ZIP creation failed:'), error.message);
        process.exit(1);
    }
}

function createZipArchive(sourceDir, outputPath, pluginName) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(chalk.blue(`📊 ${archive.pointer()} total bytes`));
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        // Create WordPress-compatible directory structure
        archive.directory(sourceDir, pluginName);
        archive.finalize();
    });
}

module.exports = { zipCommand, createZipArchive };