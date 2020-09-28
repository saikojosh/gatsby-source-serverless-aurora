/**
 * @file Type definitions.
 */

import Gatsby from 'gatsby';

/**
 * Represents a query result row.
 */
export interface IQueryResultRow {
	[key: string]: any; // tslint:disable-line:no-any
}

/**
 * Represents a query result.
 */
export interface IQueryResult {
	query: IQuery;
	rows: IQueryResultRow[];
}

/**
 * A user defined predicate function to determine if the given row should be a child of the given parent row.
 */
export type ParentMatcher = (childRow: IQueryResultRow, parentRow: IQueryResultRow) => boolean;

/**
 * A query definition. A database name can be optionally specified to query a different database than the default.
 */
export interface IQuery {
	nodeName: string;
	parentNodeName?: string;
	parentMatcher?: ParentMatcher;
	statement: string;
	idFieldName: string;
	databaseName?: string;
}

/**
 * Plugin options that can be specified by the consumer.
 */
export interface ISourcePluginOptions extends Gatsby.PluginOptions {
	connectionDetails: {
		resourceArn: string;
		secretArn: string;
		databaseName: string;
	};
	queryBatchSize?: number;
	queries: IQuery[];
}

/**
 * A definition for a Gatsby that includes additional metadata needed for constructing the nodes.
 */
export interface INodeDefinition {
	data: {
		id: string;
		links: {
			parents: {
				[key: string]: string[];
			};
			children: {
				[key: string]: string[];
			};
		};
		internal: {
			type: string;
			content: string;
			contentDigest: string;
		};
	};
	query: IQuery;
	row: IQueryResultRow;
}
