var WeakmapEvent = require('weakmap-event')
var document = require('global/document')
var prettyBytes = require('pretty-bytes')
var nextTick = require('next-tick')
var cuid = require('cuid')
var hg = require('mercury')
var h = require('mercury').h

var RemoveEvent = WeakmapEvent()

function File (opts) {
  opts = opts || {}

  return hg.state({
    id: hg.value(opts.id || cuid()),
    path: hg.value(opts.path || ''),
    editing: hg.value(opts.editing || false),
    title: hg.value(opts.title || ''),
    size: hg.value(opts.size || 0),
    contents: hg.value(opts.contents || ''),
    channels: {
      startEdit: function startEdit (state) {
        console.log(state.editing())
        state.editing.set(true)
      },
      finishEdit: function finishEdit (state, data) {
        if (state.editing() === false) {
          return
        }

        state.editing.set(false)
        state.title.set(data.title)
      }
    }
  })
}

File.onRemove = RemoveEvent.listen

File.render = function render (file, parentHandles) {
  return h('li', { key: file.id }, [
    (file.enditing ? h('input', {
      type: 'text',
      value: file.title || 'test',
      name: 'title',
      'ev-focus': file.editing ? FocusHook() : null,
      'ev-event': hg.sendSubmit(file.channels.finishEdit),
      'ev-blur': hg.sendValue(file.channels.finishEdit)
    }) : (file.title ? h('span', {
      'ev-dblclick': hg.send(file.channels.startEdit)
    }, file.title) : null)),
    h('span', file.path + ' (' + prettyBytes(file.size) + ')'),
    h('input', {
      type: 'button',
      value: 'Edit',
      name: 'edit',
      'ev-click': hg.send(file.channels.startEdit)
    }),
    h('input', {
      type: 'button',
      value: 'Remove',
      name: 'remove',
      'ev-click': hg.send(parentHandles.remove, {
        id: file.id
      })
    })
  ])
}

module.exports = File

function FocusHook () {}

FocusHook.prototype.hook = function hook (node, property) {
  nextTick(function onTick () {
    if (document.activeElement !== node) {
      node.focus()
    }
  })
}
