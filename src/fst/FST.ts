import type { WordSearch } from "../dict/DynamicDictionaries";

interface KeyValue {
	k: string | Uint8Array;
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

	commonPrefixSearch(word: string): KeyValue[] {
		const textEncoder = new TextEncoder();
		const textDecoder = new TextDecoder();
		const encoded_word = textEncoder.encode(word);
		const [accepted, result] = this.run(encoded_word);
		if (!accepted) {
			return [];
		}
		return Array.from(result).map<KeyValue>((enc_output) => {
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

export {
	State,
	FST,
	Matcher,
	FLAG_FINAL_ARC,
	FLAG_LAST_ARC,
	FLAG_ARC_HAS_OUTPUT,
	FLAG_ARC_HAS_FINAL_OUTPUT,
};
