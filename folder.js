var cuid = require('cuid')
var hg = require('mercury')
var h = require('mercury').h

function Folder (opts) {
  opts = opts || {}

  return hg.state({
    id: hg.value(opts.id || cuid()),
    title: hg.value(opts.title || ''),
    children: hg.varhash(),
    linkType: hg.value('type_1')
  })
}

Folder.render = function render (folder) {
  return h('ul', { key: folder.id }, [])
}
