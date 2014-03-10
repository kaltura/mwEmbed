<div id="performance-main"></div>

<h3>Performance Comparison </h3>
<p>For most accurate test disable local cache</p>
<p><a href="#" id="gen-performance" class="btn btn btn-info btn-large">generate performance table</a></p>

<div id="performance-table">
	<table style="width:400px;border:solid thin black;">
		<tr>
			<td>Player Name</td>
			<td>avg play callback time</td>
		</tr> 
	</table>
</div>
<div style="height:100px;"></div>
<div id="iframeContainer"></div>
<script> 
	$("#gen-performance").click(function(){
		var testTypes = [
		         		'embedKdpFlash',
		         		'embed16',
		         		'embedMediaElmement',
		         		'embed17js',
		         		'embed17',
		         		'rawVideoTag'
		         		];

		// Do 3 test per type
		var runNextTest = function( inx ){
			var type = testTypes[inx];
			// embed iframe
			$( '#iframeContainer' ).html(
				$('<iframe />').attr( 'src', 'playerSpeedTest.html#' + type )
			);
		}
		var inx = 0;
		var runCount = 0;
		var runs = [];
		runNextTest( inx );
		window[ 'testDone' ] = function( runTime ){
			runs.push( runTime );
			runCount++;
			if( runCount > 3 ) {
				runCount = 0;
				var type = testTypes[inx];
				var sum = 0;
				for( var i =0; i < runs.length; i++ ){
					sum += runs[i]; 
				}
				var fullRunTime = Math.round( sum / runs.length * 100 ) / 100; 
				// output current tests avarage: 
				$('#performance-table table').append(
					$('<tr />').append(
						$('<td />').text( type ),
						$('<td />').text( fullRunTime )
					)
				)
				inx++;
			}
			if( testTypes[ inx ] ){
				runNextTest( inx );
			}
		}
		return false;
	});
	
</script>
