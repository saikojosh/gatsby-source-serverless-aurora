/**
 * @file Utilities.
 */

/**
 * Chunks the given array into the given size chunks.
 * @param arr An array to chunk.
 * @param chunkSize THe number of elements to include in each chunk.
 * @returns The resulting chunked array.
 */
export function chunkArray<TArrayElement>(arr: TArrayElement[], chunkSize: number): TArrayElement[][] {
	const chunks: TArrayElement[][] = [];

	while (arr.length > 0) {
		const chunk = arr.splice(0, chunkSize);
		chunks.push(chunk);
	}

	return chunks;
}
