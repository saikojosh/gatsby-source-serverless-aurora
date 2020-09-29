const plugin = require(`./dist/src/main`);

exports.onPreInit = plugin.onPreInit;
exports.sourceNodes = plugin.sourceNodes;
