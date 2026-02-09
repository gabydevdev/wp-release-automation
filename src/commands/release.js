const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { bumpVersion, updateFiles } = require('./version');
const { buildCommand } = require('./build');
const { zipCommand } = require('./zip');
const { commitChanges, pushChanges, createTag, pushTags } = require('../utils/git-operations');

function getCurrentVersion() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found in current directory');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.version) {
        throw new Error('package.json missing version');
    }

    return packageJson.version;
}

async function releaseCommand(options) {
    try {
        console.log(chalk.blue('🚀 Starting release process...'));
        
        // Load configuration
        const configPath = path.join(process.cwd(), 'wp-release.config.js');
        if (!fs.existsSync(configPath)) {
            console.log(chalk.red('❌ No configuration found. Run wp-release init first.'));
            return;
        }
        
        delete require.cache[require.resolve(configPath)]; // Clear cache
        const config = require(configPath);
        
        // Validate configuration
        if (!config.pluginName) {
            throw new Error('Missing pluginName in configuration');
        }
        if (!config.buildDir) {
            throw new Error('Missing buildDir in configuration');
        }
        
        // Run pre-release hooks
        if (config.hooks.preRelease.length > 0) {
            console.log(chalk.blue('🔧 Running pre-release hooks...'));
            for (const hook of config.hooks.preRelease) {
                const shell = require('shelljs');
                shell.exec(hook);
            }
        }
        
        // Bump version (only if requested and not dry run)
        let newVersion;
        const shouldBump = typeof options.type === 'string' && options.type.length > 0;
        const currentVersion = getCurrentVersion();

        if (options.dryRun) {
            if (shouldBump) {
                // In dry run, use current version + 1 without actually changing files
                const versionParts = currentVersion.split('.').map(Number);
                if (options.type === 'minor') {
                    versionParts[1]++;
                    versionParts[2] = 0;
                } else if (options.type === 'major') {
                    versionParts[0]++;
                    versionParts[1] = 0;
                    versionParts[2] = 0;
                } else {
                    versionParts[2]++;
                }
                newVersion = versionParts.join('.');
                console.log(chalk.yellow(`🔍 Dry run: would bump version to ${newVersion}`));
            } else {
                newVersion = currentVersion;
                console.log(chalk.yellow(`🔍 Dry run: using current version ${newVersion}`));
            }
        } else if (shouldBump) {
            newVersion = bumpVersion(options.type);
            updateFiles(newVersion);
            console.log(chalk.green(`📝 Version bumped to ${newVersion}`));
        } else {
            newVersion = currentVersion;
            console.log(chalk.green(`📝 Using current version ${newVersion}`));
        }
        
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
        if (!options.dryRun && config.config.includeGitOps) {
            console.log(chalk.blue('📤 Committing changes to Git...'));
            await commitChanges(`Release version: ${newVersion}`);
            
            // Create and push git tag
            const tagName = `${config.config.tagPrefix || 'v'}${newVersion}`;
            await createTag(tagName);
            console.log(chalk.green(`✅ Created tag: ${tagName}`));
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