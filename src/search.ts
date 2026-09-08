import {Connection, Database, QueryResult} from "kuzu";

export async function search(term: string) : Promise<{path: string, score: number}[]> {
    //create DB and connection
    const db = new Database("./data/doksearch");
    const connection = new Connection(db);
    try {
        //prepare and execute the existing query
        const query = await connection.prepare(`CALL QUERY_FTS_INDEX('Document', 'document_content_fts', $term, top := 10) RETURN node.path AS path, score ORDER BY score DESC`);
        const result = await connection.execute(
            query, {term: term}
        );

        //return the results
        if (!(result instanceof QueryResult)) {
            throw new Error("Expected QueryResult");
        }
        const rows = await result.getAll();
        return rows.map((row) => ({path: String(row.path), score: Number(row.score)}));
    }
    finally {
        await connection.close();
        await db.close();
    }
}
