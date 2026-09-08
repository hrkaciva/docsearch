import * as process from "node:process";
import * as path from "node:path";
import {Connection, Database, QueryResult} from "kuzu";
import {extractText} from "./extract-text";
import {embedText} from "./embed";

const file = process.argv[2];
const topicName = process.argv[3];
const db = new Database("./data/doksearch");
const connection = new Connection(db);

if(file === undefined) {
    console.error("No file provided");
    process.exit(1);
}
if(topicName === undefined) {
    console.error("No topic name provided");
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

        await connection.query(`CREATE NODE TABLE IF NOT EXISTS Topic(name STRING, PRIMARY KEY(name))`);

        await connection.query(`CREATE REL TABLE IF NOT EXISTS ABOUT(FROM Document TO Topic)`);

        const deleteExisting = await connection.prepare(`
            MATCH (d:Document {path: $path})
            DETACH DELETE d
        `);
        await connection.execute(deleteExisting, {path: document.path});

        const insert = await connection.prepare(`
            CREATE (d:Document {
                path: $path,
                extension: $extension,
                content: $content,
                characterCount: $characterCount,
                embedding: $embedding
            })
        `);

        await connection.execute(insert, {path:document.path, extension:document.extension, content:document.content, characterCount:document.characterCount, embedding:embedding});


        const topic = await connection.prepare(`
            MERGE (t:Topic {name: $name})
        `);
        await connection.execute(topic, {name: topicName});

        const relationship = await connection.prepare(`
            MATCH (d: Document {path: $path})
            MATCH (t: Topic {name: $name})
            MERGE (d)-[:ABOUT]->(t)
        `);

        await connection.execute(relationship, {
            path: document.path,
            name: topicName,
        })

        const documentByTopic = await connection.prepare(`MATCH (d:Document)-[:ABOUT]->(t:Topic) WHERE t.name=$name RETURN d.path AS path`);

        const result = await connection.execute(documentByTopic, {name: topicName});
        if (result instanceof QueryResult) {
            console.log(await result.getAll());
        }

        console.log("Document inserted", document.characterCount);

        const relatedDocuments = await connection.prepare(`
            MATCH (source:Document)-[:ABOUT]->(topic:Topic)<-[:ABOUT]-(related:Document) 
            WHERE source.path=$path AND source.path <> related.path
            RETURN related.path AS path, topic.name AS sharedTopic
        `);

        const relatedResult = await connection.execute(relatedDocuments, {path: document.path});
        if (relatedResult instanceof QueryResult) {
            console.log(await relatedResult.getAll());
        }

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

