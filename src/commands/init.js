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
      default: 'node_modules/, .git/, src/, *.log, .env*, tests/, *.md'
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
  
  // Create package.json if it doesn't exist
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    const packageJson = {
      name: answers.pluginName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `WordPress plugin: ${answers.pluginName}`,
      main: answers.mainFile,
      scripts: {
        "version:patch": "npm version patch --no-git-tag-version",
        "version:minor": "npm version minor --no-git-tag-version", 
        "version:major": "npm version major --no-git-tag-version",
        "build": "wp-release build || node ../wp-release-automation/scripts/update-version.js",
        "zip": "wp-release zip || node ../wp-release-automation/scripts/create-zip.js",
        "git:tag": "node ../wp-release-automation/scripts/create-git-tag.js",
        "git:push": "node ../wp-release-automation/scripts/git-push.js",
        "release": "npm run build && npm run zip && npm run git:tag",
        "publish": "npm run release && npm run git:push"
      },
      keywords: ["wordpress", "plugin"],
      author: "Your Name",
      license: "GPL-2.0-or-later"
    };
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('✅ Created package.json'));
  }
  
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
