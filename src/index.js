'use strict'

import fs from 'fs'
import {pipeline} from 'stream'
import {join, dirname} from 'path'
import {createBrotliCompress as compressStream} from 'zlib'

function brotliCompressFile(file, options, minSize) {
	return new Promise((resolve, reject) => {
		fs.stat(file, (error, stats) => {
			if (error) {
				// console.error('---> error:', file, error.message)
				reject(new Error(`@tadashi/rollup-plugin-brotli: Error reading file ${file}`))
				return
			}

			if (minSize && minSize > stats.size) {
				resolve()
				return
			}

			pipeline(
				fs.createReadStream(file),
				compressStream(options),
				fs.createWriteStream(`${file}.br`),
				error => {
					if (error) {
						reject(error)
					} else {
						resolve()
					}
				}
			)
		})
	})
}

export default function brotli(options = {}) {
	let _dir = ''
	options = {
		additional: [],
		minSize: 0,
		...options,
		...{
			options: {
				...options.options || {}
			}
		}
	}
	return {
		name: 'brotli',
		generateBundle(opts) {
			_dir = (opts.file && dirname(opts.file)) || opts.dir || ''
		},
		async writeBundle(opts, bundle) {
			const compressCollection = []
			const files = [...options.additional, ...Object.keys(bundle).map(f => join(_dir, f))]
			for (const file of files) {
				compressCollection.push(brotliCompressFile(file, options.options, options.minSize))
			}
			await Promise.all(compressCollection)
		}
	}
}
