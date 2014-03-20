var http = require('http')
var fs = require('fs')
var path = require('path')

var st = require('st')
var watch = require('watch')
var watchify = require('watchify')

var config = require('./config.json')
var build = require('./build')

function callback (err) {
  if (err) return console.error(err)
}

/**
 * build and watch templates
 */
build.templates(callback)
watch.watchTree(path.join(__dirname, config.templates), {
  ignoreDotFiles: true,
  filter: function (file) {
    if (/.js$/.test(file)) return false
    return true
  },
}, function (file) {
  build.templates(callback)
})

/**
 * watch styles directory
 */
watch.watchTree(path.join(__dirname, config.styles), {
  ignoreDotFiles: true,
}, function (file) {
  build.css(callback)
})

/**
 * build and watch javascript
 */
var w = watchify()
build.js(w, callback)

function onError (err) {
  console.error(err)
  process.exit(1)
}

w.on('update', function (ids) {
  var dest = path.join(config.public, 'app.bundle.js')

  w.bundle({ debug: true })
    .on('error', onError)
    .pipe(fs.createWriteStream(dest))
    .on('error', onError)
})

/**
 * start a little static file server
 */
http.createServer(st({
  path: config.public,
  cache: false,
  index: 'index.html'
})).listen(3000, function () {
  console.log('Ready for you at http://localhost:3000')
})
