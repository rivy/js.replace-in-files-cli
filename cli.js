#!/usr/bin/env node
'use strict';

const arrify = require('arrify');
const cli = require('yargs');

const replaceInFiles = require('./api');

const {terminalWidth} = cli;

cli.version()
	.usage('\nUsage:\n  $0 <files...>')
	.option('regex', {type: 'string', describe: 'Regex pattern to find'})
	.option('string', {type: 'string', describe: 'String to find'})
	.option('replacement', {type: 'string', describe: 'Replacement string'})
	.option('ignore-case', {type: 'boolean', describe: 'Search case-insensitively', default: false})
	.option('glob', {type: 'boolean', describe: 'Enable/disable file globbing', default: true})
	.wrap(Math.min(90, terminalWidth))
	.example(`$ $0 --string='horse' --regex='unicorn|rainbow' --replacement='🦄' foo.md
$ $0  --regex='v\\d+\\.\\d+\\.\\d+' --replacement=v$npm_package_version foo.css
$ $0  --string='blob' --replacement='blog' 'some/**/[gb]lob/*' '!some/glob/foo'
`);

console.log(cli.argv);

if (cli.argv._.length === 0) {
	console.error('Specify one or more file paths');
	process.exit(1);
}

if (!cli.argv.regex && !cli.argv.string) {
	console.error('Specify at least `--regex` or `--string`');
	process.exit(1);
}

// TODO: Use the required functionality in `meow` when v6 is out
if (cli.argv.replacement === undefined) {
	console.error('The `--replacement` flag is required');
	process.exit(1);
}

(async () => {
	await replaceInFiles(cli.argv._, {
		find: [
			...arrify(cli.argv.string),
			...arrify(cli.argv.regex).map(regexString => new RegExp(regexString, 'g'))
		],
		replacement: cli.argv.replacement,
		ignoreCase: cli.argv.ignoreCase,
		glob: cli.argv.glob
	});
})().catch(error => {
	console.error(error);
	process.exit(1);
});
