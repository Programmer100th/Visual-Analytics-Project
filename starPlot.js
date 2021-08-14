var starPlot = {
  draw: function (id, d, options) {
    var cfg = {
      radius: 5, // Radius of the point of the polygon
      w: 300, //Width of the circle
      h: 300, //Height of the circle
      factor: 1, // Scale or zoom (DO NOT TOUCH)
      factorLegend: .85, // Distance of the legend
      levels: 5, //How many levels or inner polygon should there be drawn
      maxValue: 0,
      radians: 2 * Math.PI,
      opacityArea: 0, //0.2 //The opacity of the area of the polygon
      ToRight: 5,
      TranslateX: 90,
      TranslateY: 40,
      ExtraWidthX: 100,
      ExtraWidthY: 100,
      color: d3.schemeCategory10
    };

    if ('undefined' !== typeof options) {
      for (var i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    }
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function (i) { return d3.max(i.map(function (o) { return o.value; })) }));

    var allAxis = (d[0].map(function (i, j) { return i.axis }));
    var total = allAxis.length;
    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);

    // Data format of the values in the star plot
    var Format = d3.format('.0f');
    d3.select(id).select("svg").remove();

    var g = d3.select(id)
      .append("svg")
      .attr("width", cfg.w + 200)
      .attr("height", cfg.h + 100)
      .append("g")
      .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");;

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
      .style("opacity", 0) // set the tooltip invisible at the beginning
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('font-weight', 'bold')
      .style('font-size', '16px')
      .style('font-family', 'Montserrat-Bold')
      .style('width', '40px')
      .style('height', '25px')
      .style('border-radius', '10px')
      .style('border', '2px solid #818181')
      .style('background', 'white')
      .style('pointer-events', 'none');

    //Text ON THE AXIS indicating at what % each level is
    for (var j = 0; j < cfg.levels; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data([1]) //dummy data
        .enter()
        .append("svg:text")
        .attr("x", function (d) { return levelFactor * (1 - cfg.factor * Math.sin(0)); })
        .attr("y", function (d) { return levelFactor * (1 - cfg.factor * Math.cos(0)); })
        .attr("class", "")
        .style("font-family", "Montserrat")
        .style("font-size", "10px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")")
        .attr("fill", "white")
        .attr("margin", "5px")
        .text(Format((j + 1) * cfg.maxValue / cfg.levels));
    }

    let series = 0;

    var axis = g.selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    // Axis of the star plot
    axis.append("line")
      .attr("x1", cfg.w / 2)
      .attr("y1", cfg.h / 2)
      .attr("x2", function (d, i) { return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total)); })
      .attr("y2", function (d, i) { return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total)); })
      .attr("class", "line")
      .style("stroke", "#E9ECE5")
      .style("stroke-width", "2px");

    // Name of the attribute on the axis
    axis.append("text")
      .attr("class", "attributes-legend")
      .text(function (d) { return d })
      .style("font-family", "Montserrat")
      .style("font-size", "1.3vh")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("transform", function (d, i) { return "translate(-5, -20)" })
      .attr("x", function (d, i) { return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total); })
      .attr("y", function (d, i) { return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total); });

    let dataValues;

    d.forEach(function (y, x) {
      dataValues = [];
      g.selectAll(".nodes")
        .data(y, function (j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total)),
            j.overall
          ]);
        });
      dataValues.push(dataValues[0]);
      // Polygons reflecting the skilss of the player

      var colors = ["red", "blue"];

      g.selectAll(".area")
        .data([dataValues])
        .enter()
        .append("polygon")
        .attr("class", "radar-chart-serie" + series)
        .style("stroke-width", function (d) { return overallEncoding(d[0][2]) })
        .style("stroke", colors[series])
        .attr("points", function (d) {
          var str = "";
          for (var pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + "," + d[pti][1] + " ";
          }
          return str;
        })
        .style("fill", function (j, i) { return colors[series] })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d) {
          let z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .7);

          g.selectAll("circle")
            .transition(200)
            .style("fill-opacity", 0.1);
        })
        .on('mouseout', function () {
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);

          g.selectAll("circle")
            .transition(200)
            .style("fill-opacity", .9);
        });
      series++;
    });
    series = 0;


    d.forEach(function (y, x) {
      g.selectAll(".nodes")
        .data(y).enter()
        .append("svg:circle")
        .attr("class", "radar-chart-serie" + series)
        .attr('r', cfg.radius)
        .attr("alt", function (j) { return Math.max(j.value, 0) })
        .attr("cx", function (j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
          ]);
          return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("cy", function (j, i) {
          return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("data-id", function (j) { return j.axis })
        // Invisible circles (disable the colors and the opacity)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on('mouseover', function (d) {

          var newX = parseFloat(d3.select(this).attr('cx')) - 10;
          var newY = parseFloat(d3.select(this).attr('cy')) - 5;

          // Update the value of the tooltip
          div.transition()
            .duration(200)
            .style("opacity", 1.0)
            .style("margin", "10px");
          div.html(Format(d.value))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .7);

          g.selectAll("circle")
            .transition(200)
            .style("fill-opacity", .1);
        })
        .on('mouseout', function () {
          div
            .transition(200)
            .style('opacity', 0);

          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);

          g.selectAll("circle")
            .transition(200)
            .style("fill-opacity", .9);
        })
      // Unecessary additional tooltip
      //.append("svg:title").style('font-family', 'Montserrat')
      //.text(function(j) { return Math.max(j.value, 0) });

      series++;
    });
  }
};

