import * as process from "node:process";
import {readFileSync} from "node:fs";
import * as path from "node:path";

const file = process.argv[2];

if(file === undefined) {
    console.error("No file provided");
    process.exit(1);
}
try {
    const data =  readFileSync(file, "utf-8");
    const document: Document = {
        path: file,
        extension: path.extname(file),
        content: data,
        characterCount: data.length,
    }
    console.log(document.content);
    console.log("Path:", document.path);
    console.log("Extension:", document.extension);
    console.log("Character Count:", document.characterCount);

} catch (error) {
    console.error(error);
}

type Document = {
    path: string;
    extension: string;
    content: string;
    characterCount: number;
};


