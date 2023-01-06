# cz-smartbr-changelog

Status:
[![npm version](https://img.shields.io/npm/v/cz-smartbr-changelog.svg?style=flat-square)](https://www.npmjs.com/package/cz-smartbr-changelog)

inspired by [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog)

-------

A [commitizen](https://github.com/commitizen/cz-cli) adapter created to standardize commit messages in Smart Br company.
The current pattern is

```
(#<task|history-code>)[<scope?>]: <commit-title>
```

## Configuration
It is a solution made for a commitizen friendly repo, so follow the steps to use it in the project:

### Installing commitizen

Install [commitizen](https://github.com/commitizen/cz-cli#making-your-repo-commitizen-friendly) globally

```bash
npm install commitizen -g
```
### Adding to the project

Install in your project with npm:

```bash
npm i cz-smartbr-changelog --save-dev #development dependency
```

or with yarn:

```bash
yarn add cz-smartbr-changelog -D #development dependency
```

In your `package.json`, add:

```json5
"config": {
    # ... other dependencies
    "commitizen": {
      "path": "./node_modules/cz-smartbr-changelog"
    }
  }
```
