var user1="Eitan";
var user2="Guest";
var user1Ks="djJ8MjcwMTd8vVztTTPGTvjtm_ofZ3zHccz4Xbzkt8prdSjnXKORpvkn4_uRrbNOKSWbWh5Rr0wFZcup_17JBEDbPJZ-XIiK-efqKo2Lb8NBHxu1PTgLC7cmSER5s3t-f1cvzVmbi-BC6cUG8Vb-Eh858VWikdQrs-Qo8TYcqVU5bMNB-QUSS8BzJqFlmWP8zkakRsIfINh6PEwpbSIqsngDwWh7OGINxRXNhvI4guDMH5PgC9Kc_Gy1onUqyS2gq6CCrwjQFTEQiOSGiGcv1X9rxd6Is2b8QoShTRhw4IVgAdCMg8KZ4PswlvhPS9pZpSgSgao1z03en2wLiNSmXUy3bH9O6OH8-yldYbFWrA9KJiRqCzYGnTo=";
var user2Ks="djJ8MjcwMTd8BZmaCAUSwUROCrDC2rUZy0FXBqJp0ALaTINY3IpGwbIP_Qw7WtNFk0QU6Xwy4ewNzNd7muLsSkBbYZ8U8XMz1Kt3sPMw0j14Eo-fjvxTPaJ5-t1s1CsddBU8T4NwJ1X5Myh5UUFEJYJ8Lq01RYbsd_QWgLNrL0Yq-SCps_sbGs1MF9N-iP_bgYndHosDAHr33XDLvVFtnerxXud-LcB9cf-eLn8MlPwCZHBIpUodVQnNmwZ1Unl2nIUSJcuZb2fx-0e7oMR8X9SX3c8iSdzpeA==";
var entry="1_3bx9yzhz";



var playerId = 39677781; //prod OOB
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