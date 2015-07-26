var document = require('global/document')
var dragDrop = require('drag-drop/buffer')
var Importer = require('node-matrix-importer')
var Bundler = require('node-matrix-bundler')
var sanitize = require('sanitize-filename')
var concat = require('concat-stream')
var hg = require('mercury')
var h = require('mercury').h

var File = require('./file.js')
var globalState

function Bundle (opts) {
  opts = opts || {}

  var state = hg.state({
    title: hg.value('export'),
    path: hg.value('export'),
    rootFolder: hg.value(true),
    files: hg.varhash(opts.files || {}, File),
    droppable: hg.value(false),
    channels: {
      remove: remove,
      download: download,
      changeTitle: changeTitle,
      rootFolder: rootFolder
    }
  })

  File.onRemove.toHash(state.files, function onDestroy (ev) {
    remove(state, ev)
  })

  return state
}

Bundle.render = function render (state) {
  return h('div', [
    h('input', {
      type: 'text',
      value: state.title,
      name: 'title',
      'ev-event': hg.sendChange(state.channels.changeTitle)
    }),
    h('input', {
      type: 'checkbox',
      checked: state.rootFolder,
      'ev-change': hg.send(state.channels.rootFolder, !state.rootFolder)
    }),
    h('ul', Object.keys(state.files)
      .map(function renderFile (file) {
        return File.render(state.files[file], state.channels)
      })
    ),
    h('input', {
      type: 'button',
      value: 'Download!',
      'ev-click': hg.send(state.channels.download)
    }),
    hg.partial(importArea)
  ])
}

// sneaky global
globalState = Bundle()

function add (state, data) {
  if (!data.size) {
    data.size = data.contents.length
  }

  var file = File(data)

  state.files.put(file.id(), file)
}

function remove (state, file) {
  state.files.delete(file.id)
}

function download (state) {
  var importer = Importer()
  var bundle = Bundler({
    writer: importer
  })

  var files = Object.keys(state.files)
  var counter = files.length
  var rootFolder

  if (state.rootFolder()) {
    rootFolder = importer.createAsset({ type: 'folder' })

    bundle.globalRootNode = rootFolder.id

    importer.setAttribute({
      assetId: rootFolder.id,
      attribute: 'name',
      value: state.title()
    })

    importer.addPath({
      assetId: rootFolder.id,
      // regex from http://stackoverflow.com/a/8485137
      path: state.title().replace(/[^a-z0-9]/gi, '_')
    })
  }

  files.forEach(function addFile (file) {
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
  state.path.set(sanitize(data.title))
}

function rootFolder (state, data) {
  state.rootFolder.set(data)
}

function importArea () {
  return h('div', {
    style: {
      height: '100px',
      border: '2px dashed blue'
    },
    'ev-import': new ImportHook()
  })
}

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
}

hg.app(document.body, globalState, Bundle.render)
