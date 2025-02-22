import { defineConfig } from "vite";
import { resolve } from "node:path";
import checker from 'vite-plugin-checker';
const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "build");
const publicDir = resolve(__dirname, "public");
const entryFile = resolve(__dirname, "src/kuromoji.ts")

export default defineConfig({
    resolve: {
        alias: {
            "@": root,
        },
    },
    publicDir,
    plugins: [
        checker({
            typescript: true
        })
    ],
    build: {
        outDir,
        sourcemap: 'inline',
        minify: true,
        reportCompressedSize: true,
        rollupOptions: {
            watch: {
                include: ["src/**", "vite.config.ts"],
                exclude: ["node_modules/**"],
            },
            output: {
                exports: 'default',
                entryFileNames: "kuromoji.js",
            }
        },
        lib: {
            entry: entryFile,
            name: "kuromoji",

            fileName: (format) => `kuromoji.${format}.js`,
        },
        commonjsOptions: {
            include: [/linked-dep/, /node_modules/],
        },
    },
});