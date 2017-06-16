var user1="Eitan";
var user2="Guest";
var user1Ks="djJ8MjcwMTd8ABTHEGwo7JVObAYrHgiuRJaJzado1QD9pAhiNAX9CU9nKV9HXRfJjFaG1Ss0MSBmzI1LlQvtNvHvHtwR_4AEn7j_YpV_SRChlcWS68DCXtt71hiPHRk0Ifw605pfd3AfyRYkSXE0anV-9k0lNJNCmruPKspmRZJJp7CIQ6C22st2ktfU4hT58a_elSbHQ3Bm4lzshGAVa8j7E5_xE0-Ol23SX3gdiCwSvumsDTFgJWvZ2YLdPVcag23oyx4NnNRnAFIrleylq66-6nL8k_cd-k01W2KIbOUDIT3KbesE2pTJ9xGTdk8NKbLebV0CMeMO";
var user2Ks="djJ8MjcwMTd81al-5IeIqXXj94bzoYykBlnpVFrKMwyiGyhKpzVoKulcEnIBxsKhijuw0pXe-sleD-C79uhJv7QuJaes_IQ2C4ad3PgMraG89FwEIj0JL_qfDGHHTUd2bTwe7H9qvyohImf1xoevQi-zpOLP84dIiMTu6KpN3r3V8BpZkTuzcoNXXC8f8cLbRd4o_rGZigOx9TRJTYkFQjPnnTDStNAapkhZBWxMUB-uJ8N0j7NXOB_Prnhw4C200Jt_zizzkR7SxOER3SMEgf_ANbxbrZy4mg==";
var entry="1_6955edi9";


var playerId = 39666321; //prod OOB
//    var playerId = 15203553; //QA
var wid = '_27017'; // prod
//    var wid = '_5174'; // QA





// DONT CHANGE ANYTHING BELOW THIS POINT
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
	'userRole': "anonymousRole", //anonymousRole / userRole
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