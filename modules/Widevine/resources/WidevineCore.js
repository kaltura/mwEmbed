/**
* Widevine core global functions
*/

function WVGetURL( arg ) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	  	try {
			transformedUrl = aWidevinePlugin.Translate( arg );
	  	}
	 	catch (err) {
	  		//return "Error calling Translate: " + err.description;
	 	}
	   	return transformedUrl;
}
	 
function WVGetCommURL () {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
				return aWidevinePlugin.GetCommandChannelBaseUrl();
		} catch (err) {
				//alert("Error calling GetCommandChannelBaseUrl: " + err.description);
		}
		return "http://localhost:20001/cgi-bin/";
}

function WVSetPlayScale( arg ) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	  	try {
	   		return aWidevinePlugin.SetPlayScale( arg );
	   	}
	   	catch (err) {
	   		//alert ("Error calling SetPlayScale: " + err.description);
	   	}
	   	return 0;
}

function WVGetMediaTime( arg ) {
	  	var aWidevinePlugin = document.getElementById('WidevinePlugin');
	   	try {
		 	return aWidevinePlugin.GetMediaTime( arg );
	   	} catch (err) {
		 	//alert("Error calling GetMediaTime: " + err.description);
	  	}
	   	return 0;
}

function WVGetClientId() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
				return aWidevinePlugin.getClientId();
		}
		catch (err) {
				//alert ("Error calling GetClientId: " + err.description);
		}
		return 0;
}


function WVSetDeviceId(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setDeviceId(arg);
		}
		catch (err) {
				//alert ("Error calling SetDeviceId: " + err.description);
		}
		return 0;
}

function WVSetStreamId(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setStreamId(arg);
		}
		catch (err) {
				//alert ("Error calling SetStreamId: " + err.description);
		}
		return 0;
}

function WVSetClientIp(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setClientIp(arg);
		}
		catch (err) {
				//alert ("Error calling SetClientIp: " + err.description);
		}
		return 0;
}

function WVSetEmmURL(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setEmmUrl(arg);
		}
		catch (err) {
				//alert ("Error calling SetEmmURL: " + err.description);
		}
		return 0;
}


function WVSetEmmAckURL(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setEmmAckUrl(arg);
		}
		catch (err) {
				//alert ("Error calling SetEmmAckUrl: " + err.description);
		}
		return 0;
}

function WVSetHeartbeatUrl(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setHeartbeatUrl(arg);
		}
		catch (err) {
				//alert ("Error calling SetHeartbeatUrl: " + err.description);
		}
		return 0;
}


function WVSetHeartbeatPeriod(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setHeartbeatPeriod(arg);
		}
		catch (err) {
				//alert ("Error calling SetHeartbeatPeriod: " + err.description);
		}
		return 0;
}



function WVSetOptData(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setOptData(arg);
		}
		catch (err) {
			   //alert ("Error calling SetOptData: " + err.description);
		}
		return 0;
}

function WVSetPortal(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setPortal(arg);
		}
		catch (err) {
			   //alert ("Error calling SetPortal: " + err.description);
		}
		return 0;
}


function WVGetDeviceId() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getDeviceId();
		}
		catch (err) {
			   //alert ("Error calling GetDeviceId: " + err.description);
		}
		return 0;
}

function WVGetStreamId() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getStreamId();
		}
		catch (err) {
			   //alert ("Error calling GetStreamId: " + err.description);
		}
		return 0;
}

function WVGetClientIp() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getClientIp();
		}
		catch (err) {
			   //alert ("Error calling GetClientIp: " + err.description);
		}
		return 0;
}


function WVGetEmmURL() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getEmmUrl();
		}
		catch (err) {
			   //alert ("Error calling GetEmmURL: " + err.description);
		}
		return "";
}


function WVGetEmmAckURL() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getEmmAckUrl();
		}
		catch (err) {
			   //alert ("Error calling GetEmmAckUrl: " + err.description);
		}
		return "";
}

function WVGetHeartbeatUrl() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getHeartbeatUrl();
		}
		catch (err) {
			   //alert ("Error calling GetHeartbeatUrl: " + err.description);
		}
		return "";
}



function WVGetHeartbeatPeriod() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getHeartbeatPeriod();
		}
		catch (err) {
			   //alert ("Error calling GetHeartbeatPeriod: " + err.description);
		}
		return "";
}


function WVGetOptData() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getOptData();
		}
		catch (err) {
			   //alert ("Error calling GetOptData: " + err.description);
		}
		return "";
}

function WVGetPortal() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.getPortal();
		}
		catch (err) {
			   //alert ("Error calling GetPortal: " + err.description);
		}
		return "";
}


function WVAlert( arg ) {
	alert(arg);
	 	return 0;
}


