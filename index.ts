#!/usr/bin/env node

import chalk from 'chalk'
import { Command } from 'commander'
import fs from 'fs'
import ora from 'ora'
import symbols from 'log-symbols'
import semver from 'semver'
import got from 'got'
import { readFile } from 'fs/promises'
import clone from 'git-clone/promise.js'
import rm from 'rimraf'

import path from 'path'

const repoShorthands: Record<string, string> = {
  react: 'https://github.com/create-fun-cli/react-template.git',
  'react-ts': 'https://github.com/create-fun-cli/react-ts-template.git',
}

let packageJson: Record<string, string>

try {
  const data = await readFile(path.join(process.cwd(), './package.json'), { encoding: 'utf-8' })
  packageJson = JSON.parse(data)
} catch (err) {
  console.error(chalk.red('文件package.json读取失败，请检查'))
  process.exit(1)
}

let projectName: string

await init()

async function init() {
  const program = new Command(packageJson.name)

  program.configureOutput({
    writeOut: str => process.stdout.write(`[OUT] ${str}`),
    writeErr: str => process.stdout.write(`[ERR] ${str}`),
    outputError: (str, write) => write(chalk.red(str)),
  })

  program
    .version(packageJson.version)
    .description(packageJson.description)
    .argument('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
      projectName = name
    })
    .option('--template <path-to-template>', 'specify a template for the created project', 'react-ts')
    .parse(process.argv)

  if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:')
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`)
    console.log()
    console.log('For example:')
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-react-app')}`)
    console.log()
    console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`)
    process.exit(1)
  }

  try {
    const latest = await checkForLatestVersion()
    if (latest && semver.lt(packageJson.version, latest)) {
      console.log()
      console.error(chalk.yellow(`${program.name()}@${packageJson.version}非最新版本, 请重新下载最新版本：${latest}。`))
      console.log()
      console.log(
        `执行下列命令移除全局安装的包：\n
          - npm uninstall -g ${program.name()}\n
          - yarn global remove ${program.name()}`,
      )
      console.log()
      process.exit(1)
    } else {
      if (!fs.existsSync(projectName)) {
        const spinner = ora('下载中...')
        spinner.start()
        try {
          const template = program.opts().template
          const root = path.resolve(projectName)
          const appName = path.basename(root)
          await install(root, appName, template)
          spinner.succeed()
        } catch (err) {
          spinner.fail()
          console.log(symbols.error, chalk.green('模板下载失败，请重试。'))
          process.exit(1)
        }
      } else {
        console.log(symbols.error, chalk.red(`目录 ${projectName} 已被占用`))
      }
    }
  } catch (err) {
    throw err
  }
}

async function checkForLatestVersion() {
  try {
    const data = await got
      .get(`https://registry.npmjs.org/-/package/${packageJson.name}/dist-tags`)
      .json<{ latest: string }>()
    return data.latest
  } catch (err) {
    throw err
  }
}

async function install(appPath: string, appName: string, template: string) {
  // TODO: 实现 react-scripts init 方法 https://github.com/facebook/create-react-app/blob/67b48688081d8ee3562b8ac1bf6ae6d44112745a/packages/react-scripts/scripts/init.js#L84
  await clone(appPath, appName)
  rm(path.resolve(appPath, '.git'), {}, () => {})
}
