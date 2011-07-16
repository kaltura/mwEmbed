<?php 
/**
 * Simple html version of age gate plugin. 
 */
class AgeGate {
	function __construct( & $iframe ){
		$this->resultObj = $iframe->getResultObject();
	}
	function run( ){
		$meta = $this->resultObj->getMeta();
		// Check if the plugin is enabled ( agegate tag ) 
		if( $meta && strpos( $meta->tags, 'agegate' ) === false ){
			return true;
		}
		
		// Check if the validAge cookie is set: 
		if( isset( $_COOKIE['validUserAge'] ) ){
			if( $_COOKIE['validUserAge'] == 'yes' ){
				return true;
			}			
		} else {
			// Cookie is not set, check for validAge url param
			if( isset( $_GET['validUserAge'] ) && $_GET['validUserAge'] == 'yes'){
				return true;
			}
		}
		
		// Else print out the age form with some simple js help to set cookie, and say not old enough
		$this->outputAgeForm();
		ob_end_flush();
		// Iframe error exit
		exit( 1 );
	}
	function data_uri($file, $mime) {  
	  $contents = file_get_contents($file);
	  $base64   = base64_encode($contents); 
	  return ('data:' . $mime . ';base64,' . $base64);
	}
	private function outputAgeForm(){
		global $wgMwEmbedPathUrl;
		?>
<!DOCTYPE html>
<html>
	<head>
		<title> Validate Age </title>
	</head>
	<script src='<?php echo $wgMwEmbedPathUrl ?>mwEmbedLoader.php' type='text/javascript'></script>
	<script>
	var showSorry = function(){
		$('#inputAgeForm').hide();
		$('#weAreSorry').show();
	};
	// We use "mw.ready" here so that $.cookie is avaliable and we reuse the same cached js 
	mw.ready(function(){
		$('#loadingSpinner').hide();
		if( $.cookie('validUserAge' ) == 'no' ){
			showSorry();
			return;
		}
		$('#inputAgeForm').show();
		$('#enterbtn').click(function(){			
			// Check Age
			var ageDate = new Date();
			ageDate.setFullYear( $('#year').val(), $('#month').val(), $('#day').val() );
			// Get age:
			var age = ( new Date().getTime() - ageDate.getTime() )/1000;
			var thirteenYearsOld = 3600*24*365*13;
			
			if( age > thirteenYearsOld ){
				$('#loadingSpinner').show();
				$('#inputAgeForm').hide();
				$.cookie('validUserAge', 'yes');
				// Refresh the page append validUserAge=yes
				setTimeout(function(){
					var baseUrl = window.location.href;
					urlParts = baseUrl.split( '#' );
					var urlString = urlParts[0];
					urlString+= ( urlParts[0].indexOf('?') === -1 )? '?' : '&';
					urlString+= 'validUserAge=yes';
					urlString+= ( urlParts[1] )? '#' + urlParts[1] : '';
					window.location.href = urlString;
				}, 100);
			} else {
				$.cookie('validUserAge', 'no');
				showSorry();
			}
		});
	});
	</script>
	<style type="text/css">
			body {
				margin:0;
				position:fixed;
				top:0px;
				left:0px;
				bottom:0px;
				right:0px;
				width: 100%;
				height: 100%;
				overflow:hidden;
				background: #000;
				color: #fff;
				font-size: 13px;
				font-family:"Helvetica Narrow", sans-serif;
				text-align: center;
			}
			#loadingSpinner {
				background: url( '<?php echo $wgMwEmbedPathUrl ?>skins/common/images/loading_ani.gif');
				position: absolute;
				top: 50%; left: 50%;
				width:32px;
				height:32px;
				display:block;
				padding:0px;
				margin: -16px -16px;
			}
			a {
				color: #FFF300;
				text-decoration: none;
			}
			#enterbtn{
				cursor: pointer;
			}
	</style>
	<body >
	<div id="loadingSpinner"></div>
	<div id="inputAgeForm" style="display:none">
		<div style="margin-top:70px;">
			This content may contain offensive material. Proceed with caution.<br>
			Please enter your date of birth to view this content
		</div>
		<br></br>
		<form method=post name=f1 action=''><input type=hidden name=todo value=submit>
<table style="margin-left:auto; margin-right:auto;" border="0" cellspacing="0" width="300">
<tr> <td align=left >
<select name="month" id="month"> 
	<option value='0'>January</option>
	<option value='1'>February</option>
	<option value='2'>March</option>
	<option value='3'>April</option>
	<option value='4'>May</option>
	<option value='5'>June</option>
	<option value='6'>July</option>
	<option value='7'>August</option>
	<option value='8'>September</option>
	<option value='9'>October</option>
	<option value='10'>November</option>
	<option value='11'>December</option>
</select>

</td><td align=left >
<select name="day" id="day" >
<?php 
for($i=1; $i <= 31; $i++){
	echo "<option value='$i'>$i</option>";
}
?>
</select>
</td><td align=left >
<select name="year" id="year" >
<?php 
for($i=2011; $i > 1910; $i--){
	echo "<option value='$i'>$i</option>";
}
?>
</select>
</td>
<td>
<img id="enterbtn" src="<?php echo $this->data_uri( dirname(__FILE__) . '/enter_text.png','image/png'); ?>"></img>
</td>
</tr>
</table>
<br></br>
	By clicking enter you agree to Best Buy On's<br>
	<a target="_new" href="http://www.bestbuyon.com/privacy">Privacy Policy</a> and
	<a target="_new" href="http://www.bestbuyon.com/terms">Conditions of Use</a>
</div>
	<div id="weAreSorry" style="display:none;">
		<p style="margin-top:120px">
		We're sorry, but you are not eligible to view<br></br>
		this content due to ESRB guidelines.<br></br>		
		</p>
		<a href="http://www.bestbuyon.com/" style="margin-left:30px">Back to Best Buy On Home</a>
	</div>
	</body>
</html>
		<?php 
	}
}
