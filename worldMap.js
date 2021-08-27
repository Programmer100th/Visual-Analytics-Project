import { singleCountryMap } from './singleCountryMap.js'
import { myBarChart } from './barChart.js';
import { colorLegend } from './colorLegend.js'
import { myStarPlot } from './starPlot.js';




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


}


function createColorLegend(countries) {

    var svg = document.getElementById('worldMap')
    const colorLegendG = d3.select(svg).append('g')
        .attr('transform', 'translate(30,160)')

    var colorScale = d3.scaleQuantile()
    //var colorScale = d3.scaleQuantize()
    //const colorScale = d3.scaleOrdinal((d3.schemeCategory10))

    colorScale.domain([0, 100, 1000, 10000, d3.max(countries.features, d => d.properties.sites_number)])
    colorScale.range(['#feedde', '#fdbe85', '#fd8d3c', '#d94701'])
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



function colorWorldMap(countries, path) 
{
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
        .text(d => d.properties.NAME + ',' + d.properties.sites_number)

}





function worldMapFirstTime() {
    var width = window.innerWidth / 2;
    var height = window.innerHeight / 2;


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



    let selectedColorValue;



    const onClick = (event, d) => {
        selectedColorValue = d;
        render()

    }


    Promise.all([
        d3.tsv('./data_files/geoviewsnew.tsv'),
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
    var height = window.innerHeight / 2;


    var projection = d3.geoMercator()
        .center([0, 0])
        .scale(100)
        .translate([width / 2, height / 1.5])


    var path = d3.geoPath()
        .projection(projection);



    let selectedColorValue;




    const onClick = (event, d) => {
        selectedColorValue = d;
        render()

    }



    var updatedCsvData = []


    d3.tsv("./data_files/geoviewsnew.tsv")
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



            colorWorldMap(countries, path);


        });


}


export { worldMap };
export { worldMapFirstTime };
