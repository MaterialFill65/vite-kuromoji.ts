import Tokenizer from "./Tokenizer";
import DictionaryBuilder from "./dict/builder/DictionaryBuilder";
import DictionaryLoader from "./loader/DictionaryLoader";
import type { Formatter } from "./util/Formatter";
import IpadicFormatter from "./util/IpadicFormatter";
import UnidicFormatter from "./util/UnidicFormater";
import type manifest from "./util/manifest";
import { type dicType } from "./util/manifest";
import { type Token } from "./util/Formatter";

const dic_formatter: Record<dicType, Formatter> = {
	IPAdic: new IpadicFormatter(),
	UniDic: new UnidicFormatter(),
	"NAIST-jdic": new IpadicFormatter(),
};

// Public methods
const kuromoji = {
	build: async (option: manifest) => {
		const loader = new DictionaryLoader(option.dicPath);
		const dic = await loader.load();
		return new Tokenizer(dic, dic_formatter[option.dicType ?? "IPAdic"]);
	},
	dictionaryBuilder: () => new DictionaryBuilder(),
};

export default kuromoji;
