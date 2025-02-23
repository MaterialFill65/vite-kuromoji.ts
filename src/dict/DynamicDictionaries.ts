import { Matcher } from "../fst/FST";
import { builder, load } from "../util/DoubleArray";
import ConnectionCosts from "./ConnectionCosts";
import TokenInfoDictionary from "./TokenInfoDictionary";
import UnknownDictionary from "./UnknownDictionary";

interface KeyValue {
	k: string | Uint8Array;
	v: number;
}

export interface WordSearch {
	commonPrefixSearch(word: string): KeyValue[];
	lookup(key: string): number
}

/**
 * Dictionaries container for Tokenizer
 * @param {DoubleArray} trie
 * @param {TokenInfoDictionary} token_info_dictionary
 * @param {ConnectionCosts} connection_costs
 * @param {UnknownDictionary} unknown_dictionary
 * @constructor
 */
class DynamicDictionaries {
	word: WordSearch;
	token_info_dictionary: TokenInfoDictionary;
	connection_costs: ConnectionCosts;
	unknown_dictionary: UnknownDictionary;

	constructor(
		word?: WordSearch,
		token_info_dictionary?: TokenInfoDictionary,
		connection_costs?: ConnectionCosts,
		unknown_dictionary?: UnknownDictionary,
	) {
		if (word != null) {
			this.word = word;
		} else {
			this.word = builder(0).build([{ k: "", v: 1 }]);
		}
		if (token_info_dictionary != null) {
			this.token_info_dictionary = token_info_dictionary;
		} else {
			this.token_info_dictionary = new TokenInfoDictionary();
		}
		if (connection_costs != null) {
			this.connection_costs = connection_costs;
		} else {
			// backward_size * backward_size
			this.connection_costs = new ConnectionCosts(0, 0);
		}
		if (unknown_dictionary != null) {
			this.unknown_dictionary = unknown_dictionary;
		} else {
			this.unknown_dictionary = new UnknownDictionary();
		}
	}
	// from base.dat & check.dat
	loadTrie(
		base_buffer:
			| Int8Array<ArrayBufferLike>
			| Int16Array<ArrayBufferLike>
			| Int32Array<ArrayBufferLike>
			| Uint8Array<ArrayBufferLike>
			| Uint16Array<ArrayBufferLike>
			| Uint32Array<ArrayBufferLike>,
		check_buffer:
			| Int8Array<ArrayBufferLike>
			| Int16Array<ArrayBufferLike>
			| Int32Array<ArrayBufferLike>
			| Uint8Array<ArrayBufferLike>
			| Uint16Array<ArrayBufferLike>
			| Uint32Array<ArrayBufferLike>,
	) {
		this.word = load(base_buffer, check_buffer);
		return this;
	}
	// from base.dat
	loadFST(base_buffer: Uint8Array) {
		this.word = new Matcher(base_buffer);
		return this;
	}
	loadTokenInfoDictionaries(
		token_info_buffer: Uint8Array<ArrayBufferLike> | undefined,
		pos_buffer: Uint8Array<ArrayBufferLike> | undefined,
		target_map_buffer: Uint8Array<ArrayBufferLike> | undefined,
	) {
		this.token_info_dictionary.loadDictionary(token_info_buffer);
		this.token_info_dictionary.loadPosVector(pos_buffer);
		this.token_info_dictionary.loadTargetMap(target_map_buffer);
		return this;
	}
	loadConnectionCosts(cc_buffer: Int16Array<ArrayBuffer>) {
		this.connection_costs.loadConnectionCosts(cc_buffer);
		return this;
	}
	loadUnknownDictionaries(
		unk_buffer: Uint8Array<ArrayBufferLike>,
		unk_pos_buffer: Uint8Array<ArrayBufferLike>,
		unk_map_buffer: Uint8Array<ArrayBufferLike>,
		cat_map_buffer: Uint8Array,
		compat_cat_map_buffer: Uint32Array,
		invoke_def_buffer: Uint8Array,
	) {
		this.unknown_dictionary.loadUnknownDictionaries(
			unk_buffer,
			unk_pos_buffer,
			unk_map_buffer,
			cat_map_buffer,
			compat_cat_map_buffer,
			invoke_def_buffer,
		);
		return this;
	}
}

export default DynamicDictionaries;
