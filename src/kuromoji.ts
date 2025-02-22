import TokenizerBuilder from "./TokenizerBuilder";
import DictionaryBuilder from "./dict/builder/DictionaryBuilder";

// Public methods
const kuromoji = {
	builder: (option: { dicPath?: string; dicType?: "UniDic" | "IPADic" }) =>
		new TokenizerBuilder(option),
	dictionaryBuilder: () => new DictionaryBuilder(),
};

export default kuromoji;
