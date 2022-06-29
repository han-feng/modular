#!/usr/bin/env node
/*
 * 版本号设置/同步工具：
 * 1、通过命令行传递 version 参数时，将同步设置 package.json 和 sonar-project.properties 文件中的版本号
 * 2、未指定 version 参数时，读取 package.json 中 version 的值，更新 sonar-project.properties 文件中的版本号
 * 该脚本设计为在 package.json 中 scripts 配置，并使用 node 执行。该脚本应放置于 script（或scripts）目录中。
 */
import chalk from 'chalk'
import fs from 'fs'
// const fs = require('fs')
// const chalk = require('chalk')
const sonarPath = 'sonar-project.properties'

let version = process.argv[2] // 第一个命令行参数是要设置的版本号，可选

if (!version) {
  version = process.env.npm_package_version
} else if (version !== process.env.npm_package_version) {
  // 需要更新 package.json
  const packagePath = 'package.json'
  const packageJSON = require('../' + packagePath) // pacakge.json 在上一级目录中
  packageJSON.version = version

  fs.writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2))
  console.log(chalk.green(`set package.version ${version}`))
}

if (!fs.existsSync(sonarPath)) {
  console.log(chalk.yellow('skipped: sonar-project.properties'))
  process.exit(0)
}
const sonarFile = fs.readFileSync(sonarPath, 'utf8')

const sonarVersionRegex = /sonar\.projectVersion=(.*)/
const match = sonarFile.match(sonarVersionRegex)
if (!match) {
  console.error(chalk.red('sonar-project.properties file doesn\'t have a version number. Fix this and run again.'))
  process.exit(1)
}

const oldSonarVersionString = match[0]
const newSonarVersionString = `sonar.projectVersion=${version}`
if (oldSonarVersionString !== newSonarVersionString) {
  fs.writeFileSync(sonarPath, sonarFile.replace(oldSonarVersionString, newSonarVersionString), 'utf8')
  console.log(chalk.green(`replace '${oldSonarVersionString}' -> '${newSonarVersionString}'`))
}
