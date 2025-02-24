import { FST, State } from "./FST";
import { createMinimumTransducer } from "./createMinimumTransducer";

interface KeyValue {
	k: string;
	v: number;
}

export class FSTBuilder {
	private states: State[];

	constructor() {
		this.states = [];
	}

	/**
	 * 新しい状態を作成します
	 */
	newState(): State {
		const state = new State(this.states.length);
		this.states.push(state);
		return state;
	}

	/**
	 * FSTを最適化して構築します
	 */
	build(keys: KeyValue[]): FST {
		// Convert key string to ArrayBuffer
		const textEncoder = new TextEncoder()
		const buff_keys = keys.map<{ k: Uint8Array, v: Uint8Array }>((k: KeyValue) => {
			return {
				k: textEncoder.encode(k.k),
				v: textEncoder.encode(k.v.toString())
			}
		});

		return createMinimumTransducer(buff_keys);
	}
}
