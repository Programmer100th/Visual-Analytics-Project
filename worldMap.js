import { selectedCountryMap } from './selectedCountryMap.js'
import {myBarChart} from './barChart.js';
import { colorLegend } from './colorLegend.js'


import { loadAndProcessData } from './loadAndProcessData.js'
import { myStarPlot } from './starPlot.js';




/*

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')

*/


function worldMap(selectedCategory, selectedRelevance) {

    console.log("Attuali in World Map:", selectedCategory, selectedRelevance)

    selectedRelevance = parseInt(selectedRelevance)


    //needed to replace barchart time by time
    d3.select("#row1").select("#worldMap").remove();

    var width = window.innerWidth / 2;
    var height = window.innerHeight / 2;


    var projection = d3.geoMercator()
        //var projection = d3.geoOrthographic()
        .center([0, 0])
        .scale(100)
        .translate([width / 2, height / 1.5])


    var svg = d3.select("#row1").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "map flex_item_primary")
        .attr('id', "worldMap")



    var g = svg.append("g");
    var path = d3.geoPath()
        .projection(projection);

    const colorLegendG = svg.append('g')
        .attr('transform', 'translate(30,160)');


    var colorScale = d3.scaleQuantile()
    //var colorScale = d3.scaleQuantize()
    //const colorScale = d3.scaleOrdinal((d3.schemeCategory10))


    const zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on('zoom', (event) => {
            g.attr('transform', event.transform)
            svg.selectAll(".worldMapCircle")
                .attr('transform', event.transform)
        })

    svg.call(zoom)




    let selectedColorValue;

    let csvData;



    let countries;

    const onClick = (event, d) => {
        selectedColorValue = d;
        render()

    }


    const render = () => {




        //var categoryMenu = document.getElementById("categoryMenu");
        //var relevanceMenu = document.getElementById("relevanceMenu");

        //var selectedCategory = categoryMenu.options[categoryMenu.selectedIndex].text;
        //var selectedRelevance = relevanceMenu.options[relevanceMenu.selectedIndex].value;



        var updatedCsvData = []



        csvData.filter(function(row) {
     
            if(selectedCategory == "All")
            {
                if(selectedRelevance == 0)
                {
                    updatedCsvData.push(row)
                }
                else
                {
                    if(row['relevance'] >= selectedRelevance)
                    {
                        updatedCsvData.push(row)
                    }
                }
            }
            else
            {
                if(selectedRelevance == 0)
                {
                    if(row['category'] == selectedCategory)
                    {
                        updatedCsvData.push(row)
                    }
                }
                else
                {
                    if(row['relevance'] >= selectedRelevance && row['category'] == selectedCategory)
                    {
                        updatedCsvData.push(row)
                    }
                }

            }
        });


        const sitesPerCountryMap = d3.rollup(updatedCsvData, v => v.length, d => d.country_iso);
       

        //Converting map to array
        var sitesPerCountryArray = Array.from(sitesPerCountryMap, ([name, sites_number]) => ([name, sites_number]));

        console.log(sitesPerCountryArray)



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






        colorScale.domain([0, 100, 1000, 10000, d3.max(countries.features, d => d.properties.sites_number)])
        //colorScale.domain([0, d3.max(sitesPerCountry, d => d[1])])

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


        const categoryScale = d3.scaleOrdinal()
            .domain(updatedCsvData.map(d => d.category))
            .range(['#fc8d59', '#ffffbf', '#91cf60'])




        g.selectAll("path")


            .data(countries.features)
            .enter()
            .append("path")
            .attr('class', 'country')
            .attr("d", path)

            

            .attr('fill', function (d) {

                return colorScale(d.properties.sites_number)
            })

            


            .on('click', function (event, d) {

                var categoryMenu = document.getElementById("categoryMenu");
                var relevanceMenu = document.getElementById("relevanceMenu");

                var currentCategory = categoryMenu.options[categoryMenu.selectedIndex].text;
                var currentRelevance = relevanceMenu.options[relevanceMenu.selectedIndex].value;


                //Dynamically set the value of the dropdown menu
                var countryMenuOptions = document.getElementById('countryMenu').options;

                for(var i = 0; i < countryMenuOptions.length; i++) {
                    if(countryMenuOptions[i].value == d.properties.ISO_A2) {
                        countryMenuOptions[i].selected = true;
                      
                    }
                }

                selectedCountryMap(d.properties.ISO_A2, currentCategory, currentRelevance, true)
                myBarChart(d.properties.ISO_A2, currentCategory, currentRelevance)
                myStarPlot(d.properties.ISO_A2)
            })

            .append('title')
            .text(d => d.properties.NAME + ',' + d.properties.sites_number)


    }








    loadAndProcessData('./data_files/ne_50m_admin_0_countries.topojson').then(result => {

        countries = result[0]
        csvData = result[1]
        render()

    })

}


export { worldMap };
