import {useState} from "react";
import type {SyntheticEvent} from "react";

export default function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [relatedDocuments, setRelatedDocuments] = useState<Record<string, RelatedDocument[]>>({});
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
        setRelatedDocuments({});
        setHasSearched(true);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if(!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            const searchResults: SearchResult[] = await response.json();
            setResults(searchResults);

            const relatedEntries: [string, RelatedDocument[]][] = [];
            for (const result of searchResults) {
                const relatedResponse = await fetch(
                    `/api/documents/related?path=${encodeURIComponent(result.path)}`,
                );

                if (!relatedResponse.ok) {
                    throw new Error(`Related document lookup failed: ${relatedResponse.status}`);
                }

                const documents: RelatedDocument[] = await relatedResponse.json();
                relatedEntries.push([result.path, documents]);
            }

            setRelatedDocuments(Object.fromEntries(relatedEntries));
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
                        <li key={result.path}>
                            <div>{result.path} - {result.score}</div>
                            {relatedDocuments[result.path]?.length > 0 && (
                                <div>
                                    <strong>Related documents</strong>
                                    <ul>
                                        {relatedDocuments[result.path].map((relatedDocument) => (
                                            <li key={`${relatedDocument.path}`}>
                                                {relatedDocument.path} (
                                                {relatedDocument.sharedTopicCount} shared topics:{" "}
                                                {relatedDocument.sharedTopics.join(", ")}
                                                )
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

type SearchResult = {
    path: string;
    score: number;
}

type RelatedDocument = {
    path: string;
    sharedTopics: string[];
    sharedTopicCount: number;
}
