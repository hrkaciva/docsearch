import {Connection, Database, QueryResult} from "kuzu";

export async function search(term: string): Promise<SearchResult[]> {
    //create DB and connection
    const db = new Database("./data/doksearch");
    const connection = new Connection(db);
    try {
        //prepare and execute the existing query
        const query = await connection.prepare(`
            CALL QUERY_FTS_INDEX('Chunk', 'chunk_content_fts', $term, top := 10)
            RETURN node.id AS chunkId, node.position AS position, node.content AS content, score
            ORDER BY score DESC
        `);
        const result = await connection.execute(
            query, {term: term}
        );

        //return the results
        if (!(result instanceof QueryResult)) {
            throw new Error("Expected QueryResult");
        }
        const rows = await result.getAll();
        const parentQuery = await connection.prepare(`
            MATCH (d:Document)-[:CONTAINS]->(c:Chunk {id: $chunkId})
            RETURN d.path AS path
        `);

        const searchResults: SearchResult[] = [];
        for (const row of rows) {
            const parentResult = await connection.execute(parentQuery, {
                chunkId: String(row.chunkId),
            });
            if (!(parentResult instanceof QueryResult)) {
                throw new Error("Expected QueryResult");
            }
            const parents = await parentResult.getAll();
            if (parents.length === 0) {
                continue;
            }
            searchResults.push({
                path: String(parents[0].path),
                chunkId: String(row.chunkId),
                position: Number(row.position),
                content: String(row.content),
                score: Number(row.score),
            });
        }
        return searchResults;
    }
    finally {
        await connection.close();
        await db.close();
    }
}

type SearchResult = {
    path: string;
    chunkId: string;
    position: number;
    content: string;
    score: number;
};
