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

import CharacterDefinition from "../../src/dict/CharacterDefinition";
import InvokeDefinitionMap from "../../src/dict/InvokeDefinitionMap";
import CharacterDefinitionBuilder from "../../src/dict/builder/CharacterDefinitionBuilder";

import { readFileSync } from "node:fs";
import { expect, describe, it } from "vitest";

const DIC_DIR = "test/resource/";

describe("CharacterDefinition from char.def", () => {
    const cd_builder = new CharacterDefinitionBuilder();
    readFileSync(`${DIC_DIR}char.def`, "utf-8").split("\n").map((line) => {
        cd_builder.putLine(line);
    });
    const char_def = cd_builder.build();

    it("lookup by space, return SPACE class", () => {
        expect(char_def.lookup(" ")?.class_name).to.equal("SPACE");
    });
    it("lookup by 日, return KANJI class", () => {
        expect(char_def.lookup("日")?.class_name).to.equal("KANJI");
    });
    it("lookup by !, return SYMBOL class", () => {
        expect(char_def.lookup("!")?.class_name).to.equal("SYMBOL");
    });
    it("lookup by 1, return NUMERIC class", () => {
        expect(char_def.lookup("1")?.class_name).to.equal("NUMERIC");
    });
    it("lookup by A, return ALPHA class", () => {
        expect(char_def.lookup("A")?.class_name).to.equal("ALPHA");
    });
    it("lookup by あ, return HIRAGANA class", () => {
        expect(char_def.lookup("あ")?.class_name).to.equal("HIRAGANA");
    });
    it("lookup by ア, return KATAKANA class", () => {
        expect(char_def.lookup("ア")?.class_name).to.equal("KATAKANA");
    });
    it("lookup by 一, return KANJINUMERIC class", () => {
        expect(char_def.lookup("一")?.class_name).to.equal("KANJINUMERIC");
    });
    it("lookup by surrogate pair character, return DEFAULT class", () => {
        expect(char_def.lookup("𠮷")?.class_name).to.equal("DEFAULT");
    });

    it("lookup by 一, return KANJI class as compatible category", () => {
        expect(char_def.lookupCompatibleCategory("一")[0].class_name).to.equal("KANJI");
    });
    it("lookup by 0x4E00, return KANJINUMERIC class as compatible category", () => {
        expect(char_def.lookupCompatibleCategory(String.fromCharCode(0x3007))[0].class_name).to.equal("KANJINUMERIC");
    });

    it("SPACE class definition of INVOKE: false, GROUP: true, LENGTH: 0", () => {
        expect(char_def.lookup(" ")?.is_always_invoke).to.be.false;
        expect(char_def.lookup(" ")?.is_grouping).to.be.true;
        expect(char_def.lookup(" ")?.max_length).to.be.equal(0);
    });
    it("KANJI class definition of INVOKE: false, GROUP: false, LENGTH: 2", () => {
        expect(char_def.lookup("日")?.is_always_invoke).to.be.false;
        expect(char_def.lookup("日")?.is_grouping).to.be.false;
        expect(char_def.lookup("日")?.max_length).to.be.equal(2);
    });
    it("SYMBOL class definition of INVOKE: true, GROUP: true, LENGTH: 0", () => {
        expect(char_def.lookup("!")?.is_always_invoke).to.be.true;
        expect(char_def.lookup("!")?.is_grouping).to.be.true;
        expect(char_def.lookup("!")?.max_length).to.be.equal(0);
    });
    it("NUMERIC class definition of INVOKE: true, GROUP: true, LENGTH: 0", () => {
        expect(char_def.lookup("1")?.is_always_invoke).to.be.true;
        expect(char_def.lookup("1")?.is_grouping).to.be.true;
        expect(char_def.lookup("1")?.max_length).to.be.equal(0);
    });
    it("ALPHA class definition of INVOKE: true, GROUP: true, LENGTH: 0", () => {
        expect(char_def.lookup("A")?.is_always_invoke).to.be.true;
        expect(char_def.lookup("A")?.is_grouping).to.be.true;
        expect(char_def.lookup("A")?.max_length).to.be.equal(0);
    });
    it("HIRAGANA class definition of INVOKE: false, GROUP: true, LENGTH: 2", () => {
        expect(char_def.lookup("あ")?.is_always_invoke).to.be.false;
        expect(char_def.lookup("あ")?.is_grouping).to.be.true;
        expect(char_def.lookup("あ")?.max_length).to.be.equal(2);
    });
    it("KATAKANA class definition of INVOKE: true, GROUP: true, LENGTH: 2", () => {
        expect(char_def.lookup("ア")?.is_always_invoke).to.be.true;
        expect(char_def.lookup("ア")?.is_grouping).to.be.true;
        expect(char_def.lookup("ア")?.max_length).to.be.equal(2);
    });
    it("KANJINUMERIC class definition of INVOKE: true, GROUP: true, LENGTH: 0", () => {
        expect(char_def.lookup("一")?.is_always_invoke).to.be.true;
        expect(char_def.lookup("一")?.is_grouping).to.be.true;
        expect(char_def.lookup("一")?.max_length).to.be.equal(0);
    });
    it("Save and load", () => {
        const buffer = char_def.invoke_definition_map?.toBuffer();
        const invoke_def = InvokeDefinitionMap.load(buffer!);
        expect(invoke_def.getCharacterClass(0)).to.deep.equal({
            class_id: 0,
            class_name: "DEFAULT",
            is_always_invoke: false,
            is_grouping: true,
            max_length: 0
        });
        expect(invoke_def.getCharacterClass(10)).to.deep.equal({
            class_id: 10,
            class_name: 'CYRILLIC',
            is_always_invoke: true,
            is_grouping: true,
            max_length: 0
        });
    });
});
