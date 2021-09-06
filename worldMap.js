import { singleCountryMap } from './singleCountryMap.js'
import { myBarChart } from './barChart.js';
import { colorLegend } from './colorLegend.js'
import { myStarPlot } from './starPlot.js';
import { myScatterplot } from './scatterplot.js';




let countries;


function clickOnCountry(event, d) {

    var categoryMenu = document.getElementById("categoryMenu");
    var relevanceMenu = document.getElementById("relevanceMenu");

    var currentCategory = categoryMenu.options[categoryMenu.selectedIndex].text;
    var currentRelevance = relevanceMenu.options[relevanceMenu.selectedIndex].value;


    //Dynamically set the value of the dropdown menu
    var countryMenuOptions = document.getElementById('countryMenu').options;

    for (var i = 0; i < countryMenuOptions.length; i++) {
        if (countryMenuOptions[i].value == d.properties.ISO_A2) {
            countryMenuOptions[i].selected = true;

        }
    }

    singleCountryMap(d.properties.ISO_A2, currentCategory, currentRelevance, true)
    myBarChart(d.properties.ISO_A2, currentCategory, currentRelevance)
    myStarPlot(d.properties.ISO_A2)
    myScatterplot(d.properties.ISO_A2, currentCategory, currentRelevance)


}


function createColorLegend(countries) {

    var svg = document.getElementById('worldMap')
    const colorLegendG = d3.select(svg).append('g')
        .attr('transform', 'translate(30,370)')
        .attr('id', 'colorLegendWorldMap')



    var colorScale = d3.scaleThreshold()
    //var colorScale = d3.scaleQuantile()
    //var colorScale = d3.scaleQuantize()


    var maxValue = d3.max(countries.features, d => d.properties.sites_number)

    //If else are needed to change dynamically the legend and the colors to fit the data in the best possible way

    if (maxValue >= 10000) {
        maxValue = 10000
        var colors = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'];
        colorScale.domain([0, 10, 500, 1000, maxValue])
        colorScale.range([0].concat(colors));
        //colorScale.range(['#feedde','#fdbe85','#fd8d3c','#e6550d','#a63603'])
    }

    else if (maxValue >= 1000 && maxValue < 10000) {
        maxValue = 1000
        var colors = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
        colorScale.domain([0, 50, 200, 500, maxValue])
        colorScale.range([0].concat(colors));
        //colorScale.range(['#feedde','#fdbe85','#fd8d3c','#e6550d','#a63603'])
    }
    else if (maxValue >= 100 && maxValue < 1000) {
        maxValue = 100
        var colors = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
        colorScale.domain([0, 3, 10, 50, maxValue])
        colorScale.range([0].concat(colors));
        //colorScale.range(['#feedde','#fdbe85','#fd8d3c','#e6550d','#a63603'])
    }
    else if (maxValue >= 10 && maxValue < 100) {
        maxValue = 10
        var colors = ['#feedde', '#fdbe85', '#fd8d3c', '#d94701']
        colorScale.domain([0, 1, 5, maxValue])
        colorScale.range([0].concat(colors));
        //colorScale.range(['#feedde', '#fdbe85', '#fd8d3c', '#d94701'])
    }
    else if (maxValue > 1 && maxValue < 10) {
        var colors = ['#fee6ce', '#fdae6b', '#e6550d']
        colorScale.domain([0, 1, maxValue])
        colorScale.range([0].concat(colors));
        //colorScale.range(['#fee6ce', '#fdae6b', '#e6550d'])

    }
    else if (maxValue == 1) {
        var colors = ['#fee6ce', '#e6550d']
        colorScale.domain([0, 1])
        colorScale.range([0].concat(colors));
        //colorScale.range(['#fee6ce', '#e6550d', 'blue'])

    }
    else {
        var colors = ['#feedde']
        colorScale.domain([0])
        colorScale.range([0].concat(colors));
        //colorScale.range(['#feedde'])
    }

    //colorScale.domain([0, 100, 1000, 10000, d3.max(countries.features, d => d.properties.sites_number)])
    //colorScale.range(['#feedde', '#fdbe85', '#fd8d3c', '#d94701'])
    console.log("ColorScale domain", colorScale.domain())


    colorLegendG
        .call(colorLegend, {
            colorScale: colorScale,
            circleRadius: 5,
            spacing: 20,
            textOffset: 10,
            backgroundRectWidth: 75
        });

    return colorScale;

}



