var user1="Eitan";
var user2="Guest";
var user1Ks="djJ8MjcwMTd8EyIl3_L6Ark51uIS3N6PdMSDTODjlNm5OA5ZRJGhFwNghvrqKbdOKF-s-a9_-sWzrf_M9vLHyLJC_iTlbV2aUi1nFhy1Z0sd3t3XFlLudxu6awf2XuxzJlBwtu59MhUdviL4swjiPCqiK3s2TChLn4GPwPZZLeYo242VgvokxGqBk6aSUOjCuuKdZ3qZLxbInwwsSWCoXtRthxhQF8ZlXcTvotuFawU6PKnruMxBjq6dBkHJrt9TUeYFOU1LhnSeAgKimX3KFnYwwth-bM_we0UufUFYua6hh3QbVH5gQMCjKBCb_JBnYSPfafZcwLaLYQ_ASsipxheHJvMlck3FFvlKYODXX7uR3aoM7kkC0CY=";
var user2Ks=user1Ks;
var entry="1_8eoa4vir";



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