var dragDrop = require('drag-drop/buffer')
var hg = require('mercury')

function FileImportWidget (importfn) {
  this.type = 'Widget'
  this.importfn = importfn
}

FileImportWidget.prototype.init = function () {
  this.target = document.createElement('div')

  dragDrop(this.target, function getFiles (files) {
    files.forEach(function processFile (file) {
      hg.send(this.importfn(file.name, file))
    }, this)
  }.bind(this))

  return this.target
}

FileImportWidget.prototype.update = function (prev, elem) {
  this.target = this.target || prev.target
}

module.exports = FileImportWidget
