import type DynamicDictionaries from "./dict/DynamicDictionaries";
import type TokenInfoDictionary from "./dict/TokenInfoDictionary";
import type UnknownDictionary from "./dict/UnknownDictionary";
import type { Formatter, Token } from "./util/Formatter";
import ViterbiBuilder from "./viterbi/ViterbiBuilder";
import type ViterbiLattice from "./viterbi/ViterbiLattice";
import ViterbiNode from "./viterbi/ViterbiNode";
import ViterbiSearcher from "./viterbi/ViterbiSearcher";

const PUNCTUATION = /、|。/;

interface stream_DF<T>{
	data: T,
	eos: boolean
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
	stream: TransformStream<string, Token[]>;
	writable: WritableStreamDefaultWriter<string>;
	readble: ReadableStreamDefaultReader<Token[]>;

	constructor(dic: DynamicDictionaries, formatter: Formatter) {
		this.token_info_dictionary = dic.token_info_dictionary;
		this.unknown_dictionary = dic.unknown_dictionary;
		this.viterbi_builder = new ViterbiBuilder(dic);
		this.viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
		this.formatter = formatter;
		this.stream = this.getTokenizeStream()
		this.writable = this.stream.writable.getWriter()
		this.readble = this.stream.readable.getReader()
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

	async tokenize(text: string): Promise<Token[]> {
		if(text === ""){
			return []
		}
		await this.writable.write(text);

		const { value } = await this.readble.read();
		return value!;
	}

	getTokenizeStream(){
		let buffer: Token[] = []
		const concatStream = new TransformStream<Token, Token[]>({
			transform: (token, controller) => {
				if (token.word_type === "EOS"){
					controller.enqueue(buffer)
					buffer = []
				}else{
					buffer.push(token)
				}
			}
		});
		const stream = this.getTokenStream()

		return {
			writable: stream.writable,
			readable: stream.readable
				.pipeThrough(concatStream)
		} as TransformStream<string, Token[]>
	}

	getTokenStream(){
		const concatStream = new TransformStream<stream_DF<Token>, Token>({
			transform: (data, controller) => {
				controller.enqueue(data.data)
				if(data.eos)
					controller.enqueue({
						word_id: -1,
						word_type: "EOS",
						word_position: data.data.word_position,
						surface_form: "",
						pos: "*",
						pos_detail_1: "*",
						pos_detail_2: "*",
						pos_detail_3: "*",
						conjugated_type: "*",
						conjugated_form: "*",
						basic_form: "*",
					});
			}
		});
		const stream = this.getStream()
		
		return {
			writable: stream.writable,
			readable: stream.readable
			.pipeThrough(concatStream)		
		} as TransformStream<string, Token>
	}

	private getStream() {
		const splitStream = new TransformStream<string, stream_DF<string>>({
			transform: (data, controller) => {
				const sentences = Tokenizer.splitByPunctuation(data);
				for (let i = 0; i < sentences.length; i++) {
					const sentence = sentences[i];
					controller.enqueue({
						data: sentence,
						eos: sentences.length - 1 === i
					})
				}
			}
		});

		const latticeStream = new TransformStream<stream_DF<string>, stream_DF<ViterbiLattice>>({
			transform: (data, controller) => {
				controller.enqueue({
					data: this.getLattice(data.data), 
					eos: data.eos
				});
			}
		});

		const viterbiStream = new TransformStream<stream_DF<ViterbiLattice>, stream_DF<ViterbiNode>>({
			transform: (data, controller) => {
				const nodes = this.viterbi_searcher.search(data.data)
				for (let i = 0; i < nodes.length; i++) {
					const node = nodes[i];
					controller.enqueue({
						data: node,
						eos: data.eos && nodes.length - 1 === i
					})
				}
			}
		});

		const tokenizeStream = new TransformStream<stream_DF<ViterbiNode>, stream_DF<Token>>({
			transform: (data, controller) => {
				const node = data.data
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
						node.start_pos,
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
						node.start_pos,
						node.type,
						features,
						node.surface_form,
					);
				} else {
					// TODO User dictionary
					token = this.formatter.formatEntry(
						node.name,
						node.start_pos,
						node.type,
						[],
					);
				}
				controller.enqueue({
					data: token,
					eos: data.eos
				})
			}
		});
	
		return {
			writable: splitStream.writable,
			readable: splitStream.readable
				.pipeThrough(latticeStream)
				.pipeThrough(viterbiStream)
				.pipeThrough(tokenizeStream)
		} as TransformStream<string, stream_DF<Token>>
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
