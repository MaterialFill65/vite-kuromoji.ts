interface externalKeyValue {
    k: string;
    v: number;
}
const enum AlignmentSize {
    ONE_BYTE = 1,
    TWO_BYTES = 2,
    FOUR_BYTES = 4,
    EIGHT_BYTES = 8
}
declare class Matcher implements WordSearch {
    constructor(dictData?: Uint8Array, alignmentSize?: AlignmentSize);
    run(word: Uint8Array): [boolean, Set<Uint8Array>];
    lookup(key: string): number;
    commonPrefixSearch(word: string): externalKeyValue[];
    getBuffer(): Uint8Array<ArrayBufferLike>;
}
type Arrays = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array;
interface BaseAndCheck {
    getBaseBuffer(): Arrays;
    getCheckBuffer(): Arrays;
    loadBaseBuffer(base_buffer: Arrays): BaseAndCheck;
    loadCheckBuffer(check_buffer: Arrays): BaseAndCheck;
    size(): number;
    getBase(index: number): number;
    getCheck(index: number): number;
    setBase(index: number, base_value: number): void;
    setCheck(index: number, check_value: number): void;
    setFirstUnusedNode(index: number): void;
    getFirstUnusedNode(): number;
    shrink(): void;
    calc(): {
        all: number;
        unused: number;
        efficiency: number;
    };
    dump(): string;
}
interface external_KeyValue {
    k: string;
    v: number;
}
/**
 * Factory method of double array
 */
declare class DoubleArray implements WordSearch {
    bc: BaseAndCheck;
    constructor(bc: BaseAndCheck);
    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Boolean} True if this trie contains a given key
     */
    contain(key: string): boolean;
    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Number} Record value assgned to this key, -1 if this key does not contain
     */
    lookup(key: string): number;
    /**
     * Common prefix search
     *
     * @param {String} key
     * @return {Array} Each result object has 'k' and 'v' (key and record,
     * respectively) properties assigned to matched string
     */
    commonPrefixSearch(key: string): external_KeyValue[];
    traverse(parent: number, code: number): number;
    size(): number;
    calc(): {
        all: number;
        unused: number;
        efficiency: number;
    };
    dump(): string;
}
/**
 * Connection costs matrix from cc.dat file.
 * 2 dimension matrix [forward_id][backward_id] -> cost
 * @constructor
 * @param {number} forward_dimension
 * @param {number} backward_dimension
 */
declare class ConnectionCosts {
    buffer: Int16Array;
    forward_dimension: number;
    backward_dimension: number;
    constructor(forward_dimension: number, backward_dimension: number);
    put(forward_id: number, backward_id: number, cost: number): void;
    get(forward_id: number, backward_id: number): number;
    loadConnectionCosts(connection_costs_buffer: Int16Array): void;
}
/**
 * Utilities to manipulate byte sequence
 * @param {(number|Uint8Array)} arg Initial size of this buffer (number), or buffer to set (Uint8Array)
 * @constructor
 */
declare class ByteBuffer {
    buffer: Uint8Array<ArrayBufferLike>;
    position: number;
    constructor(arg?: number | Uint8Array);
    size(): number;
    reallocate(): void;
    shrink(): Uint8Array<ArrayBufferLike>;
    put(b: number): void;
    get(index?: number): number;
    putShort(num: string | number): void;
    getShort(index?: number): number;
    putInt(num: string | number): void;
    getInt(index?: number): number;
    readInt(): number;
    putString(str: string): void;
    getString(index?: number): string;
}
/**
 * TokenInfoDictionary
 * @constructor
 */
declare class TokenInfoDictionary {
    dictionary: ByteBuffer;
    target_map: {
        [x: string]: (number | string)[];
    };
    pos_buffer: ByteBuffer;
    constructor();
    buildDictionary(entries: string[][]): {
        [x: number]: string;
    };
    put(left_id: number, right_id: number, word_cost: number, surface_form: string, feature: string): number;
    addMapping(source: number, target: number | string): void;
    targetMapToBuffer(): Uint8Array<ArrayBufferLike>;
    loadDictionary(array_buffer?: Uint8Array<ArrayBufferLike>): this;
    loadPosVector(array_buffer?: Uint8Array<ArrayBufferLike>): this;
    loadTargetMap(array_buffer?: Uint8Array<ArrayBufferLike>): this;
    /**
     * Look up features in the dictionary
     * @param {string} token_info_id_str Word ID to look up
     * @returns {string} Features string concatenated by ","
     */
    getFeatures(token_info_id_str: string): string;
}
/**
 * CharacterClass
 * @param {number} class_id
 * @param {string} class_name
 * @param {boolean} is_always_invoke
 * @param {boolean} is_grouping
 * @param {number} max_length
 * @constructor
 */
