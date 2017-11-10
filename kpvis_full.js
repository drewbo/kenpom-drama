// menu data

var confopt = ["All", "American", "America East", "ACC", "Atlantic Sun", "A10", "Big East", "Big Sky", "Big South", "Big Ten", "Big Twelve", "Big West", "CAA", "Conference USA", "Horizon League", "Ivy League", "MAAC", "MAC", "MEAC", "Missouri Valley", "Mountain West", "Northeast", "Ohio Valley", "Pac Ten", "Patriot League",
        "SEC", "Southern", "Southland", "SWAC", "Summit League", "Sun Belt", "WCC", "WAC", "Independent"]; // hardcoded
var teamopt = [];  // updates in data loop

// for future window resizing

//d3.select(window).on('resize', resize);
var width = parseInt(d3.select('#vis').style('width'), 10);

// define some non-data dependent parts

var margin = {top: 60, right: 20, bottom: 50, left: 60},
    width = width - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width ]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#vis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// menus

var confmenu = d3.select("#conf")
                 .on("change", change);

confmenu.selectAll("option")
        .data(confopt)
        .enter().append("option")
        .text(function (d) { return d; });

var curConfSel = confmenu.property("value", "All");

var teammenu = d3.select("#team")
                 .on("change", change);

teammenu.selectAll("option")
        .data(teamopt)
        .enter().append("option")
        .text(function (d) { return d; });

//var curTeamSel = teammenu.property("value", "All");

var hlconf = d3.select("#hlconf")
             .on("change", change);

hlconf.selectAll("option")
        .data(confopt)
        .enter().append("option")
        .text(function (d) { return d; });

var hlconfsel = hlconf.property("value", "All");

var hlteam = d3.select("#hlteam")
             .on("change", change);

hlteam.selectAll("option")
        .data(teamopt)
        .enter().append("option")
        .text(function (d) { return d; });

//var hlteamsel = hlteam.property("value", "All");

var radio = d3.selectAll("form")
              .on("change", change);

// tooltip

var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return d[5] + "<br>" + d[4] + "<br>perDrama: <span style='color:orange'>" + d[8].toFixed(3) + "</span>, eFG%: <span style='color:orange'>" + d[7].toFixed(3) + "</span>, Hype: <span style='color:orange'>" + Math.round(d[1]) + "</span>";
        });

svg.call(tip);

var filtered = [];
var dataset = [];
var tc = [];
var confarray = [];
var tournarray = [];
var xmed = 0;
var ymed = 0;

// now get the data and draw the axes
d3.csv("tcmatch.csv", function (error, tcdata) {
    d3.csv("kpdata.csv", function (error, data) {
        tc = tcdata.map(function (d) {return [ d["Conference"], d["Team"]]; });

        dataset = data.map(function (d) { return [ +d["game"], +d["hype"], d["team1"], d["team2"], d["shortDate"], d["gameInfo"], +d["possessions"], +d["eFG"], +d["perDrama"], d["conference1"], d["conference2"], +d["conference"], +d["tournament"]]; });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width / 2)
            .attr("y", 36)
            .style("text-anchor", "end")
            .text("perDrama (%)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -52)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("eFG%");

    // menu initialization for those which later dynamically update

        teammenu.selectAll("option")
        .data(tc, function key(d) {return d[1]; })
        .enter().append("option")
        .text(function (d) { return d[1]; });

        teammenu.property("value", "All");

        hlteam.selectAll("option")
        .data(tc, function key(d) {return d[1]; })
        .enter().append("option")
        .text(function (d) { return d[1]; });

        hlteam.property("value", "All");

// call our rendering function to kick things off
        change();

    });
});

// this function updates the drop down menus, rescales the axes for the new data and draws all the dots

