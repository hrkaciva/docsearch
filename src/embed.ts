
const extractorPromise = (async () => {
    const {pipeline} = await import("@huggingface/transformers");
    return pipeline("feature-extraction", "sentence-transformers/all-MiniLM-L6-v2");
})();

export async function embedText(text: string): Promise<number[]> {
    const extractor = await extractorPromise;
    const output = await extractor(text, {
        pooling: "mean",
        normalize: true,
    });
    const values = output.tolist() as number[][];
    return values[0];
}