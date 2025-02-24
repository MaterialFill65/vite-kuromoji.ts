vite-kuromoji.ts
===========
TypeScript implementation of Japanese morphological analyzer.<br>
[kuromoji.js](https://github.com/takuyaa/kuromoji.js) is a pure JavaScript porting of [Kuromoji](https://www.atilika.com/ja/kuromoji/).
This is a pure TypeScript porting of [kuromoji.js](https://github.com/takuyaa/kuromoji.js)

You can see how vite-kuromoji.ts works in ~~[demo site](https://materialfill65.github.io/vite-kuromoji.ts/demo/tokenize.html)~~.<br>
Okay. I got it. Github Pages seems to deliver .ts scripts as a video fragment. Therefore it doesn't work.<br>
You can see how vite-kuromoji.ts works by running following commands.
```sh
git clone https://github.com/materialfill65/vite-kuromoji.ts
cd vite-kuromoji.ts
pnpm i
pnpm run vite dev
```
Then open http://localhost:5173/demo/tokenize.html 

Key Feature
-----------
- Written in Typescript
- UniDic(SudachiDict) compatibility
- Blazing fast dictionary building (only Deno avaliable)
- Cross platform compatibility (Node.js, Deno, Bun, Browser)
- Prefix Search with Finite State Transducer(Minimal Acyclic Subsequential Transducer)
  base.dat.gz (4.89MB) & check.dat.gz (4.08MB) -> fst.dat.gz (2.66MB)
Directory
---------

Directory tree is as follows:

    build/
      kuromoji.js -- JavaScript file for browser (vited)
    demo/         -- Demo
    dict/         -- Dictionaries for tokenizer (gzipped)
    example/      -- Examples to use in Node.js
    src/          -- JavaScript source
    test/         -- Unit test

Usage
-----

You can tokenize sentences with only 5 lines of code.
If you need working examples, you can see the files under the demo or example directory.
## Install

### Node.js
Install with npm package manager:
```sh
npm install git+
```
Install with pnpm package manager:
```sh
pnpm install git+https://github.com/materialfill65/vite-kuromoji.ts.git
```
Install with pnpm package manager:
```sh
yarn add git+https://github.com/materialfill65/vite-kuromoji.ts.git
```
### Bun
```sh
bun install git+https://github.com/materialfill65/vite-kuromoji.ts.git
```

## Run
Load this library as follows:
```ts
// Node.js
var kuromoji = require("vite-kuromoji.ts");
// Deno
import kuromoji from "https://raw.githubusercontent.com/materialfill65/vite-kuromoji.ts/master/src/kuromoji.ts";
// Bun
import kuromoji from "vite-kuromoji.ts";
```
You can prepare tokenizer like this:
```ts
const tokenizer = await kuromoji.builder({ dicPath: "path/to/dictionary/dir/" }).build();

const line = "すもももももももものうち";
const path = tokenizer.tokenize(text);
console.log(path);
```
API
---

The function tokenize() returns an JSON array like this:
```js
[ {
  word_id: 509800,          // 辞書内での単語ID
  word_type: 'KNOWN',       // 単語タイプ(辞書に登録されている単語ならKNOWN, 未知語ならUNKNOWN)
  word_position: 1,         // 単語の開始位置
  surface_form: '黒文字',    // 表層形
  pos: '名詞',               // 品詞
  pos_detail_1: '一般',      // 品詞細分類1
  pos_detail_2: '*',        // 品詞細分類2
  pos_detail_3: '*',        // 品詞細分類3
  conjugated_type: '*',     // 活用型
  conjugated_form: '*',     // 活用形
  basic_form: '黒文字',      // 基本形
  reading: 'クロモジ',       // 読み
  pronunciation: 'クロモジ'  // 発音
} ]
```

(This is defined in src/util/Formatter.js)
