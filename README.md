# wp-release-automation

## Overview

wp-release-automation is a command-line tool designed to streamline the release process for WordPress plugins and themes. It automates versioning, building, zipping, and releasing your projects, making it easier to manage updates and deployments.

## Features

- Automatic version bumping (patch, minor, major)
- Build process management
- Zip file creation for distribution
- Git integration for committing and pushing changes
- Customizable configuration settings

## Installation

To install wp-release-automation, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/wp-release-automation.git
cd wp-release-automation
npm install
```

## Usage

After installation, you can use the tool via the command line. The main command is `wp-release`, which provides various subcommands for different tasks.

### Commands

- **Versioning**: Bump the version number of your plugin or theme.
  ```bash
  ./bin/wp-release version --bump <type>
  ```
  Replace `<type>` with `patch`, `minor`, or `major`.

- **Build**: Prepare your plugin or theme for release.
  ```bash
  ./bin/wp-release build
  ```

- **Zip**: Create a zip archive of your plugin or theme.
  ```bash
  ./bin/wp-release zip
  ```

- **Release**: Execute the full release process, including versioning, building, zipping, and pushing to Git.
  ```bash
  ./bin/wp-release release
  ```

## Configuration

You can customize the behavior of wp-release-automation by creating a configuration file. An example configuration file can be found in the `templates` directory.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.