declare class CharacterClass {
    class_id: number;
    class_name: string;
    is_always_invoke: boolean;
    is_grouping: boolean;
    max_length: number;
    constructor(class_id: number, class_name: string, is_always_invoke: boolean, is_grouping: boolean, max_length: number);
}
/**
 * InvokeDefinitionMap represents invoke definition a part of char.def
 * @constructor
 */
declare class InvokeDefinitionMap {
    map: CharacterClass[];
    lookup_table: {
        [x: string]: number;
    };
    constructor();
    /**
     * Load InvokeDefinitionMap from buffer
     * @param {Uint8Array} invoke_def_buffer
     * @returns {InvokeDefinitionMap}
     */
    static load(invoke_def_buffer: Uint8Array): InvokeDefinitionMap;
    /**
     * Initializing method
     * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
     */
    init(character_category_definition: CharacterClass[]): void;
    /**
     * Get class information by class ID
     * @param {number} class_id
     * @returns {CharacterClass}
     */
    getCharacterClass(class_id: number): CharacterClass;
    /**
     * For building character definition dictionary
     * @param {string} class_name character
     * @returns {number} class_id
     */
    lookup(class_name: string): number;
    /**
     * Transform from map to binary buffer
     * @returns {Uint8Array}
     */
    toBuffer(): Uint8Array;
}
/**
 * CharacterDefinition represents char.def file and
 * defines behavior of unknown word processing
 * @constructor
 */
declare class CharacterDefinition {
    character_category_map: Uint8Array;
    compatible_category_map: Uint32Array;
    invoke_definition_map?: InvokeDefinitionMap;
    constructor();
    /**
     * Load CharacterDefinition
     * @param {Uint8Array} cat_map_buffer
     * @param {Uint32Array} compat_cat_map_buffer
     * @param {InvokeDefinitionMap} invoke_def_buffer
     * @returns {CharacterDefinition}
     */
    static load(cat_map_buffer: Uint8Array, compat_cat_map_buffer: Uint32Array, invoke_def_buffer: Uint8Array): CharacterDefinition;
    static parseCharCategory(class_id: number, parsed_category_def: string[]): CharacterClass | null;
    static parseCategoryMapping(parsed_category_mapping: RegExpExecArray): {
        start: number;
        default: string;
        compatible: string[];
    };
    static parseRangeCategoryMapping(parsed_category_mapping: RegExpExecArray): {
        start: number;
        end: number;
        default: string;
        compatible: string[];
    };
    /**
     * Initializing method
     * @param {Array} category_mapping Array of category mapping
     */
    initCategoryMappings(category_mapping: {
        start: number;
        end?: number;
        default: string;
        compatible: string[];
    }[]): void;
    /**
     * Lookup compatible categories for a character (not included 1st category)
     * @param {string} ch UCS2 character (just 1st character is effective)
     * @returns {Array.<CharacterClass>} character classes
     */
    lookupCompatibleCategory(ch: string): CharacterClass[];
    /**
     * Lookup category for a character
     * @param {string} ch UCS2 character (just 1st character is effective)
     * @returns {CharacterClass} character class
     */
    lookup(ch: string): CharacterClass;
}
/**
 * UnknownDictionary
 * @constructor
 */
declare class UnknownDictionary extends TokenInfoDictionary {
    character_definition?: CharacterDefinition;
    constructor();
    characterDefinition(character_definition: CharacterDefinition): this;
    lookup(ch: string): $$parcel$import$0;
    lookupCompatibleCategory(ch: string): $$parcel$import$1[];
    loadUnknownDictionaries(unk_buffer: Uint8Array<ArrayBufferLike>, unk_pos_buffer: Uint8Array<ArrayBufferLike>, unk_map_buffer: Uint8Array<ArrayBufferLike>, cat_map_buffer: Uint8Array, compat_cat_map_buffer: Uint32Array, invoke_def_buffer: Uint8Array): void;
}
interface KeyValue {
    k: string;
    v: number;
}
interface WordSearch {
    commonPrefixSearch(word: string): KeyValue[];
    lookup(key: string): number;
}
/**
 * Dictionaries container for Tokenizer
 * @param {DoubleArray} trie
 * @param {TokenInfoDictionary} token_info_dictionary
 * @param {ConnectionCosts} connection_costs
 * @param {UnknownDictionary} unknown_dictionary
 * @constructor
 */
