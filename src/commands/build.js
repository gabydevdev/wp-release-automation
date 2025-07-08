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
        const excludeArgs = config.excludePatterns
            .map(pattern => `--exclude=${pattern}`)
            .join(' ');
        
        if (shell.which('rsync')) {
            shell.exec(`rsync -av ${excludeArgs} . ${buildDir}/`);
        } else {
            // Fallback for Windows without rsync
            await fs.copy('.', buildDir, {
                filter: (src) => {
                    return !config.excludePatterns.some(pattern => 
                        src.includes(pattern.replace('/', '').replace('*', ''))
                    );
                }
            });
        }
        
        console.log(chalk.green('✅ Build process completed successfully.'));
        console.log(chalk.blue(`📁 Built files are in: ${buildDir}`));
        
    } catch (error) {
        console.error(chalk.red('❌ Build failed:'), error.message);
        process.exit(1);
    }
}

module.exports = { buildCommand };