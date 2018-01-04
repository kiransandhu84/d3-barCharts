var d3Bar = function(configOptions)
{
	var options = {
		renderTo: "body",
		isDateFormat: true,
		margin: {top: 0, right: 0, bottom: 0, left: 0},
		width: 800,
		height: 400,
		barWidth: 37,
		barMargin: 37,
		adjustPos: "",
		labelColor: "#606060",
		labelFontSize: 11,
		labelContainerHeight: 44,
		buttonWidth: 40
	};
	
	$.extend(options, configOptions);
	
	this.contentDAO(options);
	this.renderBarChart(options);
	this.renderChartBg(options);
};

d3Bar.prototype.contentDAO = function(options)
{
	if(options.isDateFormat && options.series.data)
	{
		var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var data = options.series.data;
		
		for(var i = 0;i < data.length; i ++)
		{
			var date = new Date(data[i].x);
			
			data[i].x = month[date.getMonth()] + " " + date.getFullYear();
		}
		
		options.series.data = data;
	}
};

d3Bar.prototype.renderBarChart = function(options)
{
	var _self = this;
	var labelPos = options.labelContainerHeight;
	var width = options.width - options.margin.left - options.margin.right;
	var height = options.height - options.margin.top - options.margin.bottom - labelPos;
	var barWidth = options.barWidth;
	var barMargin = options.barMargin;
	
	var svg = d3.select(options.renderTo).append("svg")
    .attr("width", width + options.margin.left + options.margin.right)
    .attr("height", height + options.margin.top + options.margin.bottom + labelPos)
	.append("g")
	.attr("class", "bar-container");
  
    //.attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");
		
	options.svg = svg;
	
	var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
    .range([height, 0]);

	x.domain(options.series.data.map(function(d) {return d.x; }));
	y.domain([0, d3.max(options.series.data, function(d) { return d.y; })]);
	
	
	this.getBarPos(options);
	
	svg.selectAll(".bar")
      .data(options.series.data)
    .enter().append("rect")
      .attr("class", function(d, i) { return ("bar bar_" + i) })
      .attr("x", function(d, i) { return ((barWidth + barMargin) * i)})//x(d.x); })
      .attr("width", barWidth)
	  //.attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); })
	  .attr("stroke-width", 1)
      .on('mouseover', function(d, i){_self.renderToolTip(d, i, options)})
      .on('mouseout', function(d, i){_self.removeToolTip(d, i, options);});
	  
	this.getBarMaxHeight(options);
	this.renderLabelXAxis(options);
	this.renderButtons(options);
	  
	  /*d3.select(".bar-container")
		.attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");*/
		
	this.positionBars(options);
};

d3Bar.prototype.positionBars = function(options)
{
	var width = d3.select(".bar-container").node().getBoundingClientRect().width;
	var toggleButtonWidth = (options.buttonWidth * 2); //left and right button
	var containerPadding = 20;
	var marginAlignment = 40;
	var pos = -(width - $(options.renderTo).width() - options.margin.left - options.margin.right - toggleButtonWidth - containerPadding - marginAlignment);
	options.maxRightDist = pos;
	
	d3.select(".bar-container")
		.attr("transform", "translate("+ pos +"," + options.margin.top + ")");
};

d3Bar.prototype.getBarMaxHeight = function(options)
{
	var el = $(options.renderTo + " .bar");
	var heightArr = [];
	
	for(var i = 0; i < el.length;i++)
	{
		heightArr.push($($(el)[i]).attr("height"));
	}
	
	heightArr = heightArr.sort(function(a, b){
		return parseFloat(a) - parseFloat(b);
	});
	
	heightArr = heightArr.reverse();
	options.maxHeight = heightArr[0];
};

