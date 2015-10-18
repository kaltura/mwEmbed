(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add( 'Paint', mw.KBaseScreen.extend( {

        defaultConfig: {
            parent: "controlsContainer",
            order: 5,
            align: "right",
            //tooltip: gM('mwe-quiz-tooltip'),
            visible: false,
            showTooltip: false,
            displayImportance: 'medium',
            templatePath: '../Paint/resources/templates/paint.tmpl.html',
            usePreviewPlayer: false,
            previewPlayerEnabled: false
        },
        //plugin parameters
        kClient : null,
        editMode : true,
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
            this.editMode = (embedPlayer.getFlashvars().editMode !== 'undefined') ?
                                embedPlayer.getFlashvars().editMode : false;
            this.playerWidth = embedPlayer.getWidth();
            this.playerHeight = embedPlayer.getHeight();
			//Plugin setup, all actions which needs to be done on plugin loaded and before playerReady event
			this.addBindings();
		},

		addBindings:function(){
            var _this = this;
            var embedPlayer = this.getPlayer();
            if(this.editMode) {
                this.bind('showScreen', function () {
                    embedPlayer.disablePlayControls();
                    embedPlayer.pause();
                });

                this.bind('onpause', function () {
                    _this._showPainterCanvas();
                });
            }else {
                this.bind('KalturaSupport_CuePointReached', function (e, cuePointObj) {
                    console.log('cuepoint reached');
                    if(cuePointObj.cuePoint){
                        _this._showPainterCanvas(cuePointObj.cuePoint);
                        if(_this.enablePlayDuringScreen) {
                            _this.enablePlayDuringScreen = false;
                        }
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
            var embedPlayer = this.getPlayer();
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
            var embedPlayer = this.getPlayer();
            this.canvas.width = this.canvasWidth = embedPlayer.getWidth();
            this.canvas.height = this.canvasHeight = embedPlayer.getHeight();
            $(this.canvas).width(this.canvasWidth);
            $(this.canvas).height(this.canvasHeight);
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
                    _this.canvasCtx.drawImage(img,0,0); // Or at whatever offset you like
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
            $('#savePaint').click(function(){
                _this._savePaintCuePoint();
                _this._continuePlay();
            });
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