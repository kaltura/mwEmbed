var user1="Eitan";
var user2="Guest";
var user1Ks="djJ8NTg3MnxhBsWQk3ID9ueXYqBTYoQAm2JTiP56tRY65OZ0-JtA4y8MOASCfyYHBF7b5jNr1ZLloliRNBzYF0NbksSyFyAs2i70R_QjK5C75OwArz0OH70l1GWsLUWgsy1iXmvg51_o7APfejhB__C3i4xtOXKE9j7HODVdsmqO6OP6M5pJe51FS3_g_EK1P5Zhf3UFUXVhvu1tLlyT00mfHn3zPp1W5ZfzrbjGWDAF8MCZxnChJAPths1N89mEoj2VbfnlM5x2Yk1pj6H-siKrd14sHJCTzJByfQS814-_PpkMntDomsVWVByRXcyXaCKuXQ6qHbTQpTczF5kuyW1mCs30yzLUPV5xZDfd0cJedP16v4XPKK0wZEaWqY52qIEnyncYUL2fu9DF4FcNw_rx38n59Ul7_GxLYOODhwGSVgDyRw7lfA==";
var user2Ks=user1Ks;
var entry="0_bmbbf0d1";



var playerId = 15214494; //prod OOB
//    var playerId = 15203553; //QA
var wid = '_5872'; // prod
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
	'plugin': false,
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
