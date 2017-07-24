<?php
/**
 * This file is the player studio's API for querying player features.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 * @author Nadav Sinai
 *
 */
$basePluginConfig = array(
    'attributes' => array(
        'plugin' => array(
            'doc' => "If the plugin is enabled or not",
            'type' => 'boolean',
            'hideEdit' => true
        ),
        'path' => array(
            'hideEdit' => true
        ),
        'width' => array(
            'doc' => "The width of the plugin",
            'value' => '0%',
            'hideEdit' => true,
        ),
        'loadInIframe' => array(
            'doc' => "If the on-page-plugin should be loaded inside the iframe,
					for share and embeds that don't include on-page JavaScript",
            'type' => 'boolean',
            'hideEdit' => true,
        ),
        'height' => array(
            'doc' => "The height of the plugin",
            'value' => '0%',
            'hideEdit' => true,
        ),
        'includeInLayout' => array(
            'doc' => "If the plugin should be included in the player layout",
            "value" => "false",
            'hideEdit' => true,
        ),
        'relativeTo' => array(
            'hideEdit' => true
        ),
        'position' => array(
            'hideEdit' => true
        ),
        'loadingPolicy' => array(
            'hideEdit' => true
        ),
        'className' => array(
            'hideEdit' => true
        ),
        'IframeCustomPluginJs' => array(
            'hideEdit' => true
        ),
        'IframeCustomjQueryUISkinCss' => array(
            'hideEdit' => true
        ),
        'iframeHTML5Js' => array(
            'hideEdit' => true
        ),
        'iframeHTML5Css' => array(
            'hideEdit' => true
        ),
        'onPageJs1' => array(
            'hideEdit' => true
        ),
        'onPageJs2' => array(
            'hideEdit' => true
        ),
        'onPageJs3' => array(
            'hideEdit' => true
        ),
        'onPageCss1' => array(
            'hideEdit' => true
        ),
        'onPageCss2' => array(
            'hideEdit' => true
        ),
        'requiresJQuery' => array(
            'hideEdit' => true
        )
    )
);

$configRegister = array();
global $wgMwEmbedEnabledModules, $wgKalturaPSHtml5SettingsPath, $wgBaseMwEmbedPath;
foreach ($wgMwEmbedEnabledModules as $moduleName) {
    $manifestPath =  $wgBaseMwEmbedPath . "/modules/$moduleName/{$moduleName}.manifest.";
    if( is_file( $manifestPath . "json" ) ){
        $plugins = json_decode( file_get_contents($manifestPath . "json"), TRUE );
    } elseif( is_file( $manifestPath . "php" ) ){
        $plugins = include($manifestPath . "php");
    }
    if (isset($plugins)){
        foreach ($plugins as $key => $value) {
            $configRegister[$key] = $value;
        }
    }
}
# Register all the onPage scripts:
$onPageManifestPath =  realpath(dirname(__FILE__)) . '/../kWidget/onPagePlugins/onPagePlugins.manifest.';
if( is_file( $onPageManifestPath . "json" ) ){
    $onPagePlugins = json_decode( file_get_contents($onPageManifestPath . "json"), TRUE );
} elseif( is_file( $onPageManifestPath . "php" ) ){
    $onPagePlugins = include($onPageManifestPath . "php");
}
$configRegister = array_merge($configRegister, $onPagePlugins);

# Register all kwidget-ps based scripts: ( if setup )
$html5ManifestFile = realpath(dirname($wgKalturaPSHtml5SettingsPath) . '/ps/kwidget-ps.manifest.json');
if (is_file($html5ManifestFile)) {
    $json = json_decode(file_get_contents($html5ManifestFile), true);
    if ($json == null) {
        echo "{ \"error\" : \"could not parse json\" }";
        return;
    }
    $configRegister['ps'] = $json;
}

//Traverse the PS modules directory
global $wgKwidgetPsEnabledModules;
foreach ($wgKwidgetPsEnabledModules as $moduleName) {
    $manifestPath = realpath(dirname($wgKalturaPSHtml5SettingsPath) . "/../ps/modules/$moduleName/{$moduleName}.manifest.json");
    if( is_file( $manifestPath ) ){
        $plugins = json_decode( file_get_contents($manifestPath), TRUE );
    }
    if (isset($plugins)){
        foreach ($plugins as $key => $value) {
            $configRegister[$key] = $value;
        }
    }
}

