export function chunkText(text: string, maxCharacters: number): string [] {
    if(maxCharacters <= 0) {
        throw new Error("maxCharacters must be greater than 0");
    }
    if(text.length === 0) {
        return [];
    }
   const chunks: string[] = [];
    let start = 0;

    while(start < text.length) {
        chunks.push(text.slice(start, start + maxCharacters));
        start += maxCharacters;
    }
    return chunks;
}