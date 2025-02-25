import type DynamicDictionaries from "./dict/DynamicDictionaries";
import type TokenInfoDictionary from "./dict/TokenInfoDictionary";
import type UnknownDictionary from "./dict/UnknownDictionary";
import type { Formatter, Token } from "./util/Formatter";
import ViterbiBuilder from "./viterbi/ViterbiBuilder";
import type ViterbiLattice from "./viterbi/ViterbiLattice";
import ViterbiNode from "./viterbi/ViterbiNode";
import ViterbiSearcher from "./viterbi/ViterbiSearcher";

const PUNCTUATION = /、|。/;

interface interDF<T> {
	data: T,
	eos: boolean
}
export interface exDF<T, F> {
	content: T
	flag: F,
}

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
	tokenizeSync(text: string): Token[] {
		const sentences = Tokenizer.splitByPunctuation(text);
		const tokens: Token[] = [];
		for (let i = 0; i < sentences.length; i++) {
			const sentence = sentences[i];
			this.tokenizeForSentence(sentence, tokens);
		}
		return tokens;
	}

	async tokenize<T extends any>(text: string): Promise<Token[]> {
		const stream = this.getTokenizeStream<void>();
		const writer = stream.writable.getWriter();
		writer.write({
			flag: void 0,
			content: text
		});
		writer.close();
		const reader = stream.readable.getReader();
		const tokens: Token[] = [];
		while (true) {
			const { value, done } = await reader.read();
			if (value) {
				tokens.push(...value.content);
			}
			if (done) break;
		}
		return tokens;
	}

	getTokenizeStream<F>() {
		let buffer: Token[] = [];
		const concatStream = new TransformStream<exDF<Token, F>, exDF<Token[], F>>({
			transform: (data, controller) => {
				if (data.content.word_type === "EOS") {
					controller.enqueue({
						content: buffer,
						flag: data.flag
					});
					buffer = [];
				} else {
					buffer.push(data.content);
				}
			}
		});
		const stream = this.getTokenStream<F>();

		return {
			writable: stream.writable,
			readable: stream.readable.pipeThrough(concatStream)
		} as TransformStream<exDF<string, F>, exDF<Token[], F>>;
	}

	getTokenStream<F>() {
		const concatStream = new TransformStream<exDF<interDF<Token>, F>, exDF<Token, F>>({
			transform: (data, controller) => {
				controller.enqueue({
					flag: data.flag,
					content: data.content.data
				});
				if (data.content.eos) {
					controller.enqueue({
						flag: data.flag,
						content: {
							word_id: -1,
							word_type: "EOS",
							word_position: data.content.data.word_position,
							surface_form: "",
							pos: "*",
							pos_detail_1: "*",
							pos_detail_2: "*",
							pos_detail_3: "*",
							conjugated_type: "*",
							conjugated_form: "*",
							basic_form: "*",
						}
					});
				}
			}
		});
		const stream = this.getStream<F>();

		return {
			writable: stream.writable,
			readable: stream.readable.pipeThrough(concatStream)
		} as TransformStream<exDF<string, F>, exDF<Token, F>>;
	}

	private getStream<F>() {
		const splitStream = new TransformStream<exDF<string, F>, exDF<interDF<string>, F>>({
			transform: (data, controller) => {
				const sentences = Tokenizer.splitByPunctuation(data.content);
				sentences.forEach((sentence, index) => {
					controller.enqueue({
						content: {
							data: sentence,
							eos: index === sentences.length - 1
						},
						flag: data.flag
					});
				});
			}
		});

		const latticeStream = new TransformStream<exDF<interDF<string>, F>, exDF<interDF<ViterbiLattice>, F>>({
			transform: (data, controller) => {
				controller.enqueue({
					content: {
						data: this.getLattice(data.content.data),
						eos: data.content.eos
					},
					flag: data.flag
				});
			}
		});

		const viterbiStream = new TransformStream<exDF<interDF<ViterbiLattice>, F>, exDF<interDF<ViterbiNode>, F>>({
			transform: (data, controller) => {
				const nodes = this.viterbi_searcher.search(data.content.data);
				nodes.forEach((node, index) => {
					controller.enqueue({
						content: {
							data: node,
							eos: data.content.eos && index === nodes.length - 1
						},
						flag: data.flag
					});
				});
			}
		});

		const tokenizeStream = new TransformStream<exDF<interDF<ViterbiNode>, F>, exDF<interDF<Token>, F>>({
			transform: (data, controller) => {
				const node = data.content.data;
				let token: Token;
				let features: string[];
				let features_line: string | undefined;
				if (node.type === "KNOWN") {
					features_line = this.token_info_dictionary.getFeatures(node.name.toString());
					features = features_line ? features_line.split(",") : [];
					token = this.formatter.formatEntry(node.name, node.start_pos, node.type, features);
				} else if (node.type === "UNKNOWN") {
					features_line = this.unknown_dictionary.getFeatures(node.name.toString());
					features = features_line ? features_line.split(",") : [];
					token = this.formatter.formatUnknownEntry(node.name, node.start_pos, node.type, features, node.surface_form);
				} else {
					token = this.formatter.formatEntry(node.name, node.start_pos, node.type, []);
				}
				controller.enqueue({
					content: {
						data: token,
						eos: data.content.eos
					},
					flag: data.flag
				});
			}
		});

		return {
			writable: splitStream.writable,
			readable: splitStream.readable
				.pipeThrough(latticeStream)
				.pipeThrough(viterbiStream)
				.pipeThrough(tokenizeStream)
		} as TransformStream<exDF<string, F>, exDF<interDF<Token>, F>>;
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
