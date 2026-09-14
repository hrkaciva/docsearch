export function combineResults(keywordResults: KeywordResult[], vectorResults: { path: string, distance: number }[]) {
    const combined = new Map<string, CombinedResult>();
    for(const [index, result] of keywordResults.entries()) {
        combined.set(result.chunkId ?? result.path, {
            path: result.path,
            score: 1/(60+ index+1),
            ...(result.chunkId !== undefined && {
                chunkId: result.chunkId,
                position: result.position,
                content: result.content,
            }),
        });
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
    chunkId?: string;
    position?: number;
    content?: string;
};

type KeywordResult = {
    path: string;
    chunkId?: string;
    position?: number;
    content?: string;
    score: number;
}
