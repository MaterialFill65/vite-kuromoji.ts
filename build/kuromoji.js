import {readFile as $guh5a$readFile} from "node:fs/promises";

/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * String wrapper for UTF-16 surrogate pair (4 bytes)
 * @param {string} str String to wrap
 * @constructor
 */ class $1eb93d329ffdff51$var$SurrogateAwareString {
    str;
    index_mapping;
    length;
    constructor(str){
        this.str = str;
        this.index_mapping = [];
        for(let pos = 0; pos < str.length; pos++){
            const ch = str.charAt(pos);
            this.index_mapping.push(pos);
            if ($1eb93d329ffdff51$var$SurrogateAwareString.isSurrogatePair(ch)) pos++;
        }
        // Surrogate aware length
        this.length = this.index_mapping.length;
    }
    static isSurrogatePair(ch) {
        const utf16_code = ch.charCodeAt(0);
        if (utf16_code >= 0xd800 && utf16_code <= 0xdbff) // surrogate pair
        return true;
        return false;
    }
    slice(index) {
        if (this.index_mapping.length <= index) return "";
        const surrogate_aware_index = this.index_mapping[index];
        return this.str.slice(surrogate_aware_index);
    }
    charAt(index) {
        if (this.str.length <= index) return "";
        const surrogate_aware_start_index = this.index_mapping[index];
        const surrogate_aware_end_index = this.index_mapping[index + 1];
        if (surrogate_aware_end_index == null) return this.str.slice(surrogate_aware_start_index);
        return this.str.slice(surrogate_aware_start_index, surrogate_aware_end_index);
    }
    charCodeAt(index) {
        if (this.index_mapping.length <= index) return Number.NaN;
        const surrogate_aware_index = this.index_mapping[index];
        const upper = this.str.charCodeAt(surrogate_aware_index);
        let lower;
        if (upper >= 0xd800 && upper <= 0xdbff && surrogate_aware_index < this.str.length) {
            lower = this.str.charCodeAt(surrogate_aware_index + 1);
            if (lower >= 0xdc00 && lower <= 0xdfff) return (upper - 0xd800) * 0x400 + lower - 0xdc00 + 0x10000;
        }
        return upper;
    }
    toString() {
        return this.str;
    }
}
var $1eb93d329ffdff51$export$2e2bcd8739ae039 = $1eb93d329ffdff51$var$SurrogateAwareString;


/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
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
 */ class $49750c73a20df50c$var$ViterbiNode {
    name;
    cost;
    start_pos;
    length;
    left_id;
    right_id;
    prev;
    surface_form;
    shortest_cost;
    type;
    constructor(node_name, node_cost, start_pos, length, type, left_id, right_id, surface_form){
        this.name = node_name;
        this.cost = node_cost;
        this.start_pos = start_pos;
        this.length = length;
        this.left_id = left_id;
        this.right_id = right_id;
        this.prev = null;
        this.surface_form = surface_form;
        if (type === "BOS") this.shortest_cost = 0;
        else this.shortest_cost = Number.MAX_VALUE;
        this.type = type;
    }
}
var $49750c73a20df50c$export$2e2bcd8739ae039 = $49750c73a20df50c$var$ViterbiNode;


/**
 * ViterbiLattice is a lattice in Viterbi algorithm
 * @constructor
 */ class $6f4076c3f0249525$var$ViterbiLattice {
    nodes_end_at;
    eos_pos;
    constructor(){
        this.nodes_end_at = [];
        this.nodes_end_at[0] = [
            new (0, $49750c73a20df50c$export$2e2bcd8739ae039)(-1, 0, 0, 0, "BOS", 0, 0, "")
        ];
        this.eos_pos = 1;
    }
    /**
	 * Append node to ViterbiLattice
	 * @param {ViterbiNode} node
	 */ append(node) {
        const last_pos = node.start_pos + node.length - 1;
        if (this.eos_pos < last_pos) this.eos_pos = last_pos;
        let prev_nodes = this.nodes_end_at[last_pos];
        if (prev_nodes == null) prev_nodes = [];
        prev_nodes.push(node);
        this.nodes_end_at[last_pos] = prev_nodes;
    }
    /**
	 * Set ends with EOS (End of Statement)
	 */ appendEos() {
        const last_index = this.nodes_end_at.length;
        this.eos_pos++;
        this.nodes_end_at[last_index] = [
            new (0, $49750c73a20df50c$export$2e2bcd8739ae039)(-1, 0, this.eos_pos, 0, "EOS", 0, 0, "")
        ];
    }
}
var $6f4076c3f0249525$export$2e2bcd8739ae039 = $6f4076c3f0249525$var$ViterbiLattice;



/**
 * ViterbiBuilder builds word lattice (ViterbiLattice)
 * @param {DynamicDictionaries} dic dictionary
 * @constructor
 */ class $a5dea0986113324f$var$ViterbiBuilder {
    word;
    token_info_dictionary;
    unknown_dictionary;
    constructor(dic){
        this.word = dic.word;
        this.token_info_dictionary = dic.token_info_dictionary;
        this.unknown_dictionary = dic.unknown_dictionary;
    }
    /**
	 * Build word lattice
	 * @param {string} sentence_str Input text
	 * @returns {ViterbiLattice} Word lattice
	 */ build(sentence_str) {
        const lattice = new (0, $6f4076c3f0249525$export$2e2bcd8739ae039)();
        const sentence = new (0, $1eb93d329ffdff51$export$2e2bcd8739ae039)(sentence_str);
        let key;
        let trie_id;
        let left_id;
        let right_id;
        let word_cost;
        for(let pos = 0; pos < sentence.length; pos++){
            const tail = sentence.slice(pos);
            const vocabulary = this.word.commonPrefixSearch(tail);
            // console.log(vocabulary)
            // console.log(vocabulary.length)
            for(let n = 0; n < vocabulary.length; n++){
                // Words in dictionary do not have surrogate pair (only UCS2 set)
                trie_id = vocabulary[n].v;
                key = vocabulary[n].k;
                const token_info_ids = this.token_info_dictionary.target_map[trie_id];
                // console.log(key)
                // console.log(token_info_ids)
                for(let i = 0; i < token_info_ids.length; i++){
                    const token_info_id = Number.parseInt(token_info_ids[i].toString());
                    left_id = this.token_info_dictionary.dictionary.getShort(token_info_id);
                    right_id = this.token_info_dictionary.dictionary.getShort(token_info_id + 2);
                    word_cost = this.token_info_dictionary.dictionary.getShort(token_info_id + 4);
                    // node_name, cost, start_index, length, type, left_id, right_id, surface_form
                    lattice.append(new (0, $49750c73a20df50c$export$2e2bcd8739ae039)(token_info_id, word_cost, pos + 1, key.length, "KNOWN", left_id, right_id, key.toString()));
                }
            }
            // Unknown word processing
            const surrogate_aware_tail = new (0, $1eb93d329ffdff51$export$2e2bcd8739ae039)(tail);
            const head_char = new (0, $1eb93d329ffdff51$export$2e2bcd8739ae039)(surrogate_aware_tail.charAt(0));
            const head_char_class = this.unknown_dictionary.lookup(head_char.toString());
            if (vocabulary == null || vocabulary.length === 0 || head_char_class.is_always_invoke) {
                let key;
                // Process unknown word
                key = head_char;
                if (head_char_class.is_grouping && 1 < surrogate_aware_tail.length) for(let k = 1; k < surrogate_aware_tail.length; k++){
                    const next_char = surrogate_aware_tail.charAt(k);
                    const next_char_class = this.unknown_dictionary.lookup(next_char);
                    if (head_char_class.class_name !== next_char_class.class_name) break;
                    key = new (0, $1eb93d329ffdff51$export$2e2bcd8739ae039)(key.str + next_char);
                }
                const unk_ids = this.unknown_dictionary.target_map[head_char_class.class_id];
                for(let j = 0; j < unk_ids.length; j++){
                    const unk_id = Number.parseInt(unk_ids[j].toString());
                    left_id = this.unknown_dictionary.dictionary.getShort(unk_id);
                    right_id = this.unknown_dictionary.dictionary.getShort(unk_id + 2);
                    word_cost = this.unknown_dictionary.dictionary.getShort(unk_id + 4);
                    // node_name, cost, start_index, length, type, left_id, right_id, surface_form
                    lattice.append(new (0, $49750c73a20df50c$export$2e2bcd8739ae039)(unk_id, word_cost, pos + 1, key.length, "UNKNOWN", left_id, right_id, key.toString()));
                }
            }
        }
        lattice.appendEos();
        return lattice;
    }
}
var $a5dea0986113324f$export$2e2bcd8739ae039 = $a5dea0986113324f$var$ViterbiBuilder;


/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * ViterbiSearcher is for searching best Viterbi path
 * @param {ConnectionCosts} connection_costs Connection costs matrix
 * @constructor
 */ class $f2cbeb1834e5877a$var$ViterbiSearcher {
    connection_costs;
    constructor(connection_costs){
        this.connection_costs = connection_costs;
    }
    /**
	 * Search best path by forward-backward algorithm
	 * @param {ViterbiLattice} lattice Viterbi lattice to search
	 * @returns {Array} Shortest path
	 */ search(lattice) {
        const foewarded_lattice = this.forward(lattice);
        return this.backward(foewarded_lattice);
    }
    forward(lattice) {
        let i;
        let j;
        let k;
        for(i = 1; i <= lattice.eos_pos; i++){
            const nodes = lattice.nodes_end_at[i];
            if (nodes == null) continue;
            for(j = 0; j < nodes.length; j++){
                const node = nodes[j];
                let cost = Number.MAX_VALUE;
                let shortest_prev_node = null;
                const prev_nodes = lattice.nodes_end_at[node.start_pos - 1];
                if (prev_nodes == null) continue;
                for(k = 0; k < prev_nodes.length; k++){
                    const prev_node = prev_nodes[k];
                    let edge_cost;
                    if (node.left_id == null || prev_node.right_id == null) {
                        // TODO assert
                        console.log("Left or right is null");
                        edge_cost = 0;
                    } else edge_cost = this.connection_costs.get(prev_node.right_id, node.left_id);
                    const _cost = prev_node.shortest_cost + edge_cost + node.cost;
                    if (_cost < cost) {
                        shortest_prev_node = prev_node;
                        cost = _cost;
                    }
                }
                node.prev = shortest_prev_node;
                node.shortest_cost = cost;
            }
        }
        return lattice;
    }
    backward(lattice) {
        const shortest_path = [];
        const eos = lattice.nodes_end_at[lattice.nodes_end_at.length - 1][0];
        let node_back = eos.prev;
        if (node_back == null) return [];
        while(node_back.type !== "BOS"){
            shortest_path.push(node_back);
            if (node_back.prev == null) // TODO Failed to back. Process unknown words?
            return [];
            node_back = node_back.prev;
        }
        return shortest_path.reverse();
    }
}
var $f2cbeb1834e5877a$export$2e2bcd8739ae039 = $f2cbeb1834e5877a$var$ViterbiSearcher;


