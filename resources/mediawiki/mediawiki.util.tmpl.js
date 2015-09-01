/**
 * Extends mediaWiki.util with underscore JavaScript Templating
 * http://underscorejs.org/ - MIT Licensed
 */
( function ( $, mw ) {
	"use strict";

	// Expose old method name for backward compatiblity
	mw.util.registerTemplateHelper = function(name, callback) {
		mw.log('[Deprecated] mw.util.registerTemplateHelper is deprecated. please use mw.util.formaters().register method');
		mw.util.formaters().register(name, callback);
	};

	// Is a given variable an object?
	var isObject = function(obj) {
		var type = typeof obj;
		return type === 'function' || type === 'object' && !!obj;
	};

	// Fill in a given object with default properties.
	var defaults = function(obj) {
		if (!isObject(obj)) return obj;
		for (var i = 1, length = arguments.length; i < length; i++) {
			var source = arguments[i];
			for (var prop in source) {
				if (obj[prop] === void 0) obj[prop] = source[prop];
			}
		}
		return obj;
	};

	// By default, Underscore uses ERB-style template delimiters, change the
		// following template settings to use alternative delimiters.
	var templateSettings = {
			evaluate    : /<%([\s\S]+?)%>/g,
			interpolate : /<%=([\s\S]+?)%>/g,
			escape      : /<%-([\s\S]+?)%>/g
		};

	// When customizing `templateSettings`, if you don't want to define an
	// interpolation, evaluation or escaping regex, we need one that is
	// guaranteed not to match.
	var noMatch = /(.)^/;

	// Certain characters need to be escaped so that they can be put into a
	// string literal.
	var escapes = {
		"'":      "'",
		'\\':     '\\',
		'\r':     'r',
		'\n':     'n',
		'\u2028': 'u2028',
		'\u2029': 'u2029'
	};

	var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	var escapeChar = function(match) {
		return '\\' + escapes[match];
	};

	// JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	// NB: `oldSettings` only exists for backwards compatibility.
	mw.util.tmpl = function(text, settings, oldSettings) {
		if (!settings && oldSettings) settings = oldSettings;
		settings = defaults({}, settings, templateSettings);

		// Combine delimiters into one regular expression via alternation.
		var matcher = RegExp([
			(settings.escape || noMatch).source,
			(settings.interpolate || noMatch).source,
			(settings.evaluate || noMatch).source
		].join('|') + '|$', 'g');

		// Compile the template source, escaping string literals appropriately.
		var index = 0;
		var source = "__p+='";
		text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
			source += text.slice(index, offset).replace(escaper, escapeChar);
			index = offset + match.length;

			if (escape) {
				source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
			} else if (interpolate) {
				source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
			} else if (evaluate) {
				source += "';\n" + evaluate + "\n__p+='";
			}

			// Adobe VMs need the match returned to produce the correct offest.
			return match;
		});
		source += "';\n";

		// If a variable is not specified, place data values in local scope.
		if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

		source = "var __t,__p='',__j=Array.prototype.join," +
			"print=function(){__p+=__j.call(arguments,'');};\n" +
			source + 'return __p;\n';

		try {
			var render = new Function(settings.variable || 'obj', '_', source);
		} catch (e) {
			e.source = source;
			throw e;
		}

		var template = function(data) {
			return render.call(this, data);
		};

		// Provide the compiled source as a convenience for precompilation.
		var argument = settings.variable || 'obj';
		template.source = 'function(' + argument + '){\n' + source + '}';

		return template;
	};

} )( jQuery, mediaWiki );