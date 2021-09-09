import { fromStarplotToBarchartHoverIn }        from "./barChart.js";
import { fromStarplotToBarchartHoverOut }       from "./barChart.js";
import { fromStarplotToSingleCountryHoverIn }   from "./singleCountryMap.js"
import { fromStarplotToSingleCountryHoverOut }  from "./singleCountryMap.js"
import { fromStarplotToScatterplotHoverIn }     from "./scatterplot.js";
import { fromStarplotToScatterplotHoverOut }    from "./scatterplot.js";
import { singleCountryMap }                     from './singleCountryMap.js';
import { myBarChart }                           from './barChart.js';
import { worldMap }                             from './worldMap.js';
import { myScatterplot }                        from './scatterplot.js';

var starPlot = {
  draw: function (id, d, options) {
    var cfg = {
      radius: 5, // Radius of the point of the polygon
      w: 600, //Width of the circle
      h: 600, //Height of the circle
      factor: 1, // Scale or zoom (DO NOT TOUCH)
      factorLegend: .85, // Distance of the legend
      levels: 5, //How many levels or inner polygon should there be drawn
      maxValue: 0,
      radians: 2 * Math.PI,
      opacityArea: 0, //The opacity of the area of the polygon
      ToRight: 5,
      TranslateX: 90,
      TranslateY: 40,
      ExtraWidthX: 100,
      ExtraWidthY: 100,
      color: 'steelblue'
    };

    if ('undefined' !== typeof options) {
      for (var i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    }
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    //cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function (i) { return d3.max(i.map(function (o) { return o.value; })) }));

    var allAxis = (d[0].map(function (i, j) { return i.axis }));
    var total = allAxis.length;
    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);

    // Data format of the values in the star plot
    var Format = d3.format('.0f');

    var svg = document.getElementById(id)

    d3.select("#starplotG").remove();


    var g = d3.select(svg).append("g")
      .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")")
      .attr('id', 'starplotG')

    // Define the div for the tooltip
    /*var div = d3.select(id).append("div")
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
      .style('pointer-events', 'none');*/

    var tooltip;

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
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")")
        .attr("fill", "black")
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
      .style("stroke-width", "1px");

    // Name of the attribute on the axis
    axis.append("text")
      .attr("class", "legend")
      .text(function (d) { return d })
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .style("font-weight", function (d) { if ($('#categoryMenu').val().includes(d)) { return "bold" } else { return "normal" } })
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("transform", function (d, i) { return "translate(-5, -20)" })
      .attr("x", function (d, i) { return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total); })
      .attr("y", function (d, i) { return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total); })


      .on('mouseover', function (d) {
        d3.select(this)
          .style("cursor", "pointer")
          .transition(200)
          .style("fill", "green")
          .style("font-size", "18px")


        fromStarplotToSingleCountryHoverIn(this.textContent)
        fromStarplotToBarchartHoverIn(this.textContent)
        fromStarplotToScatterplotHoverIn(this.textContent)
      })

      .on('mouseout', function (d) {
        d3.select(this)
          .transition(200)
          .style("fill", "black")
          .style("font-size", "14px")

        fromStarplotToSingleCountryHoverOut(this.textContent)
        fromStarplotToBarchartHoverOut()
        fromStarplotToScatterplotHoverOut(this.textContent)
      })

      .on('click', function () {
        console.log(this.textContent)
        var countryMenu = document.getElementById("countryMenu");
        var selectedCategory = []
        selectedCategory.push(this.textContent)
        document.getElementById("categoryMenu").value = this.textContent

        $('#categoryMenu').selectpicker('refresh');

        var relevanceMenu = document.getElementById("relevanceMenu");

        var currentCountry = countryMenu.options[countryMenu.selectedIndex].value;
        console.log(currentCountry)
        var currentRelevance = relevanceMenu.value;

        singleCountryMap(currentCountry, selectedCategory, currentRelevance, false)
        myBarChart(currentCountry, selectedCategory, currentRelevance)
        worldMap(selectedCategory, currentRelevance)
        myStarPlot(currentCountry, currentRelevance)
        myScatterplot(currentCountry, selectedCategory, currentRelevance)


      });

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

      g.selectAll(".area")
        .data([dataValues])
        .enter()
        .append("polygon")
        .attr("class", "radar-chart-serie" + series)
        .style("stroke-width", "4px")
        //.style("stroke", cfg.color(series))
        .style("stroke", cfg.color)
        .attr("points", function (d) {
          var str = "";
          for (var pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + "," + d[pti][1] + " ";
          }
          return str;
        })
        //.style("fill", function (j, i) { return cfg.color(series) })
        .style("fill", cfg.color)
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
          tooltip
            .attr('x', newX)
            .attr('y', newY)
            .text(Format(d.value))
            .transition(200)
            .style('opacity', 1);

          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .7);
        })
        .on('mouseout', function () {
          tooltip
            .transition(200)
            .style('opacity', 0);
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        })
        .append("svg:title")
        .text(function (j) { return Math.max(j.value, 0) });

      series++;
    });
  }
};

