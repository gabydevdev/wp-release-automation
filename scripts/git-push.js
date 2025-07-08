#!/usr/bin/env node

/**
 * Git Push Script for WordPress Release Automation
 * 
 * Pushes commits and tags to GitHub
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🚀 Pushing changes to GitHub...'));

try {
  // Check if we're in a git repository
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
} catch (error) {
  console.log(chalk.red('❌ Not in a Git repository.'));
  process.exit(1);
}

try {
  // Push commits
  console.log(chalk.blue('📤 Pushing commits...'));
  execSync('git push origin HEAD', { stdio: 'inherit' });
  console.log(chalk.green('✅ Commits pushed successfully'));
  
  // Push tags
  console.log(chalk.blue('🏷️  Pushing tags...'));
  execSync('git push origin --tags', { stdio: 'inherit' });
  console.log(chalk.green('✅ Tags pushed successfully'));
  
  console.log(chalk.green('\n🎉 All changes pushed to GitHub!\n'));
  
  // Get the current branch and last commit
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
  
  console.log(chalk.blue('📋 Push Summary:'));
  console.log(chalk.gray(`Branch: ${branch}`));
  console.log(chalk.gray(`Latest commit: ${commit}`));
  
  // Get repository URL if available
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    if (remoteUrl) {
      const githubUrl = remoteUrl
        .replace(/^git@github\.com:/, 'https://github.com/')
        .replace(/\.git$/, '');
      
      console.log(chalk.blue('\n🔗 Repository:'));
      console.log(chalk.cyan(githubUrl));
      console.log(chalk.cyan(githubUrl + '/releases'));
    }
  } catch (e) {
    // Ignore error if we can't get remote URL
  }
  
} catch (error) {
  console.log(chalk.red('❌ Error pushing to GitHub:'), error.message);
  process.exit(1);
}
