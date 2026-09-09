import assert from "node:assert/strict";
import test from "node:test";
import {combineResults} from "./hybrid-search";

test("documents found by both searches receive a higher score", () => {
    const results = combineResults(
        [{path: "shared.txt", score: 1}],
        [{path: "shared.txt", distance: 0.1}],
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.path, "shared.txt");
    assert.equal(results[0]?.score, 2 / 61);
});

test("documents found by only one search are included", () => {
    const results = combineResults(
        [{path: "keyword.txt", score: 1}],
        [{path: "vector.txt", distance: 0.1}],
    );

    assert.deepEqual(
        results.map((result) => result.path).sort(),
        ["keyword.txt", "vector.txt"],
    );
});

test("results are sorted by combined score", () => {
    const results = combineResults(
        [
            {path: "keyword-first.txt", score: 1},
            {path: "shared.txt", score: 0.5},
        ],
        [{path: "shared.txt", distance: 0.1}],
    );

    assert.deepEqual(
        results.map((result) => result.path),
        ["shared.txt", "keyword-first.txt"],
    );
});
