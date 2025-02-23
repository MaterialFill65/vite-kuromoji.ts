import { describe, it, expect } from 'vitest';
import { FSTBuilder } from '../../src/fst/FSTBuilder';
import { compileFST, Matcher } from '../../src/fst/FST';

describe('FST', () => {
    it('should handle empty word list', () => {
        const builder = new FSTBuilder();
        const textEncoder = new TextEncoder();
        const fst = builder.build([]);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        let [accepted, outputs] = matcher.run(textEncoder.encode('anything'));
        expect(accepted).toBe(false);
    });

    it('should handle single character words', () => {
        const builder = new FSTBuilder();
        const textEncoder = new TextEncoder();
        const entries: [Uint8Array, Uint8Array][] = [
            [textEncoder.encode('a'), new Uint8Array([1])],
            [textEncoder.encode('a'), new Uint8Array([1])],
            [textEncoder.encode('b'), new Uint8Array([3])],
            [textEncoder.encode('c'), new Uint8Array([4])]
        ];
        builder.addAll(entries);
        const fst = builder.build([]);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        let [accepted, outputs] = matcher.run(textEncoder.encode('a'));
        console.log(outputs)
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('b'));
        console.log(outputs)
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('c'));
        console.log(outputs)
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('d'));
        console.log(outputs)
        expect(accepted).toBe(false);
        [accepted, outputs] = matcher.run(textEncoder.encode('aa'));
        expect(accepted).toBe(false);
    });

    it('should handle words with special characters', () => {
        const builder = new FSTBuilder();
        const textEncoder = new TextEncoder();
        const entries: [Uint8Array, Uint8Array][] = [
            [textEncoder.encode('こんちゃ'), new Uint8Array([2])],
            [textEncoder.encode('こんにちは'), new Uint8Array([1])],
            [textEncoder.encode('感想'), new Uint8Array([3])]
        ];
        builder.addAll(entries);
        const fst = builder.build([]);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        let [accepted, outputs] = matcher.run(textEncoder.encode('こんにちは'));
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('こんちゃ'));
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('感想'));
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('こんちは'));
        expect(accepted).toBe(false);
    });
});
