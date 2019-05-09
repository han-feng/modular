const { task, src, dest, series } = require('gulp')
const plugins = require('gulp-load-plugins')()
const del = require('del')
const pump = require('pump')
const dotgitignore = require('dotgitignore')()

const { typescript, match, terser, license, filter, zip } = plugins

const project = typescript.createProject('tsconfig.json')

task('clean', () => del('dist'))

task('build', callback => {
  pump([
    project.src(),
    project(),
    plugins.if(
      file => match(file, '*.js'),
      terser()
    ),
    license('MIT', { organization: 'han_feng@foxmail.com' }),
    dest('dist')
  ], callback)
})

task('source', callback => {
  pump([
    // '**'不包含'.'开头的文件，需要补充'**/.*'
    src(['**{,/.*}', '!node_modules', '!.git']),
    filter(file => !dotgitignore.ignore(file.path)),
    zip('source.zip'),
    dest('dist')
  ], callback)
})

task('default', series('clean', 'build'))
