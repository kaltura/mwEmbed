var user1="Eitan";
var user2="Guest";
var user1Ks="djJ8MjcwMTd83x7Y2rg7ngA8PWz-drVDrkB31XtKPGfKhUHi8befmO0KWuZtmpDXWoF1scwEW1_zpg9ho6blT7ittqn7mly0c32DMwRjBEZ4uJzgZA3212Yphui9qAJzP9cbxKu32xQiDcj4NOBQZmQuOvHC0bTCbFhZH9q-0j0FHSWBDU5WEF753OIErI3qgXcr-FKg43qn8OkQBk5DfBYDv16bbWvb174st0_kqK2mUO45pJV-hPfQw_c2LsRSv2qNjVqMWN_9ROAdVWDcUQj2Qx3_v2hQREa0H2BPqhgIUkWb1NbXeWYhjzrGGWSceG4COrvB__ugRmd15Ny-YINj0D1562hTvPyvD0Km-E0qD_ZlXw0x78Y=";
var user2Ks=user1Ks;
var entry="1_z9gvqs8a";



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