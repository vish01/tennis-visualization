// Start of Choropleth
function createMap(data, id) {
    var wt = 1500;
    var ht = 700;
    var proj = d3.geoMercator()
        .scale(130)
        .translate( [wt/2, ht/2]);

    var mapSvg = d3.select(id).append("svg")
        .attr("width", wt)
        .attr("height", ht);

    var path = d3.geoPath()
        .projection(proj);

    mapSvg.append("path")
        .datum(data)
        .attr("d", path)
        .style("stroke", "black")
        .style("fill", "none");
}

function processData(errors,tennisdata, countries) {

    tdata = tennisdata;
    world = countries;

    colormap(errors, tdata, countries , "#Firstmap");

}

 function colormap(errors, tdata, countries) {
     var wmap = d3.entries(tdata);
     var countryaccess = {};
     wmap.map(function (d, i) {

         if (countryaccess[d.value.winner_ioc] == undefined) {
             countryaccess[d.value.winner_ioc] = 1;
         }
         else {
             countryaccess[d.value.winner_ioc] += 1;

         }

     })
     var w = 1300;
     var h = 700;
     var proj2 = d3.geoMercator()
         .scale(130)
         .translate([w / 2, h / 2]);

     var map = d3.select('#Firstmap').append("svg:svg")
         .attr("width", 0)
         .attr("height", 0);
     var tip = d3.tip()
         .attr('class', 'd3-tip')
         .html(function (d) {
             var wins = 0;
             if (d.id in countryaccess) {
                 wins = countryaccess[d.id];
             }
             return "<strong>Total Wins:</strong><span style='color:white'>" + wins + "</span>"
         });

     var mapSvg = d3.select("#Firstmap").append("svg")
         .attr("width", w)
         .attr("height", h)
         .attr("class", "region");

     var path = d3.geoPath()
         .projection(proj2);
     mapSvg.call(tip);
     var x = d3.scaleLinear()
         .domain([1, 10])
         .rangeRound([600, 860]);

     var color = d3.scaleThreshold()
         .domain(d3.range(1, 32))
         .range(d3.schemeBlues[9]);

     mapSvg.selectAll("rect")
         .data(color.range().map(function(d) {
             d = color.invertExtent(d);
             if (d[0] == null) d[0] = x.domain()[0];
             if (d[1] == null) d[1] = x.domain()[1];
             return d;
         }))
         .enter().append("rect")
         .attr("height", 8)
         .attr("x", function(d) { return x(d[0]); })
         .attr("width", function(d) { return x(d[1]) - x(d[0]); })
         .attr("fill", function(d) { return color(d[0]); });
     var m = d3.max(d3.values(countryaccess));
     world.features.map(function (d) {
         mapSvg.append("path")
             .datum(d)
             .attr("d", path)
             .style("stroke", "black")
             .style("fill", function (e) {
                 var name = e.id;
                 if (countryaccess[name] !== undefined) {
                     return color(countryaccess[name]);
                 }
                 else
                     return "none";
             })
             .on("mouseover", function (d) {
                 tip.show(d);
             })
             .on("mouseout", function (d) {
                 d3.select("#tooltip").remove();
             })
             .on("click", showbarchart);

     });

     function showbarchart(country) {

         var playerwin = {};
         wmap.forEach(function (d) {
             if (d.value.winner_ioc == country.id) {
                 if (d.value.winner_name in playerwin) {
                     playerwin[d.value.winner_name] = playerwin[d.value.winner_name] + 1;
                 }
                 else {
                     playerwin[d.value.winner_name] = 1;
                 }
             }
         });

         var values = Object.values(playerwin);
         var maxwin = Math.max.apply(Math, values);
         // console.log(maxwin);
         var keys = Object.keys(playerwin);
         var margin = {top: 20, right: 20, bottom: 30, left: 40},
             width = 960 - margin.left - margin.right,
             height = 600 - margin.top - margin.bottom;
         xwidth = values.length*60;
// set the ranges
         var x = d3.scaleBand()
             .range([0, xwidth]);
         var y = d3.scaleLinear()
             .range([height, 0]);

// append the svg object to the body of the page
         d3.select(".barchart")
             .select("svg")
             .remove();

         var svg = d3.select(".barchart").append("svg")
             .attr("width", 960)
             .attr("height", 710)
             .append("g")
             .attr("transform",
                 "translate(" + margin.left + "," + margin.top + ")")
             .on("mouseover", function (d) {
                 tip.show(d);
             })
         var tip = d3.tip()
             .attr('class', 'd3-tip')
             .html(function (d) {
                 var age = 0;
                 if (keys == wmap.value) {
                     age = countryaccess.d;
                 }
                 return "<strong>Player Age:</strong><span style='color:gray'>" + age + "</span>"
             });
         mapSvg.call(tip);

             // Scale the range of the data in the domains
             x.domain((keys));
             y.domain([0,maxwin]);

             // append the rectangles for the bar chart
             svg.selectAll(".barchart")
                 .data(values)
                 .enter().append("rect")
                 .transition()
                 .duration(2000)
                 .attr("class", "bar")
                 .attr("x", function(d,i) { return i*60 + 23 - i/2; })
                 .attr("width", 20)
                 .attr("y", function(d) { return y(d); })
                 .attr("height", function(d) { return height-y(d); });

             // add the x Axis
             svg.append("g")
                 .attr("transform", "translate(0," + height + ")")
                 .call(d3.axisBottom(x))
                 .selectAll("text")
                 .attr("y", -5)
                 .attr("x",60)
                 //.attr("stroke",'bold')
                 .attr("fill", 'darkgreen')
                 .style("font-size","13px")
                 .attr("transform","rotate(90)");
             svg.append("text")
                 .attr("transform", "translate(-30," + (height / 2) + ") rotate(-90)")

                 .attr("dy","0.71em")
                 .attr("text-anchor","middle")
                 .text("Matches Won in 2017 year");
   //add axis name
            svg.append("text")
             .attr("x", width /5)
             .attr("y", height+130)
             .text("Name of Players")
             // add the y Axis
             svg.append("g")
                 .call(d3.axisLeft(y).ticks(maxwin));
         }

 }

d3.queue()
    .defer(d3.csv, "atp_matches_2017.csv")
    .defer(d3.json, "https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json")
    .await(processData);
//End of Project