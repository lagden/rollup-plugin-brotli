'use strict'

const {writeFile, readFile, access, mkdirSync} = require('fs')
const {brotliDecompressSync: decompress} = require('zlib')
const {promisify} = require('util')
const {describe, it} = require('mocha')
const {expect} = require('chai')
const {rollup} = require('rollup')
const brotli = require('../lib/index.cjs')

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)
const accessAsync = promisify(access)

// helper
function _plugin(name, content) {
	return {
		name,
		generateBundle() {
			writeFileAsync(`test/__output/${name}.txt`, content)
		}
	}
}

describe('rollup-plugin-brotli', () => {

	it('has sensible defaults', async () => {
		const bundle = await rollup({
			input: 'test/sample/index.js',
			plugins: [brotli()]
		})
		await bundle.write({
			file: 'test/__output/bundle.js',
			format: 'iife'
		})
		const uncompressed = await readFileAsync('test/__output/bundle.js')
		const compressed = decompress(await readFileAsync('test/__output/bundle.js.br'))
		expect(uncompressed).to.eql(compressed)
	})

	it('has sensible defaults', async () => {
		mkdirSync('test/__output', {recursive: true, mode: 0o755})
		const bundle = await rollup({
			input: 'test/sample/index.js',
			plugins: [
				// file that is above the size option => gets compressed
				_plugin('test1', 'This is a test'),
				// short file that is below the size option => not compressed
				_plugin('test2', 'Short'),
				brotli({
					options: {
						level: 9,
					},
					additional: [
						'test/__output/test1.txt',
						'test/__output/test2.txt',
					],
					minSize: 10
				})
			]
		})

		await bundle.write({
			file: 'test/__output/bundle.js',
			format: 'cjs'
		})

		const uncompressed = await readFileAsync('test/__output/bundle.js')
		const compressed = await decompress(await readFileAsync('test/__output/bundle.js.br'))
		expect(uncompressed).to.eql(compressed)

		const uncompressedTxt = await readFileAsync('test/__output/test1.txt')
		const compressedTxt = await decompress(await readFileAsync('test/__output/test1.txt.br'))
		expect(uncompressedTxt).to.eql(compressedTxt)

		let access = null
		try {
			access = await accessAsync(await readFileAsync('test/__output/test2.txt.br'))
		} catch {
			access = null
		}
		expect(access).to.equal(null)
	})
})
