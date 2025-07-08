const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { releaseCommand } = require('./release');
const { execSync } = require('child_process');

async function publishCommand(options) {
    try {
        console.log(chalk.blue('🚀 Starting publish process...'));
        
        // Load configuration
        const configPath = path.join(process.cwd(), 'wp-release.config.js');
        if (!fs.existsSync(configPath)) {
            console.log(chalk.red('❌ No configuration found. Run wp-release init first.'));
            return;
        }
        
        const config = require(configPath);
        
        // Check if Git operations are enabled
        if (!config.config || !config.config.includeGitOps) {
            console.log(chalk.yellow('⚠️  Git operations are disabled. Running release only...'));
            await releaseCommand(options);
            return;
        }
        
        // Run the release process first
        await releaseCommand(options);
        
        // Push to Git
        console.log(chalk.blue('📤 Pushing to Git repository...'));
        
        const branch = config.config.branch || 'main';
        
        try {
            // Push commits
            execSync(`git push origin ${branch}`, { stdio: 'inherit' });
            console.log(chalk.green('✅ Commits pushed successfully'));
            
            // Push tags
            execSync('git push origin --tags', { stdio: 'inherit' });
            console.log(chalk.green('✅ Tags pushed successfully'));
            
        } catch (error) {
            console.error(chalk.red('❌ Failed to push to Git:'), error.message);
            console.log(chalk.yellow('💡 You can manually push with: git push origin ' + branch + ' && git push origin --tags'));
        }
        
        // Run post-release hooks
        if (config.hooks.postRelease.length > 0) {
            console.log(chalk.blue('🔧 Running post-release hooks...'));
            for (const hook of config.hooks.postRelease) {
                const shell = require('shelljs');
                shell.exec(hook);
            }
        }
        
        console.log(chalk.green('✅ Publish process completed successfully!'));
        
        // Show next steps
        console.log(chalk.blue('\n📦 Next Steps:'));
        console.log(chalk.gray('1. Go to your GitHub repository'));
        console.log(chalk.gray('2. Click "Releases" → "Create a new release"'));
        console.log(chalk.gray('3. Select the latest tag'));
        console.log(chalk.gray('4. Upload the ZIP file from your project directory'));
        console.log(chalk.gray('5. Add release notes and publish'));
        
    } catch (error) {
        console.error(chalk.red('❌ Publish failed:'), error.message);
        process.exit(1);
    }
}

module.exports = { publishCommand };
