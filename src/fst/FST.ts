import type { WordSearch } from "../dict/DynamicDictionaries";

interface internalKeyValue {
	k: Uint8Array;
	v: Uint8Array;
}

interface externalKeyValue {
	k: string;
	v: number;
}

// Bit flags for arc representation
const FLAG_FINAL_ARC = 1 << 0;
const FLAG_LAST_ARC = 1 << 1;
const FLAG_ARC_HAS_OUTPUT = 1 << 4;
const FLAG_ARC_HAS_FINAL_OUTPUT = 1 << 5;
const NOT_FOUND = -1;
interface Transition {
	state: State;
	output: Uint8Array;
}

interface TransitionMap {
	[key: number]: Transition;
}

class State {
	id: number | null;
	final: boolean;
	transMap: TransitionMap;
	finalOutput: Set<Uint8Array>;

	constructor(id: number | null = null) {
		this.id = id;
		this.final = false;
		this.transMap = {};
		this.finalOutput = new Set();
	}

	isFinal(): boolean {
		return this.final;
	}

	setFinal(final: boolean): void {
		this.final = final;
	}

	transition(char: number): State | null {
		return this.transMap[char]?.state || null;
	}

	setTransition(char: number, state: State): void {
		this.transMap[char] = {
			state,
			output: this.transMap[char]?.output || new Uint8Array(),
		};
	}

	stateOutput(): Set<Uint8Array> {
		return this.finalOutput;
	}

	setStateOutput(output: Set<Uint8Array>): void {
		this.finalOutput = new Set(
			Array.from(output).map((e) => new Uint8Array(e)),
		);
	}

	clearStateOutput(): void {
		this.finalOutput.clear();
	}

	output(char: number): Uint8Array {
		return this.transMap[char]?.output || new Uint8Array();
	}

	setOutput(char: number, out: Uint8Array): void {
		if (this.transMap[char]) {
			this.transMap[char].output = new Uint8Array(out);
		}
	}

	clear(): void {
		this.final = false;
		this.transMap = {};
		this.finalOutput.clear();
	}
}

class FST {
	public dictionary: Map<string, State>;

	constructor() {
		this.dictionary = new Map();
	}

	size(): number {
		return this.dictionary.size;
	}

	member(state: State): State | undefined {
		return this.dictionary.get(this.hashState(state));
	}

	insert(state: State): void {
		this.dictionary.set(this.hashState(state), state);
	}

	private hashState(state: State): string {
        return JSON.stringify({
            final: state.final,
            transMap: state.transMap,
            finalOutput: Array.from(state.finalOutput)
        });
	}
}

interface Arc {
	flag: number;
	label: number;
	output: Uint8Array;
	finalOutput: Uint8Array[];
	target: number;
}

class Matcher implements WordSearch {
	private static readonly BUF_SIZE = 1024;
	private data: Uint8Array;

	constructor(dictData?: Uint8Array) {
		if (dictData) {
			this.data = dictData;
		} else {
			throw new Error("dictData must be provided");
		}
	}

	run(word: Uint8Array): [boolean, Set<Uint8Array>] {
		const outputs = new Set<Uint8Array>();
		let accept = false;
		let buf = new Uint8Array();
		let i = 0;
		let pos = 0;

		while (pos < this.data.length) {
			const [arc, incr] = this.nextArc(pos);

			if (arc.flag & FLAG_FINAL_ARC) {
				accept = i >= word.length;
				arc.finalOutput.forEach((out) => {
					const newOutput = new Uint8Array(buf.length + out.length);
					newOutput.set(buf);
					newOutput.set(out, buf.length);
					outputs.add(newOutput);
				});

				if (arc.flag & FLAG_LAST_ARC || i >= word.length) {
					break;
				}
				pos += incr;
			} else if (arc.flag & FLAG_LAST_ARC) {
				if (i >= word.length) break;
				if (word[i] === arc.label) {
					const newBuf = new Uint8Array(buf.length + arc.output.length);
					newBuf.set(buf);
					newBuf.set(arc.output, buf.length);
					buf = newBuf;
					i++;
					pos += arc.target;
				} else {
					break;
				}
			} else {
				if (i >= word.length) break;
				if (word[i] === arc.label) {
					const newBuf = new Uint8Array(buf.length + arc.output.length);
					newBuf.set(buf);
					newBuf.set(arc.output, buf.length);
					buf = newBuf;
					i++;
					pos += arc.target;
				} else {
					pos += incr;
				}
			}
		}
		return [accept, outputs];
	}