function WVPDLNew(mediaPath, pdlPath) {
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

function WVPDLStart(pdlPath, trackNumber, trickPlay) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_Start(pdlPath, trackNumber, trickPlay);
		}
		catch (err) {
			   //alert ("Error calling PDL_Start: " + err.description);
		}
		return "";
}

function WVPDLResume(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_Resume(pdlPath);
		}
		catch (err) {
			   //alert ("Error calling PDL_Resume: " + err.description);
		}
		return "";
}


function WVPDLStop(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_Stop(pdlPath);
		}
		catch (err) {
			   //alert ("Error calling PDL_Stop: " + err.description);
		}
		return "";
}

function WVPDLCancel(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_Cancel(pdlPath);
		}
		catch (err) {
			   //alert ("Error calling PDL_Stop: " + err.description);
		}
		return "";
}

function WVPDLGetProgress(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_GetProgress(pdlPath);
		}
		catch (err) {
			   //alert ("Error calling PDL_GetProgress: " + err.description);
		}
		return "";
}


function WVPDLGetTotalSize(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_GetTotalSize(pdlPath);
		}
		catch (err) {
			   //alert ("Error calling PDL_GetTotalSize: " + err.description);
		}
		return "";
}

function WVPDLFinalize(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_Finalize(pdlPath);
		}
		catch (err) {
			   //alert ("Error calling PDL_Finalize: " + err.description);
		}
		return "";
}

function WVPDLCheckHasTrickPlay(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_CheckHasTrickPlay(pdlPath);
		}
		catch (err) {
			   //alert ("Error calling PDL_CheckHasTrickPlay: " + err.description);
		}
		return "";
}

function WVPDLGetTrackBitrate(pdlPath, trackNumber) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_GetTrackBitrate(pdlPath, trackNumber);
		}
		catch (err) {
			   //alert ("Error calling PDL_GetTrackBitrate: " + err.description);
		}
		return "";
}

function WVPDLGetTrackCount(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_GetTrackCount(pdlPath);
		}
		catch (err) {
				//alert ("Error calling PDL_GetTrackCount: " + err.description);
		}
		return "";
}

function WVPDLGetDownloadMap(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.PDL_GetDownloadMap(pdlPath);
		}
		catch (err) {
				//alert ("Error calling PDL_GetDownloadMap: " + err.description);
		}
		return "";
}

function WVGetLastError() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.GetLastError();
		}
		catch (err) {
			   //alert ("Error calling GetLastError: " + err.description);
		}
		return "";
}

function WVRegisterAsset(assetPath, requestLicense){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.RegisterAsset(assetPath, requestLicense);
		}
		catch (err) {
			   //alert ("Error calling RegisterAsset: " + err.description);
		}
		return "";

}


function WVQueryAsset(assetPath){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.QueryAsset(assetPath);
		}
		catch (err) {
			   //alert ("Error calling QueryAsset: " + err.description);
		}
		return "";

}

function WVQueryAllAssets(){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.QueryAllAssets();
		}
		catch (err) {
			   //alert ("Error calling QueryAllAssets: " + err.description);
		}
		return "";

}



function WVUnregisterAsset(assetPath){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.UnregisterAsset(assetPath);
		}
		catch (err) {
			   //alert ("Error calling UnregisterAsset: " + err.description);
		}
		return "";

}

function WVUpdateLicense(assetPath){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.UpdateLicense(assetPath);
		}
		catch (err) {
			   //alert ("Error calling UpdateAssetLicense: " + err.description);
		}
		return "";

}

function WVGetQueryLicenseValue(assetPath, key){
		var licenseInfo = eval('(' + WVQueryAsset(assetPath) + ')');
		licenseInfo = eval("licenseInfo." + key);
		return licenseInfo;
}


function WVCancelAllDownloads(){
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


function WVSetJSON(value){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			   return aWidevinePlugin.setUseJSON(value);
		}
		catch (err) {
			   //alert ("Error calling setUseJSON: " + err.description);
		}
		return "";

}

function WVSetAudioTrack(trackid){
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

function WVGetAudioTracks(){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
				return  aWidevinePlugin.GetAudioTracks();
		}
		catch (err) {
			   //alert ("Error calling : GetAudioTracks " + err.description);
		}
		return "";
}

function WVGetCurrentAudioTrack(){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
				return aWidevinePlugin.GetCurrentAudioTrack();
		}
		catch (err) {
			   //alert ("Error calling : GetCurrentAudioTrack " + err.description);
		}
		return "";
}

function WVGetSubtitles(){
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
				return aWidevinePlugin.GetSubtitleTracks();
		}
		catch (err) {
				//alert ("Error calling : GetSubtitleTracks " + err.description);
		}
		return "";
}