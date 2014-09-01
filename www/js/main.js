'use strict';
var hrt_data =[];
/*Creation of the d3 ScatterPlot*/
var splot_dataset = [];
var hrt_counter = 0;
//shifting of line graph
var xshift = -1;

/*Creation of the d3 Chart*/
var chart_data = [];

/*Creation of d3 LineGraph*/
var hrt_data_line = [10];

/*Creation of the d3 ScatterPlot*/
var isPurged = 0;

var hrt_purge_time = 0;
var ekg_purge_marker = 0;

//Create a JSON style object for the margin
var margin = {
    top: 10,
    right: 20,
    bottom: 20,
    left: 20
};

var h_width = 100000;
var height = 0.5 * window.innerHeight;

//Heartrate Scatterplot-Selects the specified DOM element for appending the svg 
var hrt_svg = d3.select("#hrt_chart").append("svg").attr("id","container1").attr("width", h_width)
.attr("height", 0.6 * height).append("g");

hrt_svg.attr("transform", "translate(25," + margin.top + ")");

var x1 = d3.scale.linear().domain([0, 5000]).range([0, 100000]);

var y1 = d3.scale.linear().domain([0, 200]).range([0.5 * height, 0]);

//Add X Axis grid lines
hrt_svg.selectAll("line.y1")
  .data(y1.ticks(10))
  .enter().append("line")
  .attr("class", "y")
  .attr("x1", 0)
  .attr("x2", 100000)
  .attr("y1", y1)
  .attr("y2", y1)
  .style("stroke", "rgba(8, 16, 115, 0.2)");

//This is for the Scatterplot X axis label
hrt_svg.append("text").attr("fill", "white").attr("text-anchor", "end").attr("x", 0.5 * h_width).attr("y", 0.55 * height).text("Periods");

var x1Axis = d3.svg.axis().scale(x1).orient("top").tickPadding(0).ticks(1000);
var y1Axis = d3.svg.axis().scale(y1).orient("left").tickPadding(0);

hrt_svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y1.range()[0] + ")")
.call(x1Axis);

hrt_svg.append("g").attr("class", "y axis").call(y1Axis);

var dottedline = d3.svg.line().x(function(d, i) {
    return x1(i);
}).y(function(d, i) {
    return y1(d);
});


hrt_purge_time=Math.round(((window.innerWidth*40)/969)-2);

ekg_purge_marker=Math.round(((window.innerWidth*789)/413)); //Measuring chart_data count


function purgeData(data){
        if(data == "hrt"){
            hrt_counter = 0;
            xshift = -1;
            hrt_data_line = [10];    
            splot_dataset = [];
            //Remove all of the nodes from the charts
            hrt_svg.selectAll("#hgraph_l").remove();
            hrt_svg.selectAll("#hgraph").remove();
        }
        else if(data == "ekg"){
            chart_data = [2000];
            tick();
        }        
		//Data has been purged		
		isPurged = 1;
}

function plot() { 	
  /*-------------------------------For the Line Graph-------------------------------*/
    //var tmp_hrt_data = [];
    //hrt_data_line.push(hrt_data[0]);
    //Add new element to the front of the array
    //console.log("hrt_data before unshift "+hrt_data);
    hrt_data.unshift(hrt_counter);
    //Add new element to the end of the array
    splot_dataset.push(hrt_data);
    //console.log("Plot dataset " + splot_dataset);
    //Empty heart rate data array
    hrt_data = [];
    hrt_counter++;
    
    //Draw Line Graph && Draw circles
    hrt_svg.selectAll("circle").data(splot_dataset).enter().append("svg").attr("id", "hgraph").append("circle").attr("cx", function(d, i) {
        return x1(d[0]);
    }).attr("cy", function(d) {
        return y1(d[1]);
    }).attr("r", 4).attr("class", "dot")
    //.style("fill", "white");
    .style("fill", function(d) {
        if (d[1] > 100) {
            return "red";
        } else if ((d[1] > 59) && (d[1] < 101)) {
            return "green"
        } else {
            return "white";
        }
    })
    .attr("stroke", "black")
    .attr("stroke-width", 1);
    
	//Handle purging data
	if((hrt_purge_time === hrt_counter) || (hrt_counter > hrt_purge_time)){
		//alert("PURGE Heart rate Data");
		purgeData("hrt");
	}
}


var connection, socket;
try{
    //Connect to the Galileo Server
    socket = io.connect("http://192.168.1.148:1337");

    //Attach a 'connected' event handler to the socket
    socket.on("connected", function(message){
        /*navigator.notification.alert(
                message,  // message
                "",                     // callback
                'Hi There!',            // title
                'Ok'                  // buttonName
            );*/
    });

    socket.on("message", function(message){
        //console.log("Temperature is "+ message);
        hrt_data.push(message);
        plot();
        //Update log
        $("#feedback_log").text("Last Updated at "+Date().substr(0, 21));
    });
}
catch(e){
    alert("Connection Error: Server Not Available");
}



