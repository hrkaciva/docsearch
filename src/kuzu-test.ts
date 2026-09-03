import {Connection, Database} from "kuzu";

const db = new Database(":memory:");
const connection = new Connection(db);

async function main(): Promise<void> {
    try {
        await connection.query(`
            CREATE NODE TABLE Document(
                path STRING,
                extension STRING,
                content STRING,
                characterCount INT64,
                PRIMARY KEY(path)
            )
        `);

        await connection.query(`
            CREATE (d:Document {
                path: 'test.txt',
                extension: '.txt',
                content: 'Hello Kuzu',
                characterCount: 10
            })
        `);

        const result = await connection.query(
            "MATCH (d:Document) RETURN d.path, d.content, d.characterCount",
        );

        if (Array.isArray(result)) {
            throw new Error("Expected one query result");
        }

        console.log(await result.getAll());
    } finally {
        await connection.close();
        await db.close();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