const $1d80c1e34dd115b9$var$PUNCTUATION = /、|。/;
/**
 * Tokenizer
 * @param {DynamicDictionaries} dic Dictionaries used by this tokenizer
 * @constructor
 */ class $1d80c1e34dd115b9$var$Tokenizer {
    token_info_dictionary;
    unknown_dictionary;
    viterbi_builder;
    viterbi_searcher;
    formatter;
    constructor(dic, formatter){
        this.token_info_dictionary = dic.token_info_dictionary;
        this.unknown_dictionary = dic.unknown_dictionary;
        this.viterbi_builder = new (0, $a5dea0986113324f$export$2e2bcd8739ae039)(dic);
        this.viterbi_searcher = new (0, $f2cbeb1834e5877a$export$2e2bcd8739ae039)(dic.connection_costs);
        this.formatter = formatter;
    }
    /**
	 * Split into sentence by punctuation
	 * @param {string} input Input text
	 * @returns {Array.<string>} Sentences end with punctuation
	 */ static splitByPunctuation(input) {
        const sentences = [];
        let tail = input;
        while(true){
            if (tail === "") break;
            const index = tail.search($1d80c1e34dd115b9$var$PUNCTUATION);
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
	 */ tokenizeSync(text) {
        const sentences = $1d80c1e34dd115b9$var$Tokenizer.splitByPunctuation(text);
        const tokens = [];
        for(let i = 0; i < sentences.length; i++){
            const sentence = sentences[i];
            this.tokenizeForSentence(sentence, tokens);
        }
        return tokens;
    }
    async tokenize(text, flags) {
        const stream = this.getTokenizeStream();
        const writer = stream.writable.getWriter();
        writer.write({
            flag: flags,
            content: text
        });
        writer.close();
        const reader = stream.readable.getReader();
        const tokens = [];
        while(true){
            const { value: value, done: done } = await reader.read();
            if (value) tokens.push(...value.content);
            if (done) break;
        }
        return tokens;
    }
    getTokenizeStream() {
        let buffer = [];
        const concatStream = new TransformStream({
            transform: (data, controller)=>{
                if (data.content.word_type === "EOS") {
                    controller.enqueue({
                        content: buffer,
                        flag: data.flag
                    });
                    buffer = [];
                } else buffer.push(data.content);
            }
        });
        const stream = this.getTokenStream();
        return {
            writable: stream.writable,
            readable: stream.readable.pipeThrough(concatStream)
        };
    }
    getTokenStream() {
        const concatStream = new TransformStream({
            transform: (data, controller)=>{
                controller.enqueue({
                    flag: data.flag,
                    content: data.content.data
                });
                if (data.content.eos) controller.enqueue({
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
                        basic_form: "*"
                    }
                });
            }
        });
        const stream = this.getStream();
        return {
            writable: stream.writable,
            readable: stream.readable.pipeThrough(concatStream)
        };
    }
    getStream() {
        const splitStream = new TransformStream({
            transform: (data, controller)=>{
                const sentences = $1d80c1e34dd115b9$var$Tokenizer.splitByPunctuation(data.content);
                sentences.forEach((sentence, index)=>{
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
        const latticeStream = new TransformStream({
            transform: (data, controller)=>{
                controller.enqueue({
                    content: {
                        data: this.getLattice(data.content.data),
                        eos: data.content.eos
                    },
                    flag: data.flag
                });
            }
        });
        const viterbiStream = new TransformStream({
            transform: (data, controller)=>{
                const nodes = this.viterbi_searcher.search(data.content.data);
                nodes.forEach((node, index)=>{
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
        const tokenizeStream = new TransformStream({
            transform: (data, controller)=>{
                const node = data.content.data;
                let token;
                let features;
                let features_line;
                if (node.type === "KNOWN") {
                    features_line = this.token_info_dictionary.getFeatures(node.name.toString());
                    features = features_line ? features_line.split(",") : [];
                    token = this.formatter.formatEntry(node.name, node.start_pos, node.type, features);
                } else if (node.type === "UNKNOWN") {
                    features_line = this.unknown_dictionary.getFeatures(node.name.toString());
                    features = features_line ? features_line.split(",") : [];
                    token = this.formatter.formatUnknownEntry(node.name, node.start_pos, node.type, features, node.surface_form);
                } else token = this.formatter.formatEntry(node.name, node.start_pos, node.type, []);
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
            readable: splitStream.readable.pipeThrough(latticeStream).pipeThrough(viterbiStream).pipeThrough(tokenizeStream)
        };
    }
    tokenizeForSentence(sentence, tokens = []) {
        const lattice = this.getLattice(sentence);
        const best_path = this.viterbi_searcher.search(lattice);
        let last_pos = 0;
        if (tokens.length > 0) last_pos = tokens[tokens.length - 1].word_position;
        for(let j = 0; j < best_path.length; j++){
            const node = best_path[j];
            let token;
            let features;
            let features_line;
            if (node.type === "KNOWN") {
                features_line = this.token_info_dictionary.getFeatures(node.name.toString());
                if (features_line == null) features = [];
                else features = features_line.split(",");
                token = this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
            } else if (node.type === "UNKNOWN") {
                // Unknown word
                features_line = this.unknown_dictionary.getFeatures(node.name.toString());
                if (features_line == null) features = [];
                else features = features_line.split(",");
                token = this.formatter.formatUnknownEntry(node.name, last_pos + node.start_pos, node.type, features, node.surface_form);
            } else // TODO User dictionary
            token = this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, []);
            tokens.push(token);
        }
        return tokens;
    }
    /**
	 * Build word lattice
	 * @param {string} text Input text to analyze
	 * @returns {ViterbiLattice} Word lattice
	 */ getLattice(text) {
        return this.viterbi_builder.build(text);
    }
}
var $1d80c1e34dd115b9$export$2e2bcd8739ae039 = $1d80c1e34dd115b9$var$Tokenizer;


// Bit flags for arc representation
const $4ead6c675ec7949c$export$281fd4b195eed79 = 1;
const $4ead6c675ec7949c$export$95b87cd1974c309d = 2;
const $4ead6c675ec7949c$export$cf6a49cbc8bcfc48 = 16;
const $4ead6c675ec7949c$export$7efbea5e16f33691 = 32;
const $4ead6c675ec7949c$export$8bca792d963eb0ef = -1;
class $4ead6c675ec7949c$export$7254cc27399e90bd {
    id;
    final;
    transMap;
    finalOutput;
    constructor(id = null){
        this.id = id;
        this.final = false;
        this.transMap = {};
        this.finalOutput = new Set();
    }
    isFinal() {
        return this.final;
    }
    setFinal(final) {
        this.final = final;
    }
    transition(char) {
        var _this_transMap_char;
        return ((_this_transMap_char = this.transMap[char]) === null || _this_transMap_char === void 0 ? void 0 : _this_transMap_char.state) || null;
    }
    setTransition(char, state) {
        var _this_transMap_char;
        this.transMap[char] = {
            state: state,
            output: ((_this_transMap_char = this.transMap[char]) === null || _this_transMap_char === void 0 ? void 0 : _this_transMap_char.output) || new Uint8Array()
        };
    }
    stateOutput() {
        return this.finalOutput;
    }
    setStateOutput(output) {
        this.finalOutput = new Set(Array.from(output).map((e)=>new Uint8Array(e)));
    }
    clearStateOutput() {
        this.finalOutput.clear();
    }
    output(char) {
        var _this_transMap_char;
        return ((_this_transMap_char = this.transMap[char]) === null || _this_transMap_char === void 0 ? void 0 : _this_transMap_char.output) || new Uint8Array();
    }
    setOutput(char, out) {
        if (this.transMap[char]) this.transMap[char].output = new Uint8Array(out);
    }
    clear() {
        this.final = false;
        this.transMap = {};
        this.finalOutput.clear();
    }
}
class $4ead6c675ec7949c$export$6f2cf46b44d412d7 {
    dictionary;
    constructor(){
        this.dictionary = new Map();
    }
    size() {
        return this.dictionary.size;
    }
    member(state) {
        return this.dictionary.get(this.hashState(state));
    }
    insert(state) {
        this.dictionary.set(this.hashState(state), state);
    }
    hashState(state) {
        return JSON.stringify({
            final: state.final,
            transMap: state.transMap,
            finalOutput: Array.from(state.finalOutput)
        });
    }
}
var $4ead6c675ec7949c$export$894ddd3ca336a680 = /*#__PURE__*/ function(AlignmentSize) {
    AlignmentSize[AlignmentSize["ONE_BYTE"] = 1] = "ONE_BYTE";
    AlignmentSize[AlignmentSize["TWO_BYTES"] = 2] = "TWO_BYTES";
    AlignmentSize[AlignmentSize["FOUR_BYTES"] = 4] = "FOUR_BYTES";
    AlignmentSize[AlignmentSize["EIGHT_BYTES"] = 8] = "EIGHT_BYTES";
    return AlignmentSize;
}({});
function $4ead6c675ec7949c$export$29db80b516530aad(size, alignment) {
    return Math.ceil(size / alignment) * alignment;
}
function $4ead6c675ec7949c$export$c3586a02be60dce4(s1, s2) {
    let i = 0;
    while(i < s1.length && i < s2.length && s1[i] === s2[i])i++;
    return i;
}
function $4ead6c675ec7949c$export$66246faf9d35a11a(state, id) {
    const newState = new $4ead6c675ec7949c$export$7254cc27399e90bd(id);
    newState.setFinal(state.isFinal());
    newState.setStateOutput(new Set(state.stateOutput())); // Shallow copy of Set, but Uint8Arrays are immutable
    for(const charCode in state.transMap)if (state.transMap.hasOwnProperty(charCode)) {
        const transition = state.transMap[charCode];
        newState.setTransition(Number(charCode), transition.state); // Assuming state IDs are handled correctly later during minimization
        newState.setOutput(Number(charCode), transition.output); // Shallow copy of Uint8Array, but they are immutable
    }
    return newState;
}
function $4ead6c675ec7949c$export$95112ecaf0c008c1(arr1, arr2) {
    const len1 = arr1.length;
    const len2 = arr2.length;
    const len = Math.min(len1, len2);
    for(let i = 0; i < len; i++){
        if (arr1[i] < arr2[i]) return -1;
        else if (arr1[i] > arr2[i]) return 1;
    }
    if (len1 < len2) return -1;
    else if (len1 > len2) return 1;
    else return 0;
}


function $412777b7fa41cd98$export$fcbc0da9b398f525(fst, alignmentSize = (0, $4ead6c675ec7949c$export$894ddd3ca336a680).FOUR_BYTES) {
    const bufferPool = new ArrayBuffer(4096);
    const view = new DataView(bufferPool);
    const arcs = [];
    const address = {};
    let pos = 0;
    // メモリ効率化のためのバッファ再利用
    const getBuffer = (size)=>{
        if (size <= bufferPool.byteLength) return bufferPool;
        return new ArrayBuffer(size);
    };
    for (const s of Array.from(fst.dictionary.values())){
        const sortedTrans = Object.entries(s.transMap).sort((a, b)=>Number(b[0]) - Number(a[0]));
        for(let i = 0; i < sortedTrans.length; i++){
            const [c, v] = sortedTrans[i];
            const buffer = getBuffer(1024);
            const view = new DataView(buffer);
            let offset = 0;
            let flag = 0;
            if (i === 0) flag |= (0, $4ead6c675ec7949c$export$95b87cd1974c309d);
            if (v.output.length > 0) flag |= (0, $4ead6c675ec7949c$export$cf6a49cbc8bcfc48);
            if (alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE) {
                view.setInt8(offset++, flag);
                view.setInt8(offset++, Number(c));
            } else {
                const flagAndLabel = flag << 24 | Number(c) << 16;
                view.setInt32(offset, flagAndLabel);
                offset += alignmentSize;
            }
            if (v.output.length > 0) {
                if (alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE) view.setInt8(offset++, v.output.length);
                else {
                    view.setInt32(offset, v.output.length);
                    offset += alignmentSize;
                }
                new Uint8Array(buffer, offset).set(v.output);
                offset += (0, $4ead6c675ec7949c$export$29db80b516530aad)(v.output.length, alignmentSize);
            }
            const nextAddr = address[v.state.id];
            const target = pos + offset + (alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE ? 1 : alignmentSize) - nextAddr;
            if (alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE) view.setInt8(offset++, target);
            else {
                view.setInt32(offset, target);
                offset += alignmentSize;
            }
            arcs.push(new Uint8Array(buffer.slice(0, offset)));
            pos += offset;
        }
        if (s.isFinal()) {
            const buffer = getBuffer(1024);
            const view = new DataView(buffer);
            let offset = 0;
            let flag = (0, $4ead6c675ec7949c$export$281fd4b195eed79);
            const finalOutputs = Array.from(s.finalOutput);
            const hasOutput = finalOutputs.some((out)=>out.length > 0);
            if (hasOutput) flag |= (0, $4ead6c675ec7949c$export$7efbea5e16f33691);
            if (!Object.keys(s.transMap).length) flag |= (0, $4ead6c675ec7949c$export$95b87cd1974c309d);
            if (alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE) view.setInt8(offset++, flag);
            else {
                view.setInt32(offset, flag << 24);
                offset += alignmentSize;
            }
            if (hasOutput) {
                const separator = new Uint8Array([
                    0x1a
                ]);
                const totalLength = finalOutputs.reduce((sum, curr)=>sum + curr.length, 0) + (finalOutputs.length - 1);
                if (alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE) view.setInt8(offset++, totalLength);
                else {
                    view.setInt32(offset, totalLength);
                    offset += alignmentSize;
                }
                for(let i = 0; i < finalOutputs.length; i++){
                    new Uint8Array(buffer, offset).set(finalOutputs[i]);
                    offset += finalOutputs[i].length;
                    if (i < finalOutputs.length - 1) {
                        new Uint8Array(buffer, offset).set(separator);
                        offset += 1;
                    }
                }
                offset = (0, $4ead6c675ec7949c$export$29db80b516530aad)(offset, alignmentSize);
            }
            arcs.push(new Uint8Array(buffer.slice(0, offset)));
            pos += offset;
        }
        address[s.id] = pos;
    }
    arcs.reverse();
    const totalLength = arcs.reduce((sum, arr)=>sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arc of arcs){
        result.set(arc, offset);
        offset += arc.length;
    }
    return result;
}



class $cd8ea557b7be61b3$var$Matcher {
    static BUF_SIZE = 1024;
    data;
    alignmentSize;
    constructor(dictData, alignmentSize = (0, $4ead6c675ec7949c$export$894ddd3ca336a680).FOUR_BYTES){
        if (dictData) {
            this.data = dictData;
            this.alignmentSize = alignmentSize;
        } else throw new Error("dictData must be provided");
    }
    run(word) {
        const outputs = new Set();
        let accept = false;
        const bufferPool = new Uint8Array($cd8ea557b7be61b3$var$Matcher.BUF_SIZE);
        let bufferSize = 0;
        let i = 0;
        let pos = 0;
        while(pos < this.data.length){
            const [arc, incr] = this.nextArc(pos);
            if (arc.flag & (0, $4ead6c675ec7949c$export$281fd4b195eed79)) {
                accept = i === word.length;
                if (accept) arc.finalOutput.forEach((out)=>{
                    const newOutput = new Uint8Array(bufferSize + out.length);
                    newOutput.set(bufferPool.subarray(0, bufferSize));
                    newOutput.set(out, bufferSize);
                    outputs.add(newOutput);
                });
                if (arc.flag & (0, $4ead6c675ec7949c$export$95b87cd1974c309d) || i >= word.length) break;
                pos += incr;
            } else if (arc.flag & (0, $4ead6c675ec7949c$export$95b87cd1974c309d) || word[i] === arc.label) {
                if (i >= word.length) break;
                if (word[i] === arc.label) {
                    bufferPool.set(arc.output, bufferSize);
                    bufferSize += arc.output.length;
                    i++;
                    pos += arc.target;
                } else if (arc.flag & (0, $4ead6c675ec7949c$export$95b87cd1974c309d)) break;
                else pos += incr;
            } else pos += incr;
        }
        return [
            accept,
            outputs
        ];
    }
    lookup(key) {
        const textEncoder = new TextEncoder();
        const textDecoder = new TextDecoder();
        const [accept, encoded_word] = this.run(textEncoder.encode(key));
        if (!accept) return 0, $4ead6c675ec7949c$export$8bca792d963eb0ef;
        let result = Array.from(encoded_word)[0];
        return parseInt(textDecoder.decode(result));
    }
    commonPrefixSearch(word) {
        const textEncoder = new TextEncoder();
        const textDecoder = new TextDecoder();
        const buffer = textEncoder.encode(word);
        const searchResult = [];
        for(let i = 1; i <= buffer.length; i++){
            const [accepted, result] = this.run(buffer.slice(0, i));
            if (!accepted) continue;
            const arrayed = Array.from(result);
            const tmp_searchResult = arrayed.map((enc_output)=>({
                    k: textDecoder.decode(buffer.slice(0, i)),
                    v: Number.parseInt(textDecoder.decode(enc_output))
                }));
            searchResult.push(tmp_searchResult[0]);
        }
        return searchResult;
    }
    nextArc(addr) {
        const arc = {
            flag: 0,
            label: 0,
            output: new Uint8Array(),
            finalOutput: [
                new Uint8Array()
            ],
            target: 0
        };
        let pos = addr;
        if (this.alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE) {
            arc.flag = this.data[pos++];
            if (!(arc.flag & (0, $4ead6c675ec7949c$export$281fd4b195eed79))) arc.label = this.data[pos++];
        } else {
            // 複数バイトの場合は32ビット値として読み込む
            const flagAndLabel = new DataView(this.data.buffer).getInt32(pos);
            arc.flag = flagAndLabel >>> 24;
            if (!(arc.flag & (0, $4ead6c675ec7949c$export$281fd4b195eed79))) arc.label = flagAndLabel >>> 16 & 0xFF;
            pos += this.alignmentSize;
        }
        if (arc.flag & (0, $4ead6c675ec7949c$export$281fd4b195eed79)) {
            if (arc.flag & (0, $4ead6c675ec7949c$export$7efbea5e16f33691)) {
                const finalOutputSize = this.alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE ? this.data[pos++] : new DataView(this.data.buffer).getInt32(pos);
                pos += this.alignmentSize > 1 ? this.alignmentSize : 0;
                const finalOutput = this.data.slice(pos, pos + finalOutputSize);
                arc.finalOutput = this.splitOutput(finalOutput);
                pos += (0, $4ead6c675ec7949c$export$29db80b516530aad)(finalOutputSize, this.alignmentSize);
            }
        } else {
            if (arc.flag & (0, $4ead6c675ec7949c$export$cf6a49cbc8bcfc48)) {
                const outputSize = this.alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE ? this.data[pos++] : new DataView(this.data.buffer).getInt32(pos);
                pos += this.alignmentSize > 1 ? this.alignmentSize : 0;
                arc.output = this.data.slice(pos, pos + outputSize);
                pos += (0, $4ead6c675ec7949c$export$29db80b516530aad)(outputSize, this.alignmentSize);
            }
            if (this.alignmentSize === (0, $4ead6c675ec7949c$export$894ddd3ca336a680).ONE_BYTE) arc.target = this.data[pos++];
            else {
                arc.target = new DataView(this.data.buffer).getInt32(pos);
                pos += this.alignmentSize;
            }
        }
        return [
            arc,
            pos - addr
        ];
    }
    splitOutput(output) {
        const separator = 0x1a; // ASCII SUB character
        const result = [];
        let start = 0;
        for(let i = 0; i < output.length; i++)if (output[i] === separator) {
            result.push(output.slice(start, i));
            start = i + 1;
        }
        if (start < output.length) result.push(output.slice(start));
        return result;
    }
    getBuffer() {
        return this.data;
    }
}
var $cd8ea557b7be61b3$export$2e2bcd8739ae039 = $cd8ea557b7be61b3$var$Matcher;




function $75a1596d3b3c354e$export$b27a4b6e7d56c64c(inputs) {
    inputs.sort((a, b)=>(0, $4ead6c675ec7949c$export$95112ecaf0c008c1)(a.k, b.k));
    const start_time = Date.now();
    let last_printed = 0;
    const inputs_size = inputs.length;
    console.log(`input size: ${inputs_size}`);
    const fstDict = new (0, $4ead6c675ec7949c$export$6f2cf46b44d412d7)();
    const stateCache = new Map();
    const buffer = new Array(1024).fill(null).map(()=>new (0, $4ead6c675ec7949c$export$7254cc27399e90bd)());
    buffer[0] = new (0, $4ead6c675ec7949c$export$7254cc27399e90bd)(); // initial state
    const findMinimized = (state)=>{
        const hash = fstDict.hashState(state);
        const cached = stateCache.get(hash);
        if (cached) return cached;
        const s = fstDict.member(state);
        if (!s) {
            const newState = (0, $4ead6c675ec7949c$export$66246faf9d35a11a)(state, fstDict.size());
            fstDict.insert(newState);
            stateCache.set(hash, newState);
            return newState;
        }
        stateCache.set(hash, s);
        return s;
    };
    const outputBuffer = new Uint8Array(1024);
    let prev_word = new Uint8Array();
    let processed = 0;
    let current_word;
    let current_output;
    // main loop
    for (const input of inputs){
        current_word = input.k;
        current_output = input.v;
        // console.debug('current word: ' + String.fromCharCode(...current_word));
        // console.debug('current_output: ' + String.fromCharCode(...current_output));
        if ((0, $4ead6c675ec7949c$export$95112ecaf0c008c1)(current_word, prev_word) < 0) throw new Error("Input words must be sorted lexicographically.");
        const pref_len = (0, $4ead6c675ec7949c$export$c3586a02be60dce4)(prev_word, current_word);
        // expand buffer to current word length
        while(buffer.length <= current_word.length)buffer.push(new (0, $4ead6c675ec7949c$export$7254cc27399e90bd)());
        // set state transitions
        for(let i = prev_word.length; i > pref_len; i--)buffer[i - 1].setTransition(prev_word[i - 1], findMinimized(buffer[i]));
        for(let i = pref_len + 1; i <= current_word.length; i++){
            buffer[i].clear();
            buffer[i - 1].setTransition(current_word[i - 1], buffer[i]);
        }
        if ((0, $4ead6c675ec7949c$export$95112ecaf0c008c1)(current_word, prev_word) !== 0) {
            buffer[current_word.length].setFinal(true);
            buffer[current_word.length].setStateOutput(new Set([
                new Uint8Array()
            ]));
        }
        // set state outputs
        for(let j = 1; j <= pref_len; j++){
            // divide (j-1)th state's output to (common) prefix and suffix
            const common_prefix_arr = [];
            const output = buffer[j - 1].output(current_word[j - 1]);
            let k = 0;
            while(k < output.length && k < current_output.length && output[k] === current_output[k]){
                common_prefix_arr.push(output[k]);
                k++;
            }
            const common_prefix = new Uint8Array(common_prefix_arr);
            const word_suffix = output.slice(common_prefix.length);
            // re-set (j-1)'th state's output to prefix
            buffer[j - 1].setOutput(current_word[j - 1], common_prefix);
            // re-set jth state's output to suffix or set final state output
            for(const charCodeStr in buffer[j].transMap)if (buffer[j].transMap.hasOwnProperty(charCodeStr)) {
                const charCode = Number(charCodeStr);
                const new_output_arr = [
                    ...word_suffix,
                    ...buffer[j].output(charCode)
                ];
                const new_output = new Uint8Array(new_output_arr);
                buffer[j].setOutput(charCode, new_output);
            }
            // or, set final state output if it's a final state
            if (buffer[j].isFinal()) {
                const tmp_set = new Set();
                for (const tmp_str of buffer[j].stateOutput()){
                    const newOutputArr = [
                        ...word_suffix,
                        ...tmp_str
                    ];
                    tmp_set.add(new Uint8Array(newOutputArr));
                }
                buffer[j].setStateOutput(tmp_set);
            }
            // update current output (subtract prefix)
            current_output = current_output.slice(common_prefix.length);
        }
        if ((0, $4ead6c675ec7949c$export$95112ecaf0c008c1)(current_word, prev_word) === 0) buffer[current_word.length].stateOutput().add(current_output);
        else buffer[pref_len].setOutput(current_word[pref_len], current_output);
        // preserve current word for next loop
        prev_word = current_word;
        // progress
        processed++;
        const elapsed = Math.round((Date.now() - start_time) / 1000);
        if (elapsed % 30 === 0 && elapsed > last_printed) {
            const progress = processed / inputs_size * 100;
            console.log(`elapsed=${elapsed}sec, progress: ${progress} %`);
            last_printed = elapsed;
        }
    }
    if (current_word) // minimize the last word
    for(let i = current_word.length; i > 0; i--)buffer[i - 1].setTransition(prev_word[i - 1], findMinimized(buffer[i]));
    findMinimized(buffer[0]);
    console.log(`num of state: ${fstDict.size()}`);
    return fstDict;
}


class $b15954558ed9603e$export$8764c37c2a3aea76 {
    states;
    constructor(){
        this.states = [];
    }
    /**
	 * 新しい状態を作成します
	 */ newState() {
        const state = new (0, $4ead6c675ec7949c$export$7254cc27399e90bd)(this.states.length);
        this.states.push(state);
        return state;
    }
    /**
	 * FSTを最適化して構築します
	 */ build(keys) {
        // Convert key string to ArrayBuffer
        const textEncoder = new TextEncoder();
        const buff_keys = keys.map((k)=>{
            return {
                k: textEncoder.encode(k.k),
                v: textEncoder.encode(k.v.toString())
            };
        });
        return (0, $75a1596d3b3c354e$export$b27a4b6e7d56c64c)(buff_keys);
    }
}


// Copyright (c) 2014 Takuya Asano All Rights Reserved.
const $60f4f4059ac4d094$var$TERM_CHAR = "\u0000"; // terminal character
const $60f4f4059ac4d094$var$TERM_CODE = 0; // terminal character code
const $60f4f4059ac4d094$var$ROOT_ID = 0; // index of root node
const $60f4f4059ac4d094$var$NOT_FOUND = -1; // traverse() returns if no nodes found
const $60f4f4059ac4d094$var$BASE_SIGNED = true;
const $60f4f4059ac4d094$var$CHECK_SIGNED = true;
const $60f4f4059ac4d094$var$BASE_BYTES = 4;
const $60f4f4059ac4d094$var$CHECK_BYTES = 4;
const $60f4f4059ac4d094$var$MEMORY_EXPAND_RATIO = 2;
const $60f4f4059ac4d094$var$newBC = (initial_size = 1024)=>{
    const initBase = (_base, start, end)=>{
        // 'end' index does not include
        for(let i = start; i < end; i++)_base[i] = -i + 1; // inversed previous empty node index
        if (0 < check.array[check.array.length - 1]) {
            let last_used_id = check.array.length - 2;
            while(0 < check.array[last_used_id])last_used_id--;
            _base[start] = -last_used_id;
        }
    };
    const initCheck = (_check, start, end)=>{
        for(let i = start; i < end; i++)_check[i] = -i - 1; // inversed next empty node index
    };
    const realloc = (min_size)=>{
        // expand arrays size by given ratio
        const new_size = min_size * $60f4f4059ac4d094$var$MEMORY_EXPAND_RATIO;
        // console.log('re-allocate memory to ' + new_size);
        const base_new_array = $60f4f4059ac4d094$var$newArrayBuffer(base.signed, base.bytes, new_size);
        initBase(base_new_array, base.array.length, new_size); // init BASE in new range
        base_new_array.set(base.array);
        base.array = base_new_array;
        const check_new_array = $60f4f4059ac4d094$var$newArrayBuffer(check.signed, check.bytes, new_size);
        initCheck(check_new_array, check.array.length, new_size); // init CHECK in new range
        check_new_array.set(check.array);
        check.array = check_new_array;
    };
    let first_unused_node = $60f4f4059ac4d094$var$ROOT_ID + 1;
    const base = {
        signed: $60f4f4059ac4d094$var$BASE_SIGNED,
        bytes: $60f4f4059ac4d094$var$BASE_BYTES,
        array: $60f4f4059ac4d094$var$newArrayBuffer($60f4f4059ac4d094$var$BASE_SIGNED, $60f4f4059ac4d094$var$BASE_BYTES, initial_size)
    };
    const check = {
        signed: $60f4f4059ac4d094$var$CHECK_SIGNED,
        bytes: $60f4f4059ac4d094$var$CHECK_BYTES,
        array: $60f4f4059ac4d094$var$newArrayBuffer($60f4f4059ac4d094$var$CHECK_SIGNED, $60f4f4059ac4d094$var$CHECK_BYTES, initial_size)
    };
    // init root node
    base.array[$60f4f4059ac4d094$var$ROOT_ID] = 1;
    check.array[$60f4f4059ac4d094$var$ROOT_ID] = $60f4f4059ac4d094$var$ROOT_ID;
    // init BASE
    initBase(base.array, $60f4f4059ac4d094$var$ROOT_ID + 1, base.array.length);
    // init CHECK
    initCheck(check.array, $60f4f4059ac4d094$var$ROOT_ID + 1, check.array.length);
    return {
        getBaseBuffer: ()=>base.array,
        getCheckBuffer: ()=>check.array,
        loadBaseBuffer: function(base_buffer) {
            base.array = base_buffer;
            return this;
        },
        loadCheckBuffer: function(check_buffer) {
            check.array = check_buffer;
            return this;
        },
        size: ()=>Math.max(base.array.length, check.array.length),
        getBase: (index)=>{
            if (base.array.length - 1 < index) return -index + 1;
            // if (!Number.isFinite(base.array[index])) {
            //     console.log('getBase:' + index);
            //     throw 'getBase' + index;
            // }
            return base.array[index];
        },
        getCheck: (index)=>{
            if (check.array.length - 1 < index) return -index - 1;
            // if (!Number.isFinite(check.array[index])) {
            //     console.log('getCheck:' + index);
            //     throw 'getCheck' + index;
            // }
            return check.array[index];
        },
        setBase: (index, base_value)=>{
            if (base.array.length - 1 < index) realloc(index);
            base.array[index] = base_value;
        },
        setCheck: (index, check_value)=>{
            if (check.array.length - 1 < index) realloc(index);
            check.array[index] = check_value;
        },
        setFirstUnusedNode: (index)=>{
            // if (!Number.isFinite(index)) {
            //     throw 'assertion error: setFirstUnusedNode ' + index + ' is not finite number';
            // }
            first_unused_node = index;
        },
        getFirstUnusedNode: ()=>{
            // if (!Number.isFinite(first_unused_node)) {
            //     throw 'assertion error: getFirstUnusedNode ' + first_unused_node + ' is not finite number';
            // }
            return first_unused_node;
        },
        shrink: function() {
            let last_index = this.size() - 1;
            while(true){
                if (0 <= check.array[last_index]) break;
                last_index--;
            }
            base.array = base.array.subarray(0, last_index + 2); // keep last unused node
            check.array = check.array.subarray(0, last_index + 2); // keep last unused node
        },
        calc: ()=>{
            let unused_count = 0;
            const size = check.array.length;
            for(let i = 0; i < size; i++)if (check.array[i] < 0) unused_count++;
            return {
                all: size,
                unused: unused_count,
                efficiency: (size - unused_count) / size
            };
        },
        dump: function() {
            // for debug
            let dump_base = "";
            let dump_check = "";
            let i;
            for(i = 0; i < base.array.length; i++)dump_base = `${dump_base} ${this.getBase(i)}`;
            for(i = 0; i < check.array.length; i++)dump_check = `${dump_check} ${this.getCheck(i)}`;
            console.log(`base:${dump_base}`);
            console.log(`chck:${dump_check}`);
            return `base:${dump_base} chck:${dump_check}`;
        }
    };
};
class $60f4f4059ac4d094$export$2e2bcd8739ae039 {
    bc;
    keys;
    constructor(initial_size){
        this.bc = $60f4f4059ac4d094$var$newBC(initial_size); // BASE and CHECK
        this.keys = [];
    }
    /**
	 * Append a key to initialize set
	 * (This method should be called by dictionary ordered key)
	 *
	 * @param {String} key
	 * @param {Number} record Integer value from 0 to max signed integer number - 1
	 */ append(key, record) {
        this.keys.push({
            k: key,
            v: record
        });
        return this;
    }
    /**
	 * Build double array for given keys
	 *
	 * @param {Array} keys Array of keys. A key is a Object which has properties 'k', 'v'.
	 * 'k' is a key string, 'v' is a record assigned to that key.
	 * @return {DoubleArray} Compiled double array
	 */ build(keys = this.keys, sorted = false) {
        if (keys == null) return new $60f4f4059ac4d094$export$d1d3971fdcedc28d(this.bc);
        // Convert key string to ArrayBuffer
        const buff_keys = keys.map((k)=>{
            return {
                k: $60f4f4059ac4d094$var$stringToUtf8Bytes(k.k + $60f4f4059ac4d094$var$TERM_CHAR),
                v: k.v
            };
        });
        // Sort keys by byte order
        if (sorted) this.keys = buff_keys;
        else this.keys = buff_keys.sort((k1, k2)=>{
            const b1 = k1.k;
            const b2 = k2.k;
            const min_length = Math.min(b1.length, b2.length);
            for(let pos = 0; pos < min_length; pos++){
                if (b1[pos] === b2[pos]) continue;
                return b1[pos] - b2[pos];
            }
            return b1.length - b2.length;
        });
        this._build($60f4f4059ac4d094$var$ROOT_ID, 0, 0, this.keys.length);
        return new $60f4f4059ac4d094$export$d1d3971fdcedc28d(this.bc);
    }
    /**
	 * Append nodes to BASE and CHECK array recursively
	 */ _build(parent_index, position, start, length) {
        const children_info = this.getChildrenInfo(position, start, length);
        const _base = this.findAllocatableBase(children_info);
        this.setBC(parent_index, children_info, _base);
        for(let i = 0; i < children_info.length; i = i + 3){
            const child_code = children_info[i];
            if (child_code === $60f4f4059ac4d094$var$TERM_CODE) continue;
            const child_start = children_info[i + 1];
            const child_len = children_info[i + 2];
            const child_index = _base + child_code;
            this._build(child_index, position + 1, child_start, child_len);
        }
    }
    getChildrenInfo(position, start, length) {
        let current_char = this.keys[start].k[position];
        let i = 0;
        let children_info = new Int32Array(length * 3);
        children_info[i++] = current_char; // char (current)
        children_info[i++] = start; // start index (current)
        let next_pos = start;
        let start_pos = start;
        for(; next_pos < start + length; next_pos++){
            const next_char = this.keys[next_pos].k[position];
            if (current_char !== next_char) {
                children_info[i++] = next_pos - start_pos; // length (current)
                children_info[i++] = next_char; // char (next)
                children_info[i++] = next_pos; // start index (next)
                current_char = next_char;
                start_pos = next_pos;
            }
        }
        children_info[i++] = next_pos - start_pos;
        children_info = children_info.subarray(0, i);
        return children_info;
    }
    setBC(parent_id, children_info, _base) {
        const bc = this.bc;
        bc.setBase(parent_id, _base); // Update BASE of parent node
        let i;
        for(i = 0; i < children_info.length; i = i + 3){
            const code = children_info[i];
            const child_id = _base + code;
            // Update linked list of unused nodes
            // Assertion
            // if (child_id < 0) {
            //     throw 'assertion error: child_id is negative'
            // }
            const prev_unused_id = -bc.getBase(child_id);
            const next_unused_id = -bc.getCheck(child_id);
            // if (prev_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            // if (next_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            if (child_id !== bc.getFirstUnusedNode()) bc.setCheck(prev_unused_id, -next_unused_id);
            else // Update first_unused_node
            bc.setFirstUnusedNode(next_unused_id);
            bc.setBase(next_unused_id, -prev_unused_id);
            const check = parent_id; // CHECK is parent node index
            bc.setCheck(child_id, check); // Update CHECK of child node
            // Update record
            if (code === $60f4f4059ac4d094$var$TERM_CODE) {
                const start_pos = children_info[i + 1];
                // var len = children_info[i + 2];
                // if (len != 1) {
                //     throw 'assertion error: there are multiple terminal nodes. len:' + len;
                // }
                let value = this.keys[start_pos].v;
                if (value == null) value = 0;
                const base = -value - 1; // BASE is inverted record value
                bc.setBase(child_id, base); // Update BASE of child(leaf) node
            }
        }
    }
    /**
	 * Find BASE value that all children are allocatable in double array's region
	 */ findAllocatableBase(children_info) {
        const bc = this.bc;
        // Assertion: keys are sorted by byte order
        // var c = -1;
        // for (var i = 0; i < children_info.length; i = i + 3) {
        //     if (children_info[i] < c) {
        //         throw 'assertion error: not sort key'
        //     }
        //     c = children_info[i];
        // }
        // iterate linked list of unused nodes
        let _base;
        let curr = bc.getFirstUnusedNode(); // current index
        // if (curr < 0) {
        //     throw 'assertion error: getFirstUnusedNode returns negative value'
        // }
        while(true){
            _base = curr - children_info[0];
            if (_base < 0) {
                curr = -bc.getCheck(curr); // next
                continue;
            }
            let empty_area_found = true;
            for(let i = 0; i < children_info.length; i = i + 3){
                const code = children_info[i];
                const candidate_id = _base + code;
                if (!this.isUnusedNode(candidate_id)) {
                    // candidate_id is used node
                    // next
                    curr = -bc.getCheck(curr);
                    // if (curr < 0) {
                    //     throw 'assertion error: getCheck returns negative value'
                    // }
                    empty_area_found = false;
                    break;
                }
            }
            if (empty_area_found) // Area is free
            return _base;
        }
    }
    /**
	 * Check this double array index is unused or not
	 */ isUnusedNode(index) {
        const bc = this.bc;
        const check = bc.getCheck(index);
        // if (index < 0) {
        //     throw 'assertion error: isUnusedNode index:' + index;
        // }
        if (index === $60f4f4059ac4d094$var$ROOT_ID) // root node
        return false;
        if (check < 0) // unused
        return true;
        // used node (incl. leaf)
        return false;
    }
}
class $60f4f4059ac4d094$export$d1d3971fdcedc28d {
    bc;
    constructor(bc){
        this.bc = bc; // BASE and CHECK
        this.bc.shrink();
    }
    /**
	 * Look up a given key in this trie
	 *
	 * @param {String} key
	 * @return {Boolean} True if this trie contains a given key
	 */ contain(key) {
        const bc = this.bc;
        key += $60f4f4059ac4d094$var$TERM_CHAR;
        const buffer = $60f4f4059ac4d094$var$stringToUtf8Bytes(key);
        let parent = $60f4f4059ac4d094$var$ROOT_ID;
        let child = $60f4f4059ac4d094$var$NOT_FOUND;
        for(let i = 0; i < buffer.length; i++){
            const code = buffer[i];
            child = this.traverse(parent, code);
            if (child === $60f4f4059ac4d094$var$NOT_FOUND) return false;
            if (bc.getBase(child) <= 0) // leaf node
            return true;
            // not leaf
            parent = child;
        }
        return false;
    }
    /**
	 * Look up a given key in this trie
	 *
	 * @param {String} key
	 * @return {Number} Record value assgned to this key, -1 if this key does not contain
	 */ lookup(key) {
        key += $60f4f4059ac4d094$var$TERM_CHAR;
        const buffer = $60f4f4059ac4d094$var$stringToUtf8Bytes(key);
        let parent = $60f4f4059ac4d094$var$ROOT_ID;
        let child = $60f4f4059ac4d094$var$NOT_FOUND;
        for(let i = 0; i < buffer.length; i++){
            const code = buffer[i];
            child = this.traverse(parent, code);
            if (child === $60f4f4059ac4d094$var$NOT_FOUND) return $60f4f4059ac4d094$var$NOT_FOUND;
            parent = child;
        }
        const base = this.bc.getBase(child);
        if (base <= 0) // leaf node
        return -base - 1;
        // not leaf
        return $60f4f4059ac4d094$var$NOT_FOUND;
    }
    /**
	 * Common prefix search
	 *
	 * @param {String} key
	 * @return {Array} Each result object has 'k' and 'v' (key and record,
	 * respectively) properties assigned to matched string
	 */ commonPrefixSearch(key) {
        const buffer = $60f4f4059ac4d094$var$stringToUtf8Bytes(key);
        let parent = $60f4f4059ac4d094$var$ROOT_ID;
        let child = $60f4f4059ac4d094$var$NOT_FOUND;
        const result = [];
        for(let i = 0; i < buffer.length; i++){
            const code = buffer[i];
            child = this.traverse(parent, code);
            if (child !== $60f4f4059ac4d094$var$NOT_FOUND) {
                parent = child;
                // look forward by terminal character code to check this node is a leaf or not
                const grand_child = this.traverse(child, $60f4f4059ac4d094$var$TERM_CODE);
                if (grand_child !== $60f4f4059ac4d094$var$NOT_FOUND) {
                    const base = this.bc.getBase(grand_child);
                    const r = {
                        k: "",
                        v: 0
                    };
                    if (base <= 0) // If child is a leaf node, add record to result
                    r.v = -base - 1;
                    // If child is a leaf node, add word to result
                    r.k = $60f4f4059ac4d094$var$utf8BytesToString($60f4f4059ac4d094$var$arrayCopy(buffer, 0, i + 1));
                    result.push(r);
                }
            } else break;
        }
        return result;
    }
    traverse(parent, code) {
        const child = this.bc.getBase(parent) + code;
        if (this.bc.getCheck(child) === parent) return child;
        return $60f4f4059ac4d094$var$NOT_FOUND;
    }
    size() {
        return this.bc.size();
    }
    calc() {
        return this.bc.calc();
    }
    dump() {
        return this.bc.dump();
    }
}
// Array utility functions
const $60f4f4059ac4d094$var$newArrayBuffer = (signed, bytes, size)=>{
    if (signed) switch(bytes){
        case 1:
            return new Int8Array(size);
        case 2:
            return new Int16Array(size);
        case 4:
            return new Int32Array(size);
        default:
            throw new RangeError(`Invalid newArray parameter element_bytes:${bytes}`);
    }
    switch(bytes){
        case 1:
            return new Uint8Array(size);
        case 2:
            return new Uint16Array(size);
        case 4:
            return new Uint32Array(size);
        default:
            throw new RangeError(`Invalid newArray parameter element_bytes:${bytes}`);
    }
};
const $60f4f4059ac4d094$var$arrayCopy = (src, src_offset, length)=>{
    const buffer = new ArrayBuffer(length);
    const dstU8 = new Uint8Array(buffer, 0, length);
    const srcU8 = src.subarray(src_offset, length);
    dstU8.set(srcU8);
    return dstU8;
};
/**
 * Convert String (UTF-16) to UTF-8 ArrayBuffer
 *
 * @param {String} str UTF-16 string to convert
 * @return {Uint8Array} Byte sequence encoded by UTF-8
 */ const $60f4f4059ac4d094$var$stringToUtf8Bytes = (str)=>{
    // Max size of 1 character is 4 bytes
    const bytes = new Uint8Array(new ArrayBuffer(str.length * 4));
    let i = 0;
    let j = 0;
    while(i < str.length){
        let unicode_code;
        const utf16_code = str.charCodeAt(i++);
        if (utf16_code >= 0xd800 && utf16_code <= 0xdbff) {
            // surrogate pair
            const upper = utf16_code; // high surrogate
            const lower = str.charCodeAt(i++); // low surrogate
            if (lower >= 0xdc00 && lower <= 0xdfff) unicode_code = (upper - 0xd800) * 1024 + 65536 + (lower - 0xdc00);
            else // malformed surrogate pair
            throw new Error("malformed surrogate pair");
        } else // not surrogate code
        unicode_code = utf16_code;
        if (unicode_code < 0x80) // 1-byte
        bytes[j++] = unicode_code;
        else if (unicode_code < 2048) {
            // 2-byte
            bytes[j++] = unicode_code >>> 6 | 0xc0;
            bytes[j++] = unicode_code & 0x3f | 0x80;
        } else if (unicode_code < 65536) {
            // 3-byte
            bytes[j++] = unicode_code >>> 12 | 0xe0;
            bytes[j++] = unicode_code >> 6 & 0x3f | 0x80;
            bytes[j++] = unicode_code & 0x3f | 0x80;
        } else if (unicode_code < 2097152) {
            // 4-byte
            bytes[j++] = unicode_code >>> 18 | 0xf0;
            bytes[j++] = unicode_code >> 12 & 0x3f | 0x80;
            bytes[j++] = unicode_code >> 6 & 0x3f | 0x80;
            bytes[j++] = unicode_code & 0x3f | 0x80;
        }
    }
    return bytes.subarray(0, j);
};
/**
 * Convert UTF-8 ArrayBuffer to String (UTF-16)
 *
 * @param {Uint8Array} bytes UTF-8 byte sequence to convert
 * @return {String} String encoded by UTF-16
 */ const $60f4f4059ac4d094$var$utf8BytesToString = (bytes)=>{
    let str = "";
    let code;
    let b1;
    let b2;
    let b3;
    let b4;
    let upper;
    let lower;
    let i = 0;
    while(i < bytes.length){
        b1 = bytes[i++];
        if (b1 < 0x80) // 1 byte
        code = b1;
        else if (b1 >> 5 === 0x06) {
            // 2 bytes
            b2 = bytes[i++];
            code = (b1 & 0x1f) << 6 | b2 & 0x3f;
        } else if (b1 >> 4 === 0x0e) {
            // 3 bytes
            b2 = bytes[i++];
            b3 = bytes[i++];
            code = (b1 & 0x0f) << 12 | (b2 & 0x3f) << 6 | b3 & 0x3f;
        } else {
            // 4 bytes
            b2 = bytes[i++];
            b3 = bytes[i++];
            b4 = bytes[i++];
            code = (b1 & 0x07) << 18 | (b2 & 0x3f) << 12 | (b3 & 0x3f) << 6 | b4 & 0x3f;
        }
        if (code < 0x10000) str += String.fromCharCode(code);
        else {
            // surrogate pair
            code -= 0x10000;
            upper = 0xd800 | code >> 10;
            lower = 0xdc00 | code & 0x3ff;
            str += String.fromCharCode(upper, lower);
        }
    }
    return str;
};
function $60f4f4059ac4d094$export$933032be53f7ca16(initial_size) {
    return new $60f4f4059ac4d094$export$2e2bcd8739ae039(initial_size);
}
function $60f4f4059ac4d094$export$11e63f7b0f3d9900(base_buffer, check_buffer) {
    const bc = $60f4f4059ac4d094$var$newBC(0);
    bc.loadBaseBuffer(base_buffer);
    bc.loadCheckBuffer(check_buffer);
    return new $60f4f4059ac4d094$export$d1d3971fdcedc28d(bc);
}




/**
 * Connection costs matrix from cc.dat file.
 * 2 dimension matrix [forward_id][backward_id] -> cost
 * @constructor
 * @param {number} forward_dimension
 * @param {number} backward_dimension
 */ class $a8d092bebaac30aa$var$ConnectionCosts {
    buffer;
    forward_dimension;
    backward_dimension;
    constructor(forward_dimension, backward_dimension){
        this.forward_dimension = forward_dimension;
        this.backward_dimension = backward_dimension;
        // leading 2 integers for forward_dimension, backward_dimension, respectively
        this.buffer = new Int16Array(forward_dimension * backward_dimension + 2);
        this.buffer[0] = forward_dimension;
        this.buffer[1] = backward_dimension;
    }
    put(forward_id, backward_id, cost) {
        const index = forward_id * this.backward_dimension + backward_id + 2;
        if (this.buffer.length < index + 1) throw "ConnectionCosts buffer overflow";
        this.buffer[index] = cost;
    }
    get(forward_id, backward_id) {
        const index = forward_id * this.backward_dimension + backward_id + 2;
        if (this.buffer.length < index + 1) throw "ConnectionCosts buffer overflow";
        return this.buffer[index];
    }
    loadConnectionCosts(connection_costs_buffer) {
        this.forward_dimension = connection_costs_buffer[0];
        this.backward_dimension = connection_costs_buffer[1];
        this.buffer = connection_costs_buffer;
    }
}
var $a8d092bebaac30aa$export$2e2bcd8739ae039 = $a8d092bebaac30aa$var$ConnectionCosts;


/**
 * Convert String (UTF-16) to UTF-8 ArrayBuffer
 *
 * @param {String} str UTF-16 string to convert
 * @return {Uint8Array} Byte sequence encoded by UTF-8
 */ const $d43a57de518ca883$var$stringToUtf8Bytes = (str)=>{
    // Max size of 1 character is 4 bytes
    const bytes = new Uint8Array(str.length * 4);
    let i = 0;
    let j = 0;
    while(i < str.length){
        let unicode_code;
        const utf16_code = str.charCodeAt(i++);
        if (utf16_code >= 0xd800 && utf16_code <= 0xdbff) {
            // surrogate pair
            const upper = utf16_code; // high surrogate
            const lower = str.charCodeAt(i++); // low surrogate
            if (lower >= 0xdc00 && lower <= 0xdfff) unicode_code = (upper - 0xd800) * 1024 + 65536 + (lower - 0xdc00);
            else // malformed surrogate pair
            throw new Error("malformed surrogate pair");
        } else // not surrogate code
        unicode_code = utf16_code;
        if (unicode_code < 0x80) // 1-byte
        bytes[j++] = unicode_code;
        else if (unicode_code < 2048) {
            // 2-byte
            bytes[j++] = unicode_code >>> 6 | 0xc0;
            bytes[j++] = unicode_code & 0x3f | 0x80;
        } else if (unicode_code < 65536) {
            // 3-byte
            bytes[j++] = unicode_code >>> 12 | 0xe0;
            bytes[j++] = unicode_code >> 6 & 0x3f | 0x80;
            bytes[j++] = unicode_code & 0x3f | 0x80;
        } else if (unicode_code < 2097152) {
            // 4-byte
            bytes[j++] = unicode_code >>> 18 | 0xf0;
            bytes[j++] = unicode_code >> 12 & 0x3f | 0x80;
            bytes[j++] = unicode_code >> 6 & 0x3f | 0x80;
            bytes[j++] = unicode_code & 0x3f | 0x80;
        }
    }
    return bytes.subarray(0, j);
};
/**
 * Convert UTF-8 ArrayBuffer to String (UTF-16)
 *
 * @param {Array} bytes UTF-8 byte sequence to convert
 * @return {String} String encoded by UTF-16
 */ const $d43a57de518ca883$var$utf8BytesToString = (bytes)=>{
    let str = "";
    let code;
    let b1;
    let b2;
    let b3;
    let b4;
    let upper;
    let lower;
    let i = 0;
    while(i < bytes.length){
        b1 = bytes[i++];
        if (b1 < 0x80) // 1 byte
        code = b1;
        else if (b1 >> 5 === 0x06) {
            // 2 bytes
            b2 = bytes[i++];
            code = (b1 & 0x1f) << 6 | b2 & 0x3f;
        } else if (b1 >> 4 === 0x0e) {
            // 3 bytes
            b2 = bytes[i++];
            b3 = bytes[i++];
            code = (b1 & 0x0f) << 12 | (b2 & 0x3f) << 6 | b3 & 0x3f;
        } else {
            // 4 bytes
            b2 = bytes[i++];
            b3 = bytes[i++];
            b4 = bytes[i++];
            code = (b1 & 0x07) << 18 | (b2 & 0x3f) << 12 | (b3 & 0x3f) << 6 | b4 & 0x3f;
        }
        if (code < 0x10000) str += String.fromCharCode(code);
        else {
            // surrogate pair
            code -= 0x10000;
            upper = 0xd800 | code >> 10;
            lower = 0xdc00 | code & 0x3ff;
            str += String.fromCharCode(upper, lower);
        }
    }
    return str;
};
/**
 * Utilities to manipulate byte sequence
 * @param {(number|Uint8Array)} arg Initial size of this buffer (number), or buffer to set (Uint8Array)
 * @constructor
 */ class $d43a57de518ca883$var$ByteBuffer {
    buffer;
    position;
    constructor(arg){
        let initial_size;
        if (arg == null) initial_size = 1048576;
        else if (typeof arg === "number") initial_size = arg;
        else if (arg instanceof Uint8Array) {
            this.buffer = arg;
            this.position = 0; // Overwrite
            return;
        } else // typeof arg -> String
        throw `${typeof arg} is invalid parameter type for ByteBuffer constructor`;
        // arg is null or number
        this.buffer = new Uint8Array(initial_size);
        this.position = 0;
    }
    size() {
        return this.buffer.length;
    }
    reallocate() {
        const new_array = new Uint8Array(this.buffer.length * 2);
        new_array.set(this.buffer);
        this.buffer = new_array;
    }
    shrink() {
        this.buffer = this.buffer.subarray(0, this.position);
        return this.buffer;
    }
    put(b) {
        if (this.buffer.length < this.position + 1) this.reallocate();
        this.buffer[this.position++] = b;
    }
    get(index) {
        if (index == null) {
            index = this.position;
            this.position += 1;
        }
        if (this.buffer.length < index + 1) return 0;
        return this.buffer[index];
    }
    // Write short to buffer by little endian
    putShort(num) {
        num = Number(num);
        if (0xffff < num) throw `${num} is over short value`;
        const lower = 0x00ff & num;
        const upper = (0xff00 & num) >> 8;
        this.put(lower);
        this.put(upper);
    }
    // Read short from buffer by little endian
    getShort(index) {
        if (index == null) {
            index = this.position;
            this.position += 2;
        }
        if (this.buffer.length < index + 2) return 0;
        const lower = this.buffer[index];
        const upper = this.buffer[index + 1];
        let value = (upper << 8) + lower;
        if (value & 0x8000) value = -(value - 1 ^ 0xffff);
        return value;
    }
    // Write integer to buffer by little endian
    putInt(num) {
        num = Number(num);
        if (0xffffffff < num) throw `${num} is over integer value`;
        const b0 = 0x000000ff & num;
        const b1 = (0x0000ff00 & num) >> 8;
        const b2 = (0x00ff0000 & num) >> 16;
        const b3 = (0xff000000 & num) >> 24;
        this.put(b0);
        this.put(b1);
        this.put(b2);
        this.put(b3);
    }
    // Read integer from buffer by little endian
    getInt(index) {
        if (index == null) {
            index = this.position;
            this.position += 4;
        }
        if (this.buffer.length < index + 4) return 0;
        const b0 = this.buffer[index];
        const b1 = this.buffer[index + 1];
        const b2 = this.buffer[index + 2];
        const b3 = this.buffer[index + 3];
        return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
    }
    readInt() {
        const pos = this.position;
        this.position += 4;
        return this.getInt(pos);
    }
    putString(str) {
        const bytes = $d43a57de518ca883$var$stringToUtf8Bytes(str);
        for(let i = 0; i < bytes.length; i++)this.put(bytes[i]);
        // put null character as terminal character
        this.put(0);
    }
    getString(index = this.position) {
        const buf = [];
        let ch;
        while(true){
            if (this.buffer.length < index + 1) break;
            ch = this.get(index++);
            if (ch === 0) break;
            buf.push(ch);
        }
        this.position = index;
        return $d43a57de518ca883$var$utf8BytesToString(buf);
    }
}
var $d43a57de518ca883$export$2e2bcd8739ae039 = $d43a57de518ca883$var$ByteBuffer;


/**
 * TokenInfoDictionary
 * @constructor
 */ class $b0b6d5d6e9241a5d$var$TokenInfoDictionary {
    dictionary;
    target_map;
    pos_buffer;
    constructor(){
        this.dictionary = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(10485760);
        this.target_map = {}; // trie_id (of surface form) -> token_info_id (of token)
        this.pos_buffer = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(10485760);
    }
    // left_id right_id word_cost ...
    // ^ this position is token_info_id
    buildDictionary(entries) {
        const dictionary_entries = {}; // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
        for(let i = 0; i < entries.length; i++){
            const entry = entries[i];
            if (entry.length < 4) continue;
            const surface_form = entry[0];
            const left_id = Number(entry[1]);
            const right_id = Number(entry[2]);
            const word_cost = Number(entry[3]);
            const feature = entry.slice(4).join(","); // TODO Optimize
            // Assertion
            if (!Number.isFinite(left_id) || !Number.isFinite(right_id) || !Number.isFinite(word_cost)) console.log(entry);
            const token_info_id = this.put(left_id, right_id, word_cost, surface_form, feature);
            dictionary_entries[token_info_id] = surface_form;
        }
        // Remove last unused area
        this.dictionary.shrink();
        this.pos_buffer.shrink();
        return dictionary_entries;
    }
    put(left_id, right_id, word_cost, surface_form, feature) {
        const token_info_id = this.dictionary.position;
        const pos_id = this.pos_buffer.position;
        this.dictionary.putShort(left_id);
        this.dictionary.putShort(right_id);
        this.dictionary.putShort(word_cost);
        this.dictionary.putInt(pos_id);
        this.pos_buffer.putString(`${surface_form},${feature}`);
        return token_info_id;
    }
    addMapping(source, target) {
        let mapping = this.target_map[source];
        if (mapping == null) mapping = [];
        mapping.push(target);
        this.target_map[source] = mapping;
    }
    targetMapToBuffer() {
        const buffer = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)();
        const map_keys_size = Object.keys(this.target_map).length;
        buffer.putInt(map_keys_size);
        for(const key in this.target_map){
            const values = this.target_map[key]; // Array
            const map_values_size = values.length;
            buffer.putInt(Number.parseInt(key));
            buffer.putInt(map_values_size);
            for(let i = 0; i < values.length; i++)buffer.putInt(values[i]);
        }
        return buffer.shrink(); // Shrink-ed Typed Array
    }
    // from tid.dat
    loadDictionary(array_buffer) {
        this.dictionary = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(array_buffer);
        return this;
    }
    // from tid_pos.dat
    loadPosVector(array_buffer) {
        this.pos_buffer = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(array_buffer);
        return this;
    }
    // from tid_map.dat
    loadTargetMap(array_buffer) {
        const buffer = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(array_buffer);
        buffer.position = 0;
        this.target_map = {};
        buffer.readInt(); // map_keys_size
        while(true){
            if (buffer.buffer.length < buffer.position + 1) break;
            const key = buffer.readInt();
            const map_values_size = buffer.readInt();
            for(let i = 0; i < map_values_size; i++){
                const value = buffer.readInt();
                this.addMapping(key, value);
            }
        }
        return this;
    }
    /**
	 * Look up features in the dictionary
	 * @param {string} token_info_id_str Word ID to look up
	 * @returns {string} Features string concatenated by ","
	 */ getFeatures(token_info_id_str) {
        const token_info_id = Number.parseInt(token_info_id_str);
        if (Number.isNaN(token_info_id)) // TODO throw error
        return "";
        const pos_id = this.dictionary.getInt(token_info_id + 6);
        return this.pos_buffer.getString(pos_id);
    }
}
var $b0b6d5d6e9241a5d$export$2e2bcd8739ae039 = $b0b6d5d6e9241a5d$var$TokenInfoDictionary;




/**
 * CharacterClass
 * @param {number} class_id
 * @param {string} class_name
 * @param {boolean} is_always_invoke
 * @param {boolean} is_grouping
 * @param {number} max_length
 * @constructor
 */ class $1be662dc4bb33926$var$CharacterClass {
    class_id;
    class_name;
    is_always_invoke;
    is_grouping;
    max_length;
    constructor(class_id, class_name, is_always_invoke, is_grouping, max_length){
        this.class_id = class_id;
        this.class_name = class_name;
        this.is_always_invoke = is_always_invoke;
        this.is_grouping = is_grouping;
        this.max_length = max_length;
    }
}
var $1be662dc4bb33926$export$2e2bcd8739ae039 = $1be662dc4bb33926$var$CharacterClass;




/**
 * InvokeDefinitionMap represents invoke definition a part of char.def
 * @constructor
 */ class $48f30eff22694b93$var$InvokeDefinitionMap {
    map;
    lookup_table;
    constructor(){
        this.map = [];
        this.lookup_table = {}; // Just for building dictionary
    }
    /**
	 * Load InvokeDefinitionMap from buffer
	 * @param {Uint8Array} invoke_def_buffer
	 * @returns {InvokeDefinitionMap}
	 */ static load(invoke_def_buffer) {
        const invoke_def = new $48f30eff22694b93$var$InvokeDefinitionMap();
        const character_category_definition = [];
        const buffer = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(invoke_def_buffer);
        while(buffer.position + 1 < buffer.size()){
            const class_id = character_category_definition.length;
            const is_always_invoke = buffer.get() === 1;
            const is_grouping = buffer.get() === 1;
            const max_length = buffer.getInt();
            const class_name = buffer.getString();
            character_category_definition.push(new (0, $1be662dc4bb33926$export$2e2bcd8739ae039)(class_id, class_name, is_always_invoke, is_grouping, max_length));
        }
        invoke_def.init(character_category_definition);
        return invoke_def;
    }
    /**
	 * Initializing method
	 * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
	 */ init(character_category_definition) {
        if (character_category_definition == null) return;
        for(let i = 0; i < character_category_definition.length; i++){
            const character_class = character_category_definition[i];
            this.map[i] = character_class;
            this.lookup_table[character_class.class_name] = i;
        }
    }
    /**
	 * Get class information by class ID
	 * @param {number} class_id
	 * @returns {CharacterClass}
	 */ getCharacterClass(class_id) {
        return this.map[class_id];
    }
    /**
	 * For building character definition dictionary
	 * @param {string} class_name character
	 * @returns {number} class_id
	 */ lookup(class_name) {
        const class_id = this.lookup_table[class_name];
        if (class_id == null) throw new Error("null");
        return class_id;
    }
    /**
	 * Transform from map to binary buffer
	 * @returns {Uint8Array}
	 */ toBuffer() {
        const buffer = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)();
        for(let i = 0; i < this.map.length; i++){
            const char_class = this.map[i];
            buffer.put(Number(char_class.is_always_invoke));
            buffer.put(Number(char_class.is_grouping));
            buffer.putInt(char_class.max_length);
            buffer.putString(char_class.class_name);
        }
        buffer.shrink();
        return buffer.buffer;
    }
}
var $48f30eff22694b93$export$2e2bcd8739ae039 = $48f30eff22694b93$var$InvokeDefinitionMap;


const $46c43562c300c48f$var$DEFAULT_CATEGORY = "DEFAULT";
/**
 * CharacterDefinition represents char.def file and
 * defines behavior of unknown word processing
 * @constructor
 */ class $46c43562c300c48f$var$CharacterDefinition {
    character_category_map;
    compatible_category_map;
    invoke_definition_map;
    constructor(){
        this.character_category_map = new Uint8Array(65536); // for all UCS2 code points
        this.compatible_category_map = new Uint32Array(65536); // for all UCS2 code points
    }
    /**
	 * Load CharacterDefinition
	 * @param {Uint8Array} cat_map_buffer
	 * @param {Uint32Array} compat_cat_map_buffer
	 * @param {InvokeDefinitionMap} invoke_def_buffer
	 * @returns {CharacterDefinition}
	 */ static load(cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
        const char_def = new $46c43562c300c48f$var$CharacterDefinition();
        char_def.character_category_map = cat_map_buffer;
        char_def.compatible_category_map = compat_cat_map_buffer;
        char_def.invoke_definition_map = (0, $48f30eff22694b93$export$2e2bcd8739ae039).load(invoke_def_buffer);
        return char_def;
    }
    static parseCharCategory(class_id, parsed_category_def) {
        const category = parsed_category_def[1];
        const invoke = Number.parseInt(parsed_category_def[2]);
        const grouping = Number.parseInt(parsed_category_def[3]);
        const max_length = Number.parseInt(parsed_category_def[4]);
        if (!Number.isFinite(invoke) || invoke !== 0 && invoke !== 1) {
            console.log(`char.def parse error. INVOKE is 0 or 1 in:${invoke}`);
            return null;
        }
        if (!Number.isFinite(grouping) || grouping !== 0 && grouping !== 1) {
            console.log(`char.def parse error. GROUP is 0 or 1 in:${grouping}`);
            return null;
        }
        if (!Number.isFinite(max_length) || max_length < 0) {
            console.log(`char.def parse error. LENGTH is 1 to n:${max_length}`);
            return null;
        }
        const is_invoke = invoke === 1;
        const is_grouping = grouping === 1;
        return new (0, $1be662dc4bb33926$export$2e2bcd8739ae039)(class_id, category, is_invoke, is_grouping, max_length);
    }
    static parseCategoryMapping(parsed_category_mapping) {
        const start = Number.parseInt(parsed_category_mapping[1]);
        const default_category = parsed_category_mapping[2];
        const compatible_category = 3 < parsed_category_mapping.length ? parsed_category_mapping.slice(3) : [];
        if (!Number.isFinite(start) || start < 0 || start > 0xffff) console.log(`char.def parse error. CODE is invalid:${start}`);
        return {
            start: start,
            default: default_category,
            compatible: compatible_category
        };
    }
    static parseRangeCategoryMapping(parsed_category_mapping) {
        const start = Number.parseInt(parsed_category_mapping[1]);
        const end = Number.parseInt(parsed_category_mapping[2]);
        const default_category = parsed_category_mapping[3];
        const compatible_category = 4 < parsed_category_mapping.length ? parsed_category_mapping.slice(4) : [];
        if (!Number.isFinite(start) || start < 0 || start > 0xffff) console.log(`char.def parse error. CODE is invalid:${start}`);
        if (!Number.isFinite(end) || end < 0 || end > 0xffff) console.log(`char.def parse error. CODE is invalid:${end}`);
        return {
            start: start,
            end: end,
            default: default_category,
            compatible: compatible_category
        };
    }
    /**
	 * Initializing method
	 * @param {Array} category_mapping Array of category mapping
	 */ initCategoryMappings(category_mapping) {
        if (!this.invoke_definition_map) throw new Error("invoke_definition_map is not initialized");
        // Initialize map by DEFAULT class
        let code_point;
        if (category_mapping != null) for(let i = 0; i < category_mapping.length; i++){
            const mapping = category_mapping[i];
            const end = mapping.end || mapping.start;
            for(code_point = mapping.start; code_point <= end; code_point++){
                // Default Category class ID
                this.character_category_map[code_point] = this.invoke_definition_map.lookup(mapping.default);
                for(let j = 0; j < mapping.compatible.length; j++){
                    let bitset = this.compatible_category_map[code_point];
                    const compatible_category = mapping.compatible[j];
                    if (compatible_category == null) continue;
                    const class_id = this.invoke_definition_map.lookup(compatible_category); // Default Category
                    if (class_id == null) continue;
                    const class_id_bit = 1 << class_id;
                    bitset = bitset | class_id_bit; // Set a bit of class ID 例えば、class_idが3のとき、3ビット目に1を立てる
                    this.compatible_category_map[code_point] = bitset;
                }
            }
        }
        const default_id = this.invoke_definition_map.lookup($46c43562c300c48f$var$DEFAULT_CATEGORY);
        if (default_id == null) return;
        for(code_point = 0; code_point < this.character_category_map.length; code_point++)// 他に何のクラスも定義されていなかったときだけ DEFAULT
        if (this.character_category_map[code_point] === 0) // DEFAULT class ID に対応するビットだけ1を立てる
        this.character_category_map[code_point] = 1 << default_id;
    }
    /**
	 * Lookup compatible categories for a character (not included 1st category)
	 * @param {string} ch UCS2 character (just 1st character is effective)
	 * @returns {Array.<CharacterClass>} character classes
	 */ lookupCompatibleCategory(ch) {
        if (!this.invoke_definition_map) throw new Error("invoke_definition_map is not initialized");
        const classes = [];
        /*
         if (SurrogateAwareString.isSurrogatePair(ch)) {
         // Surrogate pair character codes can not be defined by char.def
         return classes;
         }*/ const code = ch.charCodeAt(0);
        let integer = undefined;
        if (code < this.compatible_category_map.length) integer = this.compatible_category_map[code]; // Bitset
        if (integer == null || integer === 0) return classes;
        for(let bit = 0; bit < 32; bit++)// Treat "bit" as a class ID
        if (integer << 31 - bit >>> 31 === 1) {
            const character_class = this.invoke_definition_map.getCharacterClass(bit);
            if (character_class == null) continue;
            classes.push(character_class);
        }
        return classes;
    }
    /**
	 * Lookup category for a character
	 * @param {string} ch UCS2 character (just 1st character is effective)
	 * @returns {CharacterClass} character class
	 */ lookup(ch) {
        if (!this.invoke_definition_map) throw new Error("invoke_definition_map is not initialized");
        let class_id;
        const code = ch.charCodeAt(0);
        if ((0, $1eb93d329ffdff51$export$2e2bcd8739ae039).isSurrogatePair(ch)) // Surrogate pair character codes can not be defined by char.def, so set DEFAULT category
        class_id = this.invoke_definition_map.lookup($46c43562c300c48f$var$DEFAULT_CATEGORY);
        else if (code < this.character_category_map.length) class_id = this.character_category_map[code]; // Read as integer value
        if (class_id == null) class_id = this.invoke_definition_map.lookup($46c43562c300c48f$var$DEFAULT_CATEGORY);
        return this.invoke_definition_map.getCharacterClass(class_id);
    }
}
var $46c43562c300c48f$export$2e2bcd8739ae039 = $46c43562c300c48f$var$CharacterDefinition;



/**
 * UnknownDictionary
 * @constructor
 */ // Inherit from TokenInfoDictionary as a super class
class $01d4a28b5b1ce081$var$UnknownDictionary extends (0, $b0b6d5d6e9241a5d$export$2e2bcd8739ae039) {
    character_definition;
    constructor(){
        super();
        this.dictionary = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(10485760);
        this.target_map = {}; // class_id (of CharacterClass) -> token_info_id (of unknown class)
        this.pos_buffer = new (0, $d43a57de518ca883$export$2e2bcd8739ae039)(10485760);
    }
    characterDefinition(character_definition) {
        this.character_definition = character_definition;
        return this;
    }
    lookup(ch) {
        if (!this.character_definition) throw new Error("Character definition is not initialized");
        return this.character_definition.lookup(ch);
    }
    lookupCompatibleCategory(ch) {
        if (!this.character_definition) throw new Error("Character definition is not initialized");
        return this.character_definition.lookupCompatibleCategory(ch);
    }
    loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
        this.loadDictionary(unk_buffer);
        this.loadPosVector(unk_pos_buffer);
        this.loadTargetMap(unk_map_buffer);
        this.character_definition = (0, $46c43562c300c48f$export$2e2bcd8739ae039).load(cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
    }
}
var $01d4a28b5b1ce081$export$2e2bcd8739ae039 = $01d4a28b5b1ce081$var$UnknownDictionary;


/**
 * Dictionaries container for Tokenizer
 * @param {DoubleArray} trie
 * @param {TokenInfoDictionary} token_info_dictionary
 * @param {ConnectionCosts} connection_costs
 * @param {UnknownDictionary} unknown_dictionary
 * @constructor
 */ class $0848a9c02181f40d$var$DynamicDictionaries {
    word;
    token_info_dictionary;
    connection_costs;
    unknown_dictionary;
    constructor(word, token_info_dictionary, connection_costs, unknown_dictionary){
        if (word != null) this.word = word;
        else this.word = (0, $60f4f4059ac4d094$export$933032be53f7ca16)(0).build([
            {
                k: "",
                v: 1
            }
        ]);
        if (token_info_dictionary != null) this.token_info_dictionary = token_info_dictionary;
        else this.token_info_dictionary = new (0, $b0b6d5d6e9241a5d$export$2e2bcd8739ae039)();
        if (connection_costs != null) this.connection_costs = connection_costs;
        else // backward_size * backward_size
        this.connection_costs = new (0, $a8d092bebaac30aa$export$2e2bcd8739ae039)(0, 0);
        if (unknown_dictionary != null) this.unknown_dictionary = unknown_dictionary;
        else this.unknown_dictionary = new (0, $01d4a28b5b1ce081$export$2e2bcd8739ae039)();
    }
    // from base.dat & check.dat
    loadTrie(base_buffer, check_buffer) {
        this.word = (0, $60f4f4059ac4d094$export$11e63f7b0f3d9900)(base_buffer, check_buffer);
        return this;
    }
    // from base.dat
    loadFST(base_buffer) {
        this.word = new (0, $cd8ea557b7be61b3$export$2e2bcd8739ae039)(base_buffer);
        return this;
    }
    loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer) {
        this.token_info_dictionary.loadDictionary(token_info_buffer);
        this.token_info_dictionary.loadPosVector(pos_buffer);
        this.token_info_dictionary.loadTargetMap(target_map_buffer);
        return this;
    }
    loadConnectionCosts(cc_buffer) {
        this.connection_costs.loadConnectionCosts(cc_buffer);
        return this;
    }
    loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
        this.unknown_dictionary.loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
        return this;
    }
}
var $0848a9c02181f40d$export$2e2bcd8739ae039 = $0848a9c02181f40d$var$DynamicDictionaries;






const $1f68d5c6b2004367$var$CATEGORY_DEF_PATTERN = /^(\w+)\s+(\d)\s+(\d)\s+(\d)/;
const $1f68d5c6b2004367$var$CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;
const $1f68d5c6b2004367$var$RANGE_CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})\.\.(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;
/**
 * CharacterDefinitionBuilder
 * @constructor
 */ class $1f68d5c6b2004367$var$CharacterDefinitionBuilder {
    char_def;
    character_category_definition;
    category_mapping;
    constructor(){
        this.char_def = new (0, $46c43562c300c48f$export$2e2bcd8739ae039)();
        this.char_def.invoke_definition_map = new (0, $48f30eff22694b93$export$2e2bcd8739ae039)();
        this.character_category_definition = [];
        this.category_mapping = [];
    }
    putLine(line) {
        const parsed_category_def = $1f68d5c6b2004367$var$CATEGORY_DEF_PATTERN.exec(line);
        if (parsed_category_def != null) {
            const class_id = this.character_category_definition.length;
            const char_class = (0, $46c43562c300c48f$export$2e2bcd8739ae039).parseCharCategory(class_id, parsed_category_def);
            if (char_class == null) return;
            this.character_category_definition.push(char_class);
            return;
        }
        const parsed_category_mapping = $1f68d5c6b2004367$var$CATEGORY_MAPPING_PATTERN.exec(line);
        if (parsed_category_mapping != null) {
            const mapping = (0, $46c43562c300c48f$export$2e2bcd8739ae039).parseCategoryMapping(parsed_category_mapping);
            this.category_mapping.push(mapping);
        }
        const parsed_range_category_mapping = $1f68d5c6b2004367$var$RANGE_CATEGORY_MAPPING_PATTERN.exec(line);
        if (parsed_range_category_mapping != null) {
            const range_mapping = (0, $46c43562c300c48f$export$2e2bcd8739ae039).parseRangeCategoryMapping(parsed_range_category_mapping);
            this.category_mapping.push(range_mapping);
        }
    }
    build() {
        // TODO If DEFAULT category does not exist, throw error
        if (!this.char_def.invoke_definition_map) throw new Error("invoke_definition_map is not initialized");
        this.char_def.invoke_definition_map.init(this.character_category_definition);
        this.char_def.initCategoryMappings(this.category_mapping);
        return this.char_def;
    }
}
var $1f68d5c6b2004367$export$2e2bcd8739ae039 = $1f68d5c6b2004367$var$CharacterDefinitionBuilder;



/**
 * Builder class for constructing ConnectionCosts object
 * @constructor
 */ class $3089003cac8608b4$var$ConnectionCostsBuilder {
    lines;
    connection_cost;
    constructor(){
        this.lines = 0;
    }
    putLine(line) {
        var _this_connection_cost, _this_connection_cost1, _this_connection_cost2;
        if (this.lines === 0) {
            const dimensions = line.split(" ");
            const forward_dimension = Number.parseInt(dimensions[0]);
            const backward_dimension = Number.parseInt(dimensions[1]);
            if (forward_dimension < 0 || backward_dimension < 0) throw "Parse error of matrix.def";
            this.connection_cost = new (0, $a8d092bebaac30aa$export$2e2bcd8739ae039)(forward_dimension, backward_dimension);
            this.lines++;
            return this;
        }
        const costs = line.split(" ");
        if (costs.length !== 3) return this;
        const forward_id = Number.parseInt(costs[0]);
        const backward_id = Number.parseInt(costs[1]);
        const cost = Number.parseInt(costs[2]);
        if (forward_id < 0 || backward_id < 0 || !Number.isFinite(forward_id) || !Number.isFinite(backward_id) || ((_this_connection_cost = this.connection_cost) === null || _this_connection_cost === void 0 ? void 0 : _this_connection_cost.forward_dimension) <= forward_id || ((_this_connection_cost1 = this.connection_cost) === null || _this_connection_cost1 === void 0 ? void 0 : _this_connection_cost1.backward_dimension) <= backward_id) throw "Parse error of matrix.def";
        (_this_connection_cost2 = this.connection_cost) === null || _this_connection_cost2 === void 0 ? void 0 : _this_connection_cost2.put(forward_id, backward_id, cost);
        this.lines++;
        return this;
    }
    build() {
        if (!this.connection_cost) throw new Error("ConnectionCosts is not initialized");
        return this.connection_cost;
    }
}
var $3089003cac8608b4$export$2e2bcd8739ae039 = $3089003cac8608b4$var$ConnectionCostsBuilder;


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
 */ class $0763a7dff3591e94$var$DictionaryBuilder {
    tid_entries;
    unk_entries;
    cc_builder;
    cd_builder;
    constructor(){
        // Array of entries, each entry in Mecab form
        // (0: surface form, 1: left id, 2: right id, 3: word cost, 4: part of speech id, 5-: other features)
        this.tid_entries = [];
        this.unk_entries = [];
        this.cc_builder = new (0, $3089003cac8608b4$export$2e2bcd8739ae039)();
        this.cd_builder = new (0, $1f68d5c6b2004367$export$2e2bcd8739ae039)();
    }
    addTokenInfoDictionary(new_entry) {
        this.tid_entries.push(new_entry.split(","));
        return this;
    }
    /**
	 * Put one line of "matrix.def" file for building ConnectionCosts object
	 * @param {string} line is a line of "matrix.def"
	 */ putCostMatrixLine(line) {
        this.cc_builder.putLine(line);
        return this;
    }
    putCharDefLine(line) {
        this.cd_builder.putLine(line);
        return this;
    }
    /**
	 * Put one line of "unk.def" file for building UnknownDictionary object
	 * @param {string[]} new_entry is a line of "unk.def"
	 */ putUnkDefLine(new_entry) {
        this.unk_entries.push(new_entry.split(","));
        return this;
    }
    build(isTrie = true) {
        const dictionaries = this.buildTokenInfoDictionary(isTrie);
        const unknown_dictionary = this.buildUnknownDictionary();
        if (dictionaries.word.fst) return new (0, $0848a9c02181f40d$export$2e2bcd8739ae039)(dictionaries.word.fst, dictionaries.token_info_dictionary, this.cc_builder.build(), unknown_dictionary);
        else return new (0, $0848a9c02181f40d$export$2e2bcd8739ae039)(dictionaries.word.trie, dictionaries.token_info_dictionary, this.cc_builder.build(), unknown_dictionary);
    }
    buildAll() {
        const dictionaries = this.buildTokenInfoDictionary(true, true);
        const unknown_dictionary = this.buildUnknownDictionary();
        return {
            dic: new (0, $0848a9c02181f40d$export$2e2bcd8739ae039)(undefined, dictionaries.token_info_dictionary, this.cc_builder.build(), unknown_dictionary),
            word: dictionaries.word
        };
    }
    /**
	 * Build TokenInfoDictionary
	 *
	 * @returns {{trie: WordSearch, token_info_dictionary: TokenInfoDictionary}}
	 */ buildTokenInfoDictionary(isTrie = true, all = false) {
        const token_info_dictionary = new (0, $b0b6d5d6e9241a5d$export$2e2bcd8739ae039)();
        // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
        const dictionary_entries = token_info_dictionary.buildDictionary(this.tid_entries);
        let fst;
        let trie;
        if (all) {
            fst = this.buildFST();
            trie = this.buildDoubleArray();
        } else if (isTrie) trie = this.buildDoubleArray();
        else fst = this.buildFST();
        for(const token_info_id in dictionary_entries){
            const surface_form = dictionary_entries[token_info_id];
            const trie_id = (isTrie ? trie : fst).lookup(surface_form);
            // Assertion
            if (trie_id < 0) console.log("Not Found:" + surface_form);
            token_info_dictionary.addMapping(trie_id, token_info_id);
        }
        return {
            word: {
                trie: trie,
                fst: fst
            },
            token_info_dictionary: token_info_dictionary
        };
    }
    buildUnknownDictionary() {
        const unk_dictionary = new (0, $01d4a28b5b1ce081$export$2e2bcd8739ae039)();
        // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
        const dictionary_entries = unk_dictionary.buildDictionary(this.unk_entries);
        const char_def = this.cd_builder.build(); // Create CharacterDefinition
        if (!char_def.invoke_definition_map) throw new Error("invoke_definition_map is not initialized");
        unk_dictionary.characterDefinition(char_def);
        for(const token_info_id in dictionary_entries){
            const class_name = dictionary_entries[token_info_id];
            const class_id = char_def.invoke_definition_map.lookup(class_name);
            // Assertion
            // if (trie_id < 0) {
            //     console.log("Not Found:" + surface_form);
            // }
            unk_dictionary.addMapping(class_id, token_info_id);
        }
        return unk_dictionary;
    }
    buildFST() {
        let trie_id = 0;
        const words = this.tid_entries.map((entry)=>{
            const surface_form = entry[0];
            return {
                k: surface_form,
                v: trie_id++
            };
        });
        const builder = new (0, $b15954558ed9603e$export$8764c37c2a3aea76)();
        const fst = builder.build(words);
        const bin = (0, $412777b7fa41cd98$export$fcbc0da9b398f525)(fst);
        return new (0, $cd8ea557b7be61b3$export$2e2bcd8739ae039)(bin);
    }
    /**
	 * Build double array trie
	 *
	 * @returns {DoubleArray} Double-Array trie
	 */ buildDoubleArray() {
        let trie_id = 0;
        const words = this.tid_entries.map((entry)=>{
            const surface_form = entry[0];
            return {
                k: surface_form,
                v: trie_id++
            };
        });
        const builder = (0, $60f4f4059ac4d094$export$933032be53f7ca16)(1048576);
        return builder.build(words);
    }
}
var $0763a7dff3591e94$export$2e2bcd8739ae039 = $0763a7dff3591e94$var$DictionaryBuilder;



/**
 * Polyfill for DecompressionStream using Bun's synchronous decompression functions.
 */ class $e251b9065c70768d$var$BunDecompressionStream extends TransformStream {
    /**
     * Creates a new DecompressionStream for the given format.
     * @param format The compression format to use for decompression ('deflate', 'deflate-raw', or 'gzip').
     * @throws {TypeError} If the format is unsupported.
     */ constructor(format){
        if (![
            "deflate",
            "deflate-raw",
            "gzip"
        ].includes(format)) throw new TypeError(`Unsupported compression format: ${format}`);
        let data;
        super({
            transform (chunk) {
                if (!data) data = chunk;
                else {
                    const newData = new Uint8Array(data.length + chunk.length);
                    newData.set(data);
                    newData.set(chunk, data.length);
                    data = newData;
                }
            },
            flush (controller) {
                try {
                    let decompressedBuffer;
                    if (format === "gzip") decompressedBuffer = Bun.gunzipSync(data);
                    else if (format === "deflate") decompressedBuffer = Bun.inflateSync(data);
                    else if (format === "deflate-raw") // Use negative windowBits for raw deflate (no zlib header/footer)
                    decompressedBuffer = Bun.inflateSync(data, {
                        windowBits: -15
                    }); // -15 is a common value for raw deflate
                    else {
                        // Should not reach here as format is validated in constructor
                        controller.error(new TypeError("Unsupported compression format (internal error)"));
                        return;
                    }
                    controller.enqueue(decompressedBuffer);
                } catch (error) {
                    // Catching 'any' for broader error capture, refine if Bun's errors are typed.
                    controller.error(new TypeError(`Decompression failed for format '${format}'.`, {
                        cause: error
                    }));
                    return;
                }
            }
        });
    }
}
var $e251b9065c70768d$export$2e2bcd8739ae039 = $e251b9065c70768d$var$BunDecompressionStream;


var // Pollyfill of DecompressionStream for Bun
$ed082760b2618cdb$var$_globalThis;
var $ed082760b2618cdb$var$_DecompressionStream;
($ed082760b2618cdb$var$_DecompressionStream = ($ed082760b2618cdb$var$_globalThis = globalThis).DecompressionStream) !== null && $ed082760b2618cdb$var$_DecompressionStream !== void 0 ? $ed082760b2618cdb$var$_DecompressionStream : $ed082760b2618cdb$var$_globalThis.DecompressionStream = (0, $e251b9065c70768d$export$2e2bcd8739ae039);

/**
 * DictionaryLoader base constructor
 * @param {string} dic_path Dictionary path
 * @constructor
 */ class $ed082760b2618cdb$var$DictionaryLoader {
    dic_path;
    constructor(dic_path){
        let dicPath;
        dic_path !== null && dic_path !== void 0 ? dic_path : dic_path = "/dict";
        if (typeof dic_path !== "string") {
            dicPath = {
                tid: {
                    dict: "tid.dat.gz",
                    map: "tid_map.dat.gz",
                    pos: "tid_pos.dat.gz"
                },
                unk: {
                    dict: "unk.dat.gz",
                    map: "unk_map.dat.gz",
                    pos: "unk_pos.dat.gz"
                },
                cc: "cc.dat.gz",
                chr: {
                    char: "unk_char.dat.gz",
                    compat: "unk_compat.dat.gz",
                    invoke: "unk_invoke.dat.gz"
                },
                word: {
                    type: "Trie",
                    base: "base.dat.gz",
                    check: "check.dat.gz"
                },
                base: "/dict"
            };
            if (dic_path.word !== undefined) dicPath.word = dic_path.word;
            if (dic_path.tid !== undefined) dicPath.tid = dic_path.tid;
            if (dic_path.unk !== undefined) dicPath.unk = dic_path.unk;
            if (dic_path.cc !== undefined) dicPath.cc = dic_path.cc;
            if (dic_path.chr !== undefined) dicPath.chr = dic_path.chr;
            if (dic_path.base !== undefined) dicPath.base = dic_path.base;
        } else dicPath = {
            tid: {
                dict: "tid.dat.gz",
                map: "tid_map.dat.gz",
                pos: "tid_pos.dat.gz"
            },
            unk: {
                dict: "unk.dat.gz",
                map: "unk_map.dat.gz",
                pos: "unk_pos.dat.gz"
            },
            cc: "cc.dat.gz",
            chr: {
                char: "unk_char.dat.gz",
                compat: "unk_compat.dat.gz",
                invoke: "unk_invoke.dat.gz"
            },
            word: {
                type: "Trie",
                base: "base.dat.gz",
                check: "check.dat.gz"
            },
            base: dic_path
        };
        this.dic_path = dicPath;
    }
    async loadArrayBuffer(base, file) {
        let compressedData;
        if (typeof globalThis.Deno !== "undefined") // Okay. I'm on Deno. Let's just read it.
        compressedData = await Deno.readFile(base + file.path);
        else if (typeof globalThis.Bun !== "undefined") // Now, I'm on Bun. Let's use `Bun.file`.
        compressedData = Buffer.from(await Bun.file(base + file.path).arrayBuffer());
        else if (typeof globalThis.process !== "undefined") {
            // Yep, I guess I'm on Node. read file by using promise!
            const fs = await $ed082760b2618cdb$importAsync$3fe130b383a0ea79;
            compressedData = await fs.readFile(base + file.path);
        } else {
            // Looks like I'm in browser. Let's fetch it!
            const response = await fetch(base + file.path);
            if (!response.ok) throw new Error(`Failed to fetch ${base + file.path}: ${response.statusText}`);
            // What the hell... They decompressed it automatically...
            return await response.arrayBuffer();
        }
        if (!file.compression) file.compression = "gzip";
        // Decompress
        if (file.compression === "raw") return compressedData.buffer;
        const ds = new DecompressionStream(file.compression);
        const decompressedStream = new Blob([
            compressedData
        ]).stream().pipeThrough(ds);
        const decompressedData = await new Response(decompressedStream).arrayBuffer();
        return decompressedData;
    }
    /**
	 * Load dictionary files
	 */ async load() {
        const dic = new (0, $0848a9c02181f40d$export$2e2bcd8739ae039)();
        const dic_path = this.dic_path;
        const loadArrayBuffer = this.loadArrayBuffer;
        await Promise.all([
            // WordDictionary
            async ()=>{
                switch(dic_path.word.type){
                    case "FST":
                        {
                            const FSTword_base = typeof dic_path.word.base === "string" ? {
                                path: dic_path.word.base
                            } : dic_path.word.base;
                            const buffer = await loadArrayBuffer(`${dic_path.base}/`, FSTword_base);
                            dic.loadFST(new Uint8Array(buffer));
                            break;
                        }
                    case "Trie":
                        {
                            const Trieword_base = typeof dic_path.word.base === "string" ? {
                                path: dic_path.word.base
                            } : dic_path.word.base;
                            const Trieword_check = typeof dic_path.word.check === "string" ? {
                                path: dic_path.word.check
                            } : dic_path.word.check;
                            const buffers = await Promise.all([
                                Trieword_base,
                                Trieword_check
                            ].map(async (file)=>{
                                return loadArrayBuffer(`${dic_path.base}/`, file);
                            }));
                            const base_buffer = new Int32Array(buffers[0]);
                            const check_buffer = new Int32Array(buffers[1]);
                            dic.loadTrie(base_buffer, check_buffer);
                            break;
                        }
                }
            },
            // Token info dictionaries
            async ()=>{
                const TID_Dict = typeof dic_path.tid.dict === "string" ? {
                    path: dic_path.tid.dict
                } : dic_path.tid.dict;
                const TID_Pos = typeof dic_path.tid.pos === "string" ? {
                    path: dic_path.tid.pos
                } : dic_path.tid.pos;
                const TID_Map = typeof dic_path.tid.map === "string" ? {
                    path: dic_path.tid.map
                } : dic_path.tid.map;
                const buffers = await Promise.all([
                    TID_Dict,
                    TID_Pos,
                    TID_Map
                ].map((file)=>{
                    return loadArrayBuffer(`${dic_path.base}/`, file);
                }));
                const token_info_buffer = new Uint8Array(buffers[0]);
                const pos_buffer = new Uint8Array(buffers[1]);
                const target_map_buffer = new Uint8Array(buffers[2]);
                dic.loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer);
            },
            // Connection cost matrix
            async ()=>{
                const UNK_Dict = typeof dic_path.cc === "string" ? {
                    path: dic_path.cc
                } : dic_path.cc;
                const buffer = await loadArrayBuffer(`${dic_path.base}/`, UNK_Dict);
                const cc_buffer = new Int16Array(buffer);
                dic.loadConnectionCosts(cc_buffer);
            },
            // Unknown dictionaries
            async ()=>{
                const UNK_Dict = typeof dic_path.unk.dict === "string" ? {
                    path: dic_path.unk.dict
                } : dic_path.unk.dict;
                const UNK_Pos = typeof dic_path.unk.pos === "string" ? {
                    path: dic_path.unk.pos
                } : dic_path.unk.pos;
                const UNK_Map = typeof dic_path.unk.map === "string" ? {
                    path: dic_path.unk.map
                } : dic_path.unk.map;
                const Char = typeof dic_path.chr.char === "string" ? {
                    path: dic_path.chr.char
                } : dic_path.chr.char;
                const Compat = typeof dic_path.chr.compat === "string" ? {
                    path: dic_path.chr.compat
                } : dic_path.chr.compat;
                const Invoke = typeof dic_path.chr.invoke === "string" ? {
                    path: dic_path.chr.invoke
                } : dic_path.chr.invoke;
                const buffers = await Promise.all([
                    UNK_Dict,
                    UNK_Pos,
                    UNK_Map,
                    Char,
                    Compat,
                    Invoke
                ].map(async (file)=>{
                    return loadArrayBuffer(`${dic_path.base}/`, file);
                }));
                const unk_buffer = new Uint8Array(buffers[0]);
                const unk_pos_buffer = new Uint8Array(buffers[1]);
                const unk_map_buffer = new Uint8Array(buffers[2]);
                const cat_map_buffer = new Uint8Array(buffers[3]);
                const compat_cat_map_buffer = new Uint32Array(buffers[4]);
                const invoke_def_buffer = new Uint8Array(buffers[5]);
                dic.loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
            // dic.loadUnknownDictionaries(char_buffer, unk_buffer);
            }
        ].map((func)=>func()));
        return dic;
    }
}
var /**
 * Callback
 * @callback DictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {DynamicDictionaries} dic Loaded dictionary
 */ $ed082760b2618cdb$export$2e2bcd8739ae039 = $ed082760b2618cdb$var$DictionaryLoader;


/**
 * Mappings between IPADIC dictionary features and tokenized results
 * @constructor
 */ class $f341130530ef2d14$var$IpadicFormatter {
    formatEntry(word_id, position, type, features) {
        const token = {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: features[0],
            pos: features[1],
            pos_detail_1: features[2],
            pos_detail_2: features[3],
            pos_detail_3: features[4],
            conjugated_type: features[5],
            conjugated_form: features[6],
            basic_form: features[7],
            reading: features[8],
            pronunciation: features[9]
        };
        return token;
    }
    formatUnknownEntry(word_id, position, type, features, surface_form) {
        const token = {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: surface_form,
            pos: features[1],
            pos_detail_1: features[2],
            pos_detail_2: features[3],
            pos_detail_3: features[4],
            conjugated_type: features[5],
            conjugated_form: features[6],
            basic_form: features[7]
        };
        return token;
    }
}
var $f341130530ef2d14$export$2e2bcd8739ae039 = $f341130530ef2d14$var$IpadicFormatter;


/**
 * Mappings between Unidic dictionary features and tokenized results
 * @constructor
 */ class $e0828298df8affae$var$UnidicFormatter {
    formatEntry(word_id, position, type, features) {
        const token = {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: features[1],
            pos: features[2],
            pos_detail_1: features[3],
            pos_detail_2: features[4],
            pos_detail_3: features[5],
            conjugated_type: features[6],
            conjugated_form: features[7],
            basic_form: features[9],
            reading: features[8]
        };
        return token;
    }
    formatUnknownEntry(word_id, position, type, features, surface_form) {
        const token = {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: surface_form,
            pos: features[2],
            pos_detail_1: features[3],
            pos_detail_2: features[4],
            pos_detail_3: features[5],
            conjugated_type: features[6],
            conjugated_form: features[7],
            basic_form: features[10]
        };
        return token;
    }
}
var $e0828298df8affae$export$2e2bcd8739ae039 = $e0828298df8affae$var$UnidicFormatter;


const $37b60524ff1d5820$var$dic_formatter = {
    IPAdic: new (0, $f341130530ef2d14$export$2e2bcd8739ae039)(),
    UniDic: new (0, $e0828298df8affae$export$2e2bcd8739ae039)(),
    "NAIST-jdic": new (0, $f341130530ef2d14$export$2e2bcd8739ae039)()
};
// Public methods
const $37b60524ff1d5820$var$kuromoji = {
    build: async (option)=>{
        const loader = new (0, $ed082760b2618cdb$export$2e2bcd8739ae039)(option.dicPath);
        const dic = await loader.load();
        var _option_dicType;
        return new (0, $1d80c1e34dd115b9$export$2e2bcd8739ae039)(dic, $37b60524ff1d5820$var$dic_formatter[(_option_dicType = option.dicType) !== null && _option_dicType !== void 0 ? _option_dicType : "IPAdic"]);
    },
    dictionaryBuilder: ()=>new (0, $0763a7dff3591e94$export$2e2bcd8739ae039)()
};
var $37b60524ff1d5820$export$2e2bcd8739ae039 = $37b60524ff1d5820$var$kuromoji;


export {$37b60524ff1d5820$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=kuromoji.js.map
