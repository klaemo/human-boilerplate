var fs = require('fs')
var path = require('path')

var less = require('less')
var templatizer = require('templatizer')

var config = require('./config.json')

function onError (err) {
  console.error(err)
  process.exit(1)
}

exports.templates = function buildTemplates(cb) {
  var dest = path.join(config.templates, 'templates.js')
  try {
    templatizer(config.templates, dest, { compileDebug: true })
  } catch(err) {
    return cb(err)
  }
  cb()
}

exports.js = function buildJS(watchify, cb) {
  var templates = path.join(config.templates, 'templates.js')
  var dest = path.join(config.public, 'app.bundle.js')
  
  watchify
    .add(require.resolve('./' + config.entrypoint))
    .require(require.resolve('./' + templates), { expose: 'templates' })
    .bundle({ debug: true })
    .on('error', onError)
    .pipe(fs.createWriteStream(dest))
    .on('error', onError)
    .on('close', cb)
}

exports.css = function buildCSS(cb) {
  var parser = new(less.Parser)({
    paths: [ './' + config.styles ], // Specify search paths for @import directives
    filename: 'app.less' // Specify a filename, for better error messages
  })

  fs.readFile(path.join(config.styles, 'app.less'), 'utf-8', function (err, file) {
    if (err) return cb(err)

    parser.parse(file, function (err, tree) {
      if (err) return cb(err)
      
      var css = tree.toCSS({
        sourceMap: true,
        // sourceMapFilename: 'tmp/sourceMapLessInline.css.map',
        outputSourceFiles: true,
      })

      fs.writeFile(path.join(config.public, 'app.bundle.css'), css, cb)
    })
  })
}
