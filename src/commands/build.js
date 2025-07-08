const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');

async function buildCommand(options) {
    try {
        console.log(chalk.blue('🔨 Starting the build process...'));
        
        // Load configuration
        const configPath = path.join(process.cwd(), 'wp-release.config.js');
        if (!fs.existsSync(configPath)) {
            console.log(chalk.red('❌ No configuration found. Run wp-release init first.'));
            return;
        }
        
        const config = require(configPath);
        const buildDir = path.join(process.cwd(), config.buildDir);
        
        // Clean build directory
        await fs.remove(buildDir);
        await fs.ensureDir(buildDir);
        
        // Copy files excluding patterns
        console.log(chalk.blue('📂 Copying files...'));
        
        // Add build directory to exclude patterns to prevent copying to itself
        const allExcludePatterns = [...config.excludePatterns, config.buildDir + '/'];
        
        const excludeArgs = allExcludePatterns
            .map(pattern => `--exclude=${pattern}`)
            .join(' ');
        
        if (shell.which('rsync')) {
            shell.exec(`rsync -av ${excludeArgs} . ${buildDir}/`);
        } else {
            // Fallback for Windows without rsync - copy files individually
            const files = await fs.readdir('.');
            
            for (const file of files) {
                // Skip if it's the build directory
                if (file === config.buildDir) {
                    continue;
                }
                
                const shouldExclude = allExcludePatterns.some(pattern => {
                    const cleanPattern = pattern.replace('/', '').replace('*', '');
                    return file.includes(cleanPattern) || file.match(new RegExp(pattern.replace('*', '.*')));
                });
                
                if (!shouldExclude) {
                    const srcPath = path.join(process.cwd(), file);
                    const destPath = path.join(buildDir, file);
                    await fs.copy(srcPath, destPath);
                }
            }
        }
        
        console.log(chalk.green('✅ Build process completed successfully.'));
        console.log(chalk.blue(`📁 Built files are in: ${buildDir}`));
        
    } catch (error) {
        console.error(chalk.red('❌ Build failed:'), error.message);
        process.exit(1);
    }
}

module.exports = { buildCommand };