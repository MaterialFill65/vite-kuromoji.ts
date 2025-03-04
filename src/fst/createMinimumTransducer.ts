import { internalKeyValue, FST, compareUint8Arrays, State, copyState, prefixLen } from "./FST";

export function createMinimumTransducer(inputs: internalKeyValue[]): FST {
	const start_time = Date.now();
	let last_printed = 0;
	const inputs_size = inputs.length;
	console.log(`input size: ${inputs_size}`);

	const fstDict = new FST();
	const stateCache = new Map<string, State>();
	const buffer: State[] = new Array(1024).fill(null).map(() => new State());
	buffer[0] = new State(); // initial state

	const findMinimized = (state: State): State => {
		const hash = fstDict.hashState(state);
		const cached = stateCache.get(hash);
		if (cached) return cached;

		const s = fstDict.member(state);
		if (!s) {
			const newState = copyState(state, fstDict.size());
			fstDict.insert(newState);
			stateCache.set(hash, newState);
			return newState;
		}
		stateCache.set(hash, s);
		return s;
	};

	let prev_word: Uint8Array = new Uint8Array();

	let processed = 0;
	let current_word: Uint8Array | undefined;
	let current_output: Uint8Array | undefined;
	// main loop
	for (const input of inputs) {
		current_word = input.k;
		current_output = input.v;

		// Assert
		// if (compareUint8Arrays(current_word, prev_word) < 0) {
		// 	throw new Error("Input words must be sorted lexicographically.");
		// }

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
		if (elapsed % 5 === 0 && elapsed > last_printed) {
			const progress = (processed / inputs_size) * 100;
			console.log(`elapsed=${elapsed}sec, progress: ${progress} %`);
			last_printed = elapsed;
		}
	}
	if (current_word) {
		// minimize the last word
		for (let i = current_word.length; i > 0; i--) {
			buffer[i - 1].setTransition(prev_word[i - 1], findMinimized(buffer[i]));
		}
	}

	findMinimized(buffer[0]);
	console.log(`num of state: ${fstDict.size()}`);

	return fstDict;
}
