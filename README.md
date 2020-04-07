# rollup-plugin-brotli

Creates a compressed `.br` artifact for your Rollup bundle.


## Installation

```
npm i -D @tadashi/rollup-plugin-brotli
```


## Usage

```js
import {rollup} from 'rollup'
import brotli from 'rollup-plugin-brotli'

rollup({
  entry: 'src/index.js',
  plugins: [
    brotli()
  ]
}).then(/* ... */)
```


### Configuration

```js
brotli({
  options: {
    chunkSize: 32 * 1024
    // ...
  },
  additional: [
    'dist/bundle.css'
  ],
  minSize: 1000
})
```

**options**: Brotli compression options  
The options available are the [Class: BrotliOptions](https://nodejs.org/docs/latest-v10.x/api/zlib.html#zlib_class_brotlioptions).

**additional**: Compress additional files  
This option allows you to compress additional files that were created by other Rollup plugins.

As the `onwrite` callback for all plugins is executed in the same order they are listed in the `plugins` array, this might only work if the brotli plugin is positioned after all other plugins that create additional files.  
**minSize**: Minimum size for compression

Specified the minimum size in Bytes for a file to get compressed.  
Files that are smaller than this threshold will not be compressed.  
This applies to both the generated bundle and specified additional files.


## License

MIT
