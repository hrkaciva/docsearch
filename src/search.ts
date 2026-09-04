import {Connection, Database, QueryResult} from "kuzu";

const searchWord = process.argv[2];

if (!searchWord) {
  console.error("No search term provided");
  process.exit(1);
}

const db = new Database("./data/doksearch");
const connection = new Connection(db);

async function main(): Promise<void> {

    try {
        const query = await connection.prepare(`CALL QUERY_FTS_INDEX('Document', 'document_content_fts', $term, top := 10) RETURN node.path AS path, score ORDER BY score DESC`);
        const result = await connection.execute(
            query, {term: searchWord}
        );
        if (result instanceof QueryResult) {
            console.log(await result.getAll());
        }

    } catch (error) {
        console.error(error);
    } finally {
        await connection.close();
        await db.close();
    }
}
main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
})
