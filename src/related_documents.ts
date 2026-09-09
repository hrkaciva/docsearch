import {Connection, Database, QueryResult} from "kuzu";

export async function findRelatedDocuments(documentPath: string): Promise<{path: string, sharedTopic: string}[]> {
    const db = new Database("./data/doksearch");
    const connection = new Connection(db);
    try {
        const relatedDocuments = await connection.prepare(`
        MATCH (source:Document)-[:ABOUT]->(topic:Topic)<-[:ABOUT]-(related:Document) 
            WHERE source.path=$path AND source.path <> related.path
            RETURN related.path AS path, topic.name AS sharedTopic
        `)
        const relatedResult = await connection.execute(relatedDocuments, {path: documentPath});
        if (relatedResult instanceof QueryResult) {
            const rows = await relatedResult.getAll();
            return rows.map((row) => ({path: String(row.path), sharedTopic: String(row.sharedTopic)}));
        }
        return [];
    }
    finally {
        await connection.close();
        await db.close();
    }
}
