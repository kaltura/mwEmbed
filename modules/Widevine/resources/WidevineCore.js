/**
* Widevine core global functions
*/


window.WVGetURL = function ( arg ) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		transformedUrl = aWidevinePlugin.Translate( arg );
	}
	catch (err) {
		//return "Error calling Translate: " + err.description;
	}
	return transformedUrl;
}

window.WVGetCommURL = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.GetCommandChannelBaseUrl();
	} catch (err) {
		//alert("Error calling GetCommandChannelBaseUrl: " + err.description);
	}
	return "http://localhost:20001/cgi-bin/";
}

window.WVSetPlayScale = function ( arg ) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.SetPlayScale( arg );
	}
	catch (err) {
		//alert ("Error calling SetPlayScale: " + err.description);
	}
	return 0;
}

window.WVGetMediaTime = function ( arg ) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.GetMediaTime( arg );
	} catch (err) {
		//alert("Error calling GetMediaTime: " + err.description);
	}
	return 0;
}

window.WVGetClientId = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getClientId();
	}
	catch (err) {
		//alert ("Error calling GetClientId: " + err.description);
	}
	return 0;
}


window.WVSetDeviceId = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setDeviceId(arg);
	}
	catch (err) {
		//alert ("Error calling SetDeviceId: " + err.description);
	}
	return 0;
}

window.WVSetStreamId = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setStreamId(arg);
	}
	catch (err) {
		//alert ("Error calling SetStreamId: " + err.description);
	}
	return 0;
}

window.WVSetClientIp = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setClientIp(arg);
	}
	catch (err) {
		//alert ("Error calling SetClientIp: " + err.description);
	}
	return 0;
}

window.WVSetEmmURL = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setEmmUrl(arg);
	}
	catch (err) {
		//alert ("Error calling SetEmmURL: " + err.description);
	}
	return 0;
}


window.WVSetEmmAckURL = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setEmmAckUrl(arg);
	}
	catch (err) {
		//alert ("Error calling SetEmmAckUrl: " + err.description);
	}
	return 0;
}

window.WVSetHeartbeatUrl = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setHeartbeatUrl(arg);
	}
	catch (err) {
		//alert ("Error calling SetHeartbeatUrl: " + err.description);
	}
	return 0;
}


window.WVSetHeartbeatPeriod = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setHeartbeatPeriod(arg);
	}
	catch (err) {
		//alert ("Error calling SetHeartbeatPeriod: " + err.description);
	}
	return 0;
}



window.WVSetOptData = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setOptData(arg);
	}
	catch (err) {
		//alert ("Error calling SetOptData: " + err.description);
	}
	return 0;
}

window.WVSetPortal = function (arg) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setPortal(arg);
	}
	catch (err) {
		//alert ("Error calling SetPortal: " + err.description);
	}
	return 0;
}


window.WVGetDeviceId = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getDeviceId();
	}
	catch (err) {
		//alert ("Error calling GetDeviceId: " + err.description);
	}
	return 0;
}

window.WVGetStreamId = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getStreamId();
	}
	catch (err) {
		//alert ("Error calling GetStreamId: " + err.description);
	}
	return 0;
}

window.WVGetClientIp = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getClientIp();
	}
	catch (err) {
		//alert ("Error calling GetClientIp: " + err.description);
	}
	return 0;
}


window.WVGetEmmURL = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getEmmUrl();
	}
	catch (err) {
		//alert ("Error calling GetEmmURL: " + err.description);
	}
	return "";
}


window.WVGetEmmAckURL = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getEmmAckUrl();
	}
	catch (err) {
		//alert ("Error calling GetEmmAckUrl: " + err.description);
	}
	return "";
}

window.WVGetHeartbeatUrl = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getHeartbeatUrl();
	}
	catch (err) {
		//alert ("Error calling GetHeartbeatUrl: " + err.description);
	}
	return "";
}



window.WVGetHeartbeatPeriod = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getHeartbeatPeriod();
	}
	catch (err) {
		//alert ("Error calling GetHeartbeatPeriod: " + err.description);
	}
	return "";
}


window.WVGetOptData = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getOptData();
	}
	catch (err) {
		//alert ("Error calling GetOptData: " + err.description);
	}
	return "";
}

window.WVGetPortal = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.getPortal();
	}
	catch (err) {
		//alert ("Error calling GetPortal: " + err.description);
	}
	return "";
}


window.WVAlert = function ( arg ) {
	alert(arg);
	return 0;
}


window.WVPDLNew = function (mediaPath, pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		pdl_new =  aWidevinePlugin.PDL_New(mediaPath, pdlPath);
		return pdl_new;
	}
	catch (err) {
		//alert ("Error calling PDL_New: " + err.description);
	}
	return "";
}

