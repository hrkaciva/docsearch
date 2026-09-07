export function cosineSimilarity(a: number[], b: number[]) : number{
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for(let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        magnitudeA += a[i] * a[i];
        magnitudeB += b[i] * b[i];
    }

    const lengthA = Math.sqrt(magnitudeA);
    const lengthB = Math.sqrt(magnitudeB);
    return dotProduct / (lengthA * lengthB);
}