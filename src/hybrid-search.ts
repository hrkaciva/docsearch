export function combineResults(keywordResults: { path: string, score: number }[], vectorResults: { path: string, distance: number }[]) {
    const combined = new Map<string, CombinedResult>();
    for(const [index, result] of keywordResults.entries()) {
        combined.set(result.path, {path: result.path, score: 1/(60+ index+1)});
    }
    for(const [index, result] of vectorResults.entries()) {
        const existing = combined.get(result.path);
        const vectorScore = 1/(60+ index+1);

        if(existing) {
            existing.score += vectorScore;
        } else {
            combined.set(result.path, {path: result.path, score: vectorScore});
        }
    }
    return [...combined.values()].sort((a, b) => b.score - a.score);
}

type CombinedResult = {
    path: string;
    score: number;
}