declare class DynamicDictionaries {
    word: WordSearch;
    token_info_dictionary: TokenInfoDictionary;
    connection_costs: ConnectionCosts;
    unknown_dictionary: UnknownDictionary;
    constructor(word?: WordSearch, token_info_dictionary?: TokenInfoDictionary, connection_costs?: ConnectionCosts, unknown_dictionary?: UnknownDictionary);
    loadTrie(base_buffer: Int8Array<ArrayBufferLike> | Int16Array<ArrayBufferLike> | Int32Array<ArrayBufferLike> | Uint8Array<ArrayBufferLike> | Uint16Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike>, check_buffer: Int8Array<ArrayBufferLike> | Int16Array<ArrayBufferLike> | Int32Array<ArrayBufferLike> | Uint8Array<ArrayBufferLike> | Uint16Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike>): this;
    loadFST(base_buffer: Uint8Array): this;
    loadTokenInfoDictionaries(token_info_buffer: Uint8Array<ArrayBufferLike> | undefined, pos_buffer: Uint8Array<ArrayBufferLike> | undefined, target_map_buffer: Uint8Array<ArrayBufferLike> | undefined): this;
    loadConnectionCosts(cc_buffer: Int16Array<ArrayBuffer>): this;
    loadUnknownDictionaries(unk_buffer: Uint8Array<ArrayBufferLike>, unk_pos_buffer: Uint8Array<ArrayBufferLike>, unk_map_buffer: Uint8Array<ArrayBufferLike>, cat_map_buffer: Uint8Array, compat_cat_map_buffer: Uint32Array, invoke_def_buffer: Uint8Array): this;
}
interface Formatter {
    formatEntry(word_id: number, position: number, type: string, features: string[]): Token;
    formatUnknownEntry(word_id: number, position: number, type: string, features: string[], surface_form: string): Token;
}
interface Token {
    word_id?: number;
    word_type: string;
    word_position: number;
    surface_form: string;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading?: string;
    pronunciation?: string;
}
/**
 * ViterbiNode is a node of ViterbiLattice
 * @param {number} node_name Word ID
 * @param {number} node_cost Word cost to generate
 * @param {number} start_pos Start position from 1
 * @param {number} length Word length
 * @param {string} type Node type (KNOWN, UNKNOWN, BOS, EOS, ...)
 * @param {number} left_id Left context ID
 * @param {number} right_id Right context ID
 * @param {string} surface_form Surface form of this word
 * @constructor
 */
declare class ViterbiNode {
    name: number;
    cost: number;
    start_pos: number;
    length: number;
    left_id: number;
    right_id: number;
    prev: ViterbiNode | null;
    surface_form: string;
    shortest_cost: number;
    type: string;
    constructor(node_name: number, node_cost: number, start_pos: number, length: number, type: string, left_id: number, right_id: number, surface_form: string);
}
/**
 * ViterbiLattice is a lattice in Viterbi algorithm
 * @constructor
 */
declare class ViterbiLattice {
    nodes_end_at: ViterbiNode[][];
    eos_pos: number;
    constructor();
    /**
     * Append node to ViterbiLattice
     * @param {ViterbiNode} node
     */
    append(node: ViterbiNode): void;
    /**
     * Set ends with EOS (End of Statement)
     */
    appendEos(): void;
}
/**
 * ViterbiBuilder builds word lattice (ViterbiLattice)
 * @param {DynamicDictionaries} dic dictionary
 * @constructor
 */
declare class ViterbiBuilder {
    word: WordSearch;
    token_info_dictionary: TokenInfoDictionary;
    unknown_dictionary: UnknownDictionary;
    constructor(dic: DynamicDictionaries);
    /**
     * Build word lattice
     * @param {string} sentence_str Input text
     * @returns {ViterbiLattice} Word lattice
     */
    build(sentence_str: string): ViterbiLattice;
}
/**
 * ViterbiSearcher is for searching best Viterbi path
 * @param {ConnectionCosts} connection_costs Connection costs matrix
 * @constructor
 */
