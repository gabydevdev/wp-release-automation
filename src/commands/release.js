const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { bumpVersion, updateFiles } = require('./version');
const { buildCommand } = require('./build');
const { zipCommand } = require('./zip');
const { commitChanges, pushChanges } = require('../utils/git-operations');

async function releaseCommand(options) {
    try {
        console.log(chalk.blue('🚀 Starting release process...'));
        
        // Load configuration
        const configPath = path.join(process.cwd(), 'wp-release.config.js');
        if (!fs.existsSync(configPath)) {
            console.log(chalk.red('❌ No configuration found. Run wp-release init first.'));
            return;
        }
        
        const config = require(configPath);
        
        // Run pre-release hooks
        if (config.hooks.preRelease.length > 0) {
            console.log(chalk.blue('🔧 Running pre-release hooks...'));
            for (const hook of config.hooks.preRelease) {
                const shell = require('shelljs');
                shell.exec(hook);
            }
        }
        
        // Bump version
        const newVersion = bumpVersion(options.type || 'patch');
        updateFiles(newVersion);
        console.log(chalk.green(`📝 Version bumped to ${newVersion}`));
        
        // Run pre-build hooks
        if (config.hooks.preBuild.length > 0) {
            console.log(chalk.blue('🔧 Running pre-build hooks...'));
            for (const hook of config.hooks.preBuild) {
                const shell = require('shelljs');
                shell.exec(hook);
            }
        }
        
        // Build the project
        await buildCommand({});
        
        // Run post-build hooks
        if (config.hooks.postBuild.length > 0) {
            console.log(chalk.blue('🔧 Running post-build hooks...'));
            for (const hook of config.hooks.postBuild) {
                const shell = require('shelljs');
                shell.exec(hook);
            }
        }
        
        // Create zip file
        await zipCommand({ version: newVersion });
        
        // Git operations (if not dry run)
        if (!options.dryRun) {
            console.log(chalk.blue('📤 Committing changes to Git...'));
            await commitChanges(`Release version: ${newVersion}`);
            await pushChanges();
        }
        
        // Run post-release hooks
        if (config.hooks.postRelease.length > 0) {
            console.log(chalk.blue('🔧 Running post-release hooks...'));
            for (const hook of config.hooks.postRelease) {
                const shell = require('shelljs');
                shell.exec(hook);
            }
        }
        
        console.log(chalk.green(`✅ Release ${newVersion} completed successfully!`));
        
    } catch (error) {
        console.error(chalk.red('❌ Release process failed:'), error.message);
        process.exit(1);
    }
}

module.exports = { releaseCommand };