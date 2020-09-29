/**
 * @file On pre init.
 */

import pkg from '../../package.json';

/**
 * Outputs a log on initialisation.
 */
export function onPreInit(): void {
	console.log(`${pkg.name} @ ${pkg.version} loaded`); // tslint:disable-line:no-console
}