function colorWorldMap(countries, path) {
    var colorScale = createColorLegend(countries);


    var g = document.getElementById('pathWorldMap');


    d3.select(g).selectAll("path")
        .exit()
        .data(countries.features)
        .enter()
        .append("path")
        .attr('class', 'country')
        .attr("d", path)

        .attr('fill', function (d) {
            return colorScale(d.properties.sites_number)
        })

        .on('click', clickOnCountry)

        .append('title')
        .text(d => d.properties.NAME + ', ' + d.properties.sites_number)

}





function worldMapFirstTime() {
    var width = window.innerWidth / 2;
    var height = (window.innerHeight / 7) * 3;


    var projection = d3.geoMercator()
        .center([0, 0])
        .scale(100)
        .translate([width / 2, height / 1.5])


    var svg = d3.select("#row1").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "map flex_item_primary")
        .attr('id', "worldMap")



    var g = svg.append("g")
        .attr('id', "pathWorldMap");

    var path = d3.geoPath()
        .projection(projection);


    const zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on('zoom', (event) => {
            g.attr('transform', event.transform)
            svg.selectAll(".worldMapCircle")
                .attr('transform', event.transform)
        })

    svg.call(zoom)





    Promise.all([
        d3.tsv('./data_files/geoviewsnew_2.tsv'),
        d3.json('./data_files/ne_50m_admin_0_countries.topojson')

    ]).then(([csvData, topoJSONData]) => {



        countries = topojson.feature(topoJSONData, topoJSONData.objects.unnamed);

        const sitesPerCountryMap = d3.rollup(csvData, v => v.length, d => d.country_iso);


        //Converting map to array
        var sitesPerCountryArray = Array.from(sitesPerCountryMap, ([name, sites_number]) => ([name, sites_number]));



        //Adding the property "sites_number" to the original topoJSON file
        countries.features.forEach(element => {

            //In topojson file some iso_a2 are undefined (-99). Hardcoding right iso code

            if (element.properties.ISO_A2 == -99 && element.properties.NAME == "Norway") {
                element.properties.ISO_A2 = "NO"
            }

            else if (element.properties.ISO_A2 == -99 && element.properties.NAME == "France") {
                element.properties.ISO_A2 = "FR"
            }

            for (var i = 0; i < sitesPerCountryArray.length; i++) {

                if ((sitesPerCountryArray[i][0]) == element.properties.ISO_A2) {
                    element.properties["sites_number"] = sitesPerCountryArray[i][1]
                }

            }


            //Put 0 if no sites are in the country
            if (element.properties["sites_number"] == null) {

                element.properties["sites_number"] = 0
            }



        });

        console.log("COUNTRIES", countries);

        colorWorldMap(countries, path);

    });





}


function worldMap(selectedCategory, selectedRelevance) {

    console.log("Attuali in World Map:", selectedCategory, selectedRelevance)

    selectedRelevance = parseInt(selectedRelevance)


    var width = window.innerWidth / 2;
    var height = window.innerHeight / 7 * 3;


    var projection = d3.geoMercator()
        .center([0, 0])
        .scale(100)
        .translate([width / 2, height / 1.5])


    var path = d3.geoPath()
        .projection(projection);



    var updatedCsvData = []


    d3.tsv("./data_files/geoviewsnew_2.tsv")
        .then(csvData => {



            csvData.filter(function (row) {

                if (selectedCategory == "All") {
                    if (selectedRelevance == 0) {
                        updatedCsvData.push(row)
                    }
                    else {
                        if (row['relevance'] >= selectedRelevance) {
                            updatedCsvData.push(row)
                        }
                    }
                }
                else {
                    if (selectedRelevance == 0) {
                        if (row['category'] == selectedCategory) {
                            updatedCsvData.push(row)
                        }
                    }
                    else {
                        if (row['relevance'] >= selectedRelevance && row['category'] == selectedCategory) {
                            updatedCsvData.push(row)
                        }
                    }

                }
            });


            const sitesPerCountryMap = d3.rollup(updatedCsvData, v => v.length, d => d.country_iso);

            //Converting map to array
            var sitesPerCountryArray = Array.from(sitesPerCountryMap, ([name, sites_number]) => ([name, sites_number]));


            countries.features.forEach(element => {
                element.properties["sites_number"] = 0;
                for (var i = 0; i < sitesPerCountryArray.length; i++) {

                    if ((sitesPerCountryArray[i][0]) == element.properties.ISO_A2) {
                        element.properties["sites_number"] = sitesPerCountryArray[i][1]
                    }

                }


                //Put 0 if no sites are in the country
                if (element.properties["sites_number"] == null) {

                    element.properties["sites_number"] = 0
                }
            });


            var myColorLegend = document.getElementById('colorLegendWorldMap');
            d3.select(myColorLegend).remove();
            colorWorldMap(countries, path);


        });


}


export { worldMap };
export { worldMapFirstTime };
