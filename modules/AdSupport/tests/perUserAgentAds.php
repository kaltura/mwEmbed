<?php 
$ads = Array(
	array(
		'http://www.doritos.com/',
		'http://cdnbakmi.kaltura.com/p/243342/sp/24334200/playManifest/entryId/0_89sweeeo/flavorId/0_wyow3go7/format/url/protocol/http/a.mp4'
	),
	array(
		'http://www.mcdonalds.com/',
		'http://cdnbakmi.kaltura.com/p/243342/sp/24334200/playManifest/entryId/0_0y7z1ohl/flavorId/0_le6sb2lo/format/url/protocol/http/a.mp4'
	),
	array(
		'https://www.dominos.com/',
		'http://cdnbakmi.kaltura.com/p/243342/sp/24334200/playManifest/entryId/0_pbgnzgd1/flavorId/0_prj86bk6/format/url/protocol/http/a.mp4'
	)
);
$ua = $_SERVER['HTTP_USER_AGENT'];
list( $adClick, $adMedia ) = $ads[0];
if( strstr($ua, 'iPhone') !== false ){
	list( $adClick, $adMedia ) = $ads[1];
}
if( strstr($ua, 'iPad') !== false ){
	list( $adClick, $adMedia ) = $ads[2];
}

header ("Content-Type:text/xml");
header('Expires: Sun, 01 Jan 2014 00:00:00 GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');

