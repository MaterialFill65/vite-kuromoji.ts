import type { WordSearch } from "../dict/DynamicDictionaries";
import { AlignmentSize, FLAG_FINAL_ARC, FLAG_LAST_ARC, NOT_FOUND, externalKeyValue, Arc, FLAG_ARC_HAS_FINAL_OUTPUT, alignSize, FLAG_ARC_HAS_OUTPUT } from "./FST";

class Matcher implements WordSearch {
	private static readonly BUF_SIZE = 1024;
	private data: Uint8Array;
	private alignmentSize: number;

	constructor(dictData?: Uint8Array, alignmentSize: AlignmentSize = AlignmentSize.FOUR_BYTES) {
		if (dictData) {
			this.data = dictData;
			this.alignmentSize = alignmentSize;
		} else {
			throw new Error("dictData must be provided");
		}
	}

	run(word: Uint8Array): [boolean, Set<Uint8Array>] {
		const outputs = new Set<Uint8Array>();
		let accept = false;
		const bufferPool = new Uint8Array(Matcher.BUF_SIZE);
		let bufferSize = 0;
		let i = 0;
		let pos = 0;

		while (pos < this.data.length) {
			const [arc, incr] = this.nextArc(pos);

			if (arc.flag & FLAG_FINAL_ARC) {
				accept = (i === word.length);
				if (accept) {
					arc.finalOutput.forEach((out) => {
						const newOutput = new Uint8Array(bufferSize + out.length);
						newOutput.set(bufferPool.subarray(0, bufferSize));
						newOutput.set(out, bufferSize);
						outputs.add(newOutput);
					});
				}

				if (arc.flag & FLAG_LAST_ARC || i >= word.length) {
					break;
				}
				pos += incr;
			} else if (arc.flag & FLAG_LAST_ARC || word[i] === arc.label) {
				if (i >= word.length) break;
				if (word[i] === arc.label) {
					bufferPool.set(arc.output, bufferSize);
					bufferSize += arc.output.length;
					i++;
					pos += arc.target;
				} else if (arc.flag & FLAG_LAST_ARC) {
					break;
				} else {
					pos += incr;
				}
			} else {
				pos += incr;
			}
		}
		return [accept, outputs];
	}

	lookup(key: string): number {
		const textEncoder = new TextEncoder();
		const textDecoder = new TextDecoder();
		const [accept, encoded_word] = this.run(textEncoder.encode(key));
		if (!accept)
			return NOT_FOUND;

		let result: Uint8Array = Array.from(encoded_word)[0];

		return parseInt(textDecoder.decode(result));
	}

	commonPrefixSearch(word: string): externalKeyValue[] {
		const textEncoder = new TextEncoder();
		const textDecoder = new TextDecoder();
		const buffer = textEncoder.encode(word);

		const searchResult: externalKeyValue[] = [];

		for (let i = 1; i <= buffer.length; i ++) {
			const target = buffer.slice(0, i);
			const [accepted, result] = this.run(target);
			if (!accepted) {
				continue;
			}
			const arrayed = Array.from(result);

			const enc_output = arrayed[0]
			const key = textDecoder.decode(target);
			const value = Number(textDecoder.decode(enc_output));
			searchResult.push({ k: key, v: value });
		}

		return searchResult;
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
		if (this.alignmentSize === AlignmentSize.ONE_BYTE) {
			arc.flag = this.data[pos++];
			if (!(arc.flag & FLAG_FINAL_ARC)) {
				arc.label = this.data[pos++];
			}
		} else {
			// 複数バイトの場合は32ビット値として読み込む
			const flagAndLabel = new DataView(this.data.buffer).getInt32(pos);
			arc.flag = flagAndLabel >>> 24;
			if (!(arc.flag & FLAG_FINAL_ARC)) {
				arc.label = (flagAndLabel >>> 16) & 0xFF;
			}
			pos += this.alignmentSize;
		}

		if (arc.flag & FLAG_FINAL_ARC) {
			if (arc.flag & FLAG_ARC_HAS_FINAL_OUTPUT) {
				const finalOutputSize = this.alignmentSize === AlignmentSize.ONE_BYTE
					? this.data[pos++]
					: new DataView(this.data.buffer).getInt32(pos);
				pos += this.alignmentSize > 1 ? this.alignmentSize : 0;

				const finalOutput = this.data.slice(pos, pos + finalOutputSize);
				arc.finalOutput = this.splitOutput(finalOutput);
				pos += alignSize(finalOutputSize, this.alignmentSize);
			}
		} else {
			if (arc.flag & FLAG_ARC_HAS_OUTPUT) {
				const outputSize = this.alignmentSize === AlignmentSize.ONE_BYTE
					? this.data[pos++]
					: new DataView(this.data.buffer).getInt32(pos);
				pos += this.alignmentSize > 1 ? this.alignmentSize : 0;

				arc.output = this.data.slice(pos, pos + outputSize);
				pos += alignSize(outputSize, this.alignmentSize);
			}

			if (this.alignmentSize === AlignmentSize.ONE_BYTE) {
				arc.target = this.data[pos++];
			} else {
				arc.target = new DataView(this.data.buffer).getInt32(pos);
				pos += this.alignmentSize;
			}
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

	getBuffer() {
		return this.data;
	}
}

export default Matcher;