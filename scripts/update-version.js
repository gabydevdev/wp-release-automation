#!/usr/bin/env node

/**
 * Version Update Script for WordPress Release Automation
 * 
 * This script automatically updates version numbers across plugin files
 * when the version in package.json is changed.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Get the new version from package.json
function getVersionFromPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red('❌ package.json not found in current directory'));
    process.exit(1);
  }
  
  const packageJson = require(packageJsonPath);
  return packageJson.version;
}

// Load configuration
function loadConfig() {
  const configPath = path.join(process.cwd(), 'wp-release.config.js');
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('❌ No wp-release.config.js found. Run wp-release init first.'));
    process.exit(1);
  }
  
  return require(configPath);
}

const newVersion = getVersionFromPackageJson();
const config = loadConfig();

console.log(chalk.blue('🔄 Updating plugin version to:'), chalk.green(newVersion));

// Function to update a single file
function updateFile(fileConfig) {
  const filePath = path.join(process.cwd(), fileConfig.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(chalk.yellow(`⚠️  File not found: ${fileConfig.file}`));
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  fileConfig.patterns.forEach(pattern => {
    if (pattern.search.test(content)) {
      content = content.replace(pattern.search, pattern.replace);
      console.log(chalk.green(`✅ Updated ${pattern.description} in ${fileConfig.file}`));
      updated = true;
    } else {
      console.log(chalk.yellow(`⚠️  Pattern not found: ${pattern.description} in ${fileConfig.file}`));
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

// Files to update with their respective patterns
function getFilesToUpdate(config, newVersion) {
  const filesToUpdate = [];
  
  // Main plugin file
  if (config.mainFile) {
    filesToUpdate.push({
      file: config.mainFile,
      patterns: [
        {
          // Plugin header version
          search: /(\* Version:\s+)[\d.]+/,
          replace: `$1${newVersion}`,
          description: 'Plugin header version'
        },
        {
          // WordPress plugin constant pattern
          search: /(define\s*\(\s*['"]\w+_VERSION['"],\s*['])[\d.]+(['"]\s*\);)/,
          replace: `$1${newVersion}$2`,
          description: 'Plugin version constant'
        }
      ]
    });
  }
  
  // README.md file
  filesToUpdate.push({
    file: 'README.md',
    patterns: [
      {
        // Version in markdown
        search: /(\*\*Version:\*\*\s+)[\d.]+/,
        replace: `$1${newVersion}`,
        description: 'README version header'
      },
      {
        // Stable tag format
        search: /(Stable tag:\s+)[\d.]+/i,
        replace: `$1${newVersion}`,
        description: 'README stable tag'
      }
    ]
  });
  
  return filesToUpdate;
}

// Main execution
let totalUpdated = 0;

console.log(chalk.blue('\n📝 Starting version update process...\n'));

const filesToUpdate = getFilesToUpdate(config, newVersion);

filesToUpdate.forEach(fileConfig => {
  if (updateFile(fileConfig)) {
    totalUpdated++;
  }
});

console.log(chalk.blue('\n📊 Version update summary:'));
console.log(chalk.green(`✅ Successfully updated ${totalUpdated} file(s)`));
console.log(chalk.blue(`🎯 New version: ${newVersion}`));

// Update last modified date in README
const readmePath = path.join(process.cwd(), 'README.md');
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Update the last updated date
  const lastUpdatedPattern = /(\*Last updated:\s*)[^*\n]+/;
  if (lastUpdatedPattern.test(readmeContent)) {
    readmeContent = readmeContent.replace(lastUpdatedPattern, `$1${currentDate}`);
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log(chalk.green(`✅ Updated last modified date in README.md`));
  }
}

console.log(chalk.blue('\n🎉 Version update completed!\n'));

// Exit with appropriate code
process.exit(totalUpdated > 0 ? 0 : 1);
