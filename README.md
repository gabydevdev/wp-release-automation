# WordPress Release Automation

A comprehensive CLI tool for automating WordPress plugin and theme release processes with version management, ZIP creation, and Git integration.

## Features

- 🔄 **Version Management**: Automated version bumping across multiple files
- 📦 **ZIP Creation**: WordPress-ready distribution packages
- 🏷️ **Git Integration**: Automatic commits, tagging, and pushing
- ⚙️ **Configurable**: Flexible configuration for different project needs
- 🚀 **Complete Workflow**: From version bump to GitHub release
- 📝 **WordPress Standards**: Follows WordPress plugin/theme conventions

## Installation

### Global Installation (Recommended)

```bash
npm install -g wp-release-automation
```

### Local Installation

```bash
npm install --save-dev wp-release-automation
```

## Quick Start

1. **Initialize your project:**
   ```bash
   cd your-wordpress-plugin
   wp-release init
   ```

2. **Bump version and release:**
   ```bash
   npm run version:patch
   npm run wp-publish
   ```

3. **Your WordPress-ready ZIP file is created and pushed to GitHub!**

## CLI Commands

### Initialize Project
```bash
wp-release init
```
Sets up configuration and package.json scripts for your WordPress project.

### Version Management
```bash
wp-release version --type patch|minor|major
```

### Build Process
```bash
wp-release build
```
Updates version numbers across all configured files and creates build directory.

### Create Distribution ZIP
```bash
wp-release zip
```
Creates a WordPress-ready ZIP file for distribution.

### Complete Release
```bash
wp-release release --type patch|minor|major [--dry-run]
```
Full release process: version bump → build → ZIP → Git tag.

### Publish to GitHub
```bash
wp-release publish --type patch|minor|major [--dry-run]
```
Complete release with push to GitHub.

## NPM Scripts

After initialization, these scripts are available in your project:

```bash
# Version management
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0
npm run version:major   # 1.0.0 → 2.0.0

# Build and package
npm run build          # Update versions and create build directory
npm run zip            # Create distribution ZIP

# Complete workflows
npm run release        # Build → ZIP → Tag
npm run wp-publish     # Release → Push to GitHub
```
npm run publish        # Release → Push to GitHub
```

## Configuration

The `wp-release init` command creates a `wp-release.config.js` file:

```javascript
module.exports = {
  "pluginName": "my-plugin",
  "mainFile": "my-plugin.php",
  "buildDir": "build",
  "zipName": "{{name}}-{{version}}.zip",
  "excludePatterns": [
    "node_modules/",
    ".git/",
    "src/",
    "*.log",
    ".env*",
    "tests/",
    "*.md"
  ],
  "config": {
    "includeGitOps": true,
    "tagPrefix": "v",
    "branch": "main"
  }
};
```

## Workflow Examples

### Simple Release
```bash
# Bump patch version and release
npm run version:patch
npm run wp-publish
```

### Step by Step
```bash
# 1. Bump version
npm run version:minor

# 2. Update files and create ZIP
npm run build
npm run zip

# 3. Git operations
npm run git:tag
npm run git:push
```

### Using CLI Directly
```bash
# One command release
wp-release publish --type patch

# Dry run to see what would happen
wp-release release --type minor --dry-run
```

## File Structure

After initialization, your project will have:

```
your-plugin/
├── package.json           # NPM scripts added
├── wp-release.config.js   # Configuration
├── your-plugin.php        # Version updated automatically
├── README.md             # Version updated automatically
└── your-plugin-1.0.0.zip # Distribution ZIP created
```

## Version Updates

The tool automatically updates version numbers in:

- **WordPress Plugin Headers**: `* Version: 1.0.6`
- **Plugin Constants**: `define('PLUGIN_VERSION', '1.0.0')`
- **README.md**: Version headers and stable tags
- **package.json**: NPM version

## Git Integration

When Git operations are enabled:

- **Automatic commits** with descriptive messages
- **Git tags** with release notes
- **Push to GitHub** with tags
- **Release-ready** for GitHub Releases

## Advanced Usage

### Custom Scripts

Add to your package.json:

```json
{
  "scripts": {
    "pre-release": "npm run test && npm run lint",
    "release:beta": "npm run version:patch && npm run build && npm run zip",
    "deploy": "npm run wp-publish && echo 'Released!'"
  }
}
```

### Hooks

Configure hooks in `wp-release.config.js`:

```javascript
module.exports = {
  // ...other config
  "hooks": {
    "preRelease": ["npm run test"],
    "postRelease": ["echo 'Release complete!'"],
    "preBuild": ["npm run compile"],
    "postBuild": ["npm run optimize"]
  }
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/gabydevdev/wp-release-automation/issues)
- **Documentation**: [GitHub Wiki](https://github.com/gabydevdev/wp-release-automation/wiki)

---

**Made for WordPress developers who want professional release automation** 🚀