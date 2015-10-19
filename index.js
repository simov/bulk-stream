
var util = require('util')
  , stream = require('stream')
var isstream = require('isstream')

util.inherits(BulkStream, stream.Readable)
module.exports = BulkStream


function BulkStream () {
  stream.Readable.call(this)

  var self = this
  self._items = []
  self._streams = []
  self._index = 0
}

BulkStream.prototype.append = function (item) {
  var self = this
  if (isstream(item)) {
    self._streams.push(item)
  }
  self._items.push(item)
}

BulkStream.prototype._read = function (n) {
  var self = this

  if (self._index === self._items.length) {
    self.push(null)
    return
  }

  var item = self._items[self._index]
  if (item._reading) {
    return
  }

  if (isstream(item)) {
    item._reading = true
    item.on('readable', function () {
      var chunk = item.read()
      if (chunk === null) {
        self._index++
        self._read()
      }
      else {
        self.push(chunk)
      }
    })
  }
  else {
    self._index++
    self.push(item)
  }
}
