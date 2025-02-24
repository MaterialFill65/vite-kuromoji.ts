
export interface internalKeyValue {
	k: Uint8Array;
	v: Uint8Array;
}

export interface externalKeyValue {
	k: string;
	v: number;
}

// Bit flags for arc representation
const FLAG_FINAL_ARC = 1 << 0;
const FLAG_LAST_ARC = 1 << 1;
const FLAG_ARC_HAS_OUTPUT = 1 << 4;
const FLAG_ARC_HAS_FINAL_OUTPUT = 1 << 5;
export const NOT_FOUND = -1;
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

	hashState(state: State): string {
        return JSON.stringify({
            final: state.final,
            transMap: state.transMap,
            finalOutput: Array.from(state.finalOutput)
        });
	}
}

export interface Arc {
	flag: number;
	label: number;
	output: Uint8Array;
	finalOutput: Uint8Array[];
	target: number;
}

// アライメントサイズの設定を追加
export const enum AlignmentSize {
    ONE_BYTE = 1,
    TWO_BYTES = 2,
    FOUR_BYTES = 4,
    EIGHT_BYTES = 8
}

// アライメントユーティリティ関数
export function alignSize(size: number, alignment: number): number {
    return Math.ceil(size / alignment) * alignment;
}

export function prefixLen(s1: Uint8Array, s2: Uint8Array): number {
	let i = 0;
	while (i < s1.length && i < s2.length && s1[i] === s2[i]) {
		i++;
	}
	return i;
}

export function copyState(state: State, id: number): State {
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


export function compareUint8Arrays(arr1: Uint8Array, arr2: Uint8Array): number {
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
	FLAG_FINAL_ARC,
	FLAG_LAST_ARC,
	FLAG_ARC_HAS_OUTPUT,
	FLAG_ARC_HAS_FINAL_OUTPUT,
};
