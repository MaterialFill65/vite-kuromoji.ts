import kuromoji from "../src/kuromoji";
const DIC_DIR = "dict/unidic/";

// Load dictionaries from file, and prepare tokenizer
const tokenizer = await kuromoji.build({
  dicPath: DIC_DIR,
  dicType: "UniDic",
});

const line = "すもももももももものうち";
const path = tokenizer.tokenize(line);
console.log(path);

