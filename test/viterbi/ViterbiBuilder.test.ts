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
import ViterbiBuilder from "../../src/viterbi/ViterbiBuilder";

const IPADIC_DIR = "dict/ipadic/";
const UNIDIC_DIR = "dict/unidic/";

describe("ViterbiBuilder",async () => {
    
    const loader = new DictionaryLoader(IPADIC_DIR);
    const dic = await loader.load();
    const viterbi_builder: ViterbiBuilder = new ViterbiBuilder(dic);

    it("IPADIC Unknown word", () => {
        // lattice to have "ト", "トト", "トトロ"
        const lattice = viterbi_builder?.build("トトロ");
        for (let i = 1; i < lattice.eos_pos; i++) {
            const nodes = lattice.nodes_end_at[i];
            if (nodes == null) {
                continue;
            }
            expect(nodes.map((node) => node.surface_form)).to.include("トトロ".slice(0, i));
        }
    });
    const loader2 = new DictionaryLoader(UNIDIC_DIR);
    const dic2 =await loader2.load();
    const viterbi_builder2: ViterbiBuilder = new ViterbiBuilder(dic2);
    it("UNIDIC Unknown word", () => {
        // lattice to have "ト", "トト", "トトロ"
        const lattice = viterbi_builder2?.build("トトロ");
        for (let i = 1; i < lattice.eos_pos; i++) {
            const nodes = lattice.nodes_end_at[i];
            if (nodes == null) {
                continue;
            }
            expect(nodes.map((node) => node.surface_form)).to.include("トトロ".slice(0, i));
        }
    });
});
