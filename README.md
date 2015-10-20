
# bulk-stream

A [combined-stream][combined-stream] like module using Streams2:

```js
var BulkStream = require('bulk-stream')

var bs = new BulkStream()
bs.append('wqw')
bs.append('\r\n')
bs.append(fs.createReadStream('cat.png'))
bs.append('\r\n')
bs.append(Buffer('poop'))
```

You can access the appended items through:

```js
// array containing all appended items (including streams)
bs._items
```


  [combined-stream]: https://github.com/felixge/node-combined-stream
