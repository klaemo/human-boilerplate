var http = require('http')
var fs = require('fs')
var path = require('path')

var st = require('st')
var watch = require('watch')
var watchify = require('watchify')

var config = require('./config.json')
var build = require('./build')

build.templates()
watch.watchTree(path.join(__dirname, config.templates), {
  ignoreDotFiles: true,
  filter: function (file) {
    if (/.js$/.test(file)) return false
    return true
  },
}, function (file) {
  build.templates()
  console.log('>>> rebuilt templates')
})

watch.watchTree(path.join(__dirname, config.styles), {
  ignoreDotFiles: true,
}, function (file) {
  build.css()
  console.log('>>> rebuilt css')
})

var w = watchify()
build.js(w)

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

  console.log('>>> rebuilt js')
})

http.createServer(st({
  path: config.public,
  cache: false,
  index: 'index.html'
})).listen(3000)