d3Bar.prototype.renderLabelXAxis = function(options)
{	
	var _self = this;
	var labelContainer = options.svg.append("g")
      .attr("class", "x axis");
    
	var text = labelContainer.selectAll("text")
                        .data(options.series.data)
                        .enter()
                        .append("text");
						
	var textLabels = text
                 .attr("x", function(d, i) { var axis = _self.getLabelPos(d, i, options); return axis.x;})
                 .attr("y", function(d, i) { var axis = _self.getLabelPos(d, i, options); return axis.y;})
				 .attr("aria-label", function (d) { return options.CustomADALabels(d); })
				 .attr("tabindex", "0")
				 .attr("class", function(d, i){ return 'barLabel bar_' + i;})
				 .attr("width", function(d,i){return options.barWidth;})
				 .attr("text-anchor", function(d,i){return "middle";})
				 .attr("fill", function(d,i){return options.labelColor;})
				 .attr("color", function(d,i){return options.labelColor;})
				 .attr("transform", "translate(0,0)");
				 //.append('tspan')
				 //.text("tet")
				 //.attr('dx', '0')
				 //.append('tspan')
				 //.text("tet1");
                 //.text( function (d, i) { return _self.getLabel(d, i, options);});

	 labelContainer.selectAll("text")
	 .append("tspan")
	 .text(function(d, i){return (d.x.split(" ")[0])});
	 
	 labelContainer.selectAll("text")
	 .append("tspan")
	 .attr("x", function(d, i) { var axis = _self.getLabelPos(d, i, options); return axis.x;})
	 .attr("dy", 14)
	 .text(function(d, i){return (d.x.split(" ")[1])});
	 
	 //textLabels.append('tspan').text("test1");
	/*var bars = $(".bar");
	$(options.renderTo).append('<div class="barXaxisContainer"></div>');
	
	for(var i = 0; i < bars.length; i++)
	{
		var heightPad = 10;
		var marginPad = 2;
		var pos = $($(bars)[i]).position();
		var height = parseFloat($($(bars)[i]).attr('height')) + heightPad;
	
		pos = this.getAdjPos(options, pos);
		
		var ariaLabel = options.series.data[i].x;
		
		if(options.CustomADALabels)
		{
			ariaLabel = options.CustomADALabels(options.series.data[i]);
		}
		
		$(".barXaxisContainer").append("<div aria-label='"+ ariaLabel +"' tabindex='0' style='left:"+ (parseInt(pos.left - marginPad) + "px") +";top:"+ (parseInt(pos.top + height) + "px") +"; width:"+ options.barWidth +"px;' class='barLabel bar_"+ i +"'>"+ options.series.data[i].x +"</div>");
	}*/
};

d3Bar.prototype.getLabelPos = function(data, idx, options)
{
	var heightPad = 4;
	var marginPad = 2;
	var bars = $(".bar");
	var pos = $($(bars)[idx]).position();
	//var height = parseFloat($($(bars)[idx]).attr('height')) + heightPad;
	var axis = {};
	
	pos = this.getAdjPos(options, pos);
	
	axis.x = (parseInt(pos.left - marginPad));
	//axis.y = (parseInt(pos.top + height + options.labelFontSize + (options.labelContainerHeight / 2)));
	axis.y = (parseInt(options.maxHeight) + (options.labelContainerHeight / 2)) - heightPad;
	return axis;
};

function tooltip()
{
	return '<g class="highcharts-tooltip" style="cursor:default;padding:0;pointer-events:none;white-space:nowrap;" opacity="1" visibility="visible"><path fill="none" d="M 3.5 0.5 L 141.5 0.5 C 144.5 0.5 144.5 0.5 144.5 3.5 L 144.5 46.5 C 144.5 49.5 144.5 49.5 141.5 49.5 L 77.5 49.5 71.5 55.5 65.5 49.5 3.5 49.5 C 0.5 49.5 0.5 49.5 0.5 46.5 L 0.5 3.5 C 0.5 0.5 0.5 0.5 3.5 0.5" isShadow="true" stroke="black" stroke-opacity="0.049999999999999996" stroke-width="5" transform="translate(1, 1)"></path><path fill="none" d="M 3.5 0.5 L 141.5 0.5 C 144.5 0.5 144.5 0.5 144.5 3.5 L 144.5 46.5 C 144.5 49.5 144.5 49.5 141.5 49.5 L 77.5 49.5 71.5 55.5 65.5 49.5 3.5 49.5 C 0.5 49.5 0.5 49.5 0.5 46.5 L 0.5 3.5 C 0.5 0.5 0.5 0.5 3.5 0.5" isShadow="true" stroke="black" stroke-opacity="0.09999999999999999" stroke-width="3" transform="translate(1, 1)"></path><path fill="none" d="M 3.5 0.5 L 141.5 0.5 C 144.5 0.5 144.5 0.5 144.5 3.5 L 144.5 46.5 C 144.5 49.5 144.5 49.5 141.5 49.5 L 77.5 49.5 71.5 55.5 65.5 49.5 3.5 49.5 C 0.5 49.5 0.5 49.5 0.5 46.5 L 0.5 3.5 C 0.5 0.5 0.5 0.5 3.5 0.5" isShadow="true" stroke="black" stroke-opacity="0.15" stroke-width="1" transform="translate(1, 1)"></path><path fill="rgb(243, 243, 243)" d="M 3.5 0.5 L 141.5 0.5 C 144.5 0.5 144.5 0.5 144.5 3.5 L 144.5 46.5 C 144.5 49.5 144.5 49.5 141.5 49.5 L 77.5 49.5 71.5 55.5 65.5 49.5 3.5 49.5 C 0.5 49.5 0.5 49.5 0.5 46.5 L 0.5 3.5 C 0.5 0.5 0.5 0.5 3.5 0.5" stroke="rgb(207, 208, 215)" stroke-width="1"></path><text x="8" style="font-size:12px;color:#333333;fill:#333333;" y="20"><tspan class="accountToolTip" >Balance: $147,438.80</tspan><tspan x="8" dy="15" class="dateToolTip">Date: 02/29/2016</tspan></text></g>';
}

