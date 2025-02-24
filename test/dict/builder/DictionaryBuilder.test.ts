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

import { readFileSync } from "node:fs";
import { expect, describe, it, beforeAll } from 'vitest'

import kuromoji from "../../../src/kuromoji";
import Tokenizer from "../../../src/Tokenizer";
import IpadicFormatter from "../../../src/util/IpadicFormatter";
import type DynamicDictionaries from "../../../src/dict/DynamicDictionaries";
import UnidicFormatter from "../../../src/util/UnidicFormater";
import type { Token } from "../../../src/util/Formatter";

const DIC_DIR = "test/resource/";
const ipadic_connection_costs_file = `${DIC_DIR}ipadic_matrix.def`;
const unidic_connection_costs_file = `${DIC_DIR}unidic_matrix.def`;
const char_def_file = `${DIC_DIR}char.def`;
const unk_def_file = `${DIC_DIR}unk.def`;
const ipadic_tid_dic_file = `${DIC_DIR}ipadic.csv`;
const unidic_tid_dic_file = `${DIC_DIR}unidic.csv`;

describe("DictionaryBuilder", () => {
    describe("ipadic", () => {
        let kuromoji_dic: DynamicDictionaries
        beforeAll(() => {
            // Build token info dictionary
            const builder = kuromoji.dictionaryBuilder();
            const tokenInfo = readFileSync(ipadic_tid_dic_file, "utf-8");
            tokenInfo.split("\n").map((line) => {
                builder.addTokenInfoDictionary(line);
            });

            // Build connection costs matrix
            const cc_text = readFileSync(ipadic_connection_costs_file, "utf-8");
            const cc_lines = cc_text.split("\n");
            cc_lines.map((line) => {
                builder.putCostMatrixLine(line);
            });

            // Build unknown dictionary
            const cd_text = readFileSync(char_def_file, "utf-8");
            const cd_lines = cd_text.split("\n");
            cd_lines.map((line) => {
                builder.putCharDefLine(line);
            });
            const unk_text = readFileSync(unk_def_file, "utf-8");
            const unk_lines = unk_text.split("\n");
            unk_lines.map((line) => {
                builder.putUnkDefLine(line);
            });

            kuromoji_dic = builder.build();
        })


        it("Dictionary not to be null", () => {
            expect(kuromoji_dic).not.to.be.null;
        });
        it("TokenInfoDictionary not to be null", () => {
            expect(kuromoji_dic?.token_info_dictionary).not.to.be.null;
        });
        it("TokenInfoDictionary", () => {
            // expect(kuromoji_dic.token_info_dictionary.getFeatures("1467000")).to.have.length.above(1);
            expect(kuromoji_dic?.token_info_dictionary.dictionary.buffer).to.have.length.above(1);
        });
        it("DoubleArray not to be null", () => {
            expect(kuromoji_dic?.word).not.to.be.null;
        });
        it("ConnectionCosts not to be null", () => {
            expect(kuromoji_dic?.connection_costs).not.to.be.null;
        });
        it("Tokenize simple test", () => {
            const tokenizer = new Tokenizer(kuromoji_dic!, new IpadicFormatter());
            const path = tokenizer.tokenize("すもももももももものうち");

            const expected_tokens: Token[] = [
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
                    pronunciation: "スモモ\r"
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
                    pronunciation: "モ\r"
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
                    pronunciation: "モモ\r"
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
                    pronunciation: "モ\r"
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
                    pronunciation: "モモ\r"
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
                    pronunciation: "ノ\r"
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
                    pronunciation: "ウチ\r"
                }
            ];

            expect(path).to.have.length(7);

            for (let i = 0; i < expected_tokens.length; i++) {
                const expected_token = expected_tokens[i];
                const target_token = path[i];
                for (const key in expected_token) {
                    expect(target_token).to.have.property(key, expected_token[key as keyof Token]);
                }
            }
        });
    });
    describe("unidic", () => {
        let kuromoji_dic: DynamicDictionaries
        beforeAll(() => {
            // Build token info dictionary
            const builder = kuromoji.dictionaryBuilder();
            const tokenInfo = readFileSync(unidic_tid_dic_file, "utf-8");
            tokenInfo.split("\n").map((line) => {
                builder.addTokenInfoDictionary(line);
            });

            // Build connection costs matrix
            const cc_text = readFileSync(unidic_connection_costs_file, "utf-8");
            const cc_lines = cc_text.split("\n");
            cc_lines.map((line) => {
                builder.putCostMatrixLine(line);
            });

            // Build unknown dictionary
            const cd_text = readFileSync(char_def_file, "utf-8");
            const cd_lines = cd_text.split("\n");
            cd_lines.map((line) => {
                builder.putCharDefLine(line);
            });
            const unk_text = readFileSync(unk_def_file, "utf-8");
            const unk_lines = unk_text.split("\n");
            unk_lines.map((line) => {
                builder.putUnkDefLine(line);
            });

            kuromoji_dic = builder.build(false);
        },
    10000000)


        it("Dictionary not to be null", () => {
            expect(kuromoji_dic).not.to.be.null;
        });
        it("TokenInfoDictionary not to be null", () => {
            expect(kuromoji_dic?.token_info_dictionary).not.to.be.null;
        });
        it("TokenInfoDictionary", () => {
            // expect(kuromoji_dic.token_info_dictionary.getFeatures("1467000")).to.have.length.above(1);
            expect(kuromoji_dic?.token_info_dictionary.dictionary.buffer).to.have.length.above(1);
        });
        it("WordSearch not to be null", () => {
            expect(kuromoji_dic?.word).not.to.be.null;
        });
        it("ConnectionCosts not to be null", () => {
            expect(kuromoji_dic?.connection_costs).not.to.be.null;
        });
        it("Tokenize simple test", () => {
            const tokenizer = new Tokenizer(kuromoji_dic!, new UnidicFormatter());
            const path = tokenizer.tokenize("すもももももももものうち");

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
                const expected_token = expected_tokens[i];
                const target_token = path[i];
                for (const key in expected_token) {
                    expect(target_token).to.have.property(key, (expected_token as any)[key]);
                }
            }
        });
    });
});