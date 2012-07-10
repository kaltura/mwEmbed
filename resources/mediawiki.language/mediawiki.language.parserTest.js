/**
 * mediaWiki.language.parser.test Test Suite
 *
 * This script tests mediaWiki language transform system against the php counterpart.
 *
 * Available on "/Special:BlankPage?action=mw.language.parserTest&debug=true")
 *
 * @author Michael Dale <mdale@wikimedia.org>
 */

(function ($, mw) {

mw.language.parserTest = {
	'init': function(){
		// Make sure we are on the test page ( this will change once we explicitly  include test files on test pages )
		if (wgCanonicalSpecialPageName == 'Blankpage' && mw.util.getParamValue('action') === 'mw.language.parserTest') {
			this.setPageContent();
			this.setupParseTests();
		}
	},
	'setPageContent': function(){
		$('#firstHeading').text('Test Javascript plural msg transformations');
		mw.util.$content.html(
			'<span style="float:left;width:400px;padding:3px;">' +
				'Run Test transform<br />' +
				'<a id="runAll" href="#">Run all <span id="languageCount">...</span> tests</a> ( takes a while ) <br> '+

				'<a id="runLang" href="#">Run Language Key</a>:<input size="5" id="testLangKey" name = "testLangKey" value="en"/>'+
			'</span>' +
					'<span style="float:left;width:300px;">'+
			'Run Custom transform: <br />'+
			'Value (separate by comma ): <input size="30" id="customValue" name="customValue" value="4,3"/> <br>'+
			'Msg Swap Text: '+
					'<textarea cols="60" rows="2" id="customMsgText" name="customMsgText" >'+
						'{{PLURAL:$2|This category has only the following subcategory.|'+
						'This category has the following {{PLURAL:$1|subcategory|$1 subcategories}}, '+
						'out of $2 total.}}'+
					'</textarea>'+
			'<input id="runCustomTransform" type="button" value="Run Custom Transform">'+

			'</span>'+
			'<div style="clear:both"></div>'+
			'<br />'+

			'<div id="score_card" style="font-size:large"></div>'+
			'<table style="border:1px solid" id="table_out"></table>'
		);
	},


	/**
	 * Sets up the parser tests and binds the html actions
	 */
	'setupParseTests' : function(){
		mw.log('setupParseTests::');
		// For just setting one or two to test at a time for debug

		// Update the language count
		var count=0;
		for( var i in mw.language.names ){
			count++;
		}
		$('#languageCount').text( count );

		var headerRowHtml = '<tr style="border:1px solid">' +
				'<td style="border:1px solid" >$1[,$2]</td>' +
				'<td style="border:1px solid" width="14%">Msg key</td>' +
				'<td style="border:1px solid" width="34%">Msg text</td>' +
				'<td style="border:1px solid" width="24%">Msg Transform JS</td>' +
				'<td style="border:1px solid" width="24%">Msg Transform Mw</td>' +
			'</tr>';

		// Setup bindings:
		// Custom transform test
		$('#runCustomTransform').click( function(){
			mw.log('runCustomTransform');
			// Add the custom message:
			mediaWiki.messages.set({ 'mwe-custom-msg': $('#customMsgText').val() });

			// Empty the table
			$('#table_out,#score_card').empty();

			// Add  table header:
			$('#table_out').html( headerRowHtml +
				'<tr>' +
					'<td>' + $('#customMsgText').val() + '</td>' +
					'<td>mwe-custom-msg</td>' +
					'<td>' + $('#customMsgText').val() + '</td>' +
					'<td id="jsMessageText"></td>' +
					'<td id="mwMessageTransform"></td>' +
				'<tr>'
			);

			// Set the mw message to loading
			$('#mwMessageTransform').text(
				"note custom messages can not be parsed via the mediaWiki api at this point in time"
			).css('color', 'red');

			// Output the js msg:
			var msgArgs = $('#customValue').val().split(',');

			$('#jsMessageText').append(
				mediaWiki.msg( 'mwe-custom-msg', msgArgs )
			);

		});

		$('#runLang').click(function(){
			mw.log('runLang');
			$('#table_out,#score_card').empty();
			if(  !mw.language.names[ $('#testLangKey').val() ] ){
				alert( escape( $('#testLangKey').val() ) + ' does not appear to be a valid language key' );
			} else {
				doLanguageTransformTable( new Array( $('#testLangKey').val() ) )
			}
		});

		$('#runAll').click(function(){
			mw.log('runAll');
			$('#table_out,#score_card').empty();
			// Build the langTestSet from mw.language.names
			var langTestSet = []
			for( var i in mw.language.names ) {
				langTestSet.push( i ) ;
			}
			doLanguageTransformTable( langTestSet );
		});

		// Set-up base convert plural and gender (to restore for non-transform languages )
		var baseConvertPlural = mw.language.convertPlural;

		// Do manual script loaders calls to test multiple languages:
		function doLanguageTransformTable( langSet ){
			$('#table_out').html( '<span class="loadingSpinner">loading...</span>' );
			//build table output:
			var messageTestSet = {
				'undelete_short' : [ 0, 1, 2, 5, 21, 101 ],
				//category-subcat-count' has two params:
				'category-subcat-count' : [
					[0,10],
					[1,2],
					[3,30]
				]
			};

			var passTest=0;
			var failTest=0;
			var testCount=0;

			/**
			* Process a language key test set
			*/
			function doProcLangKey( langKey ){
				mw.log(" doProcLangKey: " + langKey );
				// Clear out the old digitTransformTable
				mw.language.digitTransformTable = null;
				// Load the current language js file if it has a langKey
				var transformLangKey = mw.language.getLangTransformKey ( langKey );
				if( transformLangKey != 'en' ){
					mw.log( langKey + " load msg transform" );
					//var langName = 'Language' +	transformLangKey.substr(0,1).toUpperCase() + transformLangKey.substr( 1, transformLangKey.length );
					$.getScript( wgScriptPath + '/resources/mediawiki.language/languages/classes/' + langName.toLowerCase() + '.js' , function(){
						doLangTest();
					});
				} else {
					mw.log( langKey + " no msg transform restore base" );
					//If no transform, restore base plural
					mw.language.convertPlural = baseConvertPlural;
					doLangTest();
				}

				function doLangTest(){
					mw.log("doLangTest::" + langKey);
					// Load the updated messages for the current language Key
					$.getScript( wgScriptPath + '/load.php?modules=mediawiki.language.parser&debug=true&only=messages&lang='+langKey, function(){
						var o='';
						o+='<tr><td colspan="6" height="20" style="font-size:large"><b>Lang:' + langKey + '</b></td></tr>';

						// Now for each language msg:
						$.each(messageTestSet, function(mKey, mTestSet){
							//output table names:
							o+= headerRowHtml;

							//for each number value
							for( var i in mTestSet ){
								var numVal = mTestSet[i];
								var numKey = i;
								var tkey = mKey + '_' + numKey + '_' + langKey;
								o+= '<tr style="border:1px solid">' +
										'<td style="border:1px solid" >' + numVal + '</td>' +
										'<td style="border:1px solid" >' + mKey + '</td>' +
										'<td style="border:1px solid" >' + mw.msgNoTrans( mKey ) + '</td>' +
										'<td style="border:1px solid" id="' + tkey + '_js">' + mw.msg( mKey, numVal ) + '</td>';
								//show mw col:
								if( mKey.substr(0, 5) == 'test_' ){
									o+='<td style="border:1px solid"> (test msg) </td>';
								}else{
									o+='<td style="border:1px solid" id="' + tkey + '">loading...</td>';

									//get transform from mw (& compare and highlight)
									function doPopWmMsg( mKey, numVal, numKey ){
										// Set the local tkey:
										var tkey = mKey + '_' + numKey + '_' + langKey;
										testCount++;
										$('#score_card').html('Running Tests <span id="perc_done">0</sapn>% done');
										var msgparam = (typeof numVal== 'object')? numVal.join( '|' ) : numVal;

										var request = {
											'action' : 'query',
											'format' : 'json',
											'meta' : 'allmessages',
											'ammessages' : mKey,
											'amlang' : langKey,
											'amargs' : msgparam,
											'amenableparser' : true
										};

										$.getJSON( wgScriptPath + '/api.php', request, function( data ) {
											var t =	'#'+ tkey;
											var $target = $( t ) ;
											if( data.query && data.query.allmessages && data.query.allmessages[0]){
												var msgText = data.query.allmessages && data.query.allmessages[0]['*'];
												if( msgText == '' )
													msgText = ' %missing% ';
												$target.html( msgText );
												var js_txt = $.trim( $(t + '_js').text().replace('\n', '') );
												var php_txt = $.trim( msgText );
												// Just get the part in the <p> to compare with js version
												if( js_txt != php_txt ){
													$target.css('color', 'red');
													failTest++;
												}else{
													$target.css('color', 'green');
													passTest++;
												}
												var perc = ( failTest + passTest ) / testCount
												if( perc != 1){
													$('#perc_done').html( Math.round(perc*1000)/1000 + '%');
												}else{
													var failHtlm = (failTest == 0)?failTest: '<span style="color:red">'+ failTest+'</span>';
													$('#score_card').html(
														'Passed: <span style="color:green">' + passTest + '</span> Failed:' + failHtlm
													);

													// Done with this lang... call outer function if we have lang keys left to proccess:
													if( langSet.length !=0 ){
														doProcLangKey( langSet.pop() );
													}
												}
											}else{
												$target.html(' error ').css('color', 'red');
											}
										});
									};
									// pop off an anonymous function call
									doPopWmMsg(mKey, numVal, numKey);
								}
								o+='</tr>';
							}
							//output a spacer:
							o+='<tr><td colspan="6" height="20"> </td></tr>';
						});
						// remove the loading text
						$( '.loadingSpinner').remove();
						//Put the output into the page:
						$('#table_out').append( o );

					});
				}
			} // process lang key:

			doProcLangKey( langSet.pop() );
		}
	}

}
// Once the dom is ready init the test page:
$(function () {
	mw.language.parserTest.init();
});

/**
* Get a language transform key
* returns default "en" fallback if none found
* @param String langKey The language key to be checked
*

*/

mw.language.getLangTransformKey = function( langKey ) {
	if( mw.language.fallbackTransformMap[ langKey ] ) {
		langKey = mw.language.fallbackTransformMap[ langKey ];
	}
	// Make sure the langKey has a transformClass:
	for( var i = 0; i < mw.language.transformClass.length ; i++ ) {
		if( langKey == mw.language.transformClass[i] ){
			return langKey
		}
	}
	// By default return the base 'en' class
	return 'en';
};

/**
 * @@FIXME this should be handled dynamically handled in the resource loader
 * 	so it keeps up-to-date with php maping.
 * 	( not explicitly listed here )
 */
mw.language.fallbackTransformMap = {
		'mwl' : 'pt',
		'ace' : 'id',
		'hsb' : 'de',
		'frr' : 'de',
		'pms' : 'it',
		'dsb' : 'de',
		'gan' : 'gan-hant',
		'lzz' : 'tr',
		'ksh' : 'de',
		'kl' : 'da',
		'fur' : 'it',
		'zh-hk' : 'zh-hant',
		'kk' : 'kk-cyrl',
		'zh-my' : 'zh-sg',
		'nah' : 'es',
		'sr' : 'sr-ec',
		'ckb-latn' : 'ckb-arab',
		'mo' : 'ro',
		'ay' : 'es',
		'gl' : 'pt',
		'gag' : 'tr',
		'mzn' : 'fa',
		'ruq-cyrl' : 'mk',
		'kk-arab' : 'kk-cyrl',
		'pfl' : 'de',
		'zh-yue' : 'yue',
		'ug' : 'ug-latn',
		'ltg' : 'lv',
		'nds' : 'de',
		'sli' : 'de',
		'mhr' : 'ru',
		'sah' : 'ru',
		'ff' : 'fr',
		'ab' : 'ru',
		'ko-kp' : 'ko',
		'sg' : 'fr',
		'zh-tw' : 'zh-hant',
		'map-bms' : 'jv',
		'av' : 'ru',
		'nds-nl' : 'nl',
		'pt-br' : 'pt',
		'ce' : 'ru',
		'vep' : 'et',
		'wuu' : 'zh-hans',
		'pdt' : 'de',
		'krc' : 'ru',
		'gan-hant' : 'zh-hant',
		'bqi' : 'fa',
		'as' : 'bn',
		'bm' : 'fr',
		'gn' : 'es',
		'tt' : 'ru',
		'zh-hant' : 'zh-hans',
		'hif' : 'hif-latn',
		'zh' : 'zh-hans',
		'kaa' : 'kk-latn',
		'lij' : 'it',
		'vot' : 'fi',
		'ii' : 'zh-cn',
		'ku-arab' : 'ckb-arab',
		'xmf' : 'ka',
		'vmf' : 'de',
		'zh-min-nan' : 'nan',
		'bcc' : 'fa',
		'an' : 'es',
		'rgn' : 'it',
		'qu' : 'es',
		'nb' : 'no',
		'bar' : 'de',
		'lbe' : 'ru',
		'su' : 'id',
		'pcd' : 'fr',
		'glk' : 'fa',
		'lb' : 'de',
		'kk-kz' : 'kk-cyrl',
		'kk-tr' : 'kk-latn',
		'inh' : 'ru',
		'mai' : 'hi',
		'tp' : 'tokipona',
		'kk-latn' : 'kk-cyrl',
		'ba' : 'ru',
		'nap' : 'it',
		'ruq' : 'ruq-latn',
		'tt-cyrl' : 'ru',
		'lad' : 'es',
		'dk' : 'da',
		'de-ch' : 'de',
		'be-x-old' : 'be-tarask',
		'za' : 'zh-hans',
		'kk-cn' : 'kk-arab',
		'shi' : 'ar',
		'crh' : 'crh-latn',
		'yi' : 'he',
		'pdc' : 'de',
		'eml' : 'it',
		'uk' : 'ru',
		'kv' : 'ru',
		'koi' : 'ru',
		'cv' : 'ru',
		'zh-cn' : 'zh-hans',
		'de-at' : 'de',
		'jut' : 'da',
		'vec' : 'it',
		'zh-mo' : 'zh-hk',
		'fiu-vro' : 'vro',
		'frp' : 'fr',
		'mg' : 'fr',
		'ruq-latn' : 'ro',
		'sa' : 'hi',
		'lmo' : 'it',
		'kiu' : 'tr',
		'tcy' : 'kn',
		'srn' : 'nl',
		'jv' : 'id',
		'vls' : 'nl',
		'zea' : 'nl',
		'ty' : 'fr',
		'szl' : 'pl',
		'rmy' : 'ro',
		'wo' : 'fr',
		'vro' : 'et',
		'udm' : 'ru',
		'bpy' : 'bn',
		'mrj' : 'ru',
		'ckb' : 'ckb-arab',
		'xal' : 'ru',
		'de-formal' : 'de',
		'myv' : 'ru',
		'ku' : 'ku-latn',
		'crh-cyrl' : 'ru',
		'gsw' : 'de',
		'rue' : 'uk',
		'iu' : 'ike-cans',
		'stq' : 'de',
		'gan-hans' : 'zh-hans',
		'scn' : 'it',
		'arn' : 'es',
		'ht' : 'fr',
		'zh-sg' : 'zh-hans',
		'bat-smg' : 'lt',
		'aln' : 'sq',
		'tg' : 'tg-cyrl',
		'li' : 'nl',
		'simple' : 'en',
		'os' : 'ru',
		'ln' : 'fr',
		'als' : 'gsw',
		'zh-classical' : 'lzh',
		'arz' : 'ar',
		'wa' : 'fr'
	};

/**
 * Language classes ( which have a file in /languages/classes/Language{code}.js )
 * ( for languages that override default transforms )
 *
 * @@FIXME again not needed if the resource loader manages this mapping and gives
 * 	us the "right" transform class regardless of what language key we request.
 */
mw.language.transformClass = ['am', 'ar', 'bat_smg', 'be_tarak', 'be', 'bh',
		'bs', 'cs', 'cu', 'cy', 'dsb', 'fr', 'ga', 'gd', 'gv', 'he', 'hi',
		'hr', 'hsb', 'hy', 'ksh', 'ln', 'lt', 'lv', 'mg', 'mk', 'mo', 'mt',
		'nso', 'pl', 'pt_br', 'ro', 'ru', 'se', 'sh', 'sk', 'sl', 'sma',
		'sr_ec', 'sr_el', 'sr', 'ti', 'tl', 'uk', 'wa' ];

/**
 * List of all languages mediaWiki supports:
 *
 * Similar to api query:
 * http://commons.wikimedia.org/w/api.php?action=query&meta=siteinfo&siprop=languages&format=jsonfm
 *
 * @@FIXME This should be dynamically generated via the resource loader and identified as a dependency of this test file.
 *
 */
mediaWiki.language.names = {
	"aa" : "Qaf\u00e1r af",
	"ab" : "\u0410\u04a7\u0441\u0443\u0430",
	"ace" : "Ac\u00e8h",
	"af" : "Afrikaans",
	"ak" : "Akan",
	"aln" : "Geg\u00eb",
	"als" : "Alemannisch",
	"am" : "\u12a0\u121b\u122d\u129b",
	"an" : "Aragon\u00e9s",
	"ang" : "Anglo-Saxon",
	"ar" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
	"arc" : "\u0710\u072a\u0721\u071d\u0710",
	"arn" : "Mapudungun",
	"arz" : "\u0645\u0635\u0631\u0649",
	"as" : "\u0985\u09b8\u09ae\u09c0\u09af\u09bc\u09be",
	"ast" : "Asturianu",
	"av" : "\u0410\u0432\u0430\u0440",
	"avk" : "Kotava",
	"ay" : "Aymar aru",
	"az" : "Az\u0259rbaycan",
	"ba" : "\u0411\u0430\u0448\u04a1\u043e\u0440\u0442",
	"bar" : "Boarisch",
	"bat-smg" : "\u017demait\u0117\u0161ka",
	"bcc" : "\u0628\u0644\u0648\u0686\u06cc \u0645\u06a9\u0631\u0627\u0646\u06cc",
	"bcl" : "Bikol Central",
	"be" : "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f",
	"be-tarask" : "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f (\u0442\u0430\u0440\u0430\u0448\u043a\u0435\u0432\u0456\u0446\u0430)",
	"be-x-old" : "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f (\u0442\u0430\u0440\u0430\u0448\u043a\u0435\u0432\u0456\u0446\u0430)",
	"bg" : "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438",
	"bh" : "\u092d\u094b\u091c\u092a\u0941\u0930\u0940",
	"bi" : "Bislama",
	"bm" : "Bamanankan",
	"bn" : "\u09ac\u09be\u0982\u09b2\u09be",
	"bo" : "\u0f56\u0f7c\u0f51\u0f0b\u0f61\u0f72\u0f42",
	"bpy" : "\u0987\u09ae\u09be\u09b0 \u09a0\u09be\u09b0\/\u09ac\u09bf\u09b7\u09cd\u09a3\u09c1\u09aa\u09cd\u09b0\u09bf\u09af\u09bc\u09be \u09ae\u09a3\u09bf\u09aa\u09c1\u09b0\u09c0",
	"bqi" : "\u0628\u062e\u062a\u064a\u0627\u0631\u064a",
	"br" : "Brezhoneg",
	"bs" : "Bosanski",
	"bug" : "\u1a05\u1a14 \u1a15\u1a18\u1a01\u1a17",
	"bxr" : "\u0411\u0443\u0440\u044f\u0430\u0434",
	"ca" : "Catal\u00e0",
	"cbk-zam" : "Chavacano de Zamboanga",
	"cdo" : "M\u00ecng-d\u0115\u0324ng-ng\u1e73\u0304",
	"ce" : "\u041d\u043e\u0445\u0447\u0438\u0439\u043d",
	"ceb" : "Cebuano",
	"ch" : "Chamoru",
	"cho" : "Choctaw",
	"chr" : "\u13e3\u13b3\u13a9",
	"chy" : "Tsets\u00eahest\u00e2hese",
	"ckb" : "Soran\u00ee \/ \u06a9\u0648\u0631\u062f\u06cc",
	"ckb-latn" : "\u202aSoran\u00ee (lat\u00een\u00ee)\u202c",
	"ckb-arab" : "\u202b\u06a9\u0648\u0631\u062f\u06cc (\u0639\u06d5\u0631\u06d5\u0628\u06cc)\u202c",
	"co" : "Corsu",
	"cr" : "N\u0113hiyaw\u0113win \/ \u14c0\u1426\u1403\u152d\u140d\u140f\u1423",
	"crh" : "Q\u0131r\u0131mtatarca",
	"crh-latn" : "\u202aQ\u0131r\u0131mtatarca (Latin)\u202c",
	"crh-cyrl" : "\u202a\u041a\u044a\u044b\u0440\u044b\u043c\u0442\u0430\u0442\u0430\u0440\u0434\u0436\u0430 (\u041a\u0438\u0440\u0438\u043b\u043b)\u202c",
	"cs" : "\u010cesky",
	"csb" : "Kasz\u00ebbsczi",
	"cu" : "\u0421\u043b\u043e\u0432\u0463\u0301\u043d\u044c\u0441\u043a\u044a \/ \u2c14\u2c0e\u2c11\u2c02\u2c21\u2c10\u2c20\u2c14\u2c0d\u2c1f",
	"cv" : "\u0427\u04d1\u0432\u0430\u0448\u043b\u0430",
	"cy" : "Cymraeg",
	"da" : "Dansk",
	"de" : "Deutsch",
	"de-at" : "\u00d6sterreichisches Deutsch",
	"de-ch" : "Schweizer Hochdeutsch",
	"de-formal" : "Deutsch (Sie-Form)",
	"diq" : "Zazaki",
	"dk" : "Dansk (deprecated:da)",
	"dsb" : "Dolnoserbski",
	"dv" : "\u078b\u07a8\u0788\u07ac\u0780\u07a8\u0784\u07a6\u0790\u07b0",
	"dz" : "\u0f47\u0f7c\u0f44\u0f0b\u0f41",
	"ee" : "E\u028begbe",
	"el" : "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac",
	"eml" : "Emili\u00e0n e rumagn\u00f2l",
	"en" : "English",
	"en-gb" : "British English",
	"eo" : "Esperanto",
	"es" : "Espa\u00f1ol",
	"et" : "Eesti",
	"eu" : "Euskara",
	"ext" : "Estreme\u00f1u",
	"fa" : "\u0641\u0627\u0631\u0633\u06cc",
	"ff" : "Fulfulde",
	"fi" : "Suomi",
	"fiu-vro" : "V\u00f5ro",
	"fj" : "Na Vosa Vakaviti",
	"fo" : "F\u00f8royskt",
	"fr" : "Fran\u00e7ais",
	"frc" : "Fran\u00e7ais cadien",
	"frp" : "Arpetan",
	"fur" : "Furlan",
	"fy" : "Frysk",
	"ga" : "Gaeilge",
	"gag" : "Gagauz",
	"gan" : "\u8d1b\u8a9e",
	"gan-hans" : "\u8d63\u8bed(\u7b80\u4f53)",
	"gan-hant" : "\u8d1b\u8a9e(\u7e41\u9ad4)",
	"gd" : "G\u00e0idhlig",
	"gl" : "Galego",
	"glk" : "\u06af\u06cc\u0644\u06a9\u06cc",
	"gn" : "Ava\u00f1e'\u1ebd",
	"got" : "\ud800\udf32\ud800\udf3f\ud800\udf44\ud800\udf39\ud800\udf43\ud800\udf3a",
	"grc" : "\u1f08\u03c1\u03c7\u03b1\u03af\u03b1 \u1f11\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u1f74",
	"gsw" : "Alemannisch",
	"gu" : "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0",
	"gv" : "Gaelg",
	"ha" : "\u0647\u064e\u0648\u064f\u0633\u064e",
	"hak" : "Hak-k\u00e2-fa",
	"haw" : "Hawai`i",
	"he" : "\u05e2\u05d1\u05e8\u05d9\u05ea",
	"hi" : "\u0939\u093f\u0928\u094d\u0926\u0940",
	"hif" : "Fiji Hindi",
	"hif-deva" : "\u092b\u093c\u0940\u091c\u0940 \u0939\u093f\u0928\u094d\u0926\u0940",
	"hif-latn" : "Fiji Hindi",
	"hil" : "Ilonggo",
	"ho" : "Hiri Motu",
	"hr" : "Hrvatski",
	"hsb" : "Hornjoserbsce",
	"ht" : "Krey\u00f2l ayisyen",
	"hu" : "Magyar",
	"hy" : "\u0540\u0561\u0575\u0565\u0580\u0565\u0576",
	"hz" : "Otsiherero",
	"ia" : "Interlingua",
	"id" : "Bahasa Indonesia",
	"ie" : "Interlingue",
	"ig" : "Igbo",
	"ii" : "\ua187\ua259",
	"ik" : "I\u00f1upiak",
	"ike-cans" : "\u1403\u14c4\u1483\u144e\u1450\u1466",
	"ike-latn" : "inuktitut",
	"ilo" : "Ilokano",
	"inh" : "\u0413\u0406\u0430\u043b\u0433\u0406\u0430\u0439 \u011eal\u011faj",
	"io" : "Ido",
	"is" : "\u00cdslenska",
	"it" : "Italiano",
	"iu" : "\u1403\u14c4\u1483\u144e\u1450\u1466\/inuktitut",
	"ja" : "\u65e5\u672c\u8a9e",
	"jbo" : "Lojban",
	"jut" : "Jysk",
	"jv" : "Basa Jawa",
	"ka" : "\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8",
	"kaa" : "Qaraqalpaqsha",
	"kab" : "Taqbaylit",
	"kg" : "Kongo",
	"ki" : "G\u0129k\u0169y\u0169",
	"kiu" : "Kurmanc\u00ee",
	"kj" : "Kwanyama",
	"kk" : "\u049a\u0430\u0437\u0430\u049b\u0448\u0430",
	"kk-arab" : "\u202b\u0642\u0627\u0632\u0627\u0642\u0634\u0627 (\u062a\u0674\u0648\u062a\u06d5)\u202c",
	"kk-cyrl" : "\u202a\u049a\u0430\u0437\u0430\u049b\u0448\u0430 (\u043a\u0438\u0440\u0438\u043b)\u202c",
	"kk-latn" : "\u202aQazaq\u015fa (lat\u0131n)\u202c",
	"kk-cn" : "\u202b\u0642\u0627\u0632\u0627\u0642\u0634\u0627 (\u062c\u06c7\u0646\u06af\u0648)\u202c",
	"kk-kz" : "\u202a\u049a\u0430\u0437\u0430\u049b\u0448\u0430 (\u049a\u0430\u0437\u0430\u049b\u0441\u0442\u0430\u043d)\u202c",
	"kk-tr" : "\u202aQazaq\u015fa (T\u00fcrk\u00efya)\u202c",
	"kl" : "Kalaallisut",
	"km" : "\u1797\u17b6\u179f\u17b6\u1781\u17d2\u1798\u17c2\u179a",
	"kn" : "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1",
	"ko" : "\ud55c\uad6d\uc5b4",
	"ko-kp" : "\ud55c\uad6d\uc5b4 (\uc870\uc120)",
	"kr" : "Kanuri",
	"kri" : "Krio",
	"krj" : "Kinaray-a",
	"ks" : "\u0915\u0936\u094d\u092e\u0940\u0930\u0940 - (\u0643\u0634\u0645\u064a\u0631\u064a)",
	"ksh" : "Ripoarisch",
	"ku" : "Kurd\u00ee \/ \u0643\u0648\u0631\u062f\u06cc",
	"ku-latn" : "\u202aKurd\u00ee (lat\u00een\u00ee)\u202c",
	"ku-arab" : "\u202b\u0643\u0648\u0631\u062f\u064a (\u0639\u06d5\u0631\u06d5\u0628\u06cc)\u202c",
	"kv" : "\u041a\u043e\u043c\u0438",
	"kw" : "Kernowek",
	"ky" : "\u041a\u044b\u0440\u0433\u044b\u0437\u0447\u0430",
	"la" : "Latina",
	"lad" : "Ladino",
	"lb" : "L\u00ebtzebuergesch",
	"lbe" : "\u041b\u0430\u043a\u043a\u0443",
	"lez" : "\u041b\u0435\u0437\u0433\u0438",
	"lfn" : "Lingua Franca Nova",
	"lg" : "Luganda",
	"li" : "Limburgs",
	"lij" : "L\u00edguru",
	"lmo" : "Lumbaart",
	"ln" : "Ling\u00e1la",
	"lo" : "\u0ea5\u0eb2\u0ea7",
	"loz" : "Silozi",
	"lt" : "Lietuvi\u0173",
	"lv" : "Latvie\u0161u",
	"lzh" : "\u6587\u8a00",
	"mai" : "\u092e\u0948\u0925\u093f\u0932\u0940",
	"map-bms" : "Basa Banyumasan",
	"mdf" : "\u041c\u043e\u043a\u0448\u0435\u043d\u044c",
	"mg" : "Malagasy",
	"mh" : "Ebon",
	"mhr" : "\u041e\u043b\u044b\u043a \u041c\u0430\u0440\u0438\u0439",
	"mi" : "M\u0101ori",
	"mk" : "\u041c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438",
	"ml" : "\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02",
	"mn" : "\u041c\u043e\u043d\u0433\u043e\u043b",
	"mo" : "\u041c\u043e\u043b\u0434\u043e\u0432\u0435\u043d\u044f\u0441\u043a\u044d",
	"mr" : "\u092e\u0930\u093e\u0920\u0940",
	"ms" : "Bahasa Melayu",
	"mt" : "Malti",
	"mus" : "Mvskoke",
	"mwl" : "Mirand\u00e9s",
	"my" : "\u1019\u103c\u1014\u103a\u1019\u102c\u1018\u102c\u101e\u102c",
	"myv" : "\u042d\u0440\u0437\u044f\u043d\u044c",
	"mzn" : "\u0645\u064e\u0632\u0650\u0631\u0648\u0646\u064a",
	"na" : "Dorerin Naoero",
	"nah" : "N\u0101huatl",
	"nan" : "B\u00e2n-l\u00e2m-g\u00fa",
	"nap" : "Nnapulitano",
	"nb" : "\u202aNorsk (bokm\u00e5l)\u202c",
	"nds" : "Plattd\u00fc\u00fctsch",
	"nds-nl" : "Nedersaksisch",
	"ne" : "\u0928\u0947\u092a\u093e\u0932\u0940",
	"new" : "\u0928\u0947\u092a\u093e\u0932 \u092d\u093e\u0937\u093e",
	"ng" : "Oshiwambo",
	"niu" : "Niu\u0113",
	"nl" : "Nederlands",
	"nn" : "\u202aNorsk (nynorsk)\u202c",
	"no" : "\u202aNorsk (bokm\u00e5l)\u202c",
	"nov" : "Novial",
	"nrm" : "Nouormand",
	"nso" : "Sesotho sa Leboa",
	"nv" : "Din\u00e9 bizaad",
	"ny" : "Chi-Chewa",
	"oc" : "Occitan",
	"om" : "Oromoo",
	"or" : "\u0b13\u0b21\u0b3c\u0b3f\u0b06",
	"os" : "\u0418\u0440\u043e\u043d\u0430\u0443",
	"pa" : "\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40",
	"pag" : "Pangasinan",
	"pam" : "Kapampangan",
	"pap" : "Papiamentu",
	"pcd" : "Picard",
	"pdc" : "Deitsch",
	"pdt" : "Plautdietsch",
	"pfl" : "Pf\u00e4lzisch",
	"pi" : "\u092a\u093e\u093f\u0934",
	"pih" : "Norfuk \/ Pitkern",
	"pl" : "Polski",
	"pms" : "Piemont\u00e8is",
	"pnb" : "\u067e\u0646\u062c\u0627\u0628\u06cc",
	"pnt" : "\u03a0\u03bf\u03bd\u03c4\u03b9\u03b1\u03ba\u03ac",
	"ps" : "\u067e\u069a\u062a\u0648",
	"pt" : "Portugu\u00eas",
	"pt-br" : "Portugu\u00eas do Brasil",
	"qu" : "Runa Simi",
	"rif" : "Tarifit",
	"rm" : "Rumantsch",
	"rmy" : "Romani",
	"rn" : "Kirundi",
	"ro" : "Rom\u00e2n\u0103",
	"roa-rup" : "Arm\u00e3neashce",
	"roa-tara" : "Tarand\u00edne",
	"ru" : "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
	"ruq" : "Vl\u0103he\u015fte",
	"ruq-cyrl" : "\u0412\u043b\u0430\u0445\u0435\u0441\u0442\u0435",
	"ruq-latn" : "Vl\u0103he\u015fte",
	"rw" : "Kinyarwanda",
	"sa" : "\u0938\u0902\u0938\u094d\u0915\u0943\u0924",
	"sah" : "\u0421\u0430\u0445\u0430 \u0442\u044b\u043b\u0430",
	"sc" : "Sardu",
	"scn" : "Sicilianu",
	"sco" : "Scots",
	"sd" : "\u0633\u0646\u068c\u064a",
	"sdc" : "Sassaresu",
	"se" : "S\u00e1megiella",
	"sei" : "Cmique Itom",
	"sg" : "S\u00e4ng\u00f6",
	"sh" : "Srpskohrvatski \/ \u0421\u0440\u043f\u0441\u043a\u043e\u0445\u0440\u0432\u0430\u0442\u0441\u043a\u0438",
	"shi" : "Ta\u0161l\u1e25iyt",
	"si" : "\u0dc3\u0dd2\u0d82\u0dc4\u0dbd",
	"simple" : "Simple English",
	"sk" : "Sloven\u010dina",
	"sl" : "Sloven\u0161\u010dina",
	"sli" : "Schl\u00e4sch",
	"sm" : "Gagana Samoa",
	"sma" : "\u00c5arjelsaemien",
	"sn" : "chiShona",
	"so" : "Soomaaliga",
	"sq" : "Shqip",
	"sr" : "\u0421\u0440\u043f\u0441\u043a\u0438 \/ Srpski",
	"sr-ec" : "\u0421\u0440\u043f\u0441\u043a\u0438 (\u045b\u0438\u0440\u0438\u043b\u0438\u0446\u0430)",
	"sr-el" : "Srpski (latinica)",
	"srn" : "Sranantongo",
	"ss" : "SiSwati",
	"st" : "Sesotho",
	"stq" : "Seeltersk",
	"su" : "Basa Sunda",
	"sv" : "Svenska",
	"sw" : "Kiswahili",
	"szl" : "\u015al\u016fnski",
	"ta" : "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd",
	"tcy" : "\u0ca4\u0cc1\u0cb3\u0cc1",
	"te" : "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41",
	"tet" : "Tetun",
	"tg" : "\u0422\u043e\u04b7\u0438\u043a\u04e3",
	"tg-cyrl" : "\u0422\u043e\u04b7\u0438\u043a\u04e3",
	"tg-latn" : "tojik\u012b",
	"th" : "\u0e44\u0e17\u0e22",
	"ti" : "\u1275\u130d\u122d\u129b",
	"tk" : "T\u00fcrkmen\u00e7e",
	"tl" : "Tagalog",
	"tn" : "Setswana",
	"to" : "lea faka-Tonga",
	"tokipona" : "Toki Pona",
	"tp" : "Toki Pona (deprecated:tokipona)",
	"tpi" : "Tok Pisin",
	"tr" : "T\u00fcrk\u00e7e",
	"ts" : "Xitsonga",
	"tt" : "\u0422\u0430\u0442\u0430\u0440\u0447\u0430\/Tatar\u00e7a",
	"tt-cyrl" : "\u0422\u0430\u0442\u0430\u0440\u0447\u0430",
	"tt-latn" : "Tatar\u00e7a",
	"tum" : "chiTumbuka",
	"tw" : "Twi",
	"ty" : "Reo M\u0101`ohi",
	"tyv" : "\u0422\u044b\u0432\u0430 \u0434\u044b\u043b",
	"udm" : "\u0423\u0434\u043c\u0443\u0440\u0442",
	"ug" : "Uyghurche\u200e \/ \u0626\u06c7\u064a\u063a\u06c7\u0631\u0686\u06d5",
	"ug-arab" : "\u0626\u06c7\u064a\u063a\u06c7\u0631\u0686\u06d5",
	"ug-latn" : "Uyghurche\u200e",
	"uk" : "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430",
	"ur" : "\u0627\u0631\u062f\u0648",
	"uz" : "O'zbek",
	"ve" : "Tshivenda",
	"vec" : "V\u00e8neto",
	"vep" : "Vepsan kel'",
	"vi" : "Ti\u1ebfng Vi\u1ec7t",
	"vls" : "West-Vlams",
	"vo" : "Volap\u00fck",
	"vro" : "V\u00f5ro",
	"wa" : "Walon",
	"war" : "Winaray",
	"wo" : "Wolof",
	"wuu" : "\u5434\u8bed",
	"xal" : "\u0425\u0430\u043b\u044c\u043c\u0433",
	"xh" : "isiXhosa",
	"xmf" : "\u10db\u10d0\u10e0\u10d2\u10d0\u10da\u10e3\u10e0\u10d8",
	"yi" : "\u05d9\u05d9\u05b4\u05d3\u05d9\u05e9",
	"yo" : "Yor\u00f9b\u00e1",
	"yue" : "\u7cb5\u8a9e",
	"za" : "Vahcuengh",
	"zea" : "Ze\u00eauws",
	"zh" : "\u4e2d\u6587",
	"zh-classical" : "\u6587\u8a00",
	"zh-cn" : "\u202a\u4e2d\u6587(\u4e2d\u56fd\u5927\u9646)\u202c",
	"zh-hans" : "\u202a\u4e2d\u6587(\u7b80\u4f53)\u202c",
	"zh-hant" : "\u202a\u4e2d\u6587(\u7e41\u9ad4)\u202c",
	"zh-hk" : "\u202a\u4e2d\u6587(\u9999\u6e2f)\u202c",
	"zh-min-nan" : "B\u00e2n-l\u00e2m-g\u00fa",
	"zh-mo" : "\u202a\u4e2d\u6587(\u6fb3\u9580)\u202c",
	"zh-my" : "\u202a\u4e2d\u6587(\u9a6c\u6765\u897f\u4e9a)\u202c",
	"zh-sg" : "\u202a\u4e2d\u6587(\u65b0\u52a0\u5761)\u202c",
	"zh-tw" : "\u202a\u4e2d\u6587(\u53f0\u7063)\u202c",
	"zh-yue" : "\u7cb5\u8a9e",
	"zu" : "isiZulu"
};


})(jQuery, mediaWiki);
