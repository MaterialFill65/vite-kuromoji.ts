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

import { expect, describe, it } from "vitest";
import DictionaryLoader from "../../src/loader/DictionaryLoader";
import type DynamicDictionaries from "../../src/dict/DynamicDictionaries";

const IPADIC_DIR = "dict/ipadic/";
const UNIDIC_DIR = "dict/unidic/";

describe("DictionaryLoader",() => {
    describe("ipadic", async () => {
        const loader = new DictionaryLoader(IPADIC_DIR);
        const dictionaries: DynamicDictionaries = await loader.load(); // target object

        it("Unknown dictionaries are loaded properly", () => {
            expect(dictionaries?.unknown_dictionary.lookup(" ")).to.deep.equal({
                class_id: 1,
                class_name: "SPACE",
                is_always_invoke: false,
                is_grouping: true,
                max_length: 0
            });
        });
        it("TokenInfoDictionary is loaded properly", () => {
            expect(dictionaries?.token_info_dictionary.getFeatures("0")).to.have.length.above(1);
        });
    });
    describe("unidic", async () => {
        const loader = new DictionaryLoader(UNIDIC_DIR);
        const dictionaries: DynamicDictionaries = await loader.load(); // target object

        it("Unknown dictionaries are loaded properly", () => {
            expect(dictionaries?.unknown_dictionary.lookup(" ")).to.deep.equal({
                class_id: 1,
                class_name: "SPACE",
                is_always_invoke: false,
                is_grouping: true,
                max_length: 0
            });
        });
        it("TokenInfoDictionary is loaded properly", () => {
            expect(dictionaries?.token_info_dictionary.getFeatures("0")).to.have.length.above(1);
        });
    });
});

describe("DictionaryLoader about loading", () => {
    it("could load directory path without suffix /", async () => {
        const loader = new DictionaryLoader("dict/ipadic"); // not have suffix /
        const dic = await loader.load()
        expect(dic).to.not.be.undefined;
    });
    it("couldn't load dictionary, then call with error", async () => {
        const loader = new DictionaryLoader("non-exist/dictionaries");
        try{
            await loader.load()
        }catch(e){
            expect(e).to.be.an.instanceof(Error);
        }
    });
});