function myStarPlotFirstTime() {

  const w = window.innerWidth / 3;
  const h = window.innerHeight / 9 * 4;

  var svg = d3.select('#row2')
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "col-sm flex_item_secondary")
    .attr('id', 'starplot')

  var chooseCategoryText = svg.append("text")
    .attr('id', 'chooseCategoryStarplot')
    .attr("y", '50%')
    .attr('x', '50%')
    .attr('text-anchor', "middle")
    .style('display', 'none')
    .text("Choose at least one category");

  var noDataText = svg.append("text")
    .attr('id', 'noDataStarplot')
    .attr("y", '50%')
    .attr('x', '50%')
    .attr('text-anchor', "middle")
    .style('display', 'none')
    .text("No data available");

  var currentdata = [], finaldata = [];

  d3.tsv("./data_files/geoviewsnew_2.tsv")
    .then(tsvData => {

      //Fixed categories
      const fCategoriesMap = d3.rollup(tsvData, v => v.length, d => d.category);
      var fCategoriesArray = Array.from(fCategoriesMap, ([category, sites_number]) => ([category, sites_number]));
      var arrayOfFCategories = fCategoriesArray.map(x => x[0]);

      //Sites for the chosen country
      var dataPerNation = tsvData.filter(function (d) { return d.country_iso == 'IT' });

      //Polygon of the chosen country
      const categoriesMap = d3.rollup(dataPerNation, v => v.length, d => d.category);
      var categoriesArray = Array.from(categoriesMap, ([category, sites_number]) => ([category, sites_number]));
      var arrayOfCategories = categoriesArray.map(x => x[0]);
      var arrayOfSites = categoriesArray.map(x => x[1]);

      const sum = arrayOfSites.reduce(add, 0); // with initial value to avoid when the array is empty

      function add(accumulator, a) {
        return accumulator + a;
      }

      console.log(arrayOfSites)

      for (var i in arrayOfFCategories) {

        var category = arrayOfFCategories[i]

        var index;

        for (var j in arrayOfCategories) {
          if (arrayOfCategories[j] === category)
            index = j
        }

        var value = parseInt(arrayOfSites[index])
        if (isNaN(value)) value = 0

        currentdata.push({
          axis: arrayOfFCategories[i],
          value: 2 * parseInt(value / sum * 100)
        })
      }

      finaldata.push(currentdata);
      console.log(JSON.stringify(finaldata))

      //var colorScale = d3.scaleLinear().domain([0, finaldata.length])
      //  .range(["#FF9300", "#0049FF"]);

      //Options for the star plot, other than default
      var mycfg = {
        w: w - 200,
        h: h - 70,
        maxValue: 100
        //color: colorScale
        //levels: 6,
        //ExtraWidthX: 200
      }

      //Call function to draw the star plot
      //Will expect that data is in %'s

      //starPlot.draw("#row2", finaldata, mycfg);
      starPlot.draw("starplot", finaldata, mycfg);

    })

}

