
var util = require('util')
  , stream = require('stream')
var isstream = require('isstream')

util.inherits(BulkStream, stream.Readable)
module.exports = BulkStream


function BulkStream () {
  stream.Readable.call(this)

  var self = this
  self._items = []

  process.nextTick(function () {
    self.start()
  })
}

BulkStream.prototype.append = function (item) {
  if (isstream(item)) {
    item.pause()
  }
  this._items.push(item)
}

BulkStream.prototype.start = function () {
  var self = this

  var read = function (index) {
    if (index === self._items.length) {
      process.nextTick(function () {
        self.push(null)
      })
      return
    }

    var item = self._items[index]
    if (isstream(item)) {
      item.on('data', function (chunk) {
        self.push(chunk)
      })
      item.on('end', function () {
        read(++index)
      })
      item.resume()
    }
    else {
      self.push(item)
      read(++index)
    }
  }

  read(0)
}

BulkStream.prototype._read = function (n) {}
