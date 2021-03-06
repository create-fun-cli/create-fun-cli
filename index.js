#!/usr/bin/env node

const chalk = require('chalk')
const { Command } = require('commander')
const inquirer = require('inquirer')
const fs = require('fs')
const ora = require('ora')
const symbols = require('log-symbols')
const download = require('download-git-repo')
const https = require('https')
const semver = require('semver')
const shell = require('shelljs')
const packageJson = require('./package.json')

let projectName

function init() {
  const program = new Command(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .arguments('<directory>')
    .usage(`${chalk.green('<directory>')}`)
    .action(name => {
      projectName = name
    })
    .allowUnknownOption()
    .on('--help', () => {
      console.log()
      console.log(`Only ${chalk.green('<directory>')} is required.`)
      console.log()
    })
    .parse(process.argv)

  checkForLatestVersion()
    .catch(() => {
      try {
        return shell.exec('npm view create-fun-cli version').toString().trim()
      } catch (e) {
        return null
      }
    })
    .then(latest => {
      if (latest && semver.lt(packageJson.version, latest)) {
        console.log()
        console.error(
          chalk.yellow(
            `You are running "${program.name()}@${
              packageJson.version
            }", which is behind the latest release (${latest}), please reinstall the latest version package.`,
          ),
        )
        console.log()
        console.log(
          'Please remove any global installs with one of the following commands:\n' +
            `- npm uninstall -g ${program.name()}\n` +
            `- yarn global remove ${program.name()}`,
        )
        console.log()
        process.exit(1)
      } else {
        if (!fs.existsSync(projectName)) {
          inquirer
            .prompt([
              {
                type: 'list',
                name: 'type',
                message: 'Please select a frontend framework:',
                choices: ['react', 'vue'],
              },
              {
                type: 'confirm',
                name: 'ts',
                message: 'Whether to support Typescript?',
                default: true,
              },
            ])
            .then(answers => {
              const repoName = getRepoName(answers)
              const spinner = ora('Downloading...')

              spinner.start()

              download(repoName, projectName, function (err) {
                if (err) {
                  spinner.error()
                  process.exit(1)
                } else {
                  spinner.succeed()
                  console.log(symbols.success, chalk.green('The object has been created successfully!'))
                }
              })
            })
        } else {
          console.log(symbols.error, chalk.red('Directory exists'))
        }
      }
    })
}

function getRepoName(answers) {
  const { type, ts } = answers
  let repo = 'github:create-fun-cli/'

  if (type === 'react' && !ts) {
    return repo + 'react-template'
  } else if (type === 'react' && ts) {
    return repo + 'react-ts-template'
  } else if (type === 'vue' && !ts) {
    return repo + 'vue-template'
  } else if (type === 'vue' && ts) {
    return repo + 'vue-ts-template'
  }
}

function checkForLatestVersion() {
  return new Promise((resolve, reject) => {
    https
      .get(`https://registry.npmjs.org/-/package/${packageJson.name}/dist-tags`, res => {
        if (res.statusCode === 200) {
          let data = ''
          res.on('data', chunk => (data += chunk))
          res.on('end', () => {
            try {
              const latest = JSON.parse(data || '{}')?.latest
              if (latest) {
                resolve(latest)
              } else {
                reject()
              }
            } catch (err) {
              throw err
            }
          })
        } else {
          reject()
        }
      })
      .on('error', () => {
        reject()
      })
  })
}

init()