function change() {
    curConfSel = [];
    curTeamSel = [];
    d3.select("#conf").selectAll("option").each(confsel);
    d3.select("#team").selectAll("option").each(teamsel);

    // menu updates
    if (curConfSel == "All") {
        teamupdate = tc;
    }
        else {
            teamupdate = tc.filter(function (d) { return curConfSel.indexOf(d[0]) > -1; });
        }

    teammenu.selectAll("option")
        .data(teamupdate, function key(d) {return d[1]; })
        .text(function (d) { return d[1]; });

    teammenu.selectAll("option")
        .data(teamupdate, function key(d) {return d[1]; })
        .enter().append("option")
        .text(function (d) { return d[1]; });

    teammenu.selectAll("option")
        .data(teamupdate, function key(d) {return d[1]; })
        .exit().remove();

    hlteam.selectAll("option")
        .data(teamupdate, function key(d) {return d[1]; })
        .enter().append("option")
        .text(function (d) { return d[1]; });


    hlconfsel = hlconf.property("value");
    hlteamsel = hlteam.property("value");

    // set the filtering arrays

    if (d3.select("#showall").property("checked") == true) {
        tournarray = [0, 1];
        confarray = [0, 1];
    }
        else if (d3.select("#conference").property("checked") == true) {
            confarray = [1];
            tournarray = [0, 1];
        }
        else {
            confarray = [0, 1];
            tournarray = [1];
        }

    datafilter();

    // this catches empty sets

    if (filtered == 0) {
        curTeamSel = [];
        teammenu.property("value", "All");
        d3.select("#team").selectAll("option").each(teamsel);
        datafilter();
    }

    // gives median for lines

    xmed = x(d3.median(filtered, function (d) {return d[8]; }));
    ymed = y(d3.median(filtered, function (d) {return d[7]; }));

    // axes

    svg.transition().duration(750).selectAll(".x.axis").call(xAxis);
    svg.transition().duration(750).selectAll(".y.axis").call(yAxis);

    // update existing dots
    var dots = svg.selectAll(".dot")
        .data(filtered, function key(d) {return d[0]; })
        .transition()
        .duration(750)
        .attr("class", "dot")
        .attr("fill", hl)
        .attr("r", function (d) { return d[1] * 4.5; })
        .attr("cx", function (d) { return x(d[8]); })
        .attr("cy", function (d) { return y(d[7]); });

    // dots come in
    svg.selectAll(".dot")
        .data(filtered, function key(d) {return d[0]; })
        .enter().append("circle")
        .attr("r", 1e-6)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr("opacity", 0.6)
        .attr("fill", hl)
        .transition()
        .duration(750)
        .attr("class", "dot")
        .attr("r", function (d) { return d[1] * 4.5; })
        .attr("cx", function (d) { return x(d[8]); })
        .attr("cy", function (d) { return y(d[7]); });

     // dots go out; never a miscommunication
    svg.selectAll(".dot")
        .data(filtered, function key(d) {return d[0]; })
        .exit()
   //     .transition()
//        .duration(750)
//        .attr("r", 1e-6)     if you leave this transition, chain it first (because it takes a while and interferes with the cooler update transition)
        .remove();

    // call the quadrants function
    quadrants();
}


// this function filters the data and rescales the domain based on the current selections

function datafilter() {
    if (curConfSel == "All" && curTeamSel == "All") {
        filtered = dataset.filter(function (d) { return (confarray.indexOf(d[11]) > -1) && (tournarray.indexOf(d[12]) > -1); });
    }
    else if (curConfSel =="All" && !(curTeamSel == "All")) {
        filtered = dataset.filter(function (d) { return (curTeamSel.indexOf(d[2]) > -1 || curTeamSel.indexOf(d[3]) > -1) && (confarray.indexOf(d[11]) > -1) && (tournarray.indexOf(d[12]) > -1); });
    }
    else if (!(curConfSel =="All") && curTeamSel == "All") {
        filtered = dataset.filter(function (d) { return (curConfSel.indexOf(d[9]) > -1 || curConfSel.indexOf(d[10]) > -1) && (confarray.indexOf(d[11]) > -1) && (tournarray.indexOf(d[12]) > -1); });
    }
    else {
        filtered = dataset.filter(function (d) {return (curConfSel.indexOf(d[9]) > -1 || curConfSel.indexOf(d[10]) > -1) && (curTeamSel.indexOf(d[2]) > -1 || curTeamSel.indexOf(d[3]) > -1) && (confarray.indexOf(d[11]) > -1) && (tournarray.indexOf(d[12]) > -1); });
    }

    x.domain([d3.min(filtered, function (d) { return d[8]; }) * 0.8, d3.max(filtered, function (d) { return d[8]; }) * 1.1]);
    y.domain([d3.min(filtered, function (d) { return d[7]; }) * 0.95, d3.max(filtered, function (d) { return d[7]; }) * 1.05]);
}

// these two functions faciliate multiple selections

function confsel() {
    if (d3.select(this).property("selected") == true) {
        curConfSel.push(d3.select(this).property("value"));
    }
}

function teamsel() {
    if (d3.select(this).property("selected") == true) {
        curTeamSel.push(d3.select(this).property("value"));
    }
}


// draws lines to show four areas of the chart good/bad shooting + high/low drama

function quadrants() {
    svg.selectAll("line").remove();

    if (d3.select("#medgrid").property("checked") == true){
        svg.append("line")
        .attr("x1", xmed)
        .attr("y1", 0)
        .attr("x2", xmed)
        .attr("y2", height)
        .attr("stroke-width", 1)
        .attr("stroke", "gray");

       svg.append("line")
        .attr("x1", 0)
        .attr("y1", ymed)
        .attr("x2", width)
        .attr("y2", ymed)
        .attr("stroke-width", 1)
        .attr("stroke", "gray");
  }
}


// colors orange if highlighted

function hl(d) {
    if (d[9] == hlconfsel || d[10] == hlconfsel || d[2] == hlteamsel || d[3] == hlteamsel){
    return "orange";
    }
    else{ return "slategray";}
}