declare class ViterbiSearcher {
    connection_costs: ConnectionCosts;
    constructor(connection_costs: ConnectionCosts);
    /**
     * Search best path by forward-backward algorithm
     * @param {ViterbiLattice} lattice Viterbi lattice to search
     * @returns {Array} Shortest path
     */
    search(lattice: ViterbiLattice): ViterbiNode[];
    forward(lattice: ViterbiLattice): ViterbiLattice;
    backward(lattice: ViterbiLattice): ViterbiNode[];
}
interface exDF<T, F> {
    content: T;
    flag: F;
}
/**
 * Tokenizer
 * @param {DynamicDictionaries} dic Dictionaries used by this tokenizer
 * @constructor
 */
declare class Tokenizer {
    token_info_dictionary: TokenInfoDictionary;
    unknown_dictionary: UnknownDictionary;
    viterbi_builder: ViterbiBuilder;
    viterbi_searcher: ViterbiSearcher;
    formatter: Formatter;
    constructor(dic: DynamicDictionaries, formatter: Formatter);
    /**
     * Split into sentence by punctuation
     * @param {string} input Input text
     * @returns {Array.<string>} Sentences end with punctuation
     */
    static splitByPunctuation(input: string): Array<string>;
    /**
     * Tokenize text
     * @param {string} text Input text to analyze
     * @returns {Array} Tokens
     */
    tokenizeSync(text: string): Token[];
    tokenize<T extends any>(text: string, flags: T): Promise<Token[]>;
    getTokenizeStream<F>(): TransformStream<exDF<string, F>, exDF<Token[], F>>;
    getTokenStream<F>(): TransformStream<exDF<string, F>, exDF<Token, F>>;
    tokenizeForSentence(sentence: string, tokens?: Token[]): Token[];
    /**
     * Build word lattice
     * @param {string} text Input text to analyze
     * @returns {ViterbiLattice} Word lattice
     */
    getLattice(text: string): ViterbiLattice;
}
/**
 * CharacterDefinitionBuilder
 * @constructor
 */
declare class CharacterDefinitionBuilder {
    char_def: CharacterDefinition;
    character_category_definition: CharacterClass[];
    category_mapping: {
        start: number;
        end?: number;
        default: string;
        compatible: string[];
    }[];
    constructor();
    putLine(line: string): void;
    build(): CharacterDefinition;
}
/**
 * Builder class for constructing ConnectionCosts object
 * @constructor
 */
declare class ConnectionCostsBuilder {
    lines: number;
    connection_cost?: ConnectionCosts;
    constructor();
    putLine(line: string): this;
    build(): ConnectionCosts;
}
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
declare class DictionaryBuilder {
    tid_entries: string[][];
    unk_entries: string[][];
    cc_builder: ConnectionCostsBuilder;
    cd_builder: CharacterDefinitionBuilder;
    constructor();
    addTokenInfoDictionary(new_entry: string): this;
    /**
     * Put one line of "matrix.def" file for building ConnectionCosts object
     * @param {string} line is a line of "matrix.def"
     */
    putCostMatrixLine(line: string): this;
    putCharDefLine(line: string): this;
    /**
     * Put one line of "unk.def" file for building UnknownDictionary object
     * @param {string[]} new_entry is a line of "unk.def"
     */
    putUnkDefLine(new_entry: string): this;
    build(isTrie?: boolean): DynamicDictionaries;
    buildAll(): {
        dic: DynamicDictionaries;
        word: {
            fst?: WordSearch;
            trie?: WordSearch;
        };
    };
    /**
     * Build TokenInfoDictionary
     *
     * @returns {{trie: WordSearch, token_info_dictionary: TokenInfoDictionary}}
     */
    buildTokenInfoDictionary(isTrie?: boolean, all?: boolean): {
        word: {
            fst?: WordSearch;
            trie?: WordSearch;
        };
        token_info_dictionary: TokenInfoDictionary;
    };
    buildUnknownDictionary(): UnknownDictionary;
    buildFST(): Matcher;
    /**
     * Build double array trie
     *
     * @returns {DoubleArray} Double-Array trie
     */
    buildDoubleArray(): DoubleArray;
}
type dicType = "UniDic" | "IPAdic" | "NAIST-jdic";
interface DetailedFile {
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
interface SoftDicPath {
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
declare global {
    var Deno: any;
    var Bun: any;
    var process: any;
}
declare const kuromoji: {
    build: (option: manifest) => Promise<Tokenizer>;
    dictionaryBuilder: () => DictionaryBuilder;
};
export default kuromoji;

//# sourceMappingURL=kuromoji.d.ts.map
