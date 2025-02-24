import { FST, AlignmentSize, FLAG_LAST_ARC, FLAG_ARC_HAS_OUTPUT, alignSize, FLAG_FINAL_ARC, FLAG_ARC_HAS_FINAL_OUTPUT } from "./FST";


export function compileFST(fst: FST, alignmentSize: AlignmentSize = AlignmentSize.FOUR_BYTES): Uint8Array {
	const bufferPool = new ArrayBuffer(4096);
	const view = new DataView(bufferPool);
	const arcs: Uint8Array[] = [];
	const address: { [key: number]: number; } = {};
	let pos = 0;

	// メモリ効率化のためのバッファ再利用
	const getBuffer = (size: number): ArrayBuffer => {
		if (size <= bufferPool.byteLength) return bufferPool;
		return new ArrayBuffer(size);
	};

	for (const s of Array.from(fst.dictionary.values())) {
		const sortedTrans = Object.entries(s.transMap).sort(
			(a, b) => Number(b[0]) - Number(a[0])
		);

		for (let i = 0; i < sortedTrans.length; i++) {
			const [c, v] = sortedTrans[i];
			const buffer = getBuffer(1024);
			const view = new DataView(buffer);
			let offset = 0;

			let flag = 0;
			if (i === 0) flag |= FLAG_LAST_ARC;
			if (v.output.length > 0) flag |= FLAG_ARC_HAS_OUTPUT;

			if (alignmentSize === AlignmentSize.ONE_BYTE) {
				view.setInt8(offset++, flag);
				view.setInt8(offset++, Number(c));
			} else {
				const flagAndLabel = (flag << 24) | (Number(c) << 16);
				view.setInt32(offset, flagAndLabel);
				offset += alignmentSize;
			}

			if (v.output.length > 0) {
				if (alignmentSize === AlignmentSize.ONE_BYTE) {
					view.setInt8(offset++, v.output.length);
				} else {
					view.setInt32(offset, v.output.length);
					offset += alignmentSize;
				}
				new Uint8Array(buffer, offset).set(v.output);
				offset += alignSize(v.output.length, alignmentSize);
			}

			const nextAddr = address[v.state.id!];
			const target = pos + offset + (alignmentSize === AlignmentSize.ONE_BYTE ? 1 : alignmentSize) - nextAddr;

			if (alignmentSize === AlignmentSize.ONE_BYTE) {
				view.setInt8(offset++, target);
			} else {
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

			let flag = FLAG_FINAL_ARC;
			const finalOutputs = Array.from(s.finalOutput);
			const hasOutput = finalOutputs.some((out) => out.length > 0);

			if (hasOutput) {
				flag |= FLAG_ARC_HAS_FINAL_OUTPUT;
			}
			if (!Object.keys(s.transMap).length) {
				flag |= FLAG_LAST_ARC;
			}

			if (alignmentSize === AlignmentSize.ONE_BYTE) {
				view.setInt8(offset++, flag);
			} else {
				view.setInt32(offset, flag << 24);
				offset += alignmentSize;
			}

			if (hasOutput) {
				const separator = new Uint8Array([0x1a]);
				const totalLength = finalOutputs.reduce((sum, curr) => sum + curr.length, 0) +
					(finalOutputs.length - 1);

				if (alignmentSize === AlignmentSize.ONE_BYTE) {
					view.setInt8(offset++, totalLength);
				} else {
					view.setInt32(offset, totalLength);
					offset += alignmentSize;
				}

				for (let i = 0; i < finalOutputs.length; i++) {
					new Uint8Array(buffer, offset).set(finalOutputs[i]);
					offset += finalOutputs[i].length;
					if (i < finalOutputs.length - 1) {
						new Uint8Array(buffer, offset).set(separator);
						offset += 1;
					}
				}
				offset = alignSize(offset, alignmentSize);
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
