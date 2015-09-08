
var fs = require('fs')
  , path = require('path')
var should = require('should')
  , bl = require('bl')
var BulkStream = require('../')

var image0 = path.resolve(__dirname, 'fixtures/cat0.png')
  , image1 = path.resolve(__dirname, 'fixtures/cat1.png')
  , image2 = path.resolve(__dirname, 'fixtures/cat2.png')
var tmp = path.resolve(__dirname, 'tmp/cat.png')


describe('strings + stream', function () {
  it('0', function (done) {
    var input = fs.createReadStream(image2, {highWaterMark:1024})

    var bs = new BulkStream()
    bs.append('wqw')
    bs.append('\r\n')
    bs.append(input)
    bs.append('\r\n')
    bs.append('poop')

    var data, buffer = bl()
    bs.on('data', function (chunk) {
      data += chunk

      if (chunk.toString() !== 'wqw' &&
          chunk.toString() !== 'poop' &&
          chunk.toString() !== '\r\n') {
        buffer.append(chunk)
      }
    })
    bs.on('end', function () {
      data.should.match(/wqw/)
      data.should.match(/PNG/)
      data.should.match(/poop/)

      fs.writeFileSync(tmp, buffer.slice())
      var stats = fs.statSync(tmp)
      stats.size.should.equal(22025)
      done()
    })
  })
})
