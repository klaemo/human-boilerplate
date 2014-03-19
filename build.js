var fs = require('fs')
var path = require('path')

var less = require('less')
var templatizer = require('templatizer')

var config = require('./config.json')

function onError (err) {
  console.error(err)
  process.exit(1)
}

exports.templates = function buildTemplates() {
  var dest = path.join(config.templates, 'templates.js')
  templatizer(config.templates, dest, { compileDebug: true })
}

exports.js = function buildJS(watchify) {
  var templates = path.join(config.templates, 'templates.js')
  var dest = path.join(config.public, 'app.bundle.js')
  
  watchify
    .require(require.resolve('./' + config.entrypoint), { entry: true })
    .require(require.resolve('./' + templates), { expose: 'templates' })
    .bundle({ debug: true })
    .on('error', onError)
    .pipe(fs.createWriteStream(dest))
    .on('error', onError)
}

exports.css = function buildCSS() {
  var parser = new(less.Parser)({
    paths: [ './' + config.styles ], // Specify search paths for @import directives
    filename: 'app.less' // Specify a filename, for better error messages
  })

  parser.parse(fs.readFileSync(path.join(config.styles, 'app.less'), 'utf-8'), function (err, tree) {
    if (err) return console.error(err)

    fs.writeFileSync(path.join(config.public, 'app.bundle.css'), tree.toCSS({
      sourceMap: true,
      // sourceMapFilename: 'tmp/sourceMapLessInline.css.map',
      outputSourceFiles: true,
    }), 'utf8');
  })
}
