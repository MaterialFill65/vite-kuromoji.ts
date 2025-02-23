/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it, beforeAll } from "vitest";
import kuromoji from "../src/kuromoji";  // Not to be browserifiy-ed
import Tokenizer from "../src/Tokenizer.js";

const IPADIC_DIR = "dict/ipadic";
const UNIDIC_DIR = "dict/unidic";

describe("Tokenizer static method test", () => {
    it("splitByPunctuation", () => {
        expect(Tokenizer.splitByPunctuation("すもももももももものうち"))
            .to.deep.equal(["すもももももももものうち"]);
    });
    it("splitByPunctuation", () => {
        expect(Tokenizer.splitByPunctuation("、"))
            .to.deep.equal(["、"]);
    });
    it("splitByPunctuation", () => {
        expect(Tokenizer.splitByPunctuation("。"))
            .to.deep.equal(["。"]);
    });
    it("splitByPunctuation", () => {
        expect(Tokenizer.splitByPunctuation("すもも、も、もも。もも、も、もも。"))
            .to.deep.equal(["すもも、", "も、", "もも。", "もも、", "も、", "もも。"]);
    });
    it("splitByPunctuation", () => {
        expect(Tokenizer.splitByPunctuation("、𠮷野屋。漢字。"))
            .to.deep.equal(["、", "𠮷野屋。", "漢字。"]);
    });
});

describe("Tokenizer for IPADic", async () => {
    let tokenizer: Tokenizer
    beforeAll(async () => {
        tokenizer = await kuromoji.build({ dicPath: IPADIC_DIR });
        expect(tokenizer).to.be.a("object");
    });

    it("Sentence すもももももももものうち is tokenized properly", () => {
        const path = tokenizer.tokenize("すもももももももものうち");
        const expected_tokens = [
            {
                word_type: "KNOWN",
                word_position: 1,
                surface_form: "すもも",
                pos: "名詞",
                pos_detail_1: "一般",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "すもも",
                reading: "スモモ",
                pronunciation: "スモモ"
            },
            {
                word_type: "KNOWN",
                word_position: 4,
                surface_form: "も",
                pos: "助詞",
                pos_detail_1: "係助詞",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "も",
                reading: "モ",
                pronunciation: "モ"
            },
            {
                word_type: "KNOWN",
                word_position: 5,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "一般",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
                pronunciation: "モモ"
            },
            {
                word_type: "KNOWN",
                word_position: 7,
                surface_form: "も",
                pos: "助詞",
                pos_detail_1: "係助詞",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "も",
                reading: "モ",
                pronunciation: "モ"
            },
            {
                word_type: "KNOWN",
                word_position: 8,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "一般",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
                pronunciation: "モモ"
            },
            {
                word_type: "KNOWN",
                word_position: 10,
                surface_form: "の",
                pos: "助詞",
                pos_detail_1: "連体化",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "の",
                reading: "ノ",
                pronunciation: "ノ"
            },
            {
                word_type: "KNOWN",
                word_position: 11,
                surface_form: "うち",
                pos: "名詞",
                pos_detail_1: "非自立",
                pos_detail_2: "副詞可能",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "うち",
                reading: "ウチ",
                pronunciation: "ウチ"
            }
        ];
        expect(path).to.have.length(7);

        for (let i = 0; i < expected_tokens.length; i++) {
            const expected_token: any = expected_tokens[i];
            const target_token: any = path[i];
            for (const key in expected_token) {
                expect(target_token).to.have.property(key, expected_token[key]);
            }
        }
    });
    it("Sentence include unknown words となりのトトロ are tokenized properly", () => {
        const path = tokenizer.tokenize("となりのトトロ");
        expect(path).to.have.length(3);
    });
    it("研究 is not split", () => {
        const path = tokenizer.tokenize("研究");
        expect(path).to.have.length(1);
    });
    it("Blank input", () => {
        const path = tokenizer.tokenize("");
        expect(path).to.have.length(0);
    });
    it("Sentence include UTF-16 surrogate pair", () => {
        const path = tokenizer.tokenize("𠮷野屋");
        expect(path).to.have.length(3);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
        expect(path[2].word_position).to.eql(3);
    });
    it("Sentence include punctuation あ、あ。あ、あ。 returns correct positions", () => {
        const path = tokenizer.tokenize("あ、あ。あ、あ。");
        expect(path).to.have.length(8);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
        expect(path[2].word_position).to.eql(3);
        expect(path[3].word_position).to.eql(4);
        expect(path[4].word_position).to.eql(5);
        expect(path[5].word_position).to.eql(6);
        expect(path[6].word_position).to.eql(7);
        expect(path[7].word_position).to.eql(8);
    });
});

