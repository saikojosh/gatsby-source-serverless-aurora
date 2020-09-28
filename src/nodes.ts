/**
 * @file Nodes.
 */

import Gatsby from 'gatsby';

import { IQueryResult, INodeDefinition, ParentMatcher } from './definitions';

const NODE_TYPE = `serverless-aurora`;

/**
 * Flattens the list of query results to a single array of nodes, one node for each result row.
 * @param sourceNodeArgs The Gatsby arguments object passed to the source nodes function.
 * @param queryResults The list of query results.
 */
function flattenQueryResultsToNodeList(
	sourceNodeArgs: Gatsby.SourceNodesArgs,
	queryResults: IQueryResult[],
): INodeDefinition[] {
	const { createContentDigest, createNodeId } = sourceNodeArgs;
	const nodeList: INodeDefinition[] = [];

	for (const { query, rows } of queryResults) {
		for (const row of rows) {
			const nodeType = `${NODE_TYPE}-${query.nodeName}`;

			nodeList.push({
				data: {
					...row,
					id: createNodeId(`${nodeType}-${row[query.idFieldName]}`),
					links: { parents: {}, children: {} },
					internal: {
						type: nodeType,
						content: JSON.stringify(row),
						contentDigest: createContentDigest(row),
					},
				},
				query,
				row,
			});
		}
	}

	return nodeList;
}

/**
 * Finds and returns all of the matching parent nodes for the given child node.
 * @param parentNodeName The name of the parent nodes to match against.
 * @param parentMatcher A predicate function to perform matching.
 * @param childNode The child node that needs parents.
 * @param nodeList The list of all the node definitions.
 */
function findParentNodes(
	parentNodeName: string | undefined,
	parentMatcher: ParentMatcher | undefined,
	childNode: INodeDefinition,
	nodeList: INodeDefinition[],
): INodeDefinition[] {
	if (!parentNodeName) return [];
	let parentNodes: INodeDefinition[] = nodeList.filter(node => node.query.nodeName === parentNodeName);
	if (parentMatcher) parentNodes = parentNodes.filter(parentNode => parentMatcher(childNode.row, parentNode.row));
	return parentNodes;
}

/**
 * Adds any foreign key (parent/child) relationships to each of the nodes in the list by mutating the function input.
 * @param nodeList The list of all the node definitions.
 */
function addForignKeyRelationships(nodeList: INodeDefinition[]): void {
	for (const childNode of nodeList) {
		const { nodeName: childNodeName, parentNodeName, parentMatcher } = childNode.query;
		const parentNodes = findParentNodes(parentNodeName, parentMatcher, childNode, nodeList);
		if (!parentNodes.length) continue;

		const childToParentLinks: string[] = [];
		const parentToChildKey = `${childNodeName}___NODE`;

		parentNodes.forEach(parentNode => {
			childToParentLinks.push(parentNode.data.id);
			parentNode.data.links.children[parentToChildKey] = parentNode.data.links.children[parentToChildKey] ?? [];
			parentNode.data.links.children[parentToChildKey].push(childNode.data.id);
		});

		childNode.data.links.parents[`${parentNodeName}___NODE`] = childToParentLinks;
	}
}

/**
 * Prepares the nodes for each of the rows in each of the query results.
 * @param sourceNodeArgs The Gatsby arguments object passed to the source nodes function.
 * @param queryResults The list of query results.
 */
export function prepareNodes(sourceNodeArgs: Gatsby.SourceNodesArgs, queryResults: IQueryResult[]): INodeDefinition[] {
	const nodeList = flattenQueryResultsToNodeList(sourceNodeArgs, queryResults);
	addForignKeyRelationships(nodeList);
	return nodeList;
}

/**
 * Creates all of the given nodes in Gatsby.
 * @param sourceNodeArgs The Gatsby arguments object passed to the source nodes function.
 * @param nodeList The list of all the node definitions.
 */
export function createNodes(sourceNodeArgs: Gatsby.SourceNodesArgs, nodeList: INodeDefinition[]): void {
	const { actions } = sourceNodeArgs;
	nodeList.forEach(node => actions.createNode(node.data));
}
