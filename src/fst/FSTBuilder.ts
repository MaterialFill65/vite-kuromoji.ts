import { FST, State } from "./FST";

interface KeyValue {
	k: string;
	v: number;
}

export class FSTBuilder {
	private states: State[];
	private dictionary: FST;

	constructor() {
		this.states = [];
		this.dictionary = new FST();
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
	 * 単語と出力をFSTに追加します
	 */
	add(word: Uint8Array, output: Uint8Array): void {
		let current = this.getRoot();
		const wordLength = word.length;

		let next: State | null;
		for (let i = 0; i < wordLength; i++) {
			next = current.transition(word[i]);

			if (!next) {
				next = this.newState();
				current.setTransition(word[i], next);
			}

			current = next;
		}

		current.setFinal(true);
		current.stateOutput().add(output);
	}

	append(key: string, record: number) {
		const textEncoder = new TextEncoder()
		this.add(textEncoder.encode(key), textEncoder.encode(record.toString()));
		return this;
	}

	/**
	 * 文字列と出力のペアを一括で追加します
	 */
	addAll(entries: Array<[Uint8Array, Uint8Array]>): void {
		for (const [word, output] of entries) {
			this.add(word, output);
		}
	}

	/**
	 * ルート状態を取得します
	 */
	private getRoot(): State {
		if (this.states.length === 0) {
			return this.newState();
		}
		return this.states[0];
	}

	/**
	 * FSTを最適化して構築します
	 */
	build(keys: KeyValue[]): FST {
		// Convert key string to ArrayBuffer
		const textEncoder = new TextEncoder()
		const buff_keys = keys.map<[Uint8Array, Uint8Array]>((k: KeyValue) => {
			return [textEncoder.encode(k.k), textEncoder.encode(k.v.toString())]
		});
		this.addAll(buff_keys)

		// 末尾の状態から順番に同値な状態を統合
		for (let i = this.states.length - 1; i >= 0; i--) {
			const state = this.states[i];
			const equivalent = this.dictionary.member(state);

			if (equivalent) {
				// 同値な状態が存在する場合、それに置き換える
				this.replaceState(i, equivalent);
			} else {
				// 新しい状態として登録
				this.dictionary.insert(state);
			}
		}

		return this.dictionary;
	}

	/**
	 * 状態を置き換えます
	 */
	private replaceState(index: number, replacement: State): void {
		// index以前の状態について、遷移先を置き換える
		for (let i = 0; i < index; i++) {
			const state = this.states[i];
			for (const [char, trans] of Object.entries(state.transMap)) {
				if (trans.state === this.states[index]) {
					state.setTransition(Number(char), replacement);
				}
			}
		}
	}
}
