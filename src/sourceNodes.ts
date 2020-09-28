/**
 * @file Source Nodes.
 */

import pkg from '../package.json';

import Gatsby from 'gatsby';

import { getDataApi, performQueries } from './database';
import { ISourcePluginOptions } from './definitions';
import { prepareNodes, createNodes } from './nodes';

/**
 * Obtains the data for the nodes from a Serverless Aurora database.
 * @param sourceNodeArgs The Gatsby arguments passed to the source nodes function.
 * @param options The user defined options passed to the plugin.
 */
export default async function sourceNodes(
	sourceNodeArgs: Gatsby.SourceNodesArgs,
	options: ISourcePluginOptions,
): Promise<void> {
	const { reporter } = sourceNodeArgs;

	try {
		reporter.info(`Sourcing data from Serverless Aurora database`);

		const { connectionDetails, queryBatchSize, queries } = options;
		const { resourceArn, secretArn, databaseName } = connectionDetails;
		const dataApi = getDataApi(resourceArn, secretArn, databaseName);
		const queryResults = await performQueries(dataApi, queries, queryBatchSize);
		const nodes = prepareNodes(sourceNodeArgs, queryResults);
		createNodes(sourceNodeArgs, nodes);

		reporter.success(`Successfully sourced ${nodes.length} node(s) from Serverless Aurora database`);
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		reporter.error(`Error while sourcing data with "${pkg.name}"`, err);
	}
}