// Parse the request is it needed? as well the presequence bit
//foreach ($configRegister as $registeredModule) {
//	foreach ($registeredModule as $pluginId => $plugin) {
//		// extend the output with base plugin config
//		if (is_array($registeredModule[$pluginId]))
//			$registeredModule[$pluginId] = array_replace_recursive($basePluginConfig, $registeredModule[$pluginId]);
//		else
//			var_dump($registeredModule[$pluginId]);
//	};
//};
Class menuMaker
{
    public function Menu($pluginId, $plugin)
    {
        $obj = new StdClass;
        if (!isset($plugin['type']) || $plugin['type'] == 'featuremenu') {
            $obj->type = 'featuremenu';
        } elseif ($plugin['type'] = 'submenu') {
            $obj->type = 'menu';
        }
        $obj->description = $plugin['description'];
        if (isset($plugin['tooltip'])) {
            $obj->helpnote = $plugin['tooltip'];
        }
        if (isset($plugin['label'])) {
            $obj->label = $plugin['label'];
        } else {
            $obj->label = ucfirst($this->from_camel_case($pluginId));
        }
        $obj->model = (isset($control['model'])) ? $plugin['model'] : 'config.plugins.' . $pluginId;
        if (isset ($plugin['endline'])) {
            $obj->endline = $plugin['endline'];
        }
        $obj->children = array();
        if (isset ($plugin['attributes'])) {
            foreach ($plugin['attributes'] as $controlModel => $control) {
                $obj->children[] = $this->control($controlModel, $control, $pluginId);
            }
        }
        foreach ($plugin as $attr => $atrVal) {
            if (!in_array($attr, array('type', 'model', 'attributes', 'label', 'description', 'endline'))) {
                $obj->$attr = $atrVal;
            }
        }
        return $obj;
    }

    private function  from_camel_case($input)
    {
        preg_match_all('!([A-Z][A-Z0-9]*(?=$|[A-Z][a-z0-9])|[A-Za-z][a-z0-9]+)!', $input, $matches);
        $ret = $matches[0];
        foreach ($ret as &$match) {
            $match = $match == strtoupper($match) ? strtolower($match) : lcfirst($match);
        }
        return implode(' ', $ret);
    }

    public function control($controlModel, $control, $pluginId)
    {
        $type = '';
        $obj = new StdClass;
        if (!isset($control['type'])) {
            $control['type'] = 'string';
        }
        switch ($control['type']) {
            case "boolean":
                $type = "checkbox";
                break;
            case "enum":
                $type = "dropdown";
                break;
            case "string" :
                $type = "text";
                break;
            case "url":
                $obj->validation = 'url';
                $type = "text";
                break;
            default :
                $type = $control['type'];
                break;
        }
        if (isset ($control['options'])) {
            $obj->options = $control['options'];
        } elseif (isset ($control['enum'])) {
            $options = array();
            foreach ($control['enum'] as $val) {
                $options[] = array(
                    'label' => $val,
                    'value' => $val
                );
            }
            $obj->options = $options;
        }
        $obj->type = $type;
        if (isset($control['label'])) {
            $obj->label = $control['label'];
        } else {
            $obj->label = ucfirst($this->from_camel_case($controlModel));
        }
        $obj->model = (isset($control['model'])) ? $control['model'] : 'config.plugins.' . $pluginId . '.' . $controlModel;
        if (isset($control['doc'])) {
            $obj->helpnote = $control['doc'];
        }else{
            $obj->helpnote = $obj->label;
        }
        foreach ($control as $attr => $atrVal) {
            if (!in_array($attr, array('type', 'model', 'options', 'enum', 'label', 'doc'))) {
                $obj->$attr = $atrVal;
            }
        }
        return $obj;
    }
}


$menuMaker = new menuMaker;
$menu = include('featuresStructure.php');
foreach ($menu as $menuItem => &$menuContent) {
    foreach ($menuContent['children'] as $pluginName => &$pluginData) {
        if (isset($configRegister[$pluginName]) && isset($configRegister[$pluginName]['attributes'])) {
            $pluginData = $menuMaker->Menu($pluginName, $configRegister[$pluginName]);
        }
    }
}

//Traverse PS featureStructure
$psFeaturesStructure = realpath(dirname($wgKalturaPSHtml5SettingsPath) . "/../ps/modules/featuresStructure.php");
if (is_file($psFeaturesStructure)){
    $psMenu = include($psFeaturesStructure);
    foreach ($psMenu as $menuItem => &$menuContent) {
        foreach ($menuContent['children'] as $pluginName => &$pluginData) {
            if (isset($configRegister[$pluginName]) && isset($configRegister[$pluginName]['attributes'])) {
                $pluginData = $menuMaker->Menu($pluginName, $configRegister[$pluginName]);
            }
        }
        if (isset($menu[$menuItem])){
            $menu[$menuItem]['children'] = array_merge_recursive($menu[$menuItem]['children'], $psMenu[$menuItem]['children']);
        }
        //This will enable creating totaly new tabs in studio from PS
    //    else {
    //        $menu[$menuItem] = $psMenu[$menuItem];
    //    }
    }
}

header("Access-Control-Allow-Origin: *");
header('Access-Control-Max-Age: 3628800');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
if (array_key_exists('callback', $_REQUEST)) {
    //  JSONP request wrapped in callback
    function is_valid_callback($subject)
    {
        $identifier_syntax
            = '/^[$_\p{L}\.][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}\.]*+$/u';

        $reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
            'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue',
            'for', 'switch', 'while', 'debugger', 'function', 'this', 'with',
            'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum',
            'extends', 'super', 'const', 'export', 'import', 'implements', 'let',
            'private', 'public', 'yield', 'interface', 'package', 'protected',
            'static', 'null', 'true', 'false');

        return preg_match($identifier_syntax, $subject)
        && !in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
    }

    $callback = $_REQUEST['callback'];
    if (is_valid_callback($callback)) {
        header('Content-Type: text/javascript; charset=utf8');
        $data = json_encode($menu);
        echo $callback . '(' . $data . ');';
    }
} else {
    // normal JSON string
    header('Content-Type: application/json; charset=utf8');
    echo json_encode($menu);
}
//echo json_encode($configRegister);
