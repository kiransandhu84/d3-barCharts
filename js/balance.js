$(document).ready(function(){
	balanceChart();
});

	function balanceChart(){
		$.getJSON('getAccountBalances.do').done(function (data) {
		//alert("partial list?"+data.partialList);
		//alert("data series size: "+data.balanceData.length);
		var monthToDisplay = data.data[12];
		//alert("time: "+monthToDisplay.x + " amt: "+monthToDisplay.y);
		if (data.partialList){
			$('.balance-chart-message-container').empty();
			var errorMessageMissingBalance = 
				'<div class="form-error" aria-label="Some monthly information is unavailable." aria-live="assertive" role="alert">Some monthly information is unavailable.</div>';
			$('.balance-chart-message-container').html(errorMessageMissingBalance);
		}
	
		
	}).fail(function( jqxhr, textStatus, error ) {
			$('.balance-chart-message-container').empty();
			var errorMessageNoBalance = 
				'<div class="form-error" aria-label="The account balance information you requested is unavailable." aria-live="assertive" role="alert">The account balance information you requested is unavailable.</div>';
			$('.balance-chart-message-container').html(errorMessageNoBalance);
			
			renderBarChart();
		}
	); //get json	
	}
	
	function renderBarChart()
	{
		$('.balance-chart-message-container').hide();
		
		var chartJson = {showInLegend:false,partialList:false,startIndex:12,name:"Account Balance Chart",color:"rgb(64, 64, 64)",data:[{x:1430377200000,y:161257.2},{x:1433055600000,y:160975.14},{x:1435647600000,y:158219.9},{x:1438326000000,y:159353.46},{x:1441004400000,y:150009.11},{x:1443596400000,y:147671.49},{x:1446274800000,y:156008.58},{x:1448870400000,y:156276.37},{x:1451548800000,y:154749.51},{x:1454227200000,y:149470.57},{x:1456732800000,y:147438.8},{x:1459407600000,y:156745.59},{x:1461999600000,y:158364.12},{x:1464678000000,y:158900.16},{x:1467270000000,y:160658.17},{x:1469948400000,y:165230.92},{x:1472626800000,y:164754.65},{x:1475218800000,y:165399.84},{x:1477897200000,y:161944.18},{x:1480492800000,y:164753.92},{x:1483171200000,y:167739.67},{x:1485849600000,y:172017.52},{x:1488268800000,y:176767.39},{x:1490943600000,y:176410.21}]};
		
		chartJson1 = {showInLegend:false,partialList:false,startIndex:12,name:"Account Balance Chart",color:"rgb(64, 64, 64)",data:[{x:1430377200000,y:161257.2},{x:1433055600000,y:160975.14},{x:1435647600000,y:158219.9},{x:1438326000000,y:159353.46},{x:1441004400000,y:150009.11},{x:1443596400000,y:147671.49},{x:1446274800000,y:156008.58},{x:1448870400000,y:156276.37},{x:1451548800000,y:154749.51},{x:1454227200000,y:149470.57},{x:1456732800000,y:147438.8},{x:1459407600000,y:156745.59}]};
		
		new d3Bar({
			"renderTo": "#accountBalancesChart",
			"series": chartJson,
			"width": 1120,
			"height": 400,
			"barMargin": 45,
			"barWidth": 39,
			"adjustPos": "#container",
			"margin": {top: 30, right: 30, bottom: 30, left: 60},
			"tooltip":{
				"formatter": function (jsonObj) {
					var str = '',
					value = jsonObj.y,
					date = jsonObj.x;
					
					value = "$" + value.toLocaleString();
					str = ['Balance: ' + value, 'Date: ' + date].join('<br>');	

					return str
				}
			},
			"CustomADALabels": function(jsonObj)
			{
				var str = '',
				value = jsonObj.y,
				date = jsonObj.x;
				
				value = "$" + value.toLocaleString();
				str = date + " " + value;	

				return str
			}
		  });
	}

	function loadAccountBalanceTable(balanceData){
		var balanceTableTitle = "<div> Account Balance Chart</div>";
		var balanceTableHead = '<div><table class="asset-table">'+
									'<thead>'+
										'<tr>'+
											'<th >Date</th>'+
											'<th >Balance</th>'+
										'</tr>'+
									'</thead>';
		var balanceNum = balanceData.length;
		var balanceRow = "";
		for(var i=0; i < balanceNum ; i++){
			var balance = balanceData[i];
			var tDate = new Date(balance.x);
			var tAmount = balance.y;
			if (balance.y == null){
				tAmount = "N/A";
			}
			balanceRow += '<tr class="parent ">';
			balanceRow += '<td><span>' + tDate.defaultView() + '</span></td>';
			balanceRow += '<td><span class="NumFormat">' + tAmount + '</span></td></tr>';
		}
		var balanceTableBody = '<tbody>'+balanceRow+'</tbody></table></div>';							
			$('#accountBalanceTable').html(balanceTableTitle+balanceTableHead +' '+ balanceTableBody);
			$('.NumFormat').digits();
	};
		
