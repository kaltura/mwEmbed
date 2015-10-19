(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add( 'Paint', mw.KBaseScreen.extend( {

        defaultConfig: {
            parent: "controlsContainer",
            templatePath: '../Paint/resources/templates/paint.tmpl.html',
            editMode : false
        },
        //plugin parameters
        duringEdit : false,
        kClient : null,
        canvas : null,
        canvasCtx : null,
        canvasWidth : 0,
        canvasHeight : 0,
        flag : false,
        prevX : 0,
        currX : 0,
        prevY : 0,
        currY : 0,
        dot_flag : false,
        curImgData : null,
        x : "black",
        y : 2,

		setup: function(){
            var embedPlayer = this.getPlayer();
            this.editMode = (this.getConfig('editMode') !== 'undefined') ?
                                this.getConfig('editMode') : this.defaultConfig.editMode;
			//Plugin setup, all actions which needs to be done on plugin loaded and before playerReady event
			this.addBindings();
		},

		addBindings:function(){
            var _this = this;
            var embedPlayer = this.getPlayer();
            this.bind('onOpenFullScreen', function() {
                //listen to event only when resizing the player window
                _this.bind('updateLayout', function() {
                    _this._initCanvasDimensions();
                    _this.unbind('updateLayout');
                });
            });
            this.bind('onCloseFullScreen', function() {
                //listen to event only when resizing the player window
                _this.bind('updateLayout', function() {
                    _this._initCanvasDimensions();
                    _this.unbind('updateLayout');
                });
            });
            if(this.editMode) {
                this.bind('showScreen', function () {
                    //embedPlayer.disablePlayControls();
                    _this.duringEdit = true;
                    $('.largePlayBtn').css('display', 'none');
                    embedPlayer.pause();
                });

                this.bind('onpause', function () {
                    _this._showPainterCanvas();
                });

                this.bind('onPauseInterfaceUpdate', function () {
                    //continue to hide big play icon if still in editing
                    if(_this.duringEdit) {
                        $('.largePlayBtn').css('display', 'none');
                    }
                });

                this.bind('onplay', function () {
                    _this.duringEdit = false;
                });
            }else {
                this.bind('KalturaSupport_CuePointReached', function (e, cuePointObj) {
                    if(cuePointObj.cuePoint){
                        _this._showPainterCanvas(cuePointObj.cuePoint);
                        if(_this.enablePlayDuringScreen) {
                            _this.enablePlayDuringScreen = false;
                        }
                        //removing the 'play' icon from the middle of the screen
                        $('.largePlayBtn').css('display', 'none');
                    }
                });
            }
        },

        getTemplateHTML: function (data) {
            var defer = $.Deferred();
            var paintTemplate = this.getTemplatePartialHTML("paint");

            var $template = $(paintTemplate({
                'paint': this,
                paintTemplate: paintTemplate
            }));
            return defer.resolve($template);
        },

        removeShowScreen:function(){
            this.removeScreen();
            this.showScreen();
        },

        _showPainterCanvas : function(cp){
            this.removeShowScreen();
            this._initCanvas(cp);
        },

        _initCanvas : function(cp) {
            //init paint canvas parameters
            this.canvas = document.getElementById('painterCanvas');
            this._initCanvasDimensions();
            this.canvasCtx = this.canvas.getContext("2d");
            if(this.editMode) {
                this._initCanvasEditMode();
            }else {
                if(cp){
                    this._initCanvasDisplayMode(cp);
                }
            }
        },

        _initCanvasEditMode : function() {
            //init canvas painter listeners
            this._initCanvasListeners();
            //init color box paints listeners
            this._initColorBoxListeners();
            //init canvas controllers
            this._initControllersListeners();
            //set default color
            this._color("yellow");
        },

        _initCanvasDisplayMode : function(cp) {
            var _this = this;
            if(cp.description) {
                var img = new Image;
                img.onload = function(){
                    //making sure resizing the player will effect the paint as well
                    _this.canvasCtx.drawImage(img,0,0,img.width,img.height,0,0,_this.canvasWidth,_this.canvasHeight);
                };
                img.src = cp.description;
            }
        },

        _initCanvasListeners : function() {
            var _this = this;
            _this.canvas.addEventListener("mousemove", function (e) {
                _this._findxy('move', e)
            }, false);
            _this.canvas.addEventListener("mousedown", function (e) {
                _this._findxy('down', e)
            }, false);
            _this.canvas.addEventListener("mouseup", function (e) {
                _this._findxy('up', e)
            }, false);
            _this.canvas.addEventListener("mouseout", function (e) {
                _this._findxy('out', e)
            }, false);
        },

        _initColorBoxListeners : function() {
            var _this = this;
            $('.colorBoxItem').each(function(index) {
                $(this).click(function(){_this._color($(this).attr('id'))});
            });
        },

        _initControllersListeners : function() {
            var _this = this;
            $('#paintSave').click(function(){
                _this.duringEdit = false;
                _this._savePaintCuePoint();
                _this._continuePlay();
            });
            $('#paintCancel').click(function(){
                _this.duringEdit = false;
                _this._continuePlay();
            });
        },

        _initCanvasDimensions : function() {
            if(this.canvas) {
                this.canvas.width = this.canvasWidth = this.getPlayer().getPlayerWidth();
                this.canvas.height = this.canvasHeight = this.getPlayer().getPlayerHeight();
                $(this.canvas).width(this.canvasWidth);
                $(this.canvas).height(this.canvasHeight);
            }
        },

        _color : function (color) {
            switch (color) {
                case "green":
                    this.x = "green";
                    break;
                case "blue":
                    this.x = "blue";
                    break;
                case "red":
                    this.x = "red";
                    break;
                case "yellow":
                    this.x = "yellow";
                    break;
                case "orange":
                    this.x = "orange";
                    break;
                case "black":
                    this.x = "black";
                    break;
                case "white":
                    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
                    break;
            }
            this.y = 2;
            $('#painterCanvas').css('z-index','1');
        },

        _findxy : function findxy(res, e) {
            if (res == 'down') {
                this.prevX = this.currX;
                this.prevY = this.currY;
                this.currX = e.clientX - this.canvas.offsetLeft;
                this.currY = e.clientY - this.canvas.offsetTop;

                this.flag = true;
                this.dot_flag = true;
                if (this.dot_flag) {
                    this.canvasCtx.beginPath();
                    this.canvasCtx.fillStyle = this.x;
                    this.canvasCtx.fillRect(this.currX, this.currY, 2, 2);
                    this.canvasCtx.closePath();
                    this.dot_flag = false;
                }
            }
            if (res == 'up' || res == "out") {
                this.flag = false;
            }
            if (res == 'move') {
                if (this.flag) {
                    this.prevX = this.currX;
                    this.prevY = this.currY;
                    this.currX = e.clientX - this.canvas.offsetLeft;
                    this.currY = e.clientY - this.canvas.offsetTop;
                    this._draw();
                }
            }
        },

        _draw : function() {
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(this.prevX, this.prevY);
            this.canvasCtx.lineTo(this.currX, this.currY);
            this.canvasCtx.strokeStyle = this.x;
            this.canvasCtx.lineWidth = this.y;
            this.canvasCtx.stroke();
            this.canvasCtx.closePath();
        },

        _savePaintCuePoint : function() {
            var _this = this;
            var embedPlayer = this.embedPlayer;
            var paintData = this.canvas.toDataURL();
            var cuePoint = {
                "service": "cuePoint_cuePoint",
                "action": "add",
                "cuePoint:objectType": "KalturaCodeCuePoint",
                "cuePoint:entryId": embedPlayer.kentryid,
                "cuePoint:startTime": embedPlayer.currentTime * 1000,
                "cuePoint:code": 'dataUrl',
                "cuePoint:description": paintData
            };
            this._getKClient().doRequest(cuePoint, function (data) {
                if (!_this._checkApiResponse('Get Paint err -->',data)){
                    return false;
                }
            });
        },

        _getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            }
            return this.kClient;
        },

        _checkApiResponse:function(msg,data){
            var _this = this;
            if(data){
                if (data.objectType.indexOf("Exception") >= 0){
                    return false;
                }
                else{
                    return true;
                }
            }
            return false;
        },

        _continuePlay: function () {
            var embedPlayer = this.getPlayer();
            if (this.isScreenVisible()){
                this.removeScreen();
            }
            embedPlayer.enablePlayControls();
            embedPlayer.play();
        }














		
	} ) );
} ) ( window.mw, window.jQuery );	