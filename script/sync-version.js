#!/usr/bin/env node
// 版本号同步工具
// 读取 package.json 中 version 的值，更新 sonar-project.properties 中的 sonar.projectVersion 的值
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const packagePath = path.resolve(process.cwd(), 'package.json')
const sonarPath = path.resolve(process.cwd(), 'sonar-project.properties')

if (!fs.existsSync(packagePath)) {
  console.error(chalk.red(`No package.json file found in' ${process.cwd()} is this a JavaScript repo?`))
  process.exit(1)
}

const packageJson = require(packagePath)

if (!packageJson.version) {
  console.error(chalk.red('package.json has no version field'))
}

if (!fs.existsSync(sonarPath)) {
  console.log(chalk.yellow('skipped: sonar-project.properties'))
  return
}
const sonarFile = fs.readFileSync(sonarPath, 'utf8')

const sonarVersionRegex = /sonar\.projectVersion=(.*)/
const match = sonarFile.match(sonarVersionRegex)
if (!match) {
  console.error(chalk.red('sonar-project.properties file doesn\'t have a version number. Fix this and run again.'))
  process.exit(1)
}

const oldSonarVersionString = match[0]
const newSonarVersionString = `sonar.projectVersion=${packageJson.version}`
if (oldSonarVersionString !== newSonarVersionString) {
  fs.writeFileSync(sonarPath, sonarFile.replace(oldSonarVersionString, newSonarVersionString), 'utf8')
  console.log(chalk.green(`replace '${oldSonarVersionString}' -> '${newSonarVersionString}'`))
}
