import ByteBuffer from "../util/ByteBuffer";

/**
 * TokenInfoDictionary
 * @constructor
 */
class TokenInfoDictionary {
	dictionary: ByteBuffer;
	target_map: {
		[x: string]: (number | string)[];
	};
	pos_buffer: ByteBuffer;

	constructor() {
		this.dictionary = new ByteBuffer(10 * 1024 * 1024);
		this.target_map = {}; // trie_id (of surface form) -> token_info_id (of token)
		this.pos_buffer = new ByteBuffer(10 * 1024 * 1024);
	}
	// left_id right_id word_cost ...
	// ^ this position is token_info_id
	buildDictionary(entries: string[][]) {
		const dictionary_entries: { [x: number]: string } = {}; // using as hashmap, string -> string (word_id -> surface_form) to build dictionary

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];

			if (entry.length < 4) {
				continue;
			}

			const surface_form = entry[0];
			const left_id = Number(entry[1]);
			const right_id = Number(entry[2]);
			const word_cost = Number(entry[3]);
			// TODO: Is it OK?
			const feature = entry.slice(4).join(","); // TODO Optimize

			// Assertion
			if (
				!Number.isFinite(left_id) ||
				!Number.isFinite(right_id) ||
				!Number.isFinite(word_cost)
			) {
				console.log(entry);
			}

			const token_info_id = this.put(
				left_id,
				right_id,
				word_cost,
				surface_form,
				feature,
			);
			dictionary_entries[token_info_id] = surface_form;
		}

		// Remove last unused area
		this.dictionary.shrink();
		this.pos_buffer.shrink();

		return dictionary_entries;
	}
	put(
		left_id: number,
		right_id: number,
		word_cost: number,
		surface_form: string,
		feature: string,
	) {
		const token_info_id = this.dictionary.position;
		const pos_id = this.pos_buffer.position;

		this.dictionary.putShort(left_id);
		this.dictionary.putShort(right_id);
		this.dictionary.putShort(word_cost);
		this.dictionary.putInt(pos_id);
		this.pos_buffer.putString(`${surface_form},${feature}`);

		return token_info_id;
	}
	addMapping(source: number, target: number | string) {
		let mapping = this.target_map[source];
		if (mapping == null) {
			mapping = [];
		}
		mapping.push(target);

		this.target_map[source] = mapping;
	}
	targetMapToBuffer() {
		const buffer = new ByteBuffer();
		const map_keys_size = Object.keys(this.target_map).length;
		buffer.putInt(map_keys_size);
		for (const key in this.target_map) {
			const values = this.target_map[key]; // Array
			const map_values_size = values.length;
			buffer.putInt(Number.parseInt(key));
			buffer.putInt(map_values_size);
			for (let i = 0; i < values.length; i++) {
				buffer.putInt(values[i]);
			}
		}
		return buffer.shrink(); // Shrink-ed Typed Array
	}
	// from tid.dat
	loadDictionary(array_buffer?: Uint8Array<ArrayBufferLike>) {
		this.dictionary = new ByteBuffer(array_buffer);
		return this;
	}
	// from tid_pos.dat
	loadPosVector(array_buffer?: Uint8Array<ArrayBufferLike>) {
		this.pos_buffer = new ByteBuffer(array_buffer);
		return this;
	}
	// from tid_map.dat
	loadTargetMap(array_buffer?: Uint8Array<ArrayBufferLike>) {
		const buffer = new ByteBuffer(array_buffer);
		buffer.position = 0;
		this.target_map = {};
		buffer.readInt(); // map_keys_size
		while (true) {
			if (buffer.buffer.length < buffer.position + 1) {
				break;
			}
			const key = buffer.readInt();
			const map_values_size = buffer.readInt();
			for (let i = 0; i < map_values_size; i++) {
				const value = buffer.readInt();
				this.addMapping(key, value);
			}
		}
		return this;
	}
	/**
	 * Look up features in the dictionary
	 * @param {string} token_info_id_str Word ID to look up
	 * @returns {string} Features string concatenated by ","
	 */
	getFeatures(token_info_id_str: string): string {
		const token_info_id = Number.parseInt(token_info_id_str);
		if (Number.isNaN(token_info_id)) {
			// TODO throw error
			return "";
		}
		const pos_id = this.dictionary.getInt(token_info_id + 6);
		return this.pos_buffer.getString(pos_id);
	}
}

export default TokenInfoDictionary;
