var user1="Eitan";
var user2="Guest";
var user1Ks="djJ8MjcwMTd8lHq4LFD8CtwzcqHuMVL9zPg7nWpN2qdpLRM5Vi0D2VwnjHuZMYiJv79BolgfqKBWRufhPfzwnk_tHTKS34QG6Fs7p-f6C9K7P0WRfUUzkptiOpQO67SonFd5OiqzvXeGsDWQJdDHC06fK-P_1FBwvwYtNPhCusDteiz3Y9_8UZVfVnXP5qlb4PeWRllT1H3FAnv8mK2Y5IW5J4WKk1XpKPj594FFBZ23Prtfv6cg_qm-fjDB2WJH2HoznBpudefAT5wj9eaG2Tl3KZ-IlyRWZFD-kTIGvJjd7NIDNux_239kb8zWU_m-K9SfqWhfIzUX";
var user2Ks="djJ8MjcwMTd8BZmaCAUSwUROCrDC2rUZy0FXBqJp0ALaTINY3IpGwbIP_Qw7WtNFk0QU6Xwy4ewNzNd7muLsSkBbYZ8U8XMz1Kt3sPMw0j14Eo-fjvxTPaJ5-t1s1CsddBU8T4NwJ1X5Myh5UUFEJYJ8Lq01RYbsd_QWgLNrL0Yq-SCps_sbGs1MF9N-iP_bgYndHosDAHr33XDLvVFtnerxXud-LcB9cf-eLn8MlPwCZHBIpUodVQnNmwZ1Unl2nIUSJcuZb2fx-0e7oMR8X9SX3c8iSdzpeA==";
var entry="1_m3j18lnj";


var playerId = 39666321; //prod OOB
//    var playerId = 15203553; //QA
var wid = '_27017'; // prod
//    var wid = '_5174'; // QA





// DON'T CHANGE ANYTHING BELOW THIS POINT
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