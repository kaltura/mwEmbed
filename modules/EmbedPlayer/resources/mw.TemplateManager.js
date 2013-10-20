// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

( function( mw, $ ) {

// exit if already defined
if( mw.TemplateManager ) return ;

mw.TemplateManager = {

	cache: {},

	tmpl: function(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		data = data || {};
		var fn = !/\W/.test(str) ?
		this.cache[str] = this.cache[str] ||
		this.tmpl(str) :

		// Generate a reusable function that will serve as a template
		// generator (and which will be cached).
		new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +

			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +

			// Convert the template into pure JavaScript
			str.replace(/[\r\t\n]/g, " ")
			   .replace(/'(?=[^%]*%>)/g,"\t")
			   .split("'").join("\\'")
			   .split("\t").join("'")
			   .replace(/<%=(.+?)%>/g, "',$1,'")
			   .split("<%").join("');")
			   .split("%>").join("p.push('")
			   + "');}return p.join('');");

		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	}
};

} )( mediaWiki, jQuery );