function myStarPlot(selectedCountry, selectedRelevance) {

  // Remove the previous star plot
  //d3.select("#row2").select("#starplot").remove();

  var w = document.getElementById("starplot").clientWidth - 170,
    h = document.getElementById("starplot").clientHeight - 80;

  selectedRelevance = isNaN(selectedRelevance) ? 0 : parseInt(selectedRelevance)

  console.log(selectedRelevance)

  /*const svg = d3.select("#row2").append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "flex_item_secondary")
        .attr('id', "starplot")*/

  //Legend titles
  //var LegendOptions = [];

  //Data to plot
  var currentdata = [], finaldata = [];

  d3.tsv("./data_files/geoviewsnew_2.tsv")
    .then(tsvData => {

      //Fixed categories
      const fCategoriesMap = d3.rollup(tsvData, v => v.length, d => d.category);
      var fCategoriesArray = Array.from(fCategoriesMap, ([category, sites_number]) => ([category, sites_number]));
      var arrayOfFCategories = fCategoriesArray.map(x => x[0]);
      //var arrayOfFValues = fCategoriesArray.map(x => x[1]);

      var dataSingleCountry = [],
          dataWorld         = [],
          arrayOfValues     = []

      //Sites for the chosen country
      tsvData.filter(function (row) {
        if (row['country_iso'] == selectedCountry && row['relevance'] >= selectedRelevance)
          dataSingleCountry.push(row)
        else if (selectedCountry == "World" && row['relevance'] >= selectedRelevance)
          dataWorld.push(row)
      });

      //Polygon of the chosen country
      var values;

      if (selectedCountry == 'World')
        values = d3.group(dataWorld, d => d.category)
      else
        values = d3.group(dataSingleCountry, d => d.category)

      for (var i in arrayOfFCategories) {
        var v = values.get(arrayOfFCategories[i])
        if (typeof v == 'undefined')
          arrayOfValues.push(0)
        else
          arrayOfValues.push(v.length)
      }

      console.log(arrayOfValues, arrayOfFCategories)

      /*const categoriesMap = d3.rollup(dataPerNation, v => v.length, d => d.category);
      var categoriesArray = Array.from(categoriesMap, ([category, sites_number]) => ([category, sites_number]));
      var arrayOfCategories = categoriesArray.map(x => x[0]);
      var arrayOfValues = categoriesArray.map(x => x[1]);

      const indices = Array.from(arrayOfCategories.keys())
      indices.sort( (a,b) => arrayOfCategories[a].localeCompare(arrayOfCategories[b]) )

      const sortedCat    = indices.map(i => arrayOfCategories[i])
      const sortedValues = indices.map(i => arrayOfValues[i])*/

      var value, sum; // with initial value to avoid when the array is empty

      function add(accumulator, a) {
        return accumulator + a;
      }

      console.log(sum)

      for (var i in arrayOfFCategories) {

        value = parseInt(arrayOfValues[i])
        sum = arrayOfValues.reduce(add, 0)

        var finalValue = 2 * parseInt(value / sum * 100)

        if (finalValue > 100)
          finalValue = 100


        //var value = selectedCountry == "World" ? parseInt(arrayOfFValues[i]) : parseInt(arrayOfValues[i])
        if (isNaN(value)) value = 0

        //console.log(value, sortedValues[i])

        currentdata.push({
          axis: arrayOfFCategories[i],
          value: finalValue
        })
      }

      finaldata.push(currentdata);
      console.log(JSON.stringify(finaldata))

      //var colorScale = d3.scaleLinear().domain([0, finaldata.length])
      //  .range(["#FF9300", "#0049FF"]);

      //Options for the star plot, other than default
      var mycfg = {
        w: w - 30,
        h: h + 10,
        maxValue: 100
        //color: colorScale
        //levels: 6,
        //ExtraWidthX: 200
      }

      //Call function to draw the star plot
      //Will expect that data is in %'s

      console.log($('#categoryMenu').val())

      if ($('#categoryMenu').val() == null) {
        var starplotG = document.getElementById('starplotG')
        starplotG.style.display = 'none';

        var chooseCategoryText = document.getElementById('chooseCategoryStarplot')
        chooseCategoryText.style.display = 'block';

        var noDataText = document.getElementById('noDataStarplot')
        noDataText.style.display = 'none';
      }
      else {
        if (sum == 0) {
          var starplotG = document.getElementById('starplotG')
          starplotG.style.display = 'none';

          var chooseCategoryText = document.getElementById('chooseCategoryStarplot')
          chooseCategoryText.style.display = 'none';

          var noDataText = document.getElementById('noDataStarplot')
          noDataText.style.display = 'block';
        }
        else {
          var starplotG = document.getElementById('starplotG')
          starplotG.style.display = 'block';

          var chooseCategoryText = document.getElementById('chooseCategoryStarplot')
          chooseCategoryText.style.display = 'none';

          var noDataText = document.getElementById('noDataStarplot')
          noDataText.style.display = 'none';

          starPlot.draw("starplot", finaldata, mycfg);
        }
      }
      //starPlot.draw("#row2", finaldata, mycfg);

    })



  ////////////////////////////////////////////
  /////////// Initiate legend ////////////////
  ////////////////////////////////////////////
  /*
var svgl = d3.select('#starplot')
  .selectAll('svg')
  .append('svg')
  .attr("width", w)
  .attr("height", h)
//Create the title for the legend
var text = svgl.append("text")
  .attr("class", "title")
  .attr('transform', 'translate(90,0)')
  .attr("x", w - 70)
  .attr("y", 10)
  .attr("font-size", "12px")
  .attr("fill", "#404040")
  .text("What % of owners use a specific service in a week");
//Initiate Legend	
var legend = svgl.append("g")
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

function changeStarplotIn(category){

  var labels = document.getElementsByClassName("legend")

  d3.selectAll(labels)
      //.transition()
      //.duration(200)
      //.style("fill", function () { if (category == this.textContent) return "green" })

  var l = document.getElementsByClassName("legend")
        
  var catList = [].slice.call(l);

  for (var i in catList) {
      var element = catList[i]
      if (element.innerHTML == category) {
          element.style.fontSize   = "18px"
          element.style.textShadow = "3px 3px 5px green"
      }
  }

}

function changeStarplotOut() {

  var labels = document.getElementsByClassName("legend")

  d3.selectAll(labels)
      .transition()
      .duration(200)
      .style("fill", "black")
      .style("font-size", "14px")
      .style("text-shadow", "none")

}

export { myStarPlot }
export { myStarPlotFirstTime }
export { changeStarplotIn }
export { changeStarplotOut }