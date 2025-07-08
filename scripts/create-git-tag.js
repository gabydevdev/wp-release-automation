#!/usr/bin/env node

/**
 * Git Tag Creation Script for WordPress Release Automation
 * 
 * Creates Git tags and commits for new versions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Load configuration
function loadConfig() {
  const configPath = path.join(process.cwd(), 'wp-release.config.js');
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('❌ No wp-release.config.js found. Run wp-release init first.'));
    process.exit(1);
  }
  
  return require(configPath);
}

// Get version from package.json
function getVersion() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red('❌ package.json not found in current directory'));
    process.exit(1);
  }
  
  const packageJson = require(packageJsonPath);
  return packageJson.version;
}

const config = loadConfig();
const version = getVersion();
const pluginName = config.pluginName || path.basename(process.cwd());
const tagPrefix = config.config?.tagPrefix || 'v';
const tagName = `${tagPrefix}${version}`;

console.log(chalk.blue('🏷️  Creating Git tag for version:'), chalk.green(version));

try {
  // Check if we're in a git repository
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
} catch (error) {
  console.log(chalk.red('❌ Not in a Git repository. Please initialize Git first.'));
  process.exit(1);
}

try {
  // Check if there are uncommitted changes
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (status.trim()) {
    console.log(chalk.yellow('📝 Uncommitted changes detected. Adding and committing files...'));
    
    // Add all changes
    execSync('git add .', { stdio: 'inherit' });
    
    // Commit with version message
    const commitMessage = `Release version ${version}

- Updated version numbers across plugin files
- Created distribution package
- Ready for deployment

Version: ${version}
Package: ${pluginName}-${version}.zip`;
    
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log(chalk.green('✅ Changes committed successfully'));
  } else {
    console.log(chalk.blue('📋 No uncommitted changes detected'));
  }
  
  // Check if tag already exists
  try {
    execSync(`git rev-parse --verify ${tagName}`, { stdio: 'ignore' });
    console.log(chalk.yellow(`⚠️  Tag ${tagName} already exists. Removing old tag...`));
    
    // Remove existing tag locally
    execSync(`git tag -d ${tagName}`, { stdio: 'ignore' });
    
    // Remove existing tag from remote (if it exists)
    try {
      execSync(`git push origin --delete ${tagName}`, { stdio: 'ignore' });
      console.log(chalk.green('✅ Removed existing remote tag'));
    } catch (e) {
      // Tag might not exist on remote, that's OK
    }
  } catch (e) {
    // Tag doesn't exist, that's good
  }
  
  // Create new tag
  const tagMessage = `Version ${version}

Release Notes:
- WordPress plugin release
- Automatic version management system
- Distribution package ready for installation

Files:
- ${pluginName}-${version}.zip (distribution package)
- Complete source code with documentation

Installation:
1. Download the ZIP file
2. Install via WordPress admin or extract to plugins directory
3. Activate the plugin

For detailed instructions, see README.md`;

  execSync(`git tag -a ${tagName} -m "${tagMessage}"`, { stdio: 'inherit' });
  console.log(chalk.green(`✅ Created Git tag: ${tagName}`));
  
  // Show tag info
  console.log(chalk.blue('\n📋 Tag Information:'));
  console.log(chalk.gray(`Tag Name: ${tagName}`));
  console.log(chalk.gray(`Version: ${version}`));
  console.log(chalk.gray(`Commit: ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7)}`));
  console.log(chalk.gray(`Date: ${new Date().toISOString()}`));
  
  // Show next steps
  console.log(chalk.blue('\n🚀 Next Steps:'));
  console.log(chalk.cyan('  npm run git:push') + '     - Push commits and tags to GitHub');
  console.log(chalk.cyan('  npm run release') + '       - Complete release with push');
  console.log(chalk.gray('  Or manually: git push origin main && git push origin --tags'));
  
  console.log(chalk.blue('\n📦 GitHub Release:'));
  console.log(chalk.gray('  1. Go to your GitHub repository'));
  console.log(chalk.gray('  2. Click "Releases" → "Create a new release"'));
  console.log(chalk.gray(`  3. Select tag: ${tagName}`));
  console.log(chalk.gray(`  4. Upload: ${pluginName}-${version}.zip`));
  console.log(chalk.gray('  5. Add release notes and publish'));
  
} catch (error) {
  console.log(chalk.red('❌ Error creating Git tag:'), error.message);
  process.exit(1);
}

console.log(chalk.green('\n🎉 Git tag created successfully!\n'));
