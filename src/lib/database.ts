/**
 * @file Database.
 */

import { default as AuroraDataAPI } from 'aurora-data-api';

import { IConnectionDetails, IQuery, IQueryResult } from './definitions';
import { chunkArray } from './utilities';

const DEFAULT_MAX_QUERY_BATCH_SIZE = 10;

/**
 * Creates and returns a new data API instance for sending queries to a Serverless Aurora database.
 * @param connection The required details for the Aurora connection.
 */
export function getDataApi(connection: IConnectionDetails): AuroraDataAPI {
	return new AuroraDataAPI({
		accessKeyId: connection.accessKeyId,
		secretAccessKey: connection.secretAccessKey,
		region: connection.region,
		resourceArn: connection.resourceArn,
		secretArn: connection.secretArn,
		database: connection.databaseName,
	});
}

/**
 * Performs a single query using the given data API.
 * @param dataApi The data API to use when querying the database.
 * @param query The query to perform.
 */
async function performQuery(dataApi: AuroraDataAPI, query: IQuery): Promise<IQueryResult> {
	const opts: AuroraDataAPI.QueryOptions = {
		database: query.databaseName,
	};
	const results = await dataApi.query<object>(query.statement, {}, opts);

	return {
		query,
		rows: results.rows ?? [],
	};
}

/**
 * Performs all the given queries in batches.
 * @param dataApi The data API to use when querying the database.
 * @param queries The list of queries to perform.
 * @param queryBatchSize The maximum number of queries to perform simultaneously.
 */
export async function performQueries(
	dataApi: AuroraDataAPI,
	queries: IQuery[],
	queryBatchSize = DEFAULT_MAX_QUERY_BATCH_SIZE,
): Promise<IQueryResult[]> {
	const batchedQueries = chunkArray(queries, queryBatchSize);
	const output: IQueryResult[] = [];

	for (const batch of batchedQueries) {
		const promises = batch.map(query => performQuery(dataApi, query));
		const results = await Promise.all(promises);
		output.push(...results);
	}

	return output;
}
