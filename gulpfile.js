const { dest, series } = require('gulp')
const ts = require('gulp-typescript')
const del = require('del')
const pump = require('pump')
const license = require('gulp-license')

const project = ts.createProject('tsconfig.json')

const clean = function () {
  return del('dist')
}
exports.clean = clean

const build = function (callback) {
  pump([
    project.src(),
    project(),
    license('MIT', { organization: 'han_feng@foxmail.com' }),
    dest('dist')
  ], callback)
}
exports.build = build

exports.default = series(clean, build)
