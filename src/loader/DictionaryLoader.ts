import DynamicDictionaries from "../dict/DynamicDictionaries";

/**
 * Polyfill for DecompressionStream using Bun's synchronous decompression functions.
 */
class BunDecompressionStream extends TransformStream<Uint8Array, Uint8Array> {
	/**
	 * Creates a new DecompressionStream for the given format.
	 * @param format The compression format to use for decompression ('deflate', 'deflate-raw', or 'gzip').
	 * @throws {TypeError} If the format is unsupported.
	 */
	constructor(format: CompressionFormat) {
		if (!["deflate", "deflate-raw", "gzip"].includes(format)) {
			throw new TypeError(`Unsupported compression format: ${format}`);
		}
		let data: Uint8Array
		super({
			transform(chunk) {
				if (!data) {
					data = chunk;
				} else {
					const newData = new Uint8Array(data.length + chunk.length);
					newData.set(data);
					newData.set(chunk, data.length);
					data = newData;
				}
			},
			flush(controller) {
				try {
					let decompressedBuffer: Uint8Array;
					if (format === 'gzip') {
						decompressedBuffer = Bun.gunzipSync(data);
					} else if (format === 'deflate') {
						decompressedBuffer = Bun.inflateSync(data);
					} else if (format === 'deflate-raw') {
						// Use negative windowBits for raw deflate (no zlib header/footer)
						decompressedBuffer = Bun.inflateSync(data, { windowBits: -15 }); // -15 is a common value for raw deflate
					} else {
						// Should not reach here as format is validated in constructor
						controller.error(new TypeError("Unsupported compression format (internal error)"));
						return;
					}
					controller.enqueue(decompressedBuffer)
				} catch (error: any) { // Catching 'any' for broader error capture, refine if Bun's errors are typed.
					controller.error(new TypeError(`Decompression failed for format '${format}'.`, { cause: error }));
					return;
				}
			}
		})
	}
}

// Export the CompressionFormat enum and DecompressionStream class if needed for module usage.
export type CompressionFormat = "deflate" | "deflate-raw" | "gzip";
// Pollyfill of DecompressionStream for Bun
globalThis.DecompressionStream ??= BunDecompressionStream

/**
 * DictionaryLoader base constructor
 * @param {string} dic_path Dictionary path
 * @constructor
 */
class DictionaryLoader {
	dic: DynamicDictionaries;
	dic_path: string;
	constructor(dic_path: string) {
		this.dic = new DynamicDictionaries();
		this.dic_path = dic_path;
	}
	async loadArrayBuffer(file: string): Promise<ArrayBuffer> {
		let compressedData: Uint8Array;
		if (typeof globalThis.Deno !== "undefined") {
			// Okay. I'm on Deno. Let's just read it.
			compressedData = await Deno.readFile(file);
		} else if (typeof globalThis.Bun !== "undefined") {
			// Now, I'm on Bun. Let's use `Bun.file`.
			compressedData = Buffer.from(await Bun.file(file).arrayBuffer())
		} else if (typeof globalThis.process !== "undefined") {
			// Yep, I guess I'm on Node. read file by using promise!
			const fs = await import("node:fs/promises");
			compressedData = await fs.readFile(file);
		} else {
			// Looks like I'm in browser. Let's fetch it!
			const response = await fetch(file);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
			}
			// What the hell... They decompressed it automatically...
			return await response.arrayBuffer();
		}

		// Decompress gzip
		const ds = new DecompressionStream("gzip");
		const decompressedStream = new Blob([compressedData])
			.stream()
			.pipeThrough(ds);
		const decompressedData = await new Response(
			decompressedStream,
		).arrayBuffer();
		return decompressedData
	}
	/**
	 * Load dictionary files
	 */
	async load() {
		const dic = this.dic;
		const dic_path = this.dic_path;
		const loadArrayBuffer = this.loadArrayBuffer;

		await Promise.all(
			[
				// Trie
				async () => {
					const buffers = await Promise.all(
						["base.dat.gz", "check.dat.gz"].map(async (filename) => {
							return loadArrayBuffer(`${dic_path}/${filename}`);
						}),
					);
					const base_buffer = new Int32Array(buffers[0]);
					const check_buffer = new Int32Array(buffers[1]);

					dic.loadTrie(base_buffer, check_buffer);
				},
				// Token info dictionaries
				async () => {
					const buffers = await Promise.all(
						["tid.dat.gz", "tid_pos.dat.gz", "tid_map.dat.gz"].map(
							async (filename) => {
								return loadArrayBuffer(`${dic_path}/${filename}`);
							},
						),
					);
					const token_info_buffer = new Uint8Array(buffers[0]);
					const pos_buffer = new Uint8Array(buffers[1]);
					const target_map_buffer = new Uint8Array(buffers[2]);

					dic.loadTokenInfoDictionaries(
						token_info_buffer,
						pos_buffer,
						target_map_buffer,
					);
				},
				// Connection cost matrix
				async () => {
					const buffer = await loadArrayBuffer(`${dic_path}/cc.dat.gz`);
					const cc_buffer = new Int16Array(buffer);
					dic.loadConnectionCosts(cc_buffer);
				},
				// Unknown dictionaries
				async () => {
					const buffers = await Promise.all(
						[
							"unk.dat.gz",
							"unk_pos.dat.gz",
							"unk_map.dat.gz",
							"unk_char.dat.gz",
							"unk_compat.dat.gz",
							"unk_invoke.dat.gz",
						].map(async (filename) => {
							return loadArrayBuffer(`${dic_path}/${filename}`);
						}),
					);
					const unk_buffer = new Uint8Array(buffers[0]);
					const unk_pos_buffer = new Uint8Array(buffers[1]);
					const unk_map_buffer = new Uint8Array(buffers[2]);
					const cat_map_buffer = new Uint8Array(buffers[3]);
					const compat_cat_map_buffer = new Uint32Array(buffers[4]);
					const invoke_def_buffer = new Uint8Array(buffers[5]);

					dic.loadUnknownDictionaries(
						unk_buffer,
						unk_pos_buffer,
						unk_map_buffer,
						cat_map_buffer,
						compat_cat_map_buffer,
						invoke_def_buffer,
					);
					// dic.loadUnknownDictionaries(char_buffer, unk_buffer);
				},
			].map((func) => func()),
		);

		return dic;
	}
}

/**
 * Callback
 * @callback DictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {DynamicDictionaries} dic Loaded dictionary
 */

export default DictionaryLoader;
