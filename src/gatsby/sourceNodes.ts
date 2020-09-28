/**
 * @file Source Nodes.
 */

import pkg from '../../package.json';

import Gatsby from 'gatsby';

import { getDataApi, performQueries } from '../lib/database';
import { ISourcePluginOptions } from '../lib/definitions';
import { prepareNodes, createNodes } from '../lib/nodes';

/**
 * Obtains the data for the nodes from a Serverless Aurora database.
 * @param sourceNodeArgs The Gatsby arguments passed to the source nodes function.
 * @param options The user defined options passed to the plugin.
 */
export async function sourceNodes(
	sourceNodeArgs: Gatsby.SourceNodesArgs,
	options: ISourcePluginOptions,
): Promise<void> {
	const { reporter } = sourceNodeArgs;

	try {
		reporter.info(`Sourcing data using "${pkg.name}" @ ${pkg.version}`);

		const { connection, queryBatchSize, queries } = options;
		const dataApi = getDataApi(connection);
		const queryResults = await performQueries(dataApi, queries, queryBatchSize);
		const nodes = prepareNodes(sourceNodeArgs, queryResults);
		createNodes(sourceNodeArgs, nodes);

		reporter.success(`Successfully sourced ${nodes.length} node(s) using "${pkg.name}"`);
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		reporter.error(`Error while sourcing data with "${pkg.name}"`, err);
	}
}
