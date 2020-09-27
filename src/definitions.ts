/**
 * @file Type definitions.
 */

import Gatsby from 'gatsby';

/**
 * A query definition.
 */
export interface IQuery {
	nodeName: string;
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
