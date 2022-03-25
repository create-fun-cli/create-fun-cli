# create-fun-cli

[![npm version](https://badge.fury.io/js/create-fun-cli.svg)](https://badge.fury.io/js/create-fun-cli)
[![Publish](https://github.com/create-fun-cli/create-fun-cli/actions/workflows/publish.yaml/badge.svg)](https://github.com/create-fun-cli/create-fun-cli/actions/workflows/publish.yaml)

Generate a new frontend project.

## Usage

npx
```shell
npx create-fun-cli <directory>
```

npm
```shell
npm init fun-cli <directory>
```

Yarn
```shell
yarn create fun-cli <directory>
```

## Release

#### 1. Set package version.

```shell
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
```

#### 2. Push all tags to GitHub.

```shell
git push --tags
```

#### 3. Create a release.

Release a new version in [release page](https://github.com/create-fun-cli/create-fun-cli/releases).

#### 4. Verify the workflow.

Visit [GitHub Action](https://github.com/create-fun-cli/create-fun-cli/actions) page to verify the result of the workflow.