mw.addMessages({
	"mwe-code-unknown": "Unknown language"
});

/**
 * Utility class which knows about languages, and how to construct HTML to select them
 * TODO: make this a more common library, used by this and TimedText
 */
mw.LanguageUpWiz = {

	defaultCode: 'en',  // when we absolutely have no idea what language to preselect

	initialized: false,

	UNKNOWN: 'unknown',

	/**
	 * List of all languages mediaWiki supports ( Avoid an api call to get this same info )
	 * http://commons.wikimedia.org/w/api.php?action=query&meta=siteinfo&siprop=languages&format=jsonfm
	 * 
     * Languages sorted by name, using tools in $SVNROOT/mediawiki/trunk/tools/langcodes 
	 * This is somewhat better than sorting by code (which produces totally bizarre results) but is not
	 * a true lexicographic sort
	 */
	languages: [
		{ code: "ace",           text: "Ac\u00e8h" },
		{ code: "af",            text: "Afrikaans" },
		{ code: "ak",            text: "Akan" },
		{ code: "als",           text: "Alemannisch" },   // } XXX someone fix this please
		{ code: "gsw",           text: "Alemannisch" },   // } 
		{ code: "ang",           text: "Anglo-Saxon" },
		{ code: "an",            text: "Aragon\u00e9s" },
		{ code: "roa-rup",       text: "Arm\u00e3neashce" },
		{ code: "frp",           text: "Arpetan" },
		{ code: "ast",           text: "Asturianu" },
		{ code: "gn",            text: "Ava\u00f1e'\u1ebd" },
		{ code: "ay",            text: "Aymar aru" },
		{ code: "az",            text: "Az\u0259rbaycan" },
		{ code: "id",            text: "Bahasa Indonesia" },
		{ code: "ms",            text: "Bahasa Melayu" },
		{ code: "bm",            text: "Bamanankan" },
		{ code: "map-bms",       text: "Basa Banyumasan" },
		{ code: "jv",            text: "Basa Jawa" },
		{ code: "su",            text: "Basa Sunda" },
		{ code: "bcl",           text: "Bikol Central" },
		{ code: "bi",            text: "Bislama" },
		{ code: "bar",           text: "Boarisch" },
		{ code: "bs",            text: "Bosanski" },
		{ code: "br",            text: "Brezhoneg" },
		{ code: "en-gb",         text: "British English" },
		{ code: "nan",           text: "B\u00e2n-l\u00e2m-g\u00fa" },
		{ code: "zh-min-nan",    text: "B\u00e2n-l\u00e2m-g\u00fa" },
		{ code: "ca",            text: "Catal\u00e0" },
		{ code: "ceb",           text: "Cebuano" },
		{ code: "ch",            text: "Chamoru" },
		{ code: "cbk-zam",       text: "Chavacano de Zamboanga" },
		{ code: "ny",            text: "Chi-Chewa" },
		{ code: "cho",           text: "Choctaw" },
		{ code: "sei",           text: "Cmique Itom" },
		{ code: "co",            text: "Corsu" },
		{ code: "cy",            text: "Cymraeg" },
		{ code: "da",            text: "Dansk" },
		{ code: "dk",            text: "Dansk (deprecated:da)" },  // XXX deprecated?
		{ code: "pdc",           text: "Deitsch" },
		{ code: "de",            text: "Deutsch" },
		{ code: "de-formal",     text: "Deutsch (Sie-Form)" },
		{ code: "nv",            text: "Din\u00e9 bizaad" },
		{ code: "dsb",           text: "Dolnoserbski" },
		{ code: "na",            text: "Dorerin Naoero" },
		{ code: "mh",            text: "Ebon" },
		{ code: "et",            text: "Eesti" },
		{ code: "eml",           text: "Emili\u00e0n e rumagn\u00f2l" },
		{ code: "en",            text: "English" },
		{ code: "es",            text: "Espa\u00f1ol" },
		{ code: "eo",            text: "Esperanto" },
		{ code: "ext",           text: "Estreme\u00f1u" },
		{ code: "eu",            text: "Euskara" },
		{ code: "ee",            text: "E\u028begbe" },
		{ code: "hif",           text: "Fiji Hindi" },   // } XXX fix this
		{ code: "hif-latn",      text: "Fiji Hindi" },   // }
		{ code: "fr",            text: "Fran\u00e7ais" },
		{ code: "frc",           text: "Fran\u00e7ais canadien" },
		{ code: "fy",            text: "Frysk" },
		{ code: "ff",            text: "Fulfulde" },
		{ code: "fur",           text: "Furlan" },
		{ code: "fo",            text: "F\u00f8royskt" },
		{ code: "ga",            text: "Gaeilge" },
		{ code: "gv",            text: "Gaelg" },
		{ code: "sm",            text: "Gagana Samoa" },
		{ code: "gag",           text: "Gagauz" },
		{ code: "gl",            text: "Galego" },
		{ code: "aln",           text: "Geg\u00eb" },
		{ code: "gd",            text: "G\u00e0idhlig" },
		{ code: "ki",            text: "G\u0129k\u0169y\u0169" },
		{ code: "hak",           text: "Hak-k\u00e2-fa" },
		{ code: "haw",           text: "Hawai`i" },
		{ code: "ho",            text: "Hiri Motu" },
		{ code: "hsb",           text: "Hornjoserbsce" },
		{ code: "hr",            text: "Hrvatski" },
		{ code: "io",            text: "Ido" },
		{ code: "ig",            text: "Igbo" },
		{ code: "ilo",           text: "Ilokano" },
		{ code: "hil",           text: "Ilonggo" },
		{ code: "ia",            text: "Interlingua" },  
		{ code: "ie",            text: "Interlingue" },
		{ code: "it",            text: "Italiano" },
		{ code: "ik",            text: "I\u00f1upiak" },
		{ code: "jut",           text: "Jysk" },
		{ code: "kl",            text: "Kalaallisut" },
		{ code: "kr",            text: "Kanuri" },
		{ code: "pam",           text: "Kapampangan" },
		{ code: "csb",           text: "Kasz\u00ebbsczi" },
		{ code: "kw",            text: "Kernowek" },
		{ code: "krj",           text: "Kinaray-a" },
		{ code: "rw",            text: "Kinyarwanda" },
		{ code: "rn",            text: "Kirundi" },
		{ code: "sw",            text: "Kiswahili" },
		{ code: "kg",            text: "Kongo" },
		{ code: "avk",           text: "Kotava" },
		{ code: "ht",            text: "Krey\u00f2l ayisyen" },
		{ code: "kri",           text: "Krio" },
		{ code: "ku",            text: "Kurd\u00ee \/ \u0643\u0648\u0631\u062f\u06cc" },
		{ code: "kiu",           text: "Kurmanc\u00ee" },
		{ code: "kj",            text: "Kwanyama" },
		{ code: "lad",           text: "Ladino" },
		{ code: "la",            text: "Latina" },
		{ code: "lv",            text: "Latvie\u0161u" },
		{ code: "lt",            text: "Lietuvi\u0173" },
		{ code: "li",            text: "Limburgs" },
		{ code: "lfn",           text: "Lingua Franca Nova" },
		{ code: "ln",            text: "Ling\u00e1la" },
		{ code: "jbo",           text: "Lojban" },
		{ code: "lg",            text: "Luganda" },
		{ code: "lmo",           text: "Lumbaart" },
		{ code: "lb",            text: "L\u00ebtzebuergesch" },
		{ code: "lij",           text: "L\u00edguru" },
		{ code: "hu",            text: "Magyar" },
		{ code: "mg",            text: "Malagasy" },
		{ code: "mt",            text: "Malti" },
		{ code: "arn",           text: "Mapudungun" },
		{ code: "mwl",           text: "Mirand\u00e9s" },
		{ code: "mus",           text: "Mvskoke" },
		{ code: "cdo",           text: "M\u00ecng-d\u0115\u0324ng-ng\u1e73\u0304" },
		{ code: "mi",            text: "M\u0101ori" },
		{ code: "fj",            text: "Na Vosa Vakaviti" },
		{ code: "nl",            text: "Nederlands" },
		{ code: "nds-nl",        text: "Nedersaksisch" },
		{ code: "niu",           text: "Niu\u0113" },
		{ code: "nap",           text: "Nnapulitano" },
		{ code: "pih",           text: "Norfuk \/ Pitkern" },
		{ code: "nb",            text: "Norsk (bokm\u00e5l)" },
		{ code: "no",            text: "Norsk (bokm\u00e5l)" },
		{ code: "nn",            text: "Norsk (nynorsk)" },
		{ code: "nrm",           text: "Nouormand" },
		{ code: "nov",           text: "Novial" },
		{ code: "nah",           text: "N\u0101huatl" },
		{ code: "cr",            text: "N\u0113hiyaw\u0113win \/ \u14c0\u1426\u1403\u152d\u140d\u140f\u1423" },
		{ code: "uz",            text: "O'zbek" },
		{ code: "oc",            text: "Occitan" },
		{ code: "om",            text: "Oromoo" },
		{ code: "ng",            text: "Oshiwambo" },
		{ code: "hz",            text: "Otsiherero" },
		{ code: "pag",           text: "Pangasinan" },
		{ code: "pap",           text: "Papiamentu" },
		{ code: "pfl",           text: "Pf\u00e4lzisch" },
		{ code: "pcd",           text: "Picard" },
		{ code: "pms",           text: "Piemont\u00e8is" },
		{ code: "nds",           text: "Plattd\u00fc\u00fctsch" },
		{ code: "pdt",           text: "Plautdietsch" },
		{ code: "pl",            text: "Polski" },
		{ code: "pt",            text: "Portugu\u00eas" },
		{ code: "pt-br",         text: "Portugu\u00eas do Brasil" },
		{ code: "aa",            text: "Qaf\u00e1r af" },
		{ code: "kaa",           text: "Qaraqalpaqsha" },
		{ code: "crh",           text: "Q\u0131r\u0131mtatarca" },
		{ code: "ty",            text: "Reo M\u0101`ohi" },
		{ code: "ksh",           text: "Ripoarisch" },
		{ code: "rmy",           text: "Romani" },
		{ code: "ro",            text: "Rom\u00e2n\u0103" },
		{ code: "rm",            text: "Rumantsch" },
		{ code: "qu",            text: "Runa Simi" },
		{ code: "sc",            text: "Sardu" },
		{ code: "sdc",           text: "Sassaresu" },
		{ code: "sli",           text: "Schl\u00e4sch" },
		{ code: "de-ch",         text: "Schweizer Hochdeutsch" },
		{ code: "sco",           text: "Scots" },
		{ code: "stq",           text: "Seeltersk" },
		{ code: "st",            text: "Sesotho" },
		{ code: "nso",           text: "Sesotho sa Leboa" },
		{ code: "tn",            text: "Setswana" },
		{ code: "sq",            text: "Shqip" },
		{ code: "ss",            text: "SiSwati" },
		{ code: "scn",           text: "Sicilianu" },
		{ code: "loz",           text: "Silozi" },
		{ code: "simple",        text: "Simple English" },
		{ code: "sk",            text: "Sloven\u010dina" },
		{ code: "sl",            text: "Sloven\u0161\u010dina" },
		{ code: "so",            text: "Soomaaliga" },
		{ code: "ckb",           text: "Soran\u00ee \/ \u06a9\u0648\u0631\u062f\u06cc" },
		{ code: "srn",           text: "Sranantongo" },
		{ code: "sr-el",         text: "Srpski (latinica)" },
		{ code: "sh",            text: "Srpskohrvatski \/ \u0421\u0440\u043f\u0441\u043a\u043e\u0445\u0440\u0432\u0430\u0442\u0441\u043a\u0438" },
		{ code: "fi",            text: "Suomi" },
		{ code: "sv",            text: "Svenska" },
		{ code: "se",            text: "S\u00e1megiella" },
		{ code: "sg",            text: "S\u00e4ng\u00f6" },
		{ code: "tl",            text: "Tagalog" },
		{ code: "kab",           text: "Taqbaylit" },
		{ code: "roa-tara",      text: "Tarand\u00edne" },
		{ code: "rif",           text: "Tarifit" },
		{ code: "tt-latn",       text: "Tatar\u00e7a" },
		{ code: "shi",           text: "Ta\u0161l\u1e25iyt" },
		{ code: "tet",           text: "Tetun" },
		{ code: "vi",            text: "Ti\u1ebfng Vi\u1ec7t" },
		{ code: "tpi",           text: "Tok Pisin" },
		{ code: "tokipona",      text: "Toki Pona" },
		{ code: "tp",            text: "Toki Pona (deprecated:tokipona)" }, // XXX deprecated?
		{ code: "chy",           text: "Tsets\u00eahest\u00e2hese" },
		{ code: "ve",            text: "Tshivenda" },
		{ code: "tw",            text: "Twi" },
		{ code: "tk",            text: "T\u00fcrkmen\u00e7e" },
		{ code: "tr",            text: "T\u00fcrk\u00e7e" },
		{ code: "ug-latn",       text: "Uyghurche\u200e" },
		{ code: "ug",            text: "Uyghurche\u200e \/ \u0626\u06c7\u064a\u063a\u06c7\u0631\u0686\u06d5" },
		{ code: "za",            text: "Vahcuengh" },
		{ code: "vep",           text: "Vepsan kel'" },
		{ code: "ruq",           text: "Vl\u0103he\u015fte" },
		{ code: "ruq-latn",      text: "Vl\u0103he\u015fte" },
		{ code: "vo",            text: "Volap\u00fck" },
		{ code: "vec",           text: "V\u00e8neto" },
		{ code: "fiu-vro",       text: "V\u00f5ro" },
		{ code: "vro",           text: "V\u00f5ro" },
		{ code: "wa",            text: "Walon" },
		{ code: "vls",           text: "West-Vlams" },
		{ code: "war",           text: "Winaray" },
		{ code: "wo",            text: "Wolof" },
		{ code: "ts",            text: "Xitsonga" },
		{ code: "yo",            text: "Yor\u00f9b\u00e1" },
		{ code: "diq",           text: "Zazaki" },
		{ code: "zea",           text: "Ze\u00eauws" },
		{ code: "sn",            text: "chiShona" },
		{ code: "tum",           text: "chiTumbuka" },
		{ code: "ike-latn",      text: "inuktitut" },
		{ code: "xh",            text: "isiXhosa" },
		{ code: "zu",            text: "isiZulu" },
		{ code: "to",            text: "lea faka-Tonga" },
		{ code: "tg-latn",       text: "tojik\u012b" },
		{ code: "is",            text: "\u00cdslenska" },
		{ code: "de-at",         text: "\u00d6sterreichisches Deutsch" },
		{ code: "szl",           text: "\u015al\u016fnski" },
		{ code: "el",            text: "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac" },
		{ code: "pnt",           text: "\u03a0\u03bf\u03bd\u03c4\u03b9\u03b1\u03ba\u03ac" },
		{ code: "av",            text: "\u0410\u0432\u0430\u0440" },
		{ code: "ab",            text: "\u0410\u04a7\u0441\u0443\u0430" },
		{ code: "ba",            text: "\u0411\u0430\u0448\u04a1\u043e\u0440\u0442" },
		{ code: "be",            text: "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f" },
		{ code: "be-tarask",     text: "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f (\u0442\u0430\u0440\u0430\u0448\u043a\u0435\u0432\u0456\u0446\u0430)" },
		{ code: "be-x-old",      text: "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f (\u0442\u0430\u0440\u0430\u0448\u043a\u0435\u0432\u0456\u0446\u0430)" },
		{ code: "bxr",           text: "\u0411\u0443\u0440\u044f\u0430\u0434" },
		{ code: "bg",            text: "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438" },
		{ code: "ruq-cyrl",      text: "\u0412\u043b\u0430\u0445\u0435\u0441\u0442\u0435" },
		{ code: "inh",           text: "\u0413\u0406\u0430\u043b\u0433\u0406\u0430\u0439 \u011eal\u011faj" },
		{ code: "os",            text: "\u0418\u0440\u043e\u043d\u0430\u0443" },
		{ code: "kv",            text: "\u041a\u043e\u043c\u0438" },
		{ code: "ky",            text: "\u041a\u044b\u0440\u0433\u044b\u0437\u0447\u0430" },
		{ code: "lbe",           text: "\u041b\u0430\u043a\u043a\u0443" },
		{ code: "lez",           text: "\u041b\u0435\u0437\u0433\u0438" },
		{ code: "mk",            text: "\u041c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438" },
		{ code: "mdf",           text: "\u041c\u043e\u043a\u0448\u0435\u043d\u044c" },
		{ code: "mo",            text: "\u041c\u043e\u043b\u0434\u043e\u0432\u0435\u043d\u044f\u0441\u043a\u044d" },
		{ code: "mn",            text: "\u041c\u043e\u043d\u0433\u043e\u043b" },
		{ code: "ce",            text: "\u041d\u043e\u0445\u0447\u0438\u0439\u043d" },
		{ code: "mhr",           text: "\u041e\u043b\u044b\u043a \u041c\u0430\u0440\u0438\u0439" },
		{ code: "ru",            text: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" },
		{ code: "sah",           text: "\u0421\u0430\u0445\u0430 \u0442\u044b\u043b\u0430" },
		{ code: "cu",            text: "\u0421\u043b\u043e\u0432\u0463\u0301\u043d\u044c\u0441\u043a\u044a \/ \u2c14\u2c0e\u2c11\u2c02\u2c21\u2c10\u2c20\u2c14\u2c0d\u2c1f" },
		{ code: "sr-ec",         text: "\u0421\u0440\u043f\u0441\u043a\u0438 (\u045b\u0438\u0440\u0438\u043b\u0438\u0446\u0430)" },
		{ code: "sr",            text: "\u0421\u0440\u043f\u0441\u043a\u0438 \/ Srpski" },
		{ code: "tt-cyrl",       text: "\u0422\u0430\u0442\u0430\u0440\u0447\u0430" },
		{ code: "tt",            text: "\u0422\u0430\u0442\u0430\u0440\u0447\u0430\/Tatar\u00e7a" },
		{ code: "tg",            text: "\u0422\u043e\u04b7\u0438\u043a\u04e3" },
		{ code: "tg-cyrl",       text: "\u0422\u043e\u04b7\u0438\u043a\u04e3" },
		{ code: "tyv",           text: "\u0422\u044b\u0432\u0430 \u0434\u044b\u043b" },
		{ code: "udm",           text: "\u0423\u0434\u043c\u0443\u0440\u0442" },
		{ code: "uk",            text: "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430" },
		{ code: "xal",           text: "\u0425\u0430\u043b\u044c\u043c\u0433" },
		{ code: "cv",            text: "\u0427\u04d1\u0432\u0430\u0448\u043b\u0430" },
		{ code: "myv",           text: "\u042d\u0440\u0437\u044f\u043d\u044c" },
		{ code: "kk",            text: "\u049a\u0430\u0437\u0430\u049b\u0448\u0430" },
		{ code: "hy",            text: "\u0540\u0561\u0575\u0565\u0580\u0565\u0576" },
		{ code: "yi",            text: "\u05d9\u05d9\u05b4\u05d3\u05d9\u05e9" },
		{ code: "he",            text: "\u05e2\u05d1\u05e8\u05d9\u05ea" },
		{ code: "ug-arab",       text: "\u0626\u06c7\u064a\u063a\u06c7\u0631\u0686\u06d5" },
		{ code: "ur",            text: "\u0627\u0631\u062f\u0648" },
		{ code: "ar",            text: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
		{ code: "bqi",           text: "\u0628\u062e\u062a\u064a\u0627\u0631\u064a" },
		{ code: "bcc",           text: "\u0628\u0644\u0648\u0686\u06cc \u0645\u06a9\u0631\u0627\u0646\u06cc" },
		{ code: "sd",            text: "\u0633\u0646\u068c\u064a" },
		{ code: "fa",            text: "\u0641\u0627\u0631\u0633\u06cc" },
		{ code: "arz",           text: "\u0645\u0635\u0631\u0649" },
		{ code: "mzn",           text: "\u0645\u064e\u0632\u0650\u0631\u0648\u0646\u064a" },
		{ code: "ha",            text: "\u0647\u064e\u0648\u064f\u0633\u064e" },
		{ code: "pnb",           text: "\u067e\u0646\u062c\u0627\u0628\u06cc" },
		{ code: "ps",            text: "\u067e\u069a\u062a\u0648" },
		{ code: "glk",           text: "\u06af\u06cc\u0644\u06a9\u06cc" },
		{ code: "arc",           text: "\u0710\u072a\u0721\u071d\u0710" },
		{ code: "dv",            text: "\u078b\u07a8\u0788\u07ac\u0780\u07a8\u0784\u07a6\u0790\u07b0" },
		{ code: "ks",            text: "\u0915\u0936\u094d\u092e\u0940\u0930\u0940 - (\u0643\u0634\u0645\u064a\u0631\u064a)" },
		{ code: "new",           text: "\u0928\u0947\u092a\u093e\u0932 \u092d\u093e\u0937\u093e" },
		{ code: "ne",            text: "\u0928\u0947\u092a\u093e\u0932\u0940" },
		{ code: "pi",            text: "\u092a\u093e\u093f\u0934" },
		{ code: "hif-deva",      text: "\u092b\u093c\u0940\u091c\u0940 \u0939\u093f\u0928\u094d\u0926\u0940" },
		{ code: "bh",            text: "\u092d\u094b\u091c\u092a\u0941\u0930\u0940" },
		{ code: "mr",            text: "\u092e\u0930\u093e\u0920\u0940" },
		{ code: "mai",           text: "\u092e\u0948\u0925\u093f\u0932\u0940" },
		{ code: "sa",            text: "\u0938\u0902\u0938\u094d\u0915\u0943\u0924" },
		{ code: "hi",            text: "\u0939\u093f\u0928\u094d\u0926\u0940" },
		{ code: "as",            text: "\u0985\u09b8\u09ae\u09c0\u09af\u09bc\u09be" },
		{ code: "bpy",           text: "\u0987\u09ae\u09be\u09b0 \u09a0\u09be\u09b0\/\u09ac\u09bf\u09b7\u09cd\u09a3\u09c1\u09aa\u09cd\u09b0\u09bf\u09af\u09bc\u09be \u09ae\u09a3\u09bf\u09aa\u09c1\u09b0\u09c0" },
		{ code: "bn",            text: "\u09ac\u09be\u0982\u09b2\u09be" },
		{ code: "pa",            text: "\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40" },
		{ code: "gu",            text: "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0" },
		{ code: "or",            text: "\u0b13\u0b21\u0b3c\u0b3f\u0b06" },
		{ code: "ta",            text: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd" },
		{ code: "te",            text: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41" },
		{ code: "sma",           text: "\u00c5arjelsaemien" },
		{ code: "kn",            text: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1" },
		{ code: "tcy",           text: "\u0ca4\u0cc1\u0cb3\u0cc1" },
		{ code: "ml",            text: "\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02" },
		{ code: "si",            text: "\u0dc3\u0dd2\u0d82\u0dc4\u0dbd" },
		{ code: "th",            text: "\u0e44\u0e17\u0e22" },
		{ code: "lo",            text: "\u0ea5\u0eb2\u0ea7" },
		{ code: "dz",            text: "\u0f47\u0f7c\u0f44\u0f0b\u0f41" },
		{ code: "bo",            text: "\u0f56\u0f7c\u0f51\u0f0b\u0f61\u0f72\u0f42" },
		{ code: "my",            text: "\u1019\u103c\u1014\u103a\u1019\u102c\u1018\u102c\u101e\u102c" },
		{ code: "cs",            text: "\u010cesky" },
		{ code: "xmf",           text: "\u10db\u10d0\u10e0\u10d2\u10d0\u10da\u10e3\u10e0\u10d8" },
		{ code: "ka",            text: "\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8" },
		{ code: "ti",            text: "\u1275\u130d\u122d\u129b" },
		{ code: "am",            text: "\u12a0\u121b\u122d\u129b" },
		{ code: "chr",           text: "\u13e3\u13b3\u13a9" },
		{ code: "ike-cans",      text: "\u1403\u14c4\u1483\u144e\u1450\u1466" },
		{ code: "iu",            text: "\u1403\u14c4\u1483\u144e\u1450\u1466\/inuktitut" },
		{ code: "km",            text: "\u1797\u17b6\u179f\u17b6\u1781\u17d2\u1798\u17c2\u179a" },
		{ code: "bat-smg",       text: "\u017demait\u0117\u0161ka" },
		{ code: "bug",           text: "\u1a05\u1a14 \u1a15\u1a18\u1a01\u1a17" },
		{ code: "grc",           text: "\u1f08\u03c1\u03c7\u03b1\u03af\u03b1 \u1f11\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u1f74" },
		{ code: "ku-latn",       text: "\u202aKurd\u00ee (lat\u00een\u00ee)\u202c" },
		{ code: "kk-tr",         text: "\u202aQazaq\u015fa (T\u00fcrk\u00efya)\u202c" },
		{ code: "kk-latn",       text: "\u202aQazaq\u015fa (lat\u0131n)\u202c" },
		{ code: "crh-latn",      text: "\u202aQ\u0131r\u0131mtatarca (Latin)\u202c" },
		{ code: "ckb-latn",      text: "\u202aSoran\u00ee (lat\u00een\u00ee)\u202c" },
		{ code: "crh-cyrl",      text: "\u202a\u041a\u044a\u044b\u0440\u044b\u043c\u0442\u0430\u0442\u0430\u0440\u0434\u0436\u0430 (\u041a\u0438\u0440\u0438\u043b\u043b)\u202c" },
		{ code: "kk-cyrl",       text: "\u202a\u049a\u0430\u0437\u0430\u049b\u0448\u0430 (\u043a\u0438\u0440\u0438\u043b)\u202c" },
		{ code: "kk-kz",         text: "\u202a\u049a\u0430\u0437\u0430\u049b\u0448\u0430 (\u049a\u0430\u0437\u0430\u049b\u0441\u0442\u0430\u043d)\u202c" },
		{ code: "kk-arab",       text: "\u202b\u0642\u0627\u0632\u0627\u0642\u0634\u0627 (\u062a\u0674\u0648\u062a\u06d5)\u202c" },
		{ code: "kk-cn",         text: "\u202b\u0642\u0627\u0632\u0627\u0642\u0634\u0627 (\u062c\u06c7\u0646\u06af\u0648)\u202c" },
		{ code: "ku-arab",       text: "\u202b\u0643\u0648\u0631\u062f\u064a (\u0639\u06d5\u0631\u06d5\u0628\u06cc)\u202c" },
		{ code: "ckb-arab",      text: "\u202b\u06a9\u0648\u0631\u062f\u06cc (\u0639\u06d5\u0631\u06d5\u0628\u06cc)\u202c" },
		{ code: "zh",            text: "\u4e2d\u6587" },
		{ code: "zh-cn",         text: "\u4e2d\u6587(\u4e2d\u56fd\u5927\u9646)" },
		{ code: "zh-tw",         text: "\u4e2d\u6587(\u53f0\u7063)" },
		{ code: "zh-sg",         text: "\u4e2d\u6587(\u65b0\u52a0\u5761)" },
		{ code: "zh-mo",         text: "\u4e2d\u6587(\u6fb3\u9580)" },
		{ code: "zh-hans",       text: "\u4e2d\u6587(\u7b80\u4f53)" },
		{ code: "zh-hant",       text: "\u4e2d\u6587(\u7e41\u9ad4)" },
		{ code: "zh-hk",         text: "\u4e2d\u6587(\u9999\u6e2f)" },
		{ code: "zh-my",         text: "\u4e2d\u6587(\u9a6c\u6765\u897f\u4e9a)" },
		{ code: "wuu",           text: "\u5434\u8bed" },
		{ code: "lzh",           text: "\u6587\u8a00" },
		{ code: "zh-classical",  text: "\u6587\u8a00" },
		{ code: "ja",            text: "\u65e5\u672c\u8a9e" },
		{ code: "yue",           text: "\u7cb5\u8a9e" },
		{ code: "zh-yue",        text: "\u7cb5\u8a9e" },
		{ code: "gan",           text: "\u8d1b\u8a9e" },
		{ code: "gan-hant",      text: "\u8d1b\u8a9e(\u7e41\u9ad4)" },
		{ code: "gan-hans",      text: "\u8d63\u8bed(\u7b80\u4f53)" },
		{ code: "ii",            text: "\ua187\ua259" },
		{ code: "ko",            text: "\ud55c\uad6d\uc5b4" },
		{ code: "ko-kp",         text: "\ud55c\uad6d\uc5b4 (\uc870\uc120)" },
		{ code: "got",           text: "\ud800\udf32\ud800\udf3f\ud800\udf44\ud800\udf39\ud800\udf43\ud800\udf3a" },
	],

	/**
	 * cache some useful objects
	 * 1) mostly ready-to-go language HTML menu. When/if we upgrade, make it a jQuery combobox
	 * 2) dict of language code to name -- useful for testing for existence, maybe other things.
	 */
	initialize: function() {
		if ( mw.LanguageUpWiz.initialized ) {
			return;	
		}
		mw.LanguageUpWiz._codes = {};
		var select = $j( '<select/>' );
		$j.each( mw.LanguageUpWiz.languages, function( i, language ) {
			select.append(
				$j( '<option>' )
					.attr( 'value', language.code )
					.append( language.text )
			);
			mw.LanguageUpWiz._codes[language.code] = language.text;
		} );
		mw.LanguageUpWiz.$_select = select;
		mw.LanguageUpWiz.initialized = true;
	},

	/**
	 * Get an HTML select menu of all our languages. 
	 * @param name	desired name of select element
	 * @param code	desired default language code
	 * @return HTML	select element configured as desired
	 */
	getMenu: function( name, code ) {
		mw.LanguageUpWiz.initialize();
		var $select = mw.LanguageUpWiz.$_select.clone();
		$select.attr( 'name', name );
		if ( code === mw.LanguageUpWiz.UNKNOWN ) {
			// n.b. MediaWiki LanguageHandler has ability to add custom label for 'Unknown'; possibly as pseudo-label
			$select.prepend( $j( '<option>' ).attr( 'value', mw.LanguageUpWiz.UNKNOWN ).append( gM( 'mwe-code-unknown' )) );
			$select.val( mw.LanguageUpWiz.UNKNOWN );
		} else if ( code !== undefined ) {
			$select.val( mw.LanguageUpWiz.getClosest( code ));
		}
		return $select.get( 0 );
	},

	/** 
 	 * Figure out the closest language we have to a supplied language code.
	 * It seems that people on Mediawiki set their language code as freetext, and it could be anything, even
	 * variants we don't have a record for, or ones that are not in any ISO standard.
	 *
	 * Logic copied from MediaWiki:LanguageHandler.js 
	 * handle null cases, special cases for some Chinese variants
	 * Otherwise, if handed "foo-bar-baz" language, try to match most specific language,
	 *    "foo-bar-baz", then "foo-bar", then "foo"
	 *
	 * @param code 	A string representing a language code, which we may or may not have. 
	 *		Expected to be separated with dashes as codes from ISO 639, e.g. "zh-tw" for Chinese ( Traditional )
	 * @return a language code which is close to the supplied parameter, or fall back to mw.LanguageUpWiz.defaultCode
	 */
	getClosest: function( code ) {
		mw.LanguageUpWiz.initialize();
		if ( typeof ( code ) != 'string' || code === null || code.length === 0 ) {
			return mw.LanguageUpWiz.defaultCode;
		}
    		if ( code == 'nan' || code == 'minnan' ) {
			return 'zh-min-nan';
		} else if ( mw.LanguageUpWiz._codes[code] !== undefined ) {
			return code;					
		} 
		return mw.LanguageUpWiz.getClosest( code.substring( 0, code.indexOf( '-' )) );
	},


	// enhance a simple text input to be an autocompleting language menu
	// this will work when/if we move to jQuery 1.4. As of now the autocomplete is too underpowered for our needs without
	// serious hackery
	/* 
	$j.fn.languageMenu = function( options ) {
		var _this = this;
		_this.autocomplete( null, {
			minChars: 0,
			width: 310,
			selectFirst: true, 
			autoFill: true,
			mustMatch: true,
			matchContains: false,
			highlightItem: true,
			scroll: true,
			scrollHeight: 220,
			formatItem: function( row, i, max, term ) {
				return row.code + " " + row.code;
			},
			formatMatch: function( row, i, max, term ) {
				return row.code + " " + row.code;
			},
			formatResult: function( row ) {
				return row.code;
			}
		}, mw.Languages );

		// and add a dropdown so we can see the thingy, too 
		return _this;
	};
	*/

	// XXX the concept of "internal language" exists in UploadForm.js -- seems to be how they handled i18n, with 
	// language codes that has underscores rather than dashes, ( "en_gb" rather than the correct "en-gb" ).
	// although other info such as Information boxes was recorded correctly.	
	// This is presumed not to apply to the shiny new world of JS2, where i18n is handled in other ways.

}
