import {Connection, Database} from "kuzu";
import path from "node:path";
import {readFileSync} from "node:fs";

const db = new Database("./data/doksearch");
const connection = new Connection(db);


async function main(): Promise<void> {
    try {
        const route = process.argv[2];

        if(route === undefined) {
            throw new Error("No route provided");
        }

        const content = readFileSync(route, "utf-8");
        const pathName = path.extname(route);
        const length = content.length;

            await connection.query(`
            CREATE NODE TABLE IF NOT EXISTS Document(
                path STRING,
                extension STRING,
                content STRING,
                characterCount INT64,
                PRIMARY KEY(path)
            )
        `);
            const insert = await connection.prepare(`
            MERGE (d:Document {path: $path}) ON CREATE SET d.extension = $extension, d.content = $content, d.characterCount = $characterCount
        `);

        await connection.execute(insert, {path:route, extension:pathName, content, characterCount:length});

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
