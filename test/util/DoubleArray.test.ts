import { expect, describe, it, beforeEach } from "vitest";
import DoubleArray, { builder as _builder, load } from "../../src/util/DoubleArray";

interface KeyValue {
    k: string;
    v: number;
}
describe("doublearray", function () {
    describe("contain", function () {
        var trie;  // target
        var dict = {
            "apple": 1,
            "ball": 2,
            "bear": 3,
            "bird": 4,
            "bison": 5,
            "black": 6,
            "blue": 7,
            "blur": 8,
            "cold": 10,
            "column": 11,
            "cow": 12
        }
        var words:KeyValue[] = []
        let key: keyof typeof dict
        for (key in dict) {
            words.push({ k: key, v: dict[key] })
        }
        it("Contain bird", function () {
            trie = _builder().build(words);
            expect(trie.contain("bird")).to.be.true;
        });
        it("Contain bison", function () {
            trie = _builder().build(words);
            expect(trie.contain("bison")).to.be.true;
        });
        it("Lookup bird", function () {
            trie = _builder().build(words);
            expect(trie.lookup("bird")).to.be.eql(dict["bird"]);
        });
        it("Lookup bison", function () {
            trie = _builder().build(words);
            expect(trie.lookup("bison")).to.be.eql(dict["bison"]);
        });
        it("Build", function () {
            trie = _builder(4).build(words);
            // trie.bc.
            expect(trie.lookup("bison")).to.be.eql(dict["bison"]);
        });
    });
    describe("load", function () {
        var trie: any;       // target
        var load_trie: any;  // target
        var words = [{ k: "apple", v: 1 }];  // test data
        beforeEach(()=>{
            // Build original
            const tmp_trie = _builder().build(words)
            trie = tmp_trie;

            // Load from original typed array
            var base_buffer = trie.bc.getBaseBuffer();
            var check_buffer = trie.bc.getCheckBuffer();
            load_trie = load(base_buffer, check_buffer);
        });
        it("Original and loaded tries lookup successfully", function () {
            expect(trie!.lookup("apple")).to.be.eql(words[0].v);
            expect(load_trie!.lookup("apple")).to.be.eql(words[0].v);
        });
        it("Original and loaded typed arrays are same", function () {
            expect(trie.bc.getBaseBuffer()).toStrictEqual(load_trie.bc.getBaseBuffer());
            expect(trie.bc.getCheckBuffer()).toStrictEqual(load_trie.bc.getCheckBuffer());
        });
    });
});