d3Bar.prototype.renderToolTip = function(data, idx, options)
{
	var pos = $($(".bar")[idx]).position();
	var label = options.series.data[idx].x;
	
	pos = this.getAdjPos(options, pos);
	
	if(options.tooltip && options.tooltip.formatter)
	{
		label = options.tooltip.formatter(data);
	}
	
	//$(options.renderTo).append("<div tabindex='0' style='left:"+ (pos.left) +";top:"+ (pos.top) +";' class='tooltip d3ToolTip'>"+ label +"</div>");
	
	d3.select("svg")
		.append('g').html(tooltip())
		.attr('class', 'tooltip');
	//$(".tooltip").hide();
	
	var tipObj = d3.select(".tooltip").node().getBoundingClientRect();
	
	var tipWidth = tipObj.width / 2; //$(".tooltip").width() / 2;
	var tipheight = tipObj.height;//$(".tooltip").outerHeight();
	var barWidth = parseFloat($($(".bar")[idx]).attr('width')) / 2;
	var toolTipPadding = 10;
	
	var barPos = d3.select(".bar_" + idx).attr('y');
	
	d3.select(".tooltip")
		.attr("transform", ("translate(" + (parseInt(pos.left - tipWidth)) + "," + (parseInt(barPos - options.margin.top)) + ")"));
		//.attr("y", (parseInt(pos.top - tipheight - toolTipPadding)));
		
	//$(".tooltip").css({'left': (parseInt(pos.left - tipWidth) + "px"), 'top': (parseInt(pos.top - tipheight - toolTipPadding) + "px")});
	$(".tooltip").show();
};

d3Bar.prototype.getAdjPos = function(options, pos)
{
	var adjPos = $(options.adjustPos).position();
	if(adjPos && adjPos.left && adjPos.top)
	{
		pos.left = pos.left - adjPos.left;
		pos.top = pos.top - adjPos.top;
	}
	return pos;
};

d3Bar.prototype.removeToolTip = function(data, idx, options)
{
	$(".tooltip").remove();
};

d3Bar.prototype.renderButtons = function(options)
{
	var strokePadding = 2; //top 1 px bottom 1 px
	var heightPad = 10; //Need to figure out 10 px
	
	d3.selectAll("svg")
		.insert("rect", ":first-child")
		.attr("x", 0.5)
		.attr("y", parseFloat(options.maxHeight) + options.margin.top)
		.attr("width", 1060)
		.attr("height", options.labelContainerHeight)
		.attr("stroke", "rgb(206, 206, 206)")
		.attr("stroke-width", 1)
		.attr("fill", "rgb(245, 245, 245)");
		
	this.renderButton(options);
	this.renderButton(options, true);
	this.registerActionsForButtons(options);
};

