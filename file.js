var cuid = require('cuid')
var hg = require('mercury')
var h = require('mercury').h

function File (opts) {
  opts = opts || {}

  return hg.state({
    id: hg.value(opts.id || cuid()),
    path: hg.value(opts.path || ''),
    title: hg.value(opts.name || opts.path || ''),
    contents: hg.value(opts.contents || '')
  })
}

File.render = function render (state) {
  return h('li', state.path)
}

module.exports = File
