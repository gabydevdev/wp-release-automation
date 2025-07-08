#!/usr/bin/env node

/**
 * ZIP Creation Script for WordPress Release Automation
 * 
 * Creates a clean ZIP file for plugin distribution
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const chalk = require('chalk');
const glob = require('glob');

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

// Parse ZIP name template
function parseZipName(template, data) {
  return template
    .replace(/\{\{name\}\}/g, data.name)
    .replace(/\{\{version\}\}/g, data.version);
}

const outputDir = process.cwd();
const zipFileName = parseZipName(config.zipName || '{{name}}-{{version}}.zip', {
  name: pluginName,
  version: version
});
const outputFile = path.join(outputDir, zipFileName);

console.log(chalk.blue('📦 Creating plugin ZIP file...'));
console.log(chalk.gray(`Plugin: ${pluginName}`));
console.log(chalk.gray(`Version: ${version}`));
console.log(chalk.gray(`Output: ${zipFileName}\n`));

// Default include patterns
const defaultIncludePatterns = [
  '*.php',
  'README.md',
  'LICENSE',
  'uninstall.php',
  'admin/**/*',
  'includes/**/*',
  'assets/**/*',
  'languages/**/*',
  'templates/**/*'
];

// Default exclude patterns
const defaultExcludePatterns = [
  'node_modules/**/*',
  'scripts/**/*',
  'package.json',
  'package-lock.json',
  '.git/**/*',
  '.gitignore',
  '.vscode/**/*',
  '.idea/**/*',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '*.zip',
  'build/**/*',
  'src/**/*',
  'tests/**/*',
  '.env*',
  '*.md',
  'composer.json',
  'composer.lock',
  'phpcs.xml',
  '.eslintrc.json',
  'webpack.config.js'
];

// Use configured patterns or defaults
const includePatterns = config.includePatterns || defaultIncludePatterns;
const excludePatterns = [...defaultExcludePatterns, ...(config.excludePatterns || [])];

// Create a file to stream archive data to
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(chalk.green(`✅ ZIP file created successfully!`));
  console.log(chalk.blue(`📁 File: ${zipFileName}`));
  console.log(chalk.blue(`📊 Size: ${sizeInMB} MB`));
  console.log(chalk.blue(`📝 Total bytes: ${archive.pointer()}\n`));
  
  // Clean up old ZIP files (keep only the latest 3)
  const zipFiles = glob.sync(`${pluginName}-*.zip`, { 
    cwd: outputDir 
  }).sort().reverse();
  
  if (zipFiles.length > 3) {
    const filesToDelete = zipFiles.slice(3);
    filesToDelete.forEach(file => {
      const filePath = path.join(outputDir, file);
      fs.unlinkSync(filePath);
      console.log(chalk.gray(`🗑️  Cleaned up old ZIP: ${file}`));
    });
  }
});

// Handle warnings (e.g., stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.log(chalk.yellow(`⚠️  Warning: ${err.message}`));
  } else {
    throw err;
  }
});

// Handle errors
archive.on('error', function(err) {
  console.log(chalk.red(`❌ Error creating ZIP: ${err.message}`));
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files to archive
function addFilesToArchive() {
  const filesToAdd = [];
  
  // Get all files matching include patterns
  includePatterns.forEach(pattern => {
    const files = glob.sync(pattern, { 
      cwd: process.cwd(),
      dot: false 
    });
    filesToAdd.push(...files);
  });
  
  // Remove duplicates and filter out excluded files
  const uniqueFiles = [...new Set(filesToAdd)];
  
  const filteredFiles = uniqueFiles.filter(file => {
    return !excludePatterns.some(excludePattern => {
      const excludeRegex = new RegExp(
        excludePattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
      );
      return excludeRegex.test(file);
    });
  });
  
  console.log(chalk.blue('📋 Adding files to ZIP:'));
  
  filteredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const archivePath = `${pluginName}/${file}`;
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        archive.file(filePath, { name: archivePath });
        console.log(chalk.gray(`  ✓ ${file}`));
      }
    }
  });
  
  console.log(chalk.blue(`\n📦 Packaging ${filteredFiles.length} files...\n`));
}

// Add files and finalize
addFilesToArchive();
archive.finalize();
