import { compileFST, FST, Matcher } from "../../fst/FST";
import { FSTBuilder } from "../../fst/FSTBuilder";
import DoubleArrayBuilder, { type DoubleArray, builder } from "../../util/DoubleArray";
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
	tid: TokenInfoDictionary;
	unk: UnknownDictionary;
	cc_builder: ConnectionCostsBuilder;
	cd_builder: CharacterDefinitionBuilder;
	unk_dictionary_entries: { [x: number]: string } = {}
	tid_dictionary_entries: { [x: number]: string } = {}
	fst_builder = new FSTBuilder()
	trie_builder = new DoubleArrayBuilder(1024 * 1024);
	trie_id = 0

	constructor() {
		// Array of entries, each entry in Mecab form
		// (0: surface form, 1: left id, 2: right id, 3: word cost, 4: part of speech id, 5-: other features)
		this.tid = new TokenInfoDictionary();
		this.unk = new UnknownDictionary();
		this.cc_builder = new ConnectionCostsBuilder();
		this.cd_builder = new CharacterDefinitionBuilder();
	}
	addTokenInfoDictionary(new_entry: string) {
		const entry = new_entry.split(",");

		if (entry.length < 4) {
			return;
		}

		const surface_form = entry[0];
		const left_id = Number(entry[1]);
		const right_id = Number(entry[2]);
		const word_cost = Number(entry[3]);
		const feature = entry.slice(4).join(","); // TODO Optimize

		// Assertion
		if (
			!Number.isFinite(left_id) ||
			!Number.isFinite(right_id) ||
			!Number.isFinite(word_cost)
		) {
			console.log(entry);
		}

		const token_info_id = this.tid.put(
			left_id,
			right_id,
			word_cost,
			surface_form,
			feature,
		);
		this.tid_dictionary_entries[token_info_id] = surface_form;
		const id = this.trie_id++
		this.fst_builder.append(surface_form, id);
		// this.trie_builder.append(surface_form, id);
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
		const entry = new_entry.split(",");

		if (entry.length < 4) {
			return;
		}

		const surface_form = entry[0];
		const left_id = Number(entry[1]);
		const right_id = Number(entry[2]);
		const word_cost = Number(entry[3]);
		const feature = entry.slice(4).join(","); // TODO Optimize

		// Assertion
		if (
			!Number.isFinite(left_id) ||
			!Number.isFinite(right_id) ||
			!Number.isFinite(word_cost)
		) {
			console.log(entry);
		}

		const token_info_id = this.unk.put(
			left_id,
			right_id,
			word_cost,
			surface_form,
			feature,
		);
		this.unk_dictionary_entries[token_info_id] = surface_form;
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
		const word: WordSearch = isTrie ? this.buildDoubleArray() : this.buildFST();

		for (const token_info_id in this.tid_dictionary_entries) {
			const surface_form = this.tid_dictionary_entries[token_info_id];
			const trie_id = word.lookup(surface_form);

			// Assertion
			// if (trie_id < 0) {
			//     console.log("Not Found:" + surface_form);
			// }
			this.tid.addMapping(trie_id, token_info_id);
		}

		return {
			word,
			token_info_dictionary: this.tid,
		};
	}
	buildUnknownDictionary() {
		const char_def = this.cd_builder.build(); // Create CharacterDefinition

		if (!char_def.invoke_definition_map) {
			throw new Error("invoke_definition_map is not initialized");
		}

		this.unk.characterDefinition(char_def);

		for (const token_info_id in this.unk_dictionary_entries) {
			const class_name = this.unk_dictionary_entries[token_info_id];
			const class_id = char_def.invoke_definition_map.lookup(class_name);

			// Assertion
			// if (trie_id < 0) {
			//     console.log("Not Found:" + surface_form);
			// }
			this.unk.addMapping(class_id, token_info_id);
		}

		return this.unk;
	}

	buildFST(): Matcher {
		const fst = this.fst_builder.build([]);
		const bin = compileFST(fst);
		return new Matcher(bin)
	}
	/**
	 * Build double array trie
	 *
	 * @returns {DoubleArray} Double-Array trie
	 */
	buildDoubleArray(): DoubleArray {
		const builder = this.trie_builder
		return builder.build();
	}
}

export default DictionaryBuilder;
