import * as process from "node:process";
import * as path from "node:path";
import {Connection, Database} from "kuzu";
import {extractText} from "./extract-text";
import {embedText} from "./embed";

const file = process.argv[2];
const db = new Database("./data/doksearch");
const connection = new Connection(db);

if(file === undefined) {
    console.error("No file provided");
    process.exit(1);
}
async function main(): Promise<void> {
    try {
        const data =  await extractText(file);
        const document: Document = {
            path: file,
            extension: path.extname(file),
            content: data,
            characterCount: data.length,
        }
        const embedding = await embedText(data);

        await connection.query(`
            CREATE NODE TABLE IF NOT EXISTS Document(
                path STRING,
                extension STRING,
                content STRING,
                characterCount INT64,
                embedding FLOAT[384],
                PRIMARY KEY(path)
            )
        `);

        const insert = await connection.prepare(`
            MERGE (d:Document {path: $path}) ON CREATE SET d.extension = $extension, d.content = $content, d.characterCount = $characterCount, d.embedding = $embedding
            ON MATCH SET d.extension = $extension, d.content = $content, d.characterCount = $characterCount, d.embedding = $embedding
        `);

        await connection.execute(insert, {path:document.path, extension:document.extension, content:document.content, characterCount:document.characterCount, embedding:embedding});

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


