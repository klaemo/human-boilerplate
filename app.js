var templates = require('templates')
var router = require('./router')

console.log('I am app.js')

document.addEventListener("DOMContentLoaded", function(event) {
    document.body.innerHTML = templates.pages.index({
      greeting: 'Hello, fellow human!'
    })
})
