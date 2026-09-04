import * as process from "node:process";
import {readFileSync} from "node:fs";
import * as path from "node:path";
import {Connection, Database} from "kuzu";

const file = process.argv[2];
const db = new Database("./data/doksearch");
const connection = new Connection(db);

if(file === undefined) {
    console.error("No file provided");
    process.exit(1);
}
async function main(): Promise<void> {
    try {
        const data =  readFileSync(file, "utf-8");
        const document: Document = {
            path: file,
            extension: path.extname(file),
            content: data,
            characterCount: data.length,
        }
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
            ON MATCH SET d.extension = $extension, d.content = $content, d.characterCount = $characterCount
        `);

        await connection.execute(insert, {path:document.path, extension:document.extension, content:document.content, characterCount:document.characterCount});

        console.log("Document inserted", document.characterCount);

    } catch (error) {
        throw error;
    }
    finally {
        await connection.close();
        await db.close();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});

type Document = {
    path: string;
    extension: string;
    content: string;
    characterCount: number;
};


