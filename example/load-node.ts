import kuromoji from "../src/kuromoji";
const DIC_DIR = "dict/unidic/";

// Load dictionaries from file, and prepare tokenizer
const tokenizer = await kuromoji.builder({
  dicPath: DIC_DIR,
  dicType: "UniDic",
}).build();

const line = "すもももももももものうち";
const path = tokenizer.tokenize(line);
console.log(path);
