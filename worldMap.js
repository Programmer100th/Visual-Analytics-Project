import { selectedCountryMap } from './selectedCountryMap.js'
import { putCountryOnMap } from './selectedCountryMap.js'
import { colorLegend } from './colorLegend.js'


import { loadAndProcessData } from './loadAndProcessData.js'




/*

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')

*/


function worldMap() {

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
            .domain(csvData.map(d => d.category))
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

                putCountryOnMap(d.properties.NAME, d.properties.sites_number, d.properties.ISO_A2)
            })

            .append('title')
            .text(d => d.properties.NAME + ',' + d.properties.sites_number)




            /*
            var circles = svg.selectAll("circle")
            .data(csvData)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", function (d) {
                return projection([d["longitude"], d["latitude"]])[1];
            })
            .attr("r", 0.5)
            .attr('class', 'worldMapCircle')
            .attr("fill", function (d) {
                return categoryScale(d.category)
            });
            */
    }






    loadAndProcessData('./data_files/ne_50m_admin_0_countries.topojson').then(result => {

        countries = result[0]
        csvData = result[1]
        render()

    })

}


export { worldMap };
