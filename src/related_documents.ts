import {Connection, Database, QueryResult} from "kuzu";

export async function findRelatedDocuments(documentPath: string): Promise<{path: string; sharedTopics: string[], sharedTopicCount: number}[]> {
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
            const result = rows.reduce<Map<string, string[]>>((groups, row) => {
                const path = String(row.path);
                const topic = String(row.sharedTopic);
                const sharedTopics = groups.get(path) ?? [];

                sharedTopics.push(topic);
                groups.set(path, sharedTopics);

                return groups;
            }, new Map());

            return Array.from(result.entries()).map(([path, sharedTopics]) => ({
                path,
                sharedTopics,
                sharedTopicCount: sharedTopics.length,
            }));
        }
        return [];
    }
    finally {
        await connection.close();
        await db.close();
    }
}