// Function that encodes the overall as stroke of the polygon in the star plot
function overallEncoding(overallValue) {
  var strokeWidth;
  // Depending on the overallValue, we set a different stroke width
  if (overallValue < 70) {
    strokeWidth = "4px"
  } else if (overallValue >= 70 && overallValue < 85) {
    strokeWidth = "8px"
  } else if (overallValue >= 85) {
    strokeWidth = "16px"
  }

  return strokeWidth;
}

function myStarPlot(selectedCountry) {

  // Remove the previous star plot
  d3.select("#row2").select("#starplot").remove();

  const width = window.innerWidth / 2;
  const height = window.innerHeight / 2;

  const svg = d3.select("#row2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "flex_item_secondary")
        .attr('id', "starplot")

  //Legend titles
  //var LegendOptions = [];

  //Data to plot
  var currentdata = [], finaldata = [];

  d3.csv("./data_files/geoviewsnew.csv")
    .then(csvData => {
      
          //Fixed categories
          const fCategoriesMap = d3.rollup(csvData, v => v.length, d => d.category);
          var fCategoriesArray = Array.from(fCategoriesMap, ([category, sites_number]) => ([category, sites_number]));
          var arrayOfFCategories = fCategoriesArray.map(x => x[0]);
          var arrayOfFSites = fCategoriesArray.map(x => x[1]);

          //Sites for the chosen country
          var dataPerNation = csvData.filter(function(d){ return d.country_iso == selectedCountry});

          //Polygon of the chosen country
          const categoriesMap = d3.rollup(dataPerNation, v => v.length, d => d.category);
          var categoriesArray = Array.from(categoriesMap, ([category, sites_number]) => ([category, sites_number]));
          var arrayOfCategories = categoriesArray.map(x => x[0]);
          var arrayOfSites = categoriesArray.map(x => x[1]);

          for (var i in arrayOfFCategories) {

            var site = selectedCountry == "World" ? parseInt(arrayOfFSites[i]) : parseInt(arrayOfSites[i])
            if(isNaN(site)) site = 0

            currentdata.push({
              axis: arrayOfFCategories[i],
              value: site
            })
          }

          finaldata.push(currentdata);
          console.log(JSON.stringify(finaldata))

          var colorScale = d3.scaleLinear().domain([0, finaldata.length])
            .range(["#FF9300", "#0049FF"]);

          //Options for the star plot, other than default
          var mycfg = {
            w: width,
            h: height,
            //maxValue: 1,
            color: colorScale,
            //levels: 6,
            ExtraWidthX: 300
          }

          //Call function to draw the star plot
          //Will expect that data is in %'s
          starPlot.draw("#row2", finaldata, mycfg);
        
    })


  ////////////////////////////////////////////
  /////////// Initiate legend ////////////////
  ////////////////////////////////////////////
  /*
  var svg = d3.select('#body')
    .selectAll('svg')
    .append('svg')
    .attr("width", w)
    .attr("height", h)

  //Create the title for the legend
  var text = svg.append("text")
    .attr("class", "title")
    .attr('transform', 'translate(90,0)')
    .attr("x", w - 70)
    .attr("y", 10)
    .attr("font-size", "12px")
    .attr("fill", "#404040")
    .text("What % of owners use a specific service in a week");

  //Initiate Legend	
  var legend = svg.append("g")
    .attr("class", "legend")
    .attr("height", 100)
    .attr("width", 200)
    .attr('transform', 'translate(90,20)')
    ;
  //Create colour squares
  legend.selectAll('rect')
    .data(LegendOptions)
    .enter()
    .append("rect")
    .attr("x", w - 65)
    .attr("y", function (d, i) { return i * 20; })
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function (d, i) { return colorscale(i); })
    ;
  //Create text next to squares
  legend.selectAll('text')
    .data(LegendOptions)
    .enter()
    .append("text")
    .attr("x", w - 52)
    .attr("y", function (d, i) { return i * 20 + 9; })
    .attr("font-size", "11px")
    .attr("fill", "#737373")
    .text(function (d) { return d; })
    ;*/
}

export { myStarPlot }