const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function initCommand() {
  console.log(chalk.blue('🚀 Initializing WordPress Release Automation'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'pluginName',
      message: 'Plugin/Theme name:',
      default: path.basename(process.cwd())
    },
    {
      type: 'input',
      name: 'mainFile',
      message: 'Main plugin file:',
      default: 'plugin.php'
    },
    {
      type: 'input',
      name: 'buildDir',
      message: 'Build directory:',
      default: 'build'
    },
    {
      type: 'input',
      name: 'zipName',
      message: 'ZIP file name template:',
      default: '{{name}}-{{version}}.zip'
    },
    {
      type: 'input',
      name: 'excludePatterns',
      message: 'Files/folders to exclude (comma-separated):',
      default: 'node_modules/, .git/, src/, *.log, .env*, tests/, *.md, *.zip, wp-release.config.js'
    },
    {
      type: 'confirm',
      name: 'includeGitOps',
      message: 'Include Git operations (commit, tag, push)?',
      default: true
    },
    {
      type: 'input',
      name: 'tagPrefix',
      message: 'Git tag prefix:',
      default: 'v',
      when: (answers) => answers.includeGitOps
    },
    {
      type: 'input',
      name: 'gitBranch',
      message: 'Git branch for releases:',
      default: 'main',
      when: (answers) => answers.includeGitOps
    }
  ]);

  // Process exclude patterns
  const excludePatterns = answers.excludePatterns
    .split(',')
    .map(pattern => pattern.trim())
    .filter(pattern => pattern.length > 0);

  const config = {
    pluginName: answers.pluginName,
    mainFile: answers.mainFile,
    buildDir: answers.buildDir,
    zipName: answers.zipName,
    excludePatterns: excludePatterns,
    config: {
      includeGitOps: answers.includeGitOps,
      tagPrefix: answers.tagPrefix || 'v',
      branch: answers.gitBranch || 'main'
    },
    hooks: {
      preRelease: [],
      postRelease: [],
      preBuild: [],
      postBuild: []
    }
  };

  const configPath = path.join(process.cwd(), 'wp-release.config.js');
  const configContent = `module.exports = ${JSON.stringify(config, null, 2)};`;
  
  await fs.writeFile(configPath, configContent);
  console.log(chalk.green('✅ Configuration saved to wp-release.config.js'));
  
  // Create or update package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let packageJson;
  
  if (fs.existsSync(packageJsonPath)) {
    // Read existing package.json
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(chalk.yellow('📝 Updating existing package.json'));
  } else {
    // Create new package.json
    packageJson = {
      name: answers.pluginName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `WordPress plugin: ${answers.pluginName}`,
      main: answers.mainFile,
      keywords: ["wordpress", "plugin"],
      author: "Your Name",
      license: "GPL-2.0-or-later"
    };
    console.log(chalk.green('✅ Creating new package.json'));
  }
  
  // Add or update scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "version:patch": "npm version patch --no-git-tag-version",
    "version:minor": "npm version minor --no-git-tag-version", 
    "version:major": "npm version major --no-git-tag-version",
    "build": "wp-release build",
    "zip": "wp-release zip",
    "release": "wp-release release",
    "publish": "wp-release publish"
  };
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('✅ Package.json updated with release scripts'));
  
  console.log(chalk.blue('\n🎉 Initialization complete!'));
  console.log(chalk.gray('\nAvailable commands:'));
  console.log(chalk.cyan('  npm run version:patch') + '  - Increment patch version (1.0.0 → 1.0.1)');
  console.log(chalk.cyan('  npm run version:minor') + '  - Increment minor version (1.0.0 → 1.1.0)');
  console.log(chalk.cyan('  npm run version:major') + '  - Increment major version (1.0.0 → 2.0.0)');
  console.log(chalk.cyan('  npm run build') + '        - Update version across files');
  console.log(chalk.cyan('  npm run zip') + '          - Create distribution ZIP');
  console.log(chalk.cyan('  npm run release') + '      - Build, ZIP, and tag');
  console.log(chalk.cyan('  npm run publish') + '      - Complete release with push to GitHub');
}

module.exports = { initCommand };
