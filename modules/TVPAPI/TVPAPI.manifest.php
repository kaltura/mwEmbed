<?php 
/**
 * The Kaltura plugin manifest
 */
return array(
	'GetMediaLicenseLink' => array(
        'description' => 'Retrieve media license link per given media.',
        'attributes' => array(
            'initObj' => array(
                'Locale' => array(
                    'LocaleLanguage'=> '',
                    'LocaleCountry' => '',
                    'LocaleDevice' => '',
                    'LocaleUserState' => ''
                ),
                'Platform' => "Web",
                'SiteGuid' => "-1",
                'DomainID' => "",
                'UDID' => "",
                "ApiUser" => "",
                "ApiPass" => ""
            ),
            "mediaFileID" => "",
            "baseLink" => ""
        )
    )
);