// write out the headers:
echo '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
?>
<VAST version="2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd">
    <Ad id="232859236">
        <InLine>
			            <AdSystem version="2.0">DART_DFP</AdSystem>
            <AdTitle></AdTitle>
            <Description></Description>
            <Survey></Survey>
            <Impression id="DART"><![CDATA[http://ad.doubleclick.net/imp;v7;x;232859236;0-0;1;13452535;200/200;39455789/39473576/1;;~aopt=2/1/ff/1;~okv=;kw=angelahtml5;sz=200x200;dcmt=text/xml;~cs=l%3fhttp://s0.2mdn.net/dot.gif]]></Impression>

            <Creatives>
                <Creative>
                    <CompanionAds>
                    <Companion id="banner" width="468" height="60" >
                        <StaticResource creativeType="image/png">
                            <![CDATA[ttp://projects.kaltura.com/mdale/adcreatives/468x60.png]]>
                        </StaticResource>
                        <CompanionClickThrough>
                            <![CDATA[http://kaltura.com]]>
                        </CompanionClickThrough>
                    </Companion>
                    <Companion id="expanding_banner" width="300" height="250" expandedWidth="300" expandedHeight="250" >
                        <StaticResource creativeType="image/png"><![CDATA[http://projects.kaltura.com/mdale/adcreatives/300x250.png]]></StaticResource>
                        <CompanionClickThrough>
                            <![CDATA[http://kaltura.com]]>
                        </CompanionClickThrough>
                    </Companion>
                </CompanionAds>
                </Creative>
                <Creative sequence="1" AdID="">
                    <Linear>
                        <Duration>00:00:52</Duration>
                        <TrackingEvents>
                            <Tracking event="start"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=232859236;ko=1;cid=39455789;rid=39473576;rv=1;timestamp=1768586;eid1=11;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="midpoint"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=232859236;ko=1;cid=39455789;rid=39473576;rv=1;timestamp=1768586;eid1=18;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="complete"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=232859236;ko=1;cid=39455789;rid=39473576;rv=1;timestamp=1768586;eid1=13;ecn1=1;etm1=0;]]></Tracking>

                            <Tracking event="mute"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=232859236;ko=1;cid=39455789;rid=39473576;rv=1;timestamp=1768586;eid1=16;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="pause"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=232859236;ko=1;cid=39455789;rid=39473576;rv=1;timestamp=1768586;eid1=15;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="fullscreen"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=232859236;ko=1;cid=39455789;rid=39473576;rv=1;timestamp=1768586;eid1=19;ecn1=1;etm1=0;]]></Tracking>
                        </TrackingEvents>
                        <AdParameters></AdParameters>
                        <VideoClicks>
                            <ClickThrough><![CDATA[<?php echo $adClick ?>]]></ClickThrough>
                            <ClickTracking id="DART"><![CDATA[http://ad.doubleclick.net/click%3Bh%3Dv8/3ac0/3/0/%2a/r%3B232859236%3B0-0%3B1%3B13452535%3B496-200/200%3B39455789/39473576/1%3B%3B%7Eaopt%3D2/1/ff/1%3B%7Esscs%3D%3fhttp://s0.2mdn.net/dot.gif]]></ClickTracking>
                        </VideoClicks>

                        <MediaFiles>
                            <MediaFile id="1" delivery="progressive" type="video/mp4" bitrate="1500" width="720" height="480">
                                <![CDATA[<?php echo $adMedia ?>]]>
                            </MediaFile>

                        </MediaFiles>
                    </Linear>

                </Creative>

                <Creative sequence="1" AdID="">
                    <CompanionAds>
                        <Companion id="1" width="300" height="250">
                            <StaticResource creativeType="image/png"><![CDATA[http://projects.kaltura.com/mdale/adcreatives/300x250.png]]></StaticResource>
                            <CompanionClickThrough><![CDATA[http://kaltura.com]]></CompanionClickThrough>
                            <AltText></AltText>
                            <AdParameters></AdParameters>
                        </Companion>
                        <Companion id="2" width="728" height="90">
                            <StaticResource creativeType="image/png"><![CDATA[http://projects.kaltura.com/mdale/adcreatives/728x90.png]]></StaticResource>
                            <CompanionClickThrough><![CDATA[http://kaltura.com]]></CompanionClickThrough>
                            <AltText></AltText>
                            <AdParameters></AdParameters>
                        </Companion>
                    </CompanionAds>
                </Creative>
                <Creative sequence="1" AdID="">
                    <NonLinearAds>
                        <TrackingEvents>
                            <Tracking event="start"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=236336770;ko=1;cid=40670887;rid=40688674;rv=1;timestamp=1763492;eid1=11;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="midpoint"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=236336770;ko=1;cid=40670887;rid=40688674;rv=1;timestamp=1763492;eid1=18;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="complete"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=236336770;ko=1;cid=40670887;rid=40688674;rv=1;timestamp=1763492;eid1=13;ecn1=1;etm1=0;]]></Tracking>

                            <Tracking event="mute"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=236336770;ko=1;cid=40670887;rid=40688674;rv=1;timestamp=1763492;eid1=16;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="pause"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=236336770;ko=1;cid=40670887;rid=40688674;rv=1;timestamp=1763492;eid1=15;ecn1=1;etm1=0;]]></Tracking>
                            <Tracking event="fullscreen"><![CDATA[http://ad.doubleclick.net/activity;src=1248596;met=1;v=1;pid=13452535;aid=236336770;ko=1;cid=40670887;rid=40688674;rv=1;timestamp=1763492;eid1=19;ecn1=1;etm1=0;]]></Tracking>
                        </TrackingEvents>
                        <NonLinear id="1" width="400" height="150" scalable="false" maintainAspectRatio="false">
                            <StaticResource creativeType="application/x-shockwave-flash"><![CDATA[http://s0.2mdn.net/1248596/nonlinear_400x150_1297278849367.swf?clickTag=http://ad.doubleclick.net/click%3Bh%3Dv8/3ac0/3/0/%2a/b%3B236336770%3B0-0%3B1%3B13452535%3B267-300/300%3B40670887/40688674/1%3B%3B%7Eaopt%3D2/1/ff/1%3B%7Esscs%3D%3fhttp://www.google.com]]></StaticResource>
                            <NonLinearClickThrough><![CDATA[http://ad.doubleclick.net/click%3Bh%3Dv8/3ac0/3/0/%2a/b%3B236336770%3B0-0%3B1%3B13452535%3B267-300/300%3B40670887/40688674/1%3B%3B%7Eaopt%3D2/1/ff/1%3B%7Esscs%3D%3fhttp://google.com]]></NonLinearClickThrough>
                            <AdParameters></AdParameters>
                        </NonLinear>

                        <NonLinear id="3" width="400" height="150" scalable="false" maintainAspectRatio="false">
                            <StaticResource creativeType="image/jpeg"><![CDATA[http://s0.2mdn.net/1248596/PID_1244559_1281625520000_google_1297278827773.jpg]]></StaticResource>
                            <NonLinearClickThrough><![CDATA[http://ad.doubleclick.net/click%3Bh%3Dv8/3ac0/3/0/%2a/b%3B236336770%3B0-0%3B1%3B13452535%3B267-300/300%3B40670887/40688674/1%3B%3B%7Eaopt%3D2/1/ff/1%3B%7Esscs%3D%3fhttp://google.com]]></NonLinearClickThrough>
                            <AdParameters></AdParameters>
                        </NonLinear>
                        <NonLinear id="3" width="300" height="250" scalable="false" maintainAspectRatio="false">
                            <HTMLResource><![CDATA[<div><iframe src="http://adserver.teracent.net/tase/ad?AdBoxType=16&url=test.test&fmt=html&rnd=insert_random_number_macro_here&esc=0&rcu=insert_click_macro_for_clear_text_here" width="300" height="250" align="center" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no"></iframe></div>]]></HTMLResource>
                            <NonLinearClickThrough><![CDATA[http://ad.doubleclick.net/click%3Bh%3Dv8/3ac0/3/0/%2a/b%3B236336770%3B0-0%3B1%3B13452535%3B267-300/300%3B40670887/40688674/1%3B%3B%7Eaopt%3D2/1/ff/1%3B%7Esscs%3D%3fhttp://www.teracent.com/]]></NonLinearClickThrough>
                            <AdParameters></AdParameters>

                        </NonLinear>
                    </NonLinearAds>
                </Creative>
            </Creatives>

            <Extensions>
                <Extension type="DART">
                    <AdServingData>
                        <DeliveryData>

                            <GeoData><![CDATA[ct=US&st=VA&ac=703&zp=20151&bw=4&dma=13&city=15719]]></GeoData>
                        </DeliveryData>
                    </AdServingData>
                </Extension>
            </Extensions>
        </InLine>
    </Ad>
</VAST>
