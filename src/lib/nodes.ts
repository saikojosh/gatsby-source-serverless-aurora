/**
 * @file Nodes.
 */

import Gatsby from 'gatsby';
import createNodeHelpers from 'gatsby-node-helpers';
import pluralize from 'pluralize';

import { IQueryResult, INodeDefinition, ParentMatcher } from './definitions';

const HELPERS = createNodeHelpers({
	typePrefix: `ServerlessAurora`,
});

/**
 * Flattens the list of query results to a single array of nodes, one node for each result row.
 * @param sourceNodeArgs The Gatsby arguments object passed to the source nodes function.
 * @param defaultDatabaseName The database name configured in the connection options.
 * @param queryResults The list of query results.
 */
function flattenQueryResultsToNodeList(
	sourceNodeArgs: Gatsby.SourceNodesArgs,
	defaultDatabaseName: string,
	queryResults: IQueryResult[],
): INodeDefinition[] {
	const { createContentDigest } = sourceNodeArgs;
	const nodeList: INodeDefinition[] = [];

	for (const { query, rows } of queryResults) {
		const idFieldName = query.idFieldName || `id`;
		const nodeType = HELPERS.generateTypeName(query.nodeName);

		for (const row of rows) {
			const rawId = String(row[idFieldName]);

			nodeList.push({
				nodeData: {
					id: rawId,
					type: query.nodeName,
					row,
					links: { parents: {}, children: {} },
					internal: {
						type: nodeType,
						content: JSON.stringify(row),
						contentDigest: createContentDigest(row),
					},
				},
				metadata: {
					rawId,
					nodeId: HELPERS.generateNodeId(query.nodeName, rawId),
					query,
					row,
				},
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
	if (!parentNodeName && !parentMatcher) return [];

	let parentNodes: INodeDefinition[] = parentNodeName
		? nodeList.filter(node => node.metadata.query.nodeName === parentNodeName)
		: nodeList;

	if (parentMatcher) {
		parentNodes = parentNodes.filter(parentNode => parentMatcher(childNode.metadata.row, parentNode.metadata.row));
	}

	return parentNodes;
}

/**
 * Adds any foreign key (parent/child) relationships to each of the nodes in the list by mutating the function input.
 * @param nodeList The list of all the node definitions.
 */
function addForignKeyRelationships(nodeList: INodeDefinition[]): void {
	for (const childNode of nodeList) {
		const { nodeName: childNodeName, parentNodeName, parentMatcher } = childNode.metadata.query;
		const parentNodes = findParentNodes(parentNodeName, parentMatcher, childNode, nodeList);

		if (!parentNodes.length) continue;

		const childToParentLinks: [string, string][] = [];
		const parentToChildKey = `${pluralize(childNodeName)}___NODE`;

		parentNodes.forEach(parentNode => {
			const childToParentKey = `${pluralize(parentNode.metadata.query.nodeName)}___NODE`;
			childToParentLinks.push([childToParentKey, parentNode.metadata.nodeId]);
			parentNode.nodeData.links.children[parentToChildKey] = parentNode.nodeData.links.children[parentToChildKey] ?? [];
			parentNode.nodeData.links.children[parentToChildKey].push(`${childNode.metadata.nodeId}`);
		});

		childToParentLinks.forEach(childToParentLink => {
			const [childToParentKey, parentNodeId] = childToParentLink;
			childNode.nodeData.links.parents[childToParentKey] = childNode.nodeData.links.parents[childToParentKey] ?? [];
			childNode.nodeData.links.parents[childToParentKey].push(`${parentNodeId}`);
		});
	}
}

/**
 * Prepares the nodes for each of the rows in each of the query results.
 * @param sourceNodeArgs The Gatsby arguments object passed to the source nodes function.
 * @param defaultDatabaseName The database name configured in the connection options.
 * @param queryResults The list of query results.
 */
export function prepareNodes(
	sourceNodeArgs: Gatsby.SourceNodesArgs,
	defaultDatabaseName: string,
	queryResults: IQueryResult[],
): INodeDefinition[] {
	const nodeList = flattenQueryResultsToNodeList(sourceNodeArgs, defaultDatabaseName, queryResults);
	addForignKeyRelationships(nodeList);
	return nodeList;
}

/**
 * Creates all of the given nodes in Gatsby.
 * @param sourceNodeArgs The Gatsby arguments object passed to the source nodes function.
 * @param nodeList The list of all the node definitions.
 */
export function createNodes(sourceNodeArgs: Gatsby.SourceNodesArgs, nodeList: INodeDefinition[]): void {
	const { actions, reporter } = sourceNodeArgs;

	reporter.info(`Creating ${nodeList.length} node(s)`);

	nodeList.forEach(node => {
		const NodeFactory = HELPERS.createNodeFactory(node.metadata.query.nodeName);
		const gatsbyNode = NodeFactory(node.nodeData);
		actions.createNode(gatsbyNode);
	});
}
