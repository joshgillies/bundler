#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))
var toHTML = require('vdom-to-html')
var falafel = require('falafel')
var JSONGlobals = require('json-globals')
var fs = require('fs')
var h = require('mercury').h

try {
  var script = fs.readFileSync(argv._[0])
  ;(function createExports () {
    var renderfns

    falafel(script, function createExports (node) {
      console.log(node)
    })
  })()
} catch (e) {
  console.log('Couldn\'t load file: ' + argv._[0] + '!\n' + e)
}

function layout(content, state) {
  return h('html', [
    h('head', [
      h('title', 'Squiz Matrix Bundler')
    ]),
    h('body', [
      content,
      h('script', JSONGlobals({
        state: state
      })),
      h('script', {
        src: 'bundle.js'
      })
    ])
  ])
}
