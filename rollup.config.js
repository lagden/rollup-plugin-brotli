export default {
	input: 'src/index.js',
	external: ['fs', 'stream', 'path', 'zlib'],
	output: [
		{
				format: 'cjs',
				file: 'lib/index.cjs.js'
		},
		{
				format: 'es',
				file: 'lib/index.es.js'
		}
	]
}
