import Tokenizer from "./Tokenizer";
import DictionaryLoader from "./loader/DictionaryLoader";
import IpadicFormatter from "./util/IpadicFormatter";
import UnidicFormatter from "./util/UnidicFormater";
import type { Formatter } from "./util/Formatter";

type dicType = "UniDic" | "IPADic";

/**
 * TokenizerBuilder create Tokenizer instance.
 * @param {Object} option JSON object which have key-value pairs settings
 * @param {string} option.dicPath Dictionary directory path (or URL using in browser)
 * @param {"UniDic"|"IPADic"} option.dicType Dictionary directory path (or URL using in browser)
 * @constructor
 */
class TokenizerBuilder {
	dic_path: string;
	dic_type: dicType;
	dic_formatter: Record<dicType, Formatter> = {
		UniDic: new UnidicFormatter(),
		IPADic: new IpadicFormatter(),
	};
	constructor(option: { dicPath?: string; dicType?: dicType }) {
		this.dic_type = option.dicType ?? "IPADic";
		this.dic_path = option.dicPath ?? "dict/";
	}
	/**
	 * Build Tokenizer instance by asynchronous manner
	 */
	async build(): Promise<Tokenizer> {
		const loader = new DictionaryLoader(this.dic_path);
		await loader.load();
		return new Tokenizer(loader.dic, this.dic_formatter[this.dic_type]);
	}
}

export default TokenizerBuilder;
