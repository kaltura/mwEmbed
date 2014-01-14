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
		foreach ($plugins as $key => $value) {
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
		$obj->helpnote = $plugin['description'];
		if (isset($plugin['label'])) {
			$obj->label = $plugin['label'];
		} else {
			$obj->label = ucfirst($this->from_camel_case($pluginId));
		}
		$obj->model = $pluginId;
		if (isset ($plugin['endline'])) {
			$obj->endline = $plugin['endline'];
		}
		$obj->children = array();
		if (isset ($plugin['attributes'])) {
			foreach ($plugin['attributes'] as $controlModel => $control) {
				$obj->children[] = $this->control($controlModel, $control, $pluginId);
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
			foreach( $control['enum'] as $val ){
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
		$obj->model = (isset($control['model'])) ?  $control['model'] : 'config.plugins.'.$pluginId .'.'.$controlModel;
		$obj->helpnote = $control['doc'];
		if ($type = 'number') {
			$attrs = array('from', 'to', 'stepsize', 'numberOfDecimals', 'initvalue');
			foreach ($attrs as $attr) {
				if (isset($control[$attr]))
					$obj->$attr = $control[$attr];
			}
		}
		if (isset ($control['endline'])) {
			$obj->endline = $control['endline'];
		}
		return $obj;
	}
}


$menuMaker = new menuMaker;
$menu = include ( 'featuresStructure.php' );
foreach ($menu as $menuItem => $menuContent) {
	foreach ($menuContent['children'] as $pluginName => &$pluginData) {
		if (isset($configRegister[$pluginName]) && isset($configRegister[$pluginName]['attributes'])) {
			$menu[$menuItem]['children'][$pluginName] = $menuMaker->Menu($pluginName, $configRegister[$pluginName]);
		}
	}
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo json_encode($menu);
//echo json_encode($configRegister);
