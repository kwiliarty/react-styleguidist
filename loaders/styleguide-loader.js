'use strict';

const pick = require('lodash/pick');
const isFunction = require('lodash/isFunction');
const commonDir = require('common-dir');
const toCode = require('./utils/toCode');
const getComponents = require('./utils/getComponents');
const getComponentsCode = require('./utils/getComponentsCode');
const getComponentsFromSections = require('./utils/getComponentsFromSections');
const getSectionsCode = require('./utils/getSectionsCode');

/* eslint-disable no-console */

// Config options that should be passed to the client
const CLIENT_CONFIG_OPTIONS = [
	'title',
	'highlightTheme',
	'showCode',
	'previewDelay',
	'theme',
	'styles',
];

module.exports = function() {};
module.exports.pitch = function() {
	/* istanbul ignore if */
	if (this.cacheable) {
		this.cacheable();
	}

	const config = this.options.styleguidist;
	const clientConfig = pick(config, CLIENT_CONFIG_OPTIONS);
	const componentFiles = getComponents(config.components, config);

	if (componentFiles.length === 0 && config.sections.length === 0) {
		const message = isFunction(config.components)
			? 'Styleguidist: No components found using a `components` function.'
			: `Styleguidist: No components found using a mask: ${config.components}.`
		;
		throw new Error(message);
	}

	/* istanbul ignore if */
	if (config.verbose) {
		console.log();
		console.log('Loading components:');
		console.log(componentFiles.join('\n'));
		console.log();
	}

	// Setup Webpack context dependencies to enable hot reload when adding new files
	if (config.contextDependencies) {
		config.contextDependencies.forEach(dir => this.addContextDependency(dir));
	}
	else {
		// Get list of all component files including components in sections,
		// and use their common parent directory as a context
		const sectionComponentFiles = getComponentsFromSections(config.sections, config);
		const allComponentFiles = componentFiles.concat(sectionComponentFiles);
		if (allComponentFiles.length) {
			this.addContextDependency(commonDir(allComponentFiles));
		}
	}

	const code = toCode({
		config: JSON.stringify(clientConfig),
		components: getComponentsCode(componentFiles, config),
		sections: getSectionsCode(config.sections, config),
	});
	return `module.exports = ${code};`;
};