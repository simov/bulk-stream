
var util = require('util')
  , stream = require('stream')
var isstream = require('isstream')

util.inherits(BulkStream, stream.Readable)
module.exports = BulkStream


function BulkStream () {
  stream.Readable.call(this)

  var self = this
  self._items = []
  self._index = 0
  self._isPaused = false
  self._isReading = false
}

BulkStream.prototype.append = function (item) {
  var self = this

  if (isstream(item)) {
    self._initStream(item)
  }
  self._items.push(item)
}

BulkStream.prototype._initStream = function (stream) {
  var self = this

  stream.isReadable = false
  stream.isActive = false

  stream.on('readable', function () {
    stream.isReadable = true
    if (stream.isActive) {
      self._read()
    }
  })
  stream.on('end', function () {
    stream.isReadable = true
    self._read()
  })
}

BulkStream.prototype._onPipesDrain = function () {
  var self = this

  if (self._readableState.pipesCount > 0) {
    var pipes = self._readableState.pipesCount > 1
      ? self._readableState.pipes
      : [self._readableState.pipes]

    pipes.forEach(function (pipe) {
      pipe.on('drain', function () {
        self._isPaused = false
        self._read()
      })
    })
  }
}

BulkStream.prototype._read = function () {
  var self = this

  if (!self._isReading) {
    self._isReading = true
    self._onPipesDrain()
  }

  if (self._isPaused) {
    return
  }

  if (self._index === self._items.length) {
    process.nextTick(function () {
      self.push(null)
    })
    return
  }

  var item = self._items[self._index]

  if (isstream(item)) {
    item.isActive = true
    if (item.isReadable) {
      item.isReadable = false
      var chunk = item.read()
      if (chunk === null) {
        self._index++
        self._read()
      }
      else {
        var result = self.push(chunk)
        if (!result) {
          self._isPaused = true
        }
      }
    }
  }
  else {
    self._index++
    var result = self.push(item)
    if (!result) {
      self._isPaused = true
    }
  }
}
