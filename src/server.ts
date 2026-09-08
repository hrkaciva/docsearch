import {createServer, ServerResponse} from "node:http";
import { search } from "./search";
import {vectorSearch} from "./vector-search";
import {combineResults} from "./hybrid-search";


function sendJson(
    response: ServerResponse,
    statusCode: number,
    body: unknown,
) : void {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    if(request.method !== "GET" || url.pathname !== "/api/search") {
        sendJson(response, 404, {error: "Not Found"});
        return;
    }

    const query = url.searchParams.get("q");

    if(!query) {
        sendJson(response, 400, {error: "Missing query parameter"});
        return;
    }

    try {
        const vectorResults= await vectorSearch(query);
        const keywordResults = await search(query);
        const results = combineResults(keywordResults, vectorResults);
        sendJson(response, 200, results);
    } catch (error) {
        sendJson(response, 500, {error: "Internal Server Error"});
    }
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});