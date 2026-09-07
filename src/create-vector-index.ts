import {Database, Connection} from "kuzu";

const db = new Database("./data/doksearch");
const connection = new Connection(db);

async function main(): Promise<void> {
    try {
        await connection.query(`                                                                                                                                                                                                       
         CALL CREATE_VECTOR_INDEX('Document', 'document_embedding_vec', 'embedding')                                                                                                                                                     
     `);
        console.log("Vector index created");

    } finally {
        await connection.close();
        await db.close();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});