var document = require('global/document')
var dragDrop = require('drag-drop/buffer')
var Bundler = require('node-matrix-bundler')
var concat = require('concat-stream')
var hg = require('mercury')
var h = require('mercury').h

var File = require('./file.js')
var bundle = Bundler()

function Bundle (opts) {
  opts = opts || {}

  return hg.state({
    title: hg.value('export'),
    files: hg.varhash(opts.files || {}, File),
    droppable: hg.value(false),
    channels: {
      add: add,
      remove: remove,
      download: download,
      changeTitle: changeTitle
    }
  })
}

function add (state, data) {
  if (!data.size) {
    data.size = data.contents.length
  }

  var file = File(data)

  state.files.put(file.id(), file)
}

function remove (state, file) {
  state.files.delete(file.id())
}

function download (state) {
  Object.keys(state.files).forEach(function addFiles (file) {
    file = state.files[file]
    bundle.add(file.path(), file.contents())
  })

  bundle.createBundle().pipe(concat(function downloadBundle (buf) {
    var link = document.createElement('a')
    link.href = 'data:application/gzip;base64,' + buf.toString('base64')
    link.download = state.title() + '.tgz'
    link.click()
  }))
}

function changeTitle (state, data) {
  state.title.set(data.title)
}

Bundle.render = function render (state) {
  return h('div', [
    h('input', {
      type: 'text',
      value: state.title,
      name: 'title',
      'ev-event': hg.sendChange(state.channels.changeTitle)
    }),
    h('ul', Object.keys(state.files)
      .map(function renderFile (file) {
        return File.render(state.files[file])
      })
    ),
    h('form', {
      'ev-event': hg.sendSubmit(state.channels.add)
    }, [
      h('input', {
        type: 'text',
        name: 'path',
        placeholder: 'file.txt',
        required: true
      }),
      h('input', {
        type: 'text',
        name: 'contents',
        placeholder: 'file content',
        required: true
      }),
      h('input', {
        type: 'submit',
        value: 'add'
      })
    ]),
    h('input', {
      type: 'button',
      value: 'Download!',
      'ev-click': hg.send(state.channels.download)
    }),
    hg.partial(function importArea (ready) {
      var attributes = {
        style: {
          height: '100px'
        }
      }

      if (!ready) {
        attributes['ev-import'] = new ImportHook()
      }

      return h('div', attributes)
    }, state.droppable)
  ])
}

var globalState = Bundle()

function ImportHook () {}

ImportHook.prototype.hook = function hook (node) {
  dragDrop(node, function getFiles (files) {
    files.forEach(function processFile (file) {
      add(globalState, {
        path: file.name,
        size: file.size,
        contents: file
      })
    })
  })

  globalState.droppable.set(true)
}

hg.app(document.body, globalState, Bundle.render)
