import {Database, Connection} from "kuzu";

const db = new Database("./data/doksearch");
const connection = new Connection(db);

async function main(): Promise<void> {
    try {
        await connection.query(`                                                                                                                                                                                                       
         CALL CREATE_FTS_INDEX('Document', 'document_content_fts', ['content'])                                                                                                                                                     
     `);
        console.log("FT index created");

    } finally {
        await connection.close();
        await db.close();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});