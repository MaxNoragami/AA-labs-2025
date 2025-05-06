import { Node, Edge } from '../types';

// Helper function to convert number to letter label
export function getLetterLabel(index: number): string {
    // For indices 0-25, return A-Z
    if (index < 26) {
        return String.fromCharCode(65 + index);
    }
    // For indices 26+, return AA, AB, etc.
    const firstChar = String.fromCharCode(65 + Math.floor((index - 26) / 26));
    const secondChar = String.fromCharCode(65 + ((index - 26) % 26));
    return firstChar + secondChar;
}

// Helper function to build adjacency list from edges
export const buildAdjacencyList = (nodes: Node[], edges: Edge[], isDirected: boolean): number[][] => {
    const adjList: number[][] = Array(nodes.length).fill(null).map(() => []);

    edges.forEach(edge => {
        adjList[edge.source].push(edge.target);

        // For undirected graphs, add the reverse edge as well
        if (!isDirected) {
            adjList[edge.target].push(edge.source);
        }
    });

    // Remove duplicates from each adjacency list
    return adjList.map(neighbors => Array.from(new Set(neighbors)));
};