	lookup(key: string): number {
		const textEncoder = new TextEncoder()
		const textDecoder = new TextDecoder()
		const [accept, encoded_word] = this.run(textEncoder.encode(key));
		if(!accept)
			return NOT_FOUND

		let result: Uint8Array | undefined
		encoded_word.forEach(e=>{
			result = e
		})
		if (!result)
			return NOT_FOUND

		return parseInt(textDecoder.decode(result))
	}

	commonPrefixSearch(word: string): externalKeyValue[] {
		const textEncoder = new TextEncoder();
		const textDecoder = new TextDecoder();
		const encoded_word = textEncoder.encode(word);
		const [accepted, result] = this.run(encoded_word);
		if (!accepted) {
			return [];
		}
		return Array.from(result).map<externalKeyValue>((enc_output) => {
			return {
				k: word,
				v: Number.parseInt(textDecoder.decode(enc_output)),
			};
		});
	}

	private nextArc(addr: number): [Arc, number] {
		const arc: Arc = {
			flag: 0,
			label: 0,
			output: new Uint8Array(),
			finalOutput: [new Uint8Array()],
			target: 0,
		};

		let pos = addr;
		arc.flag = new DataView(this.data.buffer).getInt8(pos);
		pos += 1;

		if (arc.flag & FLAG_FINAL_ARC) {
			if (arc.flag & FLAG_ARC_HAS_FINAL_OUTPUT) {
				const finalOutputSize = new DataView(this.data.buffer).getInt32(pos);
				pos += 4;
				const finalOutput = this.data.slice(pos, pos + finalOutputSize);
				arc.finalOutput = this.splitOutput(finalOutput);
				pos += finalOutputSize;
			}
		} else {
			arc.label = this.data[pos];
			pos += 1;

			if (arc.flag & FLAG_ARC_HAS_OUTPUT) {
				const outputSize = new DataView(this.data.buffer).getInt32(pos);
				pos += 4;
				arc.output = this.data.slice(pos, pos + outputSize);
				pos += outputSize;
			}

			arc.target = new DataView(this.data.buffer).getInt32(pos);
			pos += 4;
		}

		return [arc, pos - addr];
	}

	private splitOutput(output: Uint8Array): Uint8Array[] {
		const separator = 0x1a; // ASCII SUB character
		const result: Uint8Array[] = [];
		let start = 0;

		for (let i = 0; i < output.length; i++) {
			if (output[i] === separator) {
				result.push(output.slice(start, i));
				start = i + 1;
			}
		}
		if (start < output.length) {
			result.push(output.slice(start));
		}

		return result;
	}

	getBuffer(){
		return this.data
	}
}

