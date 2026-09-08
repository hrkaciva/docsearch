import {embedText} from "./embed";
import {Connection, Database, QueryResult} from "kuzu";

export async function vectorSearch(term:string): Promise<{path: string, distance: number}[]> {
    const db = new Database("./data/doksearch");
    const connection = new Connection(db);
    try {
        //convert the term to embedding
        const embedding = await embedText(term);
        // find the closest document based on the embedding
        const query = await connection.prepare(`CALL QUERY_VECTOR_INDEX('Document', 'document_embedding_vec', $embedding, $k) RETURN node.path AS path, distance ORDER BY distance ASC`);
        //put closest documents first
        const result = await connection.execute(query, {embedding:embedding, k:10});

        //return the results
        if (!(result instanceof QueryResult)) {
            throw new Error("Expected QueryResult");
        }
        const rows = await result.getAll();
        return rows.map((row) => ({path: String(row.path), distance: Number(row.distance)}));
    } finally {
        await connection.close();
        await db.close();
    }
}