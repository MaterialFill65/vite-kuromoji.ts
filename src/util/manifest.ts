export type dicType = "UniDic" | "IPAdic" | "NAIST-jdic";

export interface DetailedFile {
	readonly path: string;
	compression?: "raw" | "gzip" | "deflate";
}

type file = string | DetailedFile;

interface dict {
	readonly dict: file;
	readonly pos: file;
	readonly map: file;
}

interface chr {
	readonly char: file;
	readonly compat: file;
	readonly invoke: file;
}

interface trie {
	readonly type: "Trie";
	readonly base: file;
	readonly check: file;
}
interface fst {
	readonly type: "FST";
	readonly base: file;
}
export interface DetailedDicPath {
	tid: dict;
	unk: dict;
	cc: file;
	chr: chr;
	word: trie | fst;
	base: string;
}
export interface SoftDicPath{
	tid?: dict;
	unk?: dict;
	cc?: file;
	chr?: chr;
	word?: trie | fst;
	readonly base: string;
}

interface manifest {
	readonly dicType?: dicType;
	dicPath?: SoftDicPath | string;
}

export default manifest;
