const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');
const glob = require('glob');

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
        
        // Add build directory and essential excludes to prevent copying to itself
        const essentialExcludes = [
            config.buildDir + '/', 
            config.buildDir + '/**',
            '*.zip',
            'wp-release.config.js'
        ];
        
        // Merge user excludes with essential excludes, removing duplicates
        const allExcludePatterns = [...new Set([...config.excludePatterns, ...essentialExcludes])];
        
        const excludeArgs = allExcludePatterns
            .map(pattern => `--exclude=${pattern}`)
            .join(' ');
        
        if (shell.which('rsync')) {
            // Use rsync on Unix-like systems
            const result = shell.exec(`rsync -av ${excludeArgs} . ${buildDir}/`);
            if (result.code !== 0) {
                throw new Error(`rsync failed with code ${result.code}`);
            }
        } else {
            // Fallback for Windows or systems without rsync
            try {
                // Process exclude patterns to ensure they work with glob
                const processedExcludePatterns = allExcludePatterns.map(pattern => {
                    // Remove trailing slashes and add glob patterns for directories
                    if (pattern.endsWith('/')) {
                        const dirName = pattern.slice(0, -1);
                        return [dirName, `${dirName}/**`];
                    }
                    return pattern;
                }).flat();
                
                console.log(chalk.gray(`🚫 Excluding: ${processedExcludePatterns.join(', ')}`));
                
                const files = glob.sync('**/*', { 
                    dot: false,
                    nodir: true,
                    ignore: processedExcludePatterns
                });
                
                console.log(chalk.blue(`📄 Found ${files.length} files to copy`));
                
                for (const file of files) {
                    const srcPath = path.join(process.cwd(), file);
                    const destPath = path.join(buildDir, file);
                    
                    // Ensure destination directory exists
                    await fs.ensureDir(path.dirname(destPath));
                    await fs.copy(srcPath, destPath);
                }
            } catch (error) {
                throw new Error(`File copying failed: ${error.message}`);
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