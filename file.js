var WeakmapEvent = require('weakmap-event')
var prettyBytes = require('pretty-bytes')
var cuid = require('cuid')
var hg = require('mercury')
var h = require('mercury').h

var RemoveEvent = WeakmapEvent()

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

File.onRemove = RemoveEvent.listen

File.render = function render (state, parentHandles) {
  return h('li', [
    h('span', state.path + ' (' + prettyBytes(state.size) + ')'),
    h('input', {
      'type': 'button',
      'value': 'Remove',
      'title': 'remove',
      'ev-click': hg.send(parentHandles.remove, {
        id: state.id
      })
    })
  ])
}

module.exports = File
