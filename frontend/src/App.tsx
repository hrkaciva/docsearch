import {useState} from "react";
import type {SyntheticEvent} from "react";

export default function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        const query = searchTerm.trim();

        if (!query) {
            setError("Enter a search term.");
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults([]);
        setHasSearched(true);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if(!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            const searchResult = await response.json();
            setResults(searchResult);
        }  catch (error) {
            console.error(error);
            setError("Could not complete the search. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="App">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search documents"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Searching..." : "Search"}
                </button>
            </form>
            {error && <p role="alert">{error}</p>}
            {isLoading && <p role="status">Searching your documents...</p>}
            {!isLoading && !error && hasSearched && results.length === 0 && (
                <p>No documents matched your search.</p>
            )}
            {!isLoading && !error && !hasSearched && (
                <p>Search your documents to see results.</p>
            )}
            {!isLoading && !error && results.length > 0 && (
                <ul>
                    {results.map((result) => (
                        <li key={result.path}>{result.path} - {result.distance}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

type SearchResult = {
    path: string;
    distance: number;
}
