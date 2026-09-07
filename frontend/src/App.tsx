import {useState} from "react";
import type {SyntheticEvent} from "react";

export default function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
            if(!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            const searchResult = await response.json();
            setResults(searchResult);
        }  catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="App">
            <form onSubmit={handleSubmit}>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                <button type="submit">Search</button>
            </form>
            <div id="searchTerm">
                {searchTerm}
            </div>
            <ul>
                {results.map((result) => (
                    <li key={result.path}>{result.path} - {result.score}</li>
                ))}
            </ul>
        </div>
    );
}

type SearchResult = {
    path: string;
    score: number;
}
