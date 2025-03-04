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
import Tokenizer, { exDF } from "../src/Tokenizer.js";
import { Token } from "../src/util/Formatter";

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
        const path = tokenizer.tokenizeSync("すもももももももものうち");
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
        const path = tokenizer.tokenizeSync("となりのトトロ");
        expect(path).to.have.length(3);
    });
    it("研究 is not split", () => {
        const path = tokenizer.tokenizeSync("研究");
        expect(path).to.have.length(1);
    });
    it("Blank input", () => {
        const path = tokenizer.tokenizeSync("");
        expect(path).to.have.length(0);
    });
    it("Sentence include UTF-16 surrogate pair", () => {
        const path = tokenizer.tokenizeSync("𠮷野屋");
        expect(path).to.have.length(3);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
        expect(path[2].word_position).to.eql(3);
    });
    it("Sentence include punctuation あ、あ。あ、あ。 returns correct positions", () => {
        const path = tokenizer.tokenizeSync("あ、あ。あ、あ。");
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
        tokenizer = await kuromoji.build({ dicPath: { "base": UNIDIC_DIR }, dicType: "UniDic" });
        expect(tokenizer).to.be.a("object");
    }, 100000000);

    it("Sentence すもももももももものうち is tokenized properly", () => {
        const path = tokenizer.tokenizeSync("すもももももももものうち");
        const expected_tokens = [
            {
                word_type: "KNOWN",
                word_position: 1,
                surface_form: "すもも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "李",
                reading: "スモモ",
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
            },
            {
                word_type: "KNOWN",
                word_position: 5,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
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
            },
            {
                word_type: "KNOWN",
                word_position: 8,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
            },
            {
                word_type: "KNOWN",
                word_position: 10,
                surface_form: "の",
                pos: "助詞",
                pos_detail_1: "格助詞",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "の",
                reading: "ノ",
            },
            {
                word_type: "KNOWN",
                word_position: 11,
                surface_form: "うち",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "副詞可能",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "うち",
                reading: "ウチ",
            }
        ];
        console.log(path)
        expect(path).to.have.length(7);

        for (let i = 0; i < expected_tokens.length; i++) {
            const expected_token: any = expected_tokens[i];
            const target_token: any = path[i];
            for (const key in expected_token) {
                expect(target_token).to.have.property(key, expected_token[key]);
            }
        }
    });
    it("Sentence include unknown words 借りぐらしのアリエッティ are tokenized properly", () => {
        const path = tokenizer.tokenizeSync("借りぐらしのアリエッティ");
        expect(path).to.have.length(4);
    });
    it("研究 is not split", async () => {
        const path = await tokenizer.tokenize("研究");
        expect(path).to.have.length(1);
    });
    it("Blank input", () => {
        const path = tokenizer.tokenizeSync("");
        expect(path).to.have.length(0);
    });
    it("Sentence include UTF-16 surrogate pair", () => {
        const path = tokenizer.tokenizeSync("𠮷野屋");
        expect(path).to.have.length(2);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
    });
    it("Sentence include punctuation あ、あ。あ、あ。 returns correct positions", () => {
        const path = tokenizer.tokenizeSync("あ、あ。あ、あ。");
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

describe("Tokenizer for UniDic with FST", async () => {
    let tokenizer: Tokenizer
    beforeAll(async () => {
        tokenizer = await kuromoji.build({ dicPath: { "base": UNIDIC_DIR, "word": { "type": "FST", "base": "fst.dat.gz" } }, dicType: "UniDic" });
        expect(tokenizer).to.be.a("object");
    }, 100000000);

    it("Sentence すもももももももものうち is tokenized properly", () => {
        const path = tokenizer.tokenizeSync("すもももももももものうち");
        const expected_tokens = [
            {
                word_type: "KNOWN",
                word_position: 1,
                surface_form: "すもも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "李",
                reading: "スモモ",
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
            },
            {
                word_type: "KNOWN",
                word_position: 5,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
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
            },
            {
                word_type: "KNOWN",
                word_position: 8,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
            },
            {
                word_type: "KNOWN",
                word_position: 10,
                surface_form: "の",
                pos: "助詞",
                pos_detail_1: "格助詞",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "の",
                reading: "ノ",
            },
            {
                word_type: "KNOWN",
                word_position: 11,
                surface_form: "うち",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "副詞可能",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "うち",
                reading: "ウチ",
            }
        ];
        console.log(path)
        expect(path).to.have.length(7);

        for (let i = 0; i < expected_tokens.length; i++) {
            const expected_token: any = expected_tokens[i];
            const target_token: any = path[i];
            for (const key in expected_token) {
                expect(target_token).to.have.property(key, expected_token[key]);
            }
        }
    });
    it("Sentence include unknown words 借りぐらしのアリエッティ are tokenized properly", () => {
        const path = tokenizer.tokenizeSync("借りぐらしのアリエッティ");
        expect(path).to.have.length(4);
    });
    it("研究 is not split", async () => {
        const path = tokenizer.tokenizeSync("研究");
        expect(path).to.have.length(1);
    });
    it("Blank input", () => {
        const path = tokenizer.tokenizeSync("");
        expect(path).to.have.length(0);
    });
    it("Sentence include UTF-16 surrogate pair", () => {
        const path = tokenizer.tokenizeSync("𠮷野屋");
        expect(path).to.have.length(2);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
    });
    it("Sentence include punctuation あ、あ。あ、あ。 returns correct positions", () => {
        const path = tokenizer.tokenizeSync("あ、あ。あ、あ。");
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

    it("StreamTest", async () => {
        const stream = tokenizer.getTokenizeStream<{ id: number }>();
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
        const input = "すもももももももものうち";
        const count = 100
        const startTime = performance.now();
        const endTime: number = await new Promise<number>(async (resolve) => {

            const writer = stream.writable.getWriter();
            const output = new WritableStream<exDF<Token[], { id: number; }>>({
                write: (data) => {
                    if (data.flag.id >= count) {
                        resolve(performance.now());
                    }
                }
            });
            stream.readable.pipeTo(output);
            for (let i = 1; i <= count; i++) {
                await writer.write({ content: input, flag: { id: i } });
            }
            await writer.close();
        });

        const totalTime = endTime - startTime;
        const tokensPerSecond = (count * expected_tokens.length) / (totalTime / 1000);
        console.log(`Processed ${count} sentences (${count * expected_tokens.length} tokens) in ${totalTime}ms`);
        console.log(`Performance: ${tokensPerSecond.toFixed(2)} tokens/second`);
        expect(tokensPerSecond).to.be.greaterThan(0);
    },{
        "timeout": 20000
    });
});

describe("Tokenizer async tokenize method test", () => {
    let tokenizer: Tokenizer;
    beforeAll(async () => {
        tokenizer = await kuromoji.build({ dicPath: { "base": UNIDIC_DIR }, dicType: "UniDic" });
        expect(tokenizer).to.be.a("object");
    });

    it("Sentence すもももももももものうち is tokenized properly", async () => {
        const path = await tokenizer.tokenize("すもももももももものうち");
        const expected_tokens = [
            {
                word_type: "KNOWN",
                word_position: 1,
                surface_form: "すもも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "李",
                reading: "スモモ",
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
            },
            {
                word_type: "KNOWN",
                word_position: 5,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
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
            },
            {
                word_type: "KNOWN",
                word_position: 8,
                surface_form: "もも",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "一般",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "もも",
                reading: "モモ",
            },
            {
                word_type: "KNOWN",
                word_position: 10,
                surface_form: "の",
                pos: "助詞",
                pos_detail_1: "格助詞",
                pos_detail_2: "*",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "の",
                reading: "ノ",
            },
            {
                word_type: "KNOWN",
                word_position: 11,
                surface_form: "うち",
                pos: "名詞",
                pos_detail_1: "普通名詞",
                pos_detail_2: "副詞可能",
                pos_detail_3: "*",
                conjugated_type: "*",
                conjugated_form: "*",
                basic_form: "うち",
                reading: "ウチ",
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

    it("Should throw no Error", async () => {
        await tokenizer.tokenize("すもももももももものうち");
        await tokenizer.tokenize("こんにちは");
        await tokenizer.tokenize("やぁはっろー");
        await tokenizer.tokenize("sjisjodajk");
        await tokenizer.tokenize("ndjbaいｂｈぶobuhaohxniuabsxpaｋ０いｓｑｌｄいｂｈぶobuhaohxniuabsxpaｋ０いｓｑｌｄ");
        await tokenizer.tokenize("ｄみんｄじｑんｄｗｑｓｑｄみんｄじｑんｄｗｑｓｑ");
        await tokenizer.tokenize("すももももももももいえおｗｆんうぃくぉｈｊりうｋぃぎえｘｒoheirのうち");
        await tokenizer.tokenize("frekfopkoifkewpodlcxwd");
        await tokenizer.tokenize("@[//[@/[e/@;3.d@s;.d:]q/:3@\:@/w@;d@w");
        await tokenizer.tokenize("すももももももも\\\u212819ものうち");
        await tokenizer.tokenize("すもももももももも\nのうち");
    })

    it("Sentence include unknown words となりのトトロ are tokenized properly", async () => {
        const path = await tokenizer.tokenize("となりのトトロ");
        console.log(path)
        expect(path).to.have.length(3);
    });

    it("研究 is not split", async () => {
        const path = await tokenizer.tokenize("研究");
        expect(path).to.have.length(1);
        console.log(path)
    });

    it("Blank input", async () => {
        const path = await tokenizer.tokenize("");
        expect(path).to.have.length(0);
    });

    it("Sentence include UTF-16 surrogate pair", async () => {
        const path = await tokenizer.tokenize("𠮷野屋");
        expect(path).to.have.length(2);
        expect(path[0].word_position).to.eql(1);
        expect(path[1].word_position).to.eql(2);
    });

    it("Sentence include punctuation あ、あ。あ、あ。 returns correct positions", async () => {
        const path = await tokenizer.tokenize("あ、あ。あ、あ。");
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

    it("StreamTest", async () => {
        const stream = tokenizer.getTokenizeStream<{id: number}>();
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
        const input = "すもももももももものうち";
        const count = 1000
        const startTime = performance.now();
        const endTime: number = await new Promise<number>(async (resolve) => {

            const writer = stream.writable.getWriter();
            const output = new WritableStream<exDF<Token[], { id: number; }>>({
                write: (data) => {
                    if (data.flag.id >= count) {
                        resolve(performance.now());
                    }
                }
            });
            stream.readable.pipeTo(output);
            for (let i = 1; i <= count; i++) {
                await writer.write({content: input, flag:{id: i}});
            }
            await writer.close();
        });

        const totalTime = endTime - startTime;
        const tokensPerSecond = (count * expected_tokens.length) / (totalTime / 1000);
        console.log(`Processed ${count} sentences (${count * expected_tokens.length} tokens) in ${totalTime}ms`);
        console.log(`Performance: ${tokensPerSecond.toFixed(2)} tokens/second`);
        expect(tokensPerSecond).to.be.greaterThan(0);
    });
});
