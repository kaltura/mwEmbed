var user1="Eitan";
var user2="user";
var user1Ks="djJ8MjcwMTd8ABTHEGwo7JVObAYrHgiuRJaJzado1QD9pAhiNAX9CU9nKV9HXRfJjFaG1Ss0MSBmzI1LlQvtNvHvHtwR_4AEn7j_YpV_SRChlcWS68DCXtt71hiPHRk0Ifw605pfd3AfyRYkSXE0anV-9k0lNJNCmruPKspmRZJJp7CIQ6C22st2ktfU4hT58a_elSbHQ3Bm4lzshGAVa8j7E5_xE0-Ol23SX3gdiCwSvumsDTFgJWvZ2YLdPVcag23oyx4NnNRnAFIrleylq66-6nL8k_cd-k01W2KIbOUDIT3KbesE2pTJ9xGTdk8NKbLebV0CMeMO";
var user2Ks="djJ8MjcwMTd8nhoU1Ncr9PxJiBcYmzODe1EaJZW0HOekTMFJkyKFtsy69z_ylP185i0gj84yubBwAGXDciVdzex9t3njM9Y48o9u18VZqg1iaI8I2IXKuL4NGPt3MLFhDdaiOgg8Eaz5Jbwy1_e3Uo04i0syUW-mBFRCbDySTnmIzyQ9u63GIDwGdBRp-aei9ywrWBswA3K3QLL_AOywvFZPoM9YLeFMTWyj6LkdSiuBNHlCVyXLaJn8XIsG7knl5YUbd4sFVnPAQ9jcwZcR2ItSAq8mt1kZ-4wLn4p39JvsDfrK1Y90SMw=";
var entry="1_2e7u9qfm";


var playerId = 39666321; //prod OOB
//    var playerId = 15203553; //QA
var wid = '_27017'; // prod
//    var wid = '_5174'; // QA

var kdp;

if(!user2Ks && user1Ks){
	user2Ks = user1Ks;
}
function seekTo(t) {
	kdp.sendNotification("doSeek", t);
}
function seekRelative(offset) {
	var currentPosition = kdp.evaluate("{video.player.currentTime}");
	kdp.sendNotification("doSeek", currentPosition + offset);
}
function openSlidesMenu() {
	var $iframe = $("#kaltura_player_ifp").contents();
	var sbc = $iframe.find('.sideBarContainer');
	sbc.addClass("pinned")
}
function closeSlidesMenu() {
	var $iframe = $("#kaltura_player_ifp").contents();
	var sbc = $iframe.find('.sideBarContainer');
	sbc.removeClass("pinned");
}
var menuOpen = false;
function toggleMenu(){
	if(menuOpen){
		this.closeSlidesMenu();
	}else{
		this.openSlidesMenu();
	}
}
var qna = {
	'plugin': true,
	'qnaTargetId': 'qnaListHolder',
	'qnaPollingInterval': 5000,
	'onPage': true,
	'containerPosition': 'right',
	'moduleWidth': '200',
	'userId': this.user1,
	'userRole': "userRole", //anonymousRole
	'allowNewQuestionWhenNotLive': true
};

var QueryString = function () {
	// This function is anonymous, is executed immediately and
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}();
var paramFromUrl = function (key) {
	if (QueryString[key]) {
		this[key] = QueryString[key];
	}
};