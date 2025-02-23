import type DynamicDictionaries from "./dict/DynamicDictionaries";
import type TokenInfoDictionary from "./dict/TokenInfoDictionary";
import type UnknownDictionary from "./dict/UnknownDictionary";
import type { Formatter, Token } from "./util/Formatter";
import ViterbiBuilder from "./viterbi/ViterbiBuilder";
import type ViterbiLattice from "./viterbi/ViterbiLattice";
import ViterbiSearcher from "./viterbi/ViterbiSearcher";

const PUNCTUATION = /、|。/;

/**
 * Tokenizer
 * @param {DynamicDictionaries} dic Dictionaries used by this tokenizer
 * @constructor
 */
class Tokenizer {
	token_info_dictionary: TokenInfoDictionary;
	unknown_dictionary: UnknownDictionary;
	viterbi_builder: ViterbiBuilder;
	viterbi_searcher: ViterbiSearcher;
	formatter: Formatter;
	constructor(dic: DynamicDictionaries, formatter: Formatter) {
		this.token_info_dictionary = dic.token_info_dictionary;
		this.unknown_dictionary = dic.unknown_dictionary;
		this.viterbi_builder = new ViterbiBuilder(dic);
		this.viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
		this.formatter = formatter;
	}
	/**
	 * Split into sentence by punctuation
	 * @param {string} input Input text
	 * @returns {Array.<string>} Sentences end with punctuation
	 */
	static splitByPunctuation(input: string): Array<string> {
		const sentences: string[] = [];
		let tail = input;
		while (true) {
			if (tail === "") {
				break;
			}
			const index = tail.search(PUNCTUATION);
			if (index < 0) {
				sentences.push(tail);
				break;
			}
			sentences.push(tail.substring(0, index + 1));
			tail = tail.substring(index + 1);
		}
		return sentences;
	}
	/**
	 * Tokenize text
	 * @param {string} text Input text to analyze
	 * @returns {Array} Tokens
	 */
	tokenize(text: string): Token[] {
		const sentences = Tokenizer.splitByPunctuation(text);
		const tokens: Token[] = [];
		for (let i = 0; i < sentences.length; i++) {
			const sentence = sentences[i];
			this.tokenizeForSentence(sentence, tokens);
		}
		return tokens;
	}
	tokenizeForSentence(sentence: string, tokens: Token[] = []) {
		const lattice = this.getLattice(sentence);
		const best_path = this.viterbi_searcher.search(lattice);
		let last_pos = 0;
		if (tokens.length > 0) {
			last_pos = tokens[tokens.length - 1].word_position;
		}

		for (let j = 0; j < best_path.length; j++) {
			const node = best_path[j];

			let token: Token;
			let features: string[];
			let features_line: string | undefined;
			if (node.type === "KNOWN") {
				features_line = this.token_info_dictionary.getFeatures(
					node.name.toString(),
				);
				if (features_line == null) {
					features = [];
				} else {
					features = features_line.split(",");
				}
				token = this.formatter.formatEntry(
					node.name,
					last_pos + node.start_pos,
					node.type,
					features,
				);
			} else if (node.type === "UNKNOWN") {
				// Unknown word
				features_line = this.unknown_dictionary.getFeatures(
					node.name.toString(),
				);
				if (features_line == null) {
					features = [];
				} else {
					features = features_line.split(",");
				}
				token = this.formatter.formatUnknownEntry(
					node.name,
					last_pos + node.start_pos,
					node.type,
					features,
					node.surface_form,
				);
			} else {
				// TODO User dictionary
				token = this.formatter.formatEntry(
					node.name,
					last_pos + node.start_pos,
					node.type,
					[],
				);
			}

			tokens.push(token);
		}

		return tokens;
	}
	/**
	 * Build word lattice
	 * @param {string} text Input text to analyze
	 * @returns {ViterbiLattice} Word lattice
	 */
	getLattice(text: string): ViterbiLattice {
		return this.viterbi_builder.build(text);
	}
}

export default Tokenizer;
