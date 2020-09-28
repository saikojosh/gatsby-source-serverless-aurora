# gatsby-source-serverless-aurora

A Gatsby source plugin for pulling data into Gatsby at build time from an AWS Serverless Aurora database.

## Quick Start

Install the plugin:

```bash
npm install --save-dev gatsby-source-serverless-aurora
```

Add the plugin to `gatsby-config.js` with your Serverless Aurora connection details:

```js
module.exports = {
	//... your config here
	plugins: [
		{
			resolve: `gatsby-source-serverless-aurora`,
			options: {
				connectionDetails: {
					resourceArn: process.env.AURORA_RESOURCE_ARN,
					secretArn: process.env.AURORA_SECRET_ARN,
					databaseName: process.env.AURORA_DB_NAME,
				},
				queries: [
					{
						nodeName: `page`,
						statement: `SELECT * FROM pages`,
						idFieldName: `page_id`,
					},
				],
			},
		},
	],
};
```

Re/start your development server: `gatsby develop`.

## Options

These are all the options you can pass to the plugin:

| Option                            | Required | Default | Description                                                                                  |
| --------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------- |
| connectionDetails.accessKeyId     | Required |         | An AWS access key ID.                                                                        |
| connectionDetails.secretAccessKey | Required |         | An AWS secret access key.                                                                    |
| connectionDetails.region          | Required |         | The region for your Serverless Aurora instance.                                              |
| connectionDetails.resourceArn     | Required |         | The Resource ARN for your Serverless Aurora instance.                                        |
| connectionDetails.secretArn       | Required |         | The Secret ARN for your Serverless Aurora instance.                                          |
| connectionDetails.databaseName    | Required |         | The name of the database to use for queries. Can be overridden in each query.                |
| queryBatchSize                    |          | `10`    | The maximum number of simultaneous queries to perform.                                       |
| queries                           | Required |         | A list of queries to perform.                                                                |
| queries[].nodeName                | Required |         | Gives a name to the nodes created by the query, e.g. "page".                                 |
| queries[].parentNodeName          |          |         | Optionally link nodes created by this query as children of node(s) created by another query. |
| queries[].parentMatcher           |          |         | Optionally filter the parent nodes found with `parentNodeName`. See below for usage.         |
| queries[].statement               | Required |         | The query to perform.                                                                        |
| queries[].idFieldName             |          | `"id"`  | The column to use for the unique ID of the Gatsby nodes.                                     |
| queries[].databaseName            |          |         | Optionally query a different database for this query only.                                   |

## Parent-Child Relationships

Parent-child relationships can easily be created between different nodes. Parents can have as many children as they like, and children can have as many parents as they like.

### Example

- You have a query `"page"` to return pages: `SELECT * FROM pages`.
- You have a query `"post"` to return posts: `SELECT * FROM posts`.
- For the `post` query you specify the `parentNodeName` as `"page"`.
- For the `post` query you specify the `parentMatcher()` function to match the `page_id` of the post to the `page_id` of the page.
- Use the `node.links.children.post[]` property to access the `posts` owned by a `page` node.
- Use the `node.links.parents.page[]` property to access the `pages` a `post` node belongs to.

```js
queries: [
	{
		nodeName: `page`,
		statement: `SELECT * FROM pages`,
		idFieldName: `page_id`,
	},
	{
		nodeName: `post`,
		statement: `SELECT * FROM posts`,
		idFieldName: `post_id`,
		parentNodeName: `post`,
		parentMatcher: (post, page) => post.page_id === page.page_id,
	},
],
```

### parentMatcher(child, parent) => boolean

The parentMatcher function is passed two nodes, `child` and `parent`. It must return `true` if the child should be linked to the parent, otherwise `false`.

The `child` will be a node returned by the current query, and the `parent` will be a node with a name that matches the `parentNodeName` option if specified (or all nodes returned by all queries if not).
