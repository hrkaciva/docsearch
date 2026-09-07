import {readFileSync} from "node:fs";
import {PDFParse} from "pdf-parse";
import path from "node:path";

export async function extractText(file: string): Promise<string> {
    const extension = path.extname(file).toLowerCase();
    if(extension === ".pdf") {
        const pdfData = readFileSync(file);
        const parser = new PDFParse({data: pdfData});
        try {
            const result = await parser.getText();
            return result.text;
        } finally {
            await parser.destroy();
        }
    }
    else if (extension === ".txt" || extension === ".md") {
        return readFileSync(file, "utf-8");
    }
    throw new Error("Unsupported file type");
}