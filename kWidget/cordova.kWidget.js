/**
 * Created with JetBrains WebStorm.
 * User: elizasapir
 * Date: 9/10/13
 * Time: 5:58 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Cordova kWidget lib
 */
(function(kWidget){ "use strict"
    if( !kWidget ){
        return ;
    }
    var cordova = cordova || {};
    cordova.kWidget = {
        // This element is populated by cordova
        proxyElement: null,
        // callbacks to auth object events go here:
        embed : function( targetId, settings ){
            this.target = document.getElementById( targetId );

            // setup mappings
            this.target.evaluate = this.evaluate;
            this.target.sendNotification = this.sendNotification;
            this.addJsListener = this.addJsListener;
        },
        exec:function(){
            cordova.exec(null,null,"NativeComponentPlugin",command, args);
        },
        evaluate:function(){
            this.exec("evaluate", ['']);
        },
        sendNotification:function(){
            this.exec("sendNotification", ['']);
        },
        addJsListener:function(){

        }
    };
})( window.kWidget );