import { Matcher } from "./src/fst/FST";
import kuromoji from "./src/kuromoji";
import { DoubleArray } from "./src/util/DoubleArray";

type Arrays =
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array;

const type = "unidic"

const DIC_DIR = `resources/${type}/`;
const connection_costs_file = `${DIC_DIR}matrix.def`;
const char_def_file = `${DIC_DIR}char.def`;
const unk_def_file = `${DIC_DIR}unk.def`;
const tid_dic_files = Array.from(Deno.readDirSync(DIC_DIR))
    .filter(entry => entry.isFile && entry.name.endsWith('.csv'))
    .map(entry => DIC_DIR + entry.name);

// 文字列を受け取り、行ごとの文字列 (0 個以上) を出力する
class TextLineStream extends TransformStream<string, string> {
    constructor() {
        let chunk = "";
        super({
            start() {
                chunk = "";
            },
            transform(text, controller) {
                // chunk には最後の改行以降の部分が入る
                chunk += text;
                const split = chunk.split("\n");

                for (const line of split.slice(0, -1)) {
                    controller.enqueue(line);
                }
                chunk = split[split.length - 1];
            },
            flush(controller) {
                // ストリームが閉じた際に残っているチャンクを出力する
                if (chunk !== "") {
                    controller.enqueue(chunk);
                }
            },
        });
    }
}
// Build token info dictionary
const builder = kuromoji.dictionaryBuilder();

const promises = [
    ...tid_dic_files.map(tid_dic_file => 
        new Promise<void>(async (resolve, reject) => {
            const { readable } = await Deno.open(tid_dic_file);
            const writableStream = new WritableStream<string>(
                {
                    write(chunk) {
                        builder.addTokenInfoDictionary(chunk);
                    },
                    close() {
                        console.log(`Finished reading ${tid_dic_file}`);
                        resolve()
                    },
                    abort(err) {
                        reject(err);
                    },
                }
            );
            readable
                .pipeThrough(new TextDecoderStream())
                .pipeThrough(new TextLineStream())
                .pipeTo(writableStream)
        })
    ),
    new Promise<void>(async (resolve, reject) => {
        const { readable } = await Deno.open(connection_costs_file);
        const writableStream = new WritableStream<string>(
            {
                write(chunk) {
                    builder.putCostMatrixLine(chunk);
                },
                close() {
                    console.log('Finished reading matrix.def');
                    resolve()
                },
                abort(err) {
                    reject(err);
                },
            }
        );
        readable
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new TextLineStream())
            .pipeTo(writableStream)
    }),
    new Promise<void>(async (resolve, reject) => {
        const { readable } = await Deno.open(char_def_file);
        const writableStream = new WritableStream<string>(
            {
                write(chunk) {
                    builder.putCharDefLine(chunk);
                },
                close() {
                    console.log('Finished reading char.def');
                    resolve()
                },
                abort(err) {
                    reject(err);
                },
            }
        );
        readable
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new TextLineStream())
            .pipeTo(writableStream)
    }),
    new Promise<void>(async (resolve, reject) => {
        const { readable } = await Deno.open(unk_def_file);
        const writableStream = new WritableStream<string>(
            {
                write(chunk) {
                    builder.putUnkDefLine(chunk);
                },
                close() {
                    console.log("Finished reading unk.def")
                    resolve()
                },
                abort(err) {
                    reject(err);
                },
            }
        );
        readable
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new TextLineStream())
            .pipeTo(writableStream)
    }),
]

await Promise.all(promises)
const dic = builder.buildAll();
async function writeCompressedFile(path: string, data: Arrays) {
    const cs = new CompressionStream('gzip');
    const compressed = new Response(data).body?.pipeThrough(cs);
    const result = await new Response(compressed).arrayBuffer();
    await Deno.writeFile(`${path}.gz`, new Uint8Array(result));
    console.log("Saved file:", `${path}.gz`)
}


writeCompressedFile(`dict/${type}/fst.dat`, (dic.word.fst as Matcher).getBuffer());
writeCompressedFile(`dict/${type}/base.dat`, (dic.word.trie as DoubleArray).bc.getBaseBuffer());
writeCompressedFile(`dict/${type}/check.dat`, (dic.word.trie as DoubleArray).bc.getCheckBuffer());
writeCompressedFile(`dict/${type}/tid.dat`, dic.dic.token_info_dictionary.dictionary.buffer);
writeCompressedFile(`dict/${type}/tid_pos.dat`, dic.dic.token_info_dictionary.pos_buffer.buffer);
writeCompressedFile(`dict/${type}/tid_map.dat`, dic.dic.token_info_dictionary.targetMapToBuffer());
writeCompressedFile(`dict/${type}/cc.dat`, dic.dic.connection_costs.buffer);
writeCompressedFile(`dict/${type}/unk.dat`, dic.dic.unknown_dictionary.dictionary.buffer);
writeCompressedFile(`dict/${type}/unk_pos.dat`, dic.dic.unknown_dictionary.pos_buffer.buffer);
writeCompressedFile(`dict/${type}/unk_map.dat`, dic.dic.unknown_dictionary.targetMapToBuffer());
writeCompressedFile(`dict/${type}/unk_char.dat`, dic.dic.unknown_dictionary.character_definition!.character_category_map);
writeCompressedFile(`dict/${type}/unk_compat.dat`, dic.dic.unknown_dictionary.character_definition!.compatible_category_map);
writeCompressedFile(`dict/${type}/unk_invoke.dat`, dic.dic.unknown_dictionary.character_definition!.invoke_definition_map!.toBuffer());
