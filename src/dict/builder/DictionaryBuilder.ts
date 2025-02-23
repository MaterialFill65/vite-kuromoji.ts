import { compileFST, FST, Matcher } from "../../fst/FST";
import { FSTBuilder } from "../../fst/FSTBuilder";
import { type DoubleArray, builder as _builder } from "../../util/DoubleArray";
import DynamicDictionaries, { type WordSearch } from "../DynamicDictionaries";
import TokenInfoDictionary from "../TokenInfoDictionary";
import UnknownDictionary from "../UnknownDictionary";
import CharacterDefinitionBuilder from "./CharacterDefinitionBuilder";
import ConnectionCostsBuilder from "./ConnectionCostsBuilder";

/**
 * Build dictionaries (token info, connection costs)
 *
 * Generates from matrix.def
 * cc.dat: Connection costs
 *
 * Generates from *.csv
 * dat.dat: Double array
 * tid.dat: Token info dictionary
 * tid_map.dat: targetMap
 * tid_pos.dat: posList (part of speech)
 */
class DictionaryBuilder {
	tid_entries: string[][];
	unk_entries: string[][];
	cc_builder: ConnectionCostsBuilder;
	cd_builder: CharacterDefinitionBuilder;
	constructor() {
		// Array of entries, each entry in Mecab form
		// (0: surface form, 1: left id, 2: right id, 3: word cost, 4: part of speech id, 5-: other features)
		this.tid_entries = [];
		this.unk_entries = [];
		this.cc_builder = new ConnectionCostsBuilder();
		this.cd_builder = new CharacterDefinitionBuilder();
	}
	addTokenInfoDictionary(new_entry: string) {
		this.tid_entries.push(new_entry.split(","));
		return this;
	}
	/**
	 * Put one line of "matrix.def" file for building ConnectionCosts object
	 * @param {string} line is a line of "matrix.def"
	 */
	putCostMatrixLine(line: string) {
		this.cc_builder.putLine(line);
		return this;
	}
	putCharDefLine(line: string) {
		this.cd_builder.putLine(line);
		return this;
	}
	/**
	 * Put one line of "unk.def" file for building UnknownDictionary object
	 * @param {string[]} new_entry is a line of "unk.def"
	 */
	putUnkDefLine(new_entry: string) {
		this.unk_entries.push(new_entry.split(","));
		return this;
	}
	build(isTrie: boolean = true) {
		const dictionaries = this.buildTokenInfoDictionary(isTrie);
		const unknown_dictionary = this.buildUnknownDictionary();

		return new DynamicDictionaries(
			dictionaries.word,
			dictionaries.token_info_dictionary,
			this.cc_builder.build(),
			unknown_dictionary,
		);
	}
	/**
	 * Build TokenInfoDictionary
	 *
	 * @returns {{trie: WordSearch, token_info_dictionary: TokenInfoDictionary}}
	 */
	buildTokenInfoDictionary(isTrie: boolean): {
		word: WordSearch;
		token_info_dictionary: TokenInfoDictionary;
	} {
		const token_info_dictionary = new TokenInfoDictionary();

		// using as hashmap, string -> string (word_id -> surface_form) to build dictionary
		const dictionary_entries = token_info_dictionary.buildDictionary(
			this.tid_entries,
		);

		const word: WordSearch = isTrie ? this.buildDoubleArray() : this.buildFST();

		for (const token_info_id in dictionary_entries) {
			const surface_form = dictionary_entries[token_info_id];
			const trie_id = word.lookup(surface_form);

			// Assertion
			// if (trie_id < 0) {
			//     console.log("Not Found:" + surface_form);
			// }
			token_info_dictionary.addMapping(trie_id, token_info_id);
		}

		return {
			word,
			token_info_dictionary: token_info_dictionary,
		};
	}
	buildUnknownDictionary() {
		const unk_dictionary = new UnknownDictionary();

		// using as hashmap, string -> string (word_id -> surface_form) to build dictionary
		const dictionary_entries = unk_dictionary.buildDictionary(this.unk_entries);

		const char_def = this.cd_builder.build(); // Create CharacterDefinition

		if (!char_def.invoke_definition_map) {
			throw new Error("invoke_definition_map is not initialized");
		}

		unk_dictionary.characterDefinition(char_def);

		for (const token_info_id in dictionary_entries) {
			const class_name = dictionary_entries[token_info_id];
			const class_id = char_def.invoke_definition_map.lookup(class_name);

			// Assertion
			// if (trie_id < 0) {
			//     console.log("Not Found:" + surface_form);
			// }
			unk_dictionary.addMapping(class_id, token_info_id);
		}

		return unk_dictionary;
	}

	buildFST(): Matcher {
		let trie_id = 0;
		const words = this.tid_entries.map((entry) => {
			const surface_form = entry[0];
			return { k: surface_form, v: trie_id++ };
		});

		const builder = new FSTBuilder();
		const fst = builder.build(words);
		const bin = compileFST(fst);
		return new Matcher(bin)
	}
	/**
	 * Build double array trie
	 *
	 * @returns {DoubleArray} Double-Array trie
	 */
	buildDoubleArray(): DoubleArray {
		let trie_id = 0;
		const words = this.tid_entries.map((entry) => {
			const surface_form = entry[0];
			return { k: surface_form, v: trie_id++ };
		});

		const builder = _builder(1024 * 1024);
		return builder.build(words);
	}
}

export default DictionaryBuilder;
