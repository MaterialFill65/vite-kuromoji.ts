import { describe, it, expect } from 'vitest';
import { FSTBuilder } from '../../src/fst/FSTBuilder';
import { compileFST } from "../../src/fst/compileFST";
import Matcher from "../../src/fst/Matcher";
import DoubleArrayBuilder from '../../src/util/DoubleArray';

describe('FST tests', () => {
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
        const entries: { k: string, v: number }[] = [
            { k: 'a', v: 1 },
            { k: 'a', v: 1 },
            { k: 'b', v: 2 },
            { k: 'c', v: 3 },
        ];

        const fst = builder.build(entries);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        let [accepted, outputs] = matcher.run(textEncoder.encode('a'));
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('b'));
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('c'));
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('d'));
        expect(accepted).toBe(false);
        [accepted, outputs] = matcher.run(textEncoder.encode('aa'));
        expect(accepted).toBe(false);
    });

    it('should handle words with special characters', () => {
        const builder = new FSTBuilder();
        const textEncoder = new TextEncoder();
        const entries: { k: string, v: number }[] = [
            { k: 'こんにちは', v: 1 },
            { k: 'こんちゃ', v: 2 },
            { k: '感想', v: 3 },
        ];

        const fst = builder.build(entries);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        let [accepted, outputs] = matcher.run(textEncoder.encode('こんにちは'));
        outputs.has(textEncoder.encode("1"))
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('こんちゃ'));
        outputs.has(textEncoder.encode("2"))
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('感想'));
        outputs.has(textEncoder.encode("3"))
        expect(accepted).toBe(true);
        [accepted, outputs] = matcher.run(textEncoder.encode('こんちは'));
        expect(accepted).toBe(false);
    });

    it('should handle edge cases', () => {
        const builder = new FSTBuilder();
        const textEncoder = new TextEncoder();
        const entries: { k: string, v: number }[] = [
            { k: ' ', v: 2 },
            { k: '　', v: 3 },
            { k: '\n', v: 4 },
            { k: '\t', v: 5 },
            { k: '🎉', v: 6 },
            { k: '\u0000', v: 7 },
            { k: 'a'.repeat(10), v: 8 },
            { k: '漢字'.repeat(10), v: 9 }
        ];

        const fst = builder.build(entries);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        for (const entry of entries) {
            const [accepted, outputs] = matcher.run(textEncoder.encode(entry.k));
            const expected = textEncoder.encode(entry.v.toString());
            console.log("input:", entry.k)
            console.log("Expect:", [expected])
            console.log("Actual:", Array.from(outputs))
            expect(Array.from(outputs)).toStrictEqual([expected])
            expect(accepted).toBe(true);
        }

        const invalidInputs = [
            textEncoder.encode('\uD800'),  // Unpaired surrogate
            textEncoder.encode('\uDFFF'),  // Unpaired surrogate
            textEncoder.encode('漢字'.repeat(1001)),  // Very long string
            Buffer.from([0xFF, 0xFF, 0xFF]),  // Invalid UTF-8
        ];

        for (const input of invalidInputs) {
            const [accepted] = matcher.run(input);
            expect(accepted).toBe(false);
        }
    });

    it('should handle continuous case', () => {
        const builder = new FSTBuilder();
        const textEncoder = new TextEncoder();
        const entries: { k: string, v: number }[] = [
            { k: 'あ', v: 1 },
            { k: 'あい', v: 2 },
            { k: 'あいうえお', v: 4 },
        ];

        const fst = builder.build(entries);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        for (const entry of entries) {
            const [accepted, outputs] = matcher.run(textEncoder.encode(entry.k));
            const expected = textEncoder.encode(entry.v.toString());
            console.log("input:", entry.k)
            console.log("Expect:", [expected])
            console.log("Actual:", Array.from(outputs))
            expect(Array.from(outputs)).toStrictEqual([expected])
            expect(accepted).toBe(true);
        }

        const invalidInputs = [
            textEncoder.encode('\uD800'),  // Unpaired surrogate
            textEncoder.encode('\uDFFF'),  // Unpaired surrogate
            textEncoder.encode('漢字'.repeat(1001)),  // Very long string
            Buffer.from([0xFF, 0xFF, 0xFF]),  // Invalid UTF-8
        ];

        for (const input of invalidInputs) {
            const [accepted] = matcher.run(input);
            expect(accepted).toBe(false);
        }
    });

    it("lookup test",()=>{
        const builder = new FSTBuilder();
        const entries: { k: string, v: number }[] = [
            { k: 'こんにちは', v: 1 },
            { k: 'こんちゃ', v: 3 },
            { k: 'ばぁな', v: 4 },
            { k: 'ばなな', v: 5 },
        ];

        const fst = builder.build(entries);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        const result = matcher.lookup("こんにちは");
        expect(result).toBe(1)
        const result2 = matcher.lookup("こんちゃ");
        expect(result2).toBe(3)
        const result3 = matcher.lookup("ンゴゴゴゴ");
        expect(result3).toBe(-1)
    });

    it("commonPrefixSearch test", () => {
        const builder = new FSTBuilder();
        const entries: { k: string, v: number }[] = [
            { k: 'こんにちは', v: 1 },
            { k: 'こんちゃは', v: 3 },
            { k: 'ばぁな', v: 4 },
            { k: 'ばなな', v: 5 },
        ];

        const fst = builder.build(entries);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        const result = matcher.commonPrefixSearch("こんにちは");
        expect(result).toStrictEqual([
            { k: 'こんにちは', v: 1 }
        ])
        const result2 = matcher.commonPrefixSearch("こんちゃは");
        expect(result2).toStrictEqual([
            { k: 'こんちゃは', v: 3 }
        ])
        const result3 = matcher.commonPrefixSearch("ンゴゴゴゴ");
        expect(result3).toStrictEqual([

        ])
    });

    it("commonPrefixSearch edge cases", () => {
        const builder = new FSTBuilder();
        const entries: { k: string, v: number }[] = [
            { k: ' ', v: 1 }, // space
            { k: '　', v: 2 }, // full-width space
            { k: '\n', v: 3 }, // newline
            { k: '\t', v: 4 }, // tab
            { k: 'あ', v: 5 },
            { k: 'あい', v: 6 },
            { k: 'あいう', v: 7 },
            { k: '🎉', v: 8 }, // emoji
            { k: '🎉🎊', v: 9 }, // multiple emojis
            { k: '\u0000', v: 10 }, // null character
            { k: 'a'.repeat(100), v: 11 }, // very long string
            { k: '漢字'.repeat(50), v: 12 } // very long multibyte string
        ];

        const fst = builder.build(entries);
        const data = compileFST(fst)
        const matcher = new Matcher(data);

        // Test string with only spaces
        expect(matcher.commonPrefixSearch("   ")).toStrictEqual([{k: ' ', v: 1}]);

        // Test string with full-width spaces
        expect(matcher.commonPrefixSearch("　　　")).toStrictEqual([{k: '　', v: 2}]);

        // Test incremental matches
        const result = matcher.commonPrefixSearch("あいうえお");
        expect(result).toStrictEqual([
            {k: 'あ', v: 5},
            {k: 'あい', v: 6},
            {k: 'あいう', v: 7},
        ]);

        // Test emoji strings
        expect(matcher.commonPrefixSearch("🎉🎊🎈")).toStrictEqual([
            {k: '🎉', v: 8},
            {k: '🎉🎊', v: 9}
        ]);

        // Test with null characters
        expect(matcher.commonPrefixSearch("\u0000\u0000")).toStrictEqual([{k: '\u0000', v: 10}]);

        // Test very long input
        expect(matcher.commonPrefixSearch("a".repeat(2000))).toStrictEqual([{ k: 'a'.repeat(100), v: 11}]);

        // Test with invalid UTF-8 sequences
        expect(matcher.commonPrefixSearch("\uD800")).toStrictEqual([]); // Unpaired surrogate
        expect(matcher.commonPrefixSearch("\uDFFF")).toStrictEqual([]); // Unpaired surrogate

        // Test with mixed valid and invalid characters
        expect(matcher.commonPrefixSearch("あい\uD800うえお")).toStrictEqual([
            {k: 'あ', v: 5},
            {k: 'あい', v: 6}
        ]);

        // Test with control characters
        expect(matcher.commonPrefixSearch("\n\n\n")).toStrictEqual([{k: '\n', v: 3}]);
        expect(matcher.commonPrefixSearch("\t\t\t")).toStrictEqual([{k: '\t', v: 4}]);
    });
});
it("FST and DoubleArray should have same behavior as WordSearch", () => {
    const builder = new FSTBuilder();
    const entries: { k: string, v: number }[] = [
        { k: 'あ', v: 1 },
        { k: 'あい', v: 2 },
        { k: 'あいうえお', v: 3 },
        { k: 'あいうえお', v: 4 },
        { k: 'あいうえお', v: 5 },
        { k: 'あいうえお', v: 6 },
        { k: 'あいうえお', v: 7 },
        { k: 'あいうえおかきくけこ', v: 4 },
        { k: 'かき', v: 5 },
        { k: 'かきく', v: 6 },
        { k: 'かきくけこさしすせそ', v: 7 },
        { k: 'さしす', v: 8 },
        { k: 'さしすせそたちつてと', v: 9 },
        { k: 'た', v: 10 },
        { k: 'たちつ', v: 11 },
        { k: '漢字', v: 12 },
        { k: '漢字検索', v: 13 },
        { k: '漢字検索システム', v: 14 },
        { k: '🎉', v: 15 },
        { k: '🎉🎊', v: 16 },
        { k: '🎉🎊🎈', v: 17 },
        { k: ' ', v: 18 },
        { k: '\n', v: 19 },
        { k: '\t', v: 20 }
    ];

    const fst = builder.build(entries);
    const data = compileFST(fst);
    const fstMatcher = new Matcher(data);
    const daMatcher = new DoubleArrayBuilder().build(entries);

    // Test exact lookups
    for (const entry of entries) {
        expect(fstMatcher.lookup(entry.k)).toBe(daMatcher.lookup(entry.k));
    }

    // Test common prefix searches
    const testStrings = [
        'あいうえおか',
        'かきくけこ',
        'さしすせそ',
        'たちつてと',
        '漢字漢字',
        '🎉🎊',
        ''
    ];

    for (const str of testStrings) {
        const fstResults = fstMatcher.commonPrefixSearch(str);
        const daResults = daMatcher.commonPrefixSearch(str);
        expect(fstResults).toEqual(daResults);
    }

    // Test non-existent lookups 
    const nonExistentWords = [
        'xyz',
        'あいうえおかき',
        '漢字漢字漢字',
        '😊',
        ' ',
        '\n',
        '\t'
    ];

    for (const word of nonExistentWords) {
        expect(fstMatcher.lookup(word)).toBe(daMatcher.lookup(word));
    }
});

