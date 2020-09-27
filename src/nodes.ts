/**
 * @file Nodes.
 */

import Gatsby from 'gatsby';

import { IQuery, IQueryResult, IQueryResultRow } from './definitions';

const NODE_TYPE = `serverless-aurora`;

/**
 * Creates a new for the given row.
 * @param sourceNodeArgs The Gatsby arguments passed to the source nodes function.
 * @param query The query that was executed to obtain the row.
 * @param row The row that was obtained.
 */
function createNodeForRow(sourceNodeArgs: Gatsby.SourceNodesArgs, query: IQuery, row: IQueryResultRow): void {
	const { actions, createContentDigest, createNodeId } = sourceNodeArgs;
	const { nodeName, idFieldName } = query;

	actions.createNode({
		...row,
		id: createNodeId(`${NODE_TYPE}-${nodeName}-${row[idFieldName]}`),
		parent: undefined,
		children: [],
		internal: {
			type: `${NODE_TYPE}-${nodeName}`,
			content: JSON.stringify(row),
			contentDigest: createContentDigest(row),
		},
	});
}

/**
 * Creates the Gatsby nodes for each of the rows in the given query result.
 * @param sourceNodeArgs The Gatsby arguments passed to the source nodes function.
 * @param queryResult The query result to work with.
 */
async function createNodesForQueryResult(
	sourceNodeArgs: Gatsby.SourceNodesArgs,
	queryResult: IQueryResult,
): Promise<void> {
	const promises = queryResult.rows.map(row => createNodeForRow(sourceNodeArgs, queryResult.query, row));
	await Promise.all(promises);
}

/**
 * Creates the Gatsby nodes for each of the rows in each of the query results.
 * @param sourceNodeArgs The Gatsby arguments passed to the source nodes function.
 * @param queryResults The list of query results.
 */
export async function createNodes(sourceNodeArgs: Gatsby.SourceNodesArgs, queryResults: IQueryResult[]): Promise<void> {
	const promises = queryResults.map(queryResult => createNodesForQueryResult(sourceNodeArgs, queryResult));
	await Promise.all(promises);
}
