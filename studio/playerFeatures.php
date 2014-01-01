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
$root = realpath('../');
putenv("MW_INSTALL_PATH=$root");
require_once('../includes/MwEmbedWebStartSetup.php');

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
foreach ($wgMwEmbedEnabledModules as $moduleName) {
    $manifestPath = realpath(dirname(__FILE__)) .
        "/../modules/$moduleName/{$moduleName}.manifest.php";
    if (is_file($manifestPath)) {
        $plugins = include($manifestPath);
        foreach ($plugins as $key=>$value){
            $configRegister[$key] = $value;
        }
    }
}
# Register all the onPage scripts:
$configRegister['onPage'] = include(realpath(dirname(__FILE__)) . '/../kWidget/onPagePlugins/onPagePlugins.manifest.php');

# Register all kwidget-ps based scripts: ( if setup )
$html5ManifestFile = realpath(dirname($wgKalturaPSHtml5SettingsPath) . '/../ps/kwidget-ps.manifest.json');
if (is_file($html5ManifestFile)) {
    $json = json_decode(file_get_contents($html5ManifestFile), true);
    if ($json == null) {
        echo "{ \"error\" : \"could not parse json\" }";
        return;
    }
    $configRegister['ps'] = $json;
}
// Parse the request is it needed? as well the presequence bit
//foreach ($configRegister as $registeredModule) {
//    foreach ($registeredModule as $pluginId => $plugin) {
//        // extend the output with base plugin config
//        if (is_array($registeredModule[$pluginId]))
//            $registeredModule[$pluginId] = array_replace_recursive($basePluginConfig, $registeredModule[$pluginId]);
//        else
//            var_dump($registeredModule[$pluginId]);
//    };
//};
Class menuMaker
{
    public function featureMenu($pluginId, $plugin)
    {
        $obj = new StdClass;
        $obj->type = 'featuremenu';
        $obj->helpnote = $plugin['description'];
        $obj->model = $pluginId;
        $obj->children = array();
        if (isset ($plugin['attributes'])) {
            foreach ($plugin['attributes'] as $controlModel => $control) {
                $obj->children[] = $this->control($controlModel, $control);
            }
        }
        return $obj;
    }

    public function control($controlModel, $control)
    {
        $type = '';
        $obj = new StdClass;
        switch ($control['type']) {
            case "boolean":
                $type = "checkbox";
                break;
            case "enum":
                $type = "dropdown";
                break;

            case "string":
                $type = "text";
                break;

            default :
                $type = $control['type'];
                break;
        }
        if (isset ($control['enum'])) {
            $obj->options = $control['enum'];
        }
        $obj->type = $type;
        $obj->model = $controlModel;
        $obj->helpnote = $control['doc'];
        return $obj;
    }
}


$menuMaker = new menuMaker;
$menu = json_decode(file_get_contents('basicStructue.json'));
foreach ($menu as $menuItem => $menuContent) {
    foreach ($menuContent->children as $pluginName => &$pluginData) {
        if (isset($configRegister[$pluginName]) && isset($configRegister[$pluginName]['attributes'])) {
            $pluginData = $menuMaker->featureMenu($pluginName, $configRegister[$pluginName]);
        }
    }
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo json_encode($menu);
//echo json_encode($configRegister);