var prettyBytes = require('pretty-bytes')
var cuid = require('cuid')
var hg = require('mercury')
var h = require('mercury').h

function File (opts) {
  opts = opts || {}

  return hg.state({
    id: hg.value(opts.id || cuid()),
    path: hg.value(opts.path || ''),
    title: hg.value(opts.title || opts.path || ''),
    size: hg.value(opts.size || 0),
    contents: hg.value(opts.contents || '')
  })
}

File.render = function render (state) {
  return h('li', state.path + ' (' + prettyBytes(state.size) + ')')
}

module.exports = File
