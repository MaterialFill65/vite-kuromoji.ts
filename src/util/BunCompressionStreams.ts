/**
 * Polyfill for DecompressionStream using Bun's synchronous decompression functions.
 */
class BunDecompressionStream extends TransformStream<Uint8Array, Uint8Array> {
    /**
     * Creates a new DecompressionStream for the given format.
     * @param format The compression format to use for decompression ('deflate', 'deflate-raw', or 'gzip').
     * @throws {TypeError} If the format is unsupported.
     */
    constructor(format: CompressionFormat) {
        if (!["deflate", "deflate-raw", "gzip"].includes(format)) {
            throw new TypeError(`Unsupported compression format: ${format}`);
        }
        let data: Uint8Array;
        super({
            transform(chunk) {
                if (!data) {
                    data = chunk;
                } else {
                    const newData = new Uint8Array(data.length + chunk.length);
                    newData.set(data);
                    newData.set(chunk, data.length);
                    data = newData;
                }
            },
            flush(controller) {
                try {
                    let decompressedBuffer: Uint8Array;
                    if (format === "gzip") {
                        decompressedBuffer = Bun.gunzipSync(data);
                    } else if (format === "deflate") {
                        decompressedBuffer = Bun.inflateSync(data);
                    } else if (format === "deflate-raw") {
                        // Use negative windowBits for raw deflate (no zlib header/footer)
                        decompressedBuffer = Bun.inflateSync(data, { windowBits: -15 }); // -15 is a common value for raw deflate
                    } else {
                        // Should not reach here as format is validated in constructor
                        controller.error(
                            new TypeError("Unsupported compression format (internal error)"),
                        );
                        return;
                    }
                    controller.enqueue(decompressedBuffer);
                } catch (error: any) {
                    // Catching 'any' for broader error capture, refine if Bun's errors are typed.
                    controller.error(
                        new TypeError(`Decompression failed for format '${format}'.`, {
                            cause: error,
                        }),
                    );
                    return;
                }
            },
        });
    }
}

export default BunDecompressionStream;