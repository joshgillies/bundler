var document = require('global/document')
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
    channels: {
      add: add,
      remove: remove,
      download: download,
      changeTitle: changeTitle
    }
  })
}

function add (state, data) {
  var file = File({
    path: data.path,
    contents: data.contents
  })
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
        value: 'file.txt'
      }),
      h('input', {
        type: 'text',
        name: 'contents',
        value: 'file comtent'
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
    })
  ])
}

hg.app(document.body, Bundle(), Bundle.render)