describe("Tokenizer for UniDic", async () => {
    let tokenizer: Tokenizer
    beforeAll(async () => {
        tokenizer = await kuromoji.build({ dicPath: UNIDIC_DIR, dicType: "UniDic" });
        expect(tokenizer).to.be.a("object");
    });

    it("Sentence すもももももももものうち is tokenized properly", () => {
        const path = tokenizer.tokenize("すもももももももものうち");
        const expected_tokens = [
            {
                word_type: 'KNOWN',
                word_position: 1,
                surface_form: 'すもももももも',
                pos: '名詞',
                pos_detail_1: '固有名詞',
                pos_detail_2: '一般',
                pos_detail_3: '*',
                conjugated_type: '*',
                conjugated_form: '*',
                basic_form: 'すもももももも',
                reading: 'スモモモモモモ'
            }, 
            {
            word_type: 'KNOWN',
            word_position: 8,
            surface_form: 'もも',
            pos: '名詞',
            pos_detail_1: '普通名詞',
            pos_detail_2: '一般',
            pos_detail_3: '*',
            conjugated_type: '*',
            conjugated_form: '*',
            basic_form: 'もも',
            reading: 'モモ'
        },
        {
            word_type: 'KNOWN',
            word_position: 10,
            surface_form: 'の',
            pos: '助詞',
            pos_detail_1: '格助詞',
            pos_detail_2: '*',
            pos_detail_3: '*',
            conjugated_type: '*',
            conjugated_form: '*',
            basic_form: 'の',
            reading: 'ノ'
        },
        {
            word_type: 'KNOWN',
            word_position: 11,
            surface_form: 'うち',
            pos: '名詞',
            pos_detail_1: '普通名詞',
            pos_detail_2: '副詞可能',
            pos_detail_3: '*',
            conjugated_type: '*',
            conjugated_form: '*',
            basic_form: 'うち',
            reading: 'ウチ'
        }
        ];
        console.log(path)
        expect(path).to.have.length(4);

        for (let i = 0; i < expected_tokens.length; i++) {
            const expected_token: any = expected_tokens[i];
            const target_token: any = path[i];
            for (const key in expected_token) {
                expect(target_token).to.have.property(key, expected_token[key]);
            }
        }
    });
    it("Sentence include unknown words 借りぐらしのアリエッティ are tokenized properly", () => {
        const path = tokenizer.tokenize("借りぐらしのアリエッティ");
        expect(path).to.have.length(4);
    });
    it("研究 is not split", () => {
        const path = tokenizer.tokenize("研究");
        expect(path).to.have.length(1);
    });
    it("Blank input", () => {
        const path = tokenizer.tokenize("");
        expect(path).to.have.length(0);
    });
    it("Sentence include UTF-16 surrogate pair", () => {
        const path = tokenizer.tokenize("𠮷野屋");
        expect(path).to.have.length(2);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
    });
    it("Sentence include punctuation あ、あ。あ、あ。 returns correct positions", () => {
        const path = tokenizer.tokenize("あ、あ。あ、あ。");
        expect(path).to.have.length(8);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
        expect(path[2].word_position).to.eql(3);
        expect(path[3].word_position).to.eql(4);
        expect(path[4].word_position).to.eql(5);
        expect(path[5].word_position).to.eql(6);
        expect(path[6].word_position).to.eql(7);
        expect(path[7].word_position).to.eql(8);
    });
});