export function compileFST(fst: FST): Uint8Array {
	const arcs: Uint8Array[] = [];
	const address: { [key: number]: number } = {};
	let pos = 0;

	for (const s of Array.from(fst.dictionary.values())) {
		const sortedTrans = Object.entries(s.transMap).sort(
			(a, b) => Number(b[0]) - Number(a[0]),
		);

		for (let i = 0; i < sortedTrans.length; i++) {
			const [c, v] = sortedTrans[i];
			const buffer = new ArrayBuffer(1024);
			const view = new DataView(buffer);
			let offset = 0;

			let flag = 0;
			if (i === 0) flag |= FLAG_LAST_ARC;
			if (v.output.length > 0) flag |= FLAG_ARC_HAS_OUTPUT;

			view.setInt8(offset++, flag);
			view.setUint8(offset++, Number(c));

			if (v.output.length > 0) {
				view.setInt32(offset, v.output.length);
				offset += 4;
				new Uint8Array(buffer, offset).set(v.output);
				offset += v.output.length;
			}

			const nextAddr = address[v.state.id!];
			const target = pos + offset + 4 - nextAddr;
			view.setInt32(offset, target);
			offset += 4;

			arcs.push(new Uint8Array(buffer.slice(0, offset)));
			pos += offset;
		}

		if (s.isFinal()) {
			const buffer = new ArrayBuffer(1024);
			const view = new DataView(buffer);
			let offset = 0;

			let flag = FLAG_FINAL_ARC;
			const finalOutputs = Array.from(s.finalOutput);
			const hasOutput = finalOutputs.some((out) => out.length > 0);

			if (hasOutput) {
				flag |= FLAG_ARC_HAS_FINAL_OUTPUT;
			}
			if (!Object.keys(s.transMap).length) {
				flag |= FLAG_LAST_ARC;
			}

			view.setInt8(offset++, flag);

			if (hasOutput) {
				const separator = new Uint8Array([0x1a]);
				const totalLength =
					finalOutputs.reduce((sum, curr) => sum + curr.length, 0) +
					(finalOutputs.length - 1);

				view.setInt32(offset, totalLength);
				offset += 4;

				for (let i = 0; i < finalOutputs.length; i++) {
					new Uint8Array(buffer, offset).set(finalOutputs[i]);
					offset += finalOutputs[i].length;
					if (i < finalOutputs.length - 1) {
						new Uint8Array(buffer, offset).set(separator);
						offset += 1;
					}
				}
			}

			arcs.push(new Uint8Array(buffer.slice(0, offset)));
			pos += offset;
		}
		address[s.id!] = pos;
	}

	arcs.reverse();
	const totalLength = arcs.reduce((sum, arr) => sum + arr.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;

	for (const arc of arcs) {
		result.set(arc, offset);
		offset += arc.length;
	}

	return result;
}

function prefixLen(s1: Uint8Array, s2: Uint8Array): number {
	let i = 0;
	while (i < s1.length && i < s2.length && s1[i] === s2[i]) {
		i++;
	}
	return i;
}

function copyState(state: State, id: number): State {
	const newState = new State(id);
	newState.setFinal(state.isFinal());
	newState.setStateOutput(new Set(state.stateOutput())); // Shallow copy of Set, but Uint8Arrays are immutable
	for (const charCode in state.transMap) {
		if (state.transMap.hasOwnProperty(charCode)) {
			const transition = state.transMap[charCode];
			newState.setTransition(Number(charCode), transition.state); // Assuming state IDs are handled correctly later during minimization
			newState.setOutput(Number(charCode), transition.output); // Shallow copy of Uint8Array, but they are immutable
		}
	}
	return newState;
}


export function createMinimumTransducer(inputs: internalKeyValue[]): FST {
	inputs.sort((a, b) => compareUint8Arrays(a.k, b.k));
	const start_time = Date.now();
	let last_printed = 0;
	const inputs_size = inputs.length;
	console.log(`input size: ${inputs_size}`);

	const fstDict = new FST();
	const buffer: State[] = [];
	buffer.push(new State()); // insert 'initial' state

	// previous word
	let prev_word: Uint8Array = new Uint8Array();

	const findMinimized = (state: State): State => {
		// if an equivalent state exists in the dictionary, use that
		const s = fstDict.member(state);
		if (s === undefined) {
			// if no equivalent state exists, insert new one and return it
			const newState = copyState(state, fstDict.size());
			fstDict.insert(newState);
			return newState;
		}
		return s;
	};

	let processed = 0;
	let current_word: Uint8Array;
	let current_output: Uint8Array;
	// main loop
	for (const input of inputs) {
		current_word = input.k;
		current_output = input.v;

		// console.debug('current word: ' + String.fromCharCode(...current_word));
		// console.debug('current_output: ' + String.fromCharCode(...current_output));

		if (compareUint8Arrays(current_word, prev_word) < 0) {
			throw new Error("Input words must be sorted lexicographically.");
		}

		const pref_len = prefixLen(prev_word, current_word);

		// expand buffer to current word length
		while (buffer.length <= current_word.length) {
			buffer.push(new State());
		}

		// set state transitions
		for (let i = prev_word.length; i > pref_len; i--) {
			buffer[i - 1].setTransition(prev_word[i - 1], findMinimized(buffer[i]));
		}
		for (let i = pref_len + 1; i <= current_word.length; i++) {
			buffer[i].clear();
			buffer[i - 1].setTransition(current_word[i - 1], buffer[i]);
		}
		if (compareUint8Arrays(current_word, prev_word) !== 0) {
			buffer[current_word.length].setFinal(true);
			buffer[current_word.length].setStateOutput(new Set([new Uint8Array()]));
		}

		// set state outputs
		for (let j = 1; j <= pref_len; j++) {
			// divide (j-1)th state's output to (common) prefix and suffix
			const common_prefix_arr: number[] = [];
			const output = buffer[j - 1].output(current_word[j - 1]);
			let k = 0;
			while (k < output.length && k < current_output.length && output[k] === current_output[k]) {
				common_prefix_arr.push(output[k]);
				k++;
			}
			const common_prefix = new Uint8Array(common_prefix_arr);
			const word_suffix = output.slice(common_prefix.length);

			// re-set (j-1)'th state's output to prefix
			buffer[j - 1].setOutput(current_word[j - 1], common_prefix);

			// re-set jth state's output to suffix or set final state output
			for (const charCodeStr in buffer[j].transMap) {
				if (buffer[j].transMap.hasOwnProperty(charCodeStr)) {
					const charCode = Number(charCodeStr);
					const new_output_arr = [...word_suffix, ...buffer[j].output(charCode)];
					const new_output = new Uint8Array(new_output_arr);
					buffer[j].setOutput(charCode, new_output);
				}
			}
			// or, set final state output if it's a final state
			if (buffer[j].isFinal()) {
				const tmp_set = new Set<Uint8Array>();
				for (const tmp_str of buffer[j].stateOutput()) {
					const newOutputArr = [...word_suffix, ...tmp_str];
					tmp_set.add(new Uint8Array(newOutputArr));
				}
				buffer[j].setStateOutput(tmp_set);
			}

			// update current output (subtract prefix)
			current_output = current_output.slice(common_prefix.length);
		}

		if (compareUint8Arrays(current_word, prev_word) === 0) {
			buffer[current_word.length].stateOutput().add(current_output);
		} else {
			buffer[pref_len].setOutput(current_word[pref_len], current_output);
		}

		// preserve current word for next loop
		prev_word = current_word;

		// progress
		processed++;
		const elapsed = Math.round((Date.now() - start_time) / 1000);
		if (elapsed % 30 === 0 && elapsed > last_printed) {
			const progress = (processed / inputs_size) * 100;
			console.log(`elapsed=${elapsed}sec, progress: ${progress} %`);
			last_printed = elapsed;
		}
	}

	// minimize the last word
	for (let i = current_word!.length; i > 0; i--) {
		buffer[i - 1].setTransition(prev_word[i - 1], findMinimized(buffer[i]));
	}

	findMinimized(buffer[0]);
	console.log(`num of state: ${fstDict.size()}`);

	return fstDict;
}


function compareUint8Arrays(arr1: Uint8Array, arr2: Uint8Array): number {
	const len1 = arr1.length;
	const len2 = arr2.length;
	const len = Math.min(len1, len2);
	for (let i = 0; i < len; i++) {
		if (arr1[i] < arr2[i]) {
			return -1;
		} else if (arr1[i] > arr2[i]) {
			return 1;
		}
	}
	if (len1 < len2) {
		return -1;
	} else if (len1 > len2) {
		return 1;
	} else {
		return 0;
	}
}

export {
	State,
	FST,
	Matcher,
	FLAG_FINAL_ARC,
	FLAG_LAST_ARC,
	FLAG_ARC_HAS_OUTPUT,
	FLAG_ARC_HAS_FINAL_OUTPUT,
};