d3Bar.prototype.renderButton = function(options, isRightButton)
{
	d3.selectAll("svg")
		.append("rect")
		.attr("x", (isRightButton ? 1060 : 0))
		.attr("y", options.margin.top)
		.attr("width", (isRightButton ? 100 : options.buttonWidth))
		.attr("height", (options.height - options.margin.bottom - options.margin.top))
		.attr("fill", "rgb(255, 255, 255)");
		
	var leftArrow = d3.selectAll("svg")
		.append("g")
		.attr("class", ("highcharts-button " + (isRightButton ? "highcharts-right-button disabled" : "highcharts-left-button")))
		.attr("style", "cursor:pointer")
		.attr("transform", "translate("+ (isRightButton ? 1060 : "0") +","+  (parseFloat(options.maxHeight) + options.margin.top) +")")
		.append("rect")
		.attr("x", "0.5")
		.attr("y", "0.5")
		.attr("width", options.buttonWidth)
		.attr("height", options.labelContainerHeight)
		.attr("fill", "rgb(245, 245, 245)")
		.attr("stroke", "#CCCCCC")
		.attr("stroke-width", "1")
		.attr("rx", "0")
		.attr("ry", "0");
		
	d3.selectAll(".highcharts-button")
		.append("text")
		.attr("style", "color:black;fill:black;")
		.attr("x", "5")
		.attr("y", "17");
		
	d3.selectAll((isRightButton ? ".highcharts-right-button.disabled" : ".highcharts-left-button"))
		.append("image")
		.attr("class", (isRightButton ? "rightImg" : "leftImg"))
		.attr("preserveAspectRatio", "none")
		.attr("href", (isRightButton ? "images/arrow-right-disabled.png" : "images/arrow-left.png"))
		.attr("x", "6")
		.attr("y", "10")
		.attr("width", "10")
		.attr("height", "16")
		.attr("transform", "translate(8,5)");
};

d3Bar.prototype.registerActionsForButtons = function(options)
{
	$(".highcharts-left-button").off('click').on('click', function(){
		if($(this).attr('class').indexOf('disabled') == -1)
		{
			d3.selectAll(".highcharts-right-button").classed('disabled', false);
			d3.selectAll(".rightImg")
				.attr("href", "images/arrow-right.png");
			
			var translate = d3.selectAll(".bar-container").attr("transform");
			translate = translate.split("(")[1].split(")")[0].split(",");
			translate = parseFloat(translate) + (options.barWidth + options.barMargin);
			
			if(translate >= options.marginleft || translate >= 0)
			{
				d3.selectAll(".leftImg")
				.attr("href", "images/arrow-left-disabled.png");
				d3.selectAll(".highcharts-left-button").classed('disabled', true);
			}
			d3.selectAll(".bar-container").transition()
				.attr("transform", "translate("+ translate +", "+ options.margin.top +")")
		}
	});
	
	$(".highcharts-right-button").off('click').on('click', function(){
		if($(this).attr('class').indexOf('disabled') == -1)
		{
			d3.selectAll(".leftImg")
				.attr("href", "images/arrow-left.png");
				
			d3.selectAll(".highcharts-left-button").classed('disabled', false);
			
			var translate = d3.selectAll(".bar-container").attr("transform");
			translate = translate.split("(")[1].split(")")[0].split(",");
			translate = parseFloat(translate) - (options.barWidth + options.barMargin);
			
			if(translate <= options.maxRightDist)
			{
				d3.selectAll(".rightImg")
				.attr("href", "images/arrow-right-disabled.png");
				d3.selectAll(".highcharts-right-button").classed('disabled', true);
			}
			d3.selectAll(".bar-container").transition()
				.attr("transform", "translate("+ translate +", "+ options.margin.top +")")
		}
	});
};

d3Bar.prototype.getBarPos = function(options)
{
	var difference = options.height - options.labelContainerHeight;
	var numPointsToShow = 4;
	var diffPoint =  difference / numPointsToShow;
	
	d3.select("svg")
		.insert("g", ":first-child")
		.attr("class", "lineCoords");
	
	for(var i = 0; i < numPointsToShow; i++)
	{
		var YPos = diffPoint * (i);
		
		var lineData = [ { "x": 0,   "y": YPos},  { "x": 1060,  "y": YPos}];
 
		var lineFunction = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("linear");

		var lineGraph = d3.select(".lineCoords")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "#D8D8D8")
			.attr("stroke-width", 1)
			.attr("fill", "none");
	}
};

d3Bar.prototype.renderChartBg = function(options)
{
	var bg = d3.selectAll("svg")
		.insert("rect", ":first-child")
		.attr("x", "0")
		.attr("y", "0")
		.attr("width", options.width)
		.attr("height", options.height)
		.attr("fill", "rgb(255, 255, 255)")
		.attr("rx", "0")
		.attr("ry", "0");
};