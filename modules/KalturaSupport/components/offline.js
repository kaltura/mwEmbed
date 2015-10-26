( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'offline', mw.KBasePlugin.extend({
		defaultConfig: {

		},
		setup: function(){
			this.bind('playerReady', function() {
			var _XMLHttpRequest = XMLHttpRequest;
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			window.requestFileSystem(window.TEMPORARY, 20*1024*1024 /*5MB*/, onInitFs, errorHandler);
			function errorHandler(e) {
				var msg = '';

				switch (e.code) {
					case FileError.QUOTA_EXCEEDED_ERR:
						msg = 'QUOTA_EXCEEDED_ERR';
						break;
					case FileError.NOT_FOUND_ERR:
						msg = 'NOT_FOUND_ERR';
						break;
					case FileError.SECURITY_ERR:
						msg = 'SECURITY_ERR';
						break;
					case FileError.INVALID_MODIFICATION_ERR:
						msg = 'INVALID_MODIFICATION_ERR';
						break;
					case FileError.INVALID_STATE_ERR:
						msg = 'INVALID_STATE_ERR';
						break;
					default:
						msg = 'Unknown Error';
						break;
				};

				console.log('Error: ' + msg);
			}
			function onInitFs(fs){
				window.fs = fs;

			}
			XMLHttpRequest =  function(){
				var obj = new _XMLHttpRequest();
				var _this = this;
				var events =  ["onreadystatechange","onloadstart","onprogress","onabort","onerror","onload","ontimeout","onloadend"];

				for (var i in events) {
					var event = events[i];
					(function ( x ) {

						obj[x] = function () {

							if ( returnObj[x] ) {
								if ( x === "onloadend" && !obj.rejectSend ) {
									debugger;
									if ( obj.responseURL ) {

										var fileName = obj.responseURL.substring( obj.responseURL.lastIndexOf( '/' ) + 1 );
										fs.root.getFile( fileName , {create: true} , function ( fileEntry ) {
											debugger;
											fileEntry.createWriter( function ( fileWriter ) {

												fileWriter.onwrite = function ( e ) {
													console.log( 'Write completed.' );
													localStorage.setItem( fileName , 1 );
												};

												fileWriter.onerror = function ( e ) {
													console.log( 'Write failed: ' + e.toString() );
												};


												fileWriter.write( new Blob( [obj.response] ) );

											} );
										} );
									}
								}
								return returnObj[x]( arguments );
							}
						}
					}( event ));
				}

				var returnObj =  {
					response2:null,
					get readyState(){return obj.readyState},
					open: function(method, id,wait) {
						var fileName = id.substring(id.lastIndexOf('/')+1);
						if (localStorage.getItem(fileName)){
							obj.rejectSend = true;
							fs.root.getFile(fileName, {}, function(fileEntry) {

								// Obtain the File object representing the FileEntry.
								// Use FileReader to read its contents.
								fileEntry.file(function(file) {
									var reader = new FileReader();

									reader.onloadend = function(e) {
										var result = this.result;
										returnObj.response = result;
										returnObj.responseURL = id;
										var eventObj={ bubbles: false,
											cancelBubble: false,
											cancelable: false,
											currentTarget: returnObj,
											defaultPrevented: false,
											eventPhase: 2,
											isTrusted: true,
											lengthComputable: true,
											loaded: returnObj.response2.byteLength,
											position: returnObj.response2.byteLength,
											returnValue: true,
											srcElement: returnObj,
											target: returnObj,
											timeStamp: new Date(),
											total: returnObj.response2.byteLength,
											totalSize: returnObj.response2.byteLength,
											type: "loadend"}
										//returnObj.status = 200;

										obj.onload(eventObj);
										obj.onreadystatechange()
										obj.onloadend(eventObj)
									};

									reader.readAsArrayBuffer(file); // Read the file as plaintext.
								});

							});




							return;
						};console.log(id);return obj.open(method,id,wait)},

					setRequestHeader:function(header, value) {console.log("Header:"+Header+"  value:"+value);return obj.setRequestHeader(header, value)},
					send: function(data) {if (obj.rejectSend)return;return obj.send(data);},
					getResponseHeader:function(){return obj.getResponseHeader();},
					getAllResponseHeaders:function(){return obj.getAllResponseHeaders();},
					abort: function() {obj.abort();},
					addEventListener: function(eventName,cb){return obj.addEventListener(eventName,cd)},
					set responseType(value){console.log("set-responseType"); obj.responseType = value},
					get responseType(){return obj.responseType},
					get response(){if (obj.rejectSend) return returnObj.response2;return  obj.response},
					set response(value){returnObj.response2 = value},
					set timeout(value){obj.timeout = value},
					get status(){if (obj.rejectSend) return 200;return obj.status;}
				};
				return returnObj;
			}
		});
		},
		isSafeEnviornment: function(){
			return mw.isChrome();
		}
	}));

} )( window.mw, window.jQuery );