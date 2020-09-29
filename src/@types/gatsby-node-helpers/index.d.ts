declare module 'gatsby-node-helpers' {
	import Gatsby from 'gatsby';

	export interface ICreateNodeHelpersArgs {
		typePrefix: string;
	}

	export function nodeFactory(data: object): Gatsby.NodeInput;

	export function createNodeFactory(type: string): typeof nodeFactory;
	export function generateTypeName(type: string): string;
	export function generateNodeId(type: string, id: string): string;

	export interface INodeHelpers {
		createNodeFactory: typeof createNodeFactory;
		generateTypeName: typeof generateTypeName;
		generateNodeId: typeof generateNodeId;
	}

	export function createNodeHelpers(args: ICreateNodeHelpersArgs): INodeHelpers;
	export default createNodeHelpers;
}
