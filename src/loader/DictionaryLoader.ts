import DynamicDictionaries from "../dict/DynamicDictionaries";
import BunDecompressionStream from "../util/BunCompressionStreams";
import type manifest from "../util/manifest";
import type { DetailedDicPath, DetailedFile } from "../util/manifest";

declare global {
	var Deno: any;
	var Bun: any;
	var process: any;
}
// Export the CompressionFormat enum and DecompressionStream class if needed for module usage.
export type CompressionFormat = "deflate" | "deflate-raw" | "gzip";
// Pollyfill of DecompressionStream for Bun
globalThis.DecompressionStream ??= BunDecompressionStream;

/**
 * DictionaryLoader base constructor
 * @param {string} dic_path Dictionary path
 * @constructor
 */
class DictionaryLoader {
	dic_path: DetailedDicPath;
	constructor(dic_path: manifest["dicPath"]) {
		let dicPath: DetailedDicPath;
		dic_path ??= "/dict";
		if (typeof dic_path !== "string") {
			dicPath = {
				tid: {
					dict: "tid.dat.gz",
					map: "tid_map.dat.gz",
					pos: "tid_pos.dat.gz",
				},
				unk: {
					dict: "unk.dat.gz",
					map: "unk_map.dat.gz",
					pos: "unk_pos.dat.gz",
				},
				cc: "cc.dat.gz",
				chr: {
					char: "unk_char.dat.gz",
					compat: "unk_compat.dat.gz",
					invoke: "unk_invoke.dat.gz",
				},
				word: {
					type: "Trie",
					base: "base.dat.gz",
					check: "check.dat.gz",
				},
				base: "/dict",
			};
			if (dic_path.word !== undefined) {
				dicPath.word = dic_path.word;
			}
			if (dic_path.tid !== undefined) {
				dicPath.tid = dic_path.tid;
			}
			if (dic_path.unk !== undefined) {
				dicPath.unk = dic_path.unk;
			}

			if (dic_path.cc !== undefined) {
				dicPath.cc = dic_path.cc;
			}

			if (dic_path.chr !== undefined) {
				dicPath.chr = dic_path.chr;
			}

			if (dic_path.base !== undefined) {
				dicPath.base = dic_path.base;
			}
		} else {
			dicPath = {
				tid: {
					dict: "tid.dat.gz",
					map: "tid_map.dat.gz",
					pos: "tid_pos.dat.gz",
				},
				unk: {
					dict: "unk.dat.gz",
					map: "unk_map.dat.gz",
					pos: "unk_pos.dat.gz",
				},
				cc: "cc.dat.gz",
				chr: {
					char: "unk_char.dat.gz",
					compat: "unk_compat.dat.gz",
					invoke: "unk_invoke.dat.gz",
				},
				word: {
					type: "Trie",
					base: "base.dat.gz",
					check: "check.dat.gz",
				},
				base: dic_path,
			};
		}
		this.dic_path = dicPath;
	}
	async loadArrayBuffer(
		base: string,
		file: DetailedFile,
	): Promise<ArrayBuffer> {
		let compressedData: Uint8Array;
		if (typeof globalThis.Deno !== "undefined") {
			// Okay. I'm on Deno. Let's just read it.
			compressedData = await Deno.readFile(base + file.path);
		} else if (typeof globalThis.Bun !== "undefined") {
			// Now, I'm on Bun. Let's use `Bun.file`.
			compressedData = Buffer.from(
				await Bun.file(base + file.path).arrayBuffer(),
			);
		} else if (typeof globalThis.process !== "undefined") {
			// Yep, I guess I'm on Node. read file by using promise!
			const fs = await import("node:fs/promises");
			compressedData = await fs.readFile(base + file.path);
		} else {
			// Looks like I'm in browser. Let's fetch it!
			const response = await fetch(base + file.path);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch ${base + file.path}: ${response.statusText}`,
				);
			}
			// What the hell... They decompressed it automatically...
			compressedData = new Uint8Array(await response.arrayBuffer());
		}

		if (!file.compression) {
			file.compression = "gzip";
		}
		// Decompress
		if (file.compression === "raw") {
			return compressedData.buffer as ArrayBuffer;
		}

		const ds = new DecompressionStream(file.compression);
		const decompressedStream = new Blob([compressedData])
			.stream()
			.pipeThrough(ds);
		const decompressedData = await new Response(
			decompressedStream,
		).arrayBuffer();
		return decompressedData;
	}
	/**
	 * Load dictionary files
	 */
	async load() {
		const dic = new DynamicDictionaries();
		const dic_path = this.dic_path;
		const loadArrayBuffer = this.loadArrayBuffer;

		await Promise.all(
			[
				// WordDictionary
				async () => {
					switch (dic_path.word.type) {
						case "FST": {
							const FSTword_base: DetailedFile =
								typeof dic_path.word.base === "string"
									? { path: dic_path.word.base }
									: dic_path.word.base;
							const buffer = await loadArrayBuffer(
								`${dic_path.base}/`,
								FSTword_base,
							);

							dic.loadFST(new Uint8Array(buffer));
							break;
						}
						case "Trie": {
							const Trieword_base: DetailedFile =
								typeof dic_path.word.base === "string"
									? { path: dic_path.word.base }
									: dic_path.word.base;
							const Trieword_check: DetailedFile =
								typeof dic_path.word.check === "string"
									? { path: dic_path.word.check }
									: dic_path.word.check;
							const buffers = await Promise.all(
								[Trieword_base, Trieword_check].map(async (file) => {
									return loadArrayBuffer(`${dic_path.base}/`, file);
								}),
							);
							const base_buffer = new Int32Array(buffers[0]);
							const check_buffer = new Int32Array(buffers[1]);

							dic.loadTrie(base_buffer, check_buffer);
							break;
						}
					}
				},
				// Token info dictionaries
				async () => {
					const TID_Dict: DetailedFile =
						typeof dic_path.tid.dict === "string"
							? { path: dic_path.tid.dict }
							: dic_path.tid.dict;
					const TID_Pos: DetailedFile =
						typeof dic_path.tid.pos === "string"
							? { path: dic_path.tid.pos }
							: dic_path.tid.pos;
					const TID_Map: DetailedFile =
						typeof dic_path.tid.map === "string"
							? { path: dic_path.tid.map }
							: dic_path.tid.map;
					const buffers = await Promise.all(
						[TID_Dict, TID_Pos, TID_Map].map((file) => {
							return loadArrayBuffer(`${dic_path.base}/`, file);
						}),
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
					const UNK_Dict: DetailedFile =
						typeof dic_path.cc === "string"
							? { path: dic_path.cc }
							: dic_path.cc;
					const buffer = await loadArrayBuffer(`${dic_path.base}/`, UNK_Dict);
					const cc_buffer = new Int16Array(buffer);
					dic.loadConnectionCosts(cc_buffer);
				},
				// Unknown dictionaries
				async () => {
					const UNK_Dict: DetailedFile =
						typeof dic_path.unk.dict === "string"
							? { path: dic_path.unk.dict }
							: dic_path.unk.dict;
					const UNK_Pos: DetailedFile =
						typeof dic_path.unk.pos === "string"
							? { path: dic_path.unk.pos }
							: dic_path.unk.pos;
					const UNK_Map: DetailedFile =
						typeof dic_path.unk.map === "string"
							? { path: dic_path.unk.map }
							: dic_path.unk.map;
					const Char: DetailedFile =
						typeof dic_path.chr.char === "string"
							? { path: dic_path.chr.char }
							: dic_path.chr.char;
					const Compat: DetailedFile =
						typeof dic_path.chr.compat === "string"
							? { path: dic_path.chr.compat }
							: dic_path.chr.compat;
					const Invoke: DetailedFile =
						typeof dic_path.chr.invoke === "string"
							? { path: dic_path.chr.invoke }
							: dic_path.chr.invoke;
					const buffers = await Promise.all(
						[UNK_Dict, UNK_Pos, UNK_Map, Char, Compat, Invoke].map(
							async (file) => {
								return loadArrayBuffer(`${dic_path.base}/`, file);
							},
						),
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