window.WVPDLStart = function (pdlPath, trackNumber, trickPlay) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_Start(pdlPath, trackNumber, trickPlay);
	}
	catch (err) {
		//alert ("Error calling PDL_Start: " + err.description);
	}
	return "";
}

window.WVPDLResume = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_Resume(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_Resume: " + err.description);
	}
	return "";
}


window.WVPDLStop = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_Stop(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_Stop: " + err.description);
	}
	return "";
}

window.WVPDLCancel = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_Cancel(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_Stop: " + err.description);
	}
	return "";
}

window.WVPDLGetProgress = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_GetProgress(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_GetProgress: " + err.description);
	}
	return "";
}

window.WVPDLGetTotalSize = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_GetTotalSize(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_GetTotalSize: " + err.description);
	}
	return "";
}

window.WVPDLFinalize = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_Finalize(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_Finalize: " + err.description);
	}
	return "";
}

window.WVPDLCheckHasTrickPlay = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_CheckHasTrickPlay(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_CheckHasTrickPlay: " + err.description);
	}
	return "";
}

window.WVPDLGetTrackBitrate = function (pdlPath, trackNumber) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_GetTrackBitrate(pdlPath, trackNumber);
	}
	catch (err) {
		//alert ("Error calling PDL_GetTrackBitrate: " + err.description);
	}
	return "";
}

window.WVPDLGetTrackCount = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_GetTrackCount(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_GetTrackCount: " + err.description);
	}
	return "";
}

window.WVPDLGetDownloadMap = function (pdlPath) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.PDL_GetDownloadMap(pdlPath);
	}
	catch (err) {
		//alert ("Error calling PDL_GetDownloadMap: " + err.description);
	}
	return "";
}

window.WVGetLastError = function () {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.GetLastError();
	}
	catch (err) {
		//alert ("Error calling GetLastError: " + err.description);
	}
	return "";
}

window.WVRegisterAsset = function (assetPath, requestLicense){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.RegisterAsset(assetPath, requestLicense);
	}
	catch (err) {
		//alert ("Error calling RegisterAsset: " + err.description);
	}
	return "";

}


window.WVQueryAsset = function (assetPath){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.QueryAsset(assetPath);
	}
	catch (err) {
		//alert ("Error calling QueryAsset: " + err.description);
	}
	return "";

}

window.WVQueryAllAssets = function (){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.QueryAllAssets();
	}
	catch (err) {
		//alert ("Error calling QueryAllAssets: " + err.description);
	}
	return "";

}



window.WVUnregisterAsset = function (assetPath){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.UnregisterAsset(assetPath);
	}
	catch (err) {
		//alert ("Error calling UnregisterAsset: " + err.description);
	}
	return "";

}

window.WVUpdateLicense = function (assetPath){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.UpdateLicense(assetPath);
	}
	catch (err) {
		//alert ("Error calling UpdateAssetLicense: " + err.description);
	}
	return "";

}

window.WVGetQueryLicenseValue = function (assetPath, key){
	var licenseInfo = eval('(' + WVQueryAsset(assetPath) + ')');
	licenseInfo = eval("licenseInfo." + key);
	return licenseInfo;
}


window.WVCancelAllDownloads = function (){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		if (aWidevinePlugin){
			var downloading_list = eval(aWidevinePlugin.PDL_QueryDownloadNames());
			for(var i = 0; i < downloading_list.length; i++){
				WVPDLCancel(downloading_list[i]);
			}
		}
	}
	catch (err) {
		//alert ("Error calling QueryAllAssets: " + err.description);
	}
	return "";
}


window.WVSetJSON = function (value){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.setUseJSON(value);
	}
	catch (err) {
		//alert ("Error calling setUseJSON: " + err.description);
	}
	return "";

}

window.WVSetAudioTrack = function (trackid){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		var result =  aWidevinePlugin.SetAudioTrack(parseInt(trackid));
		if(!result){
			alert('Set Audio Track Failed');
		}
		return result;
	}
	catch (err) {
		//alert ("Error calling : SetAudioTrack" + err.description);
	}
	return "";
}

window.WVGetAudioTracks = function (){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return  aWidevinePlugin.GetAudioTracks();
	}
	catch (err) {
		//alert ("Error calling : GetAudioTracks " + err.description);
	}
	return "";
}

window.WVGetCurrentAudioTrack = function (){
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	try {
		return aWidevinePlugin.GetCurrentAudioTrack();
	}
	catch (err) {
		//alert ("Error calling : GetCurrentAudioTrack " + err.description);
	}
	return "";
}

//workaround to fix exception that occurs sometimes from widevine
try {
window.WVGetSubtitles = function (){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
				return aWidevinePlugin.GetSubtitleTracks();
		}
		catch (err) {
				//alert ("Error calling : GetSubtitleTracks " + err.description);
		}
    return "";
}
} catch( e ) {
console.log(e);
}