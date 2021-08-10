

import { loadAndProcessData } from './loadAndProcessData.js'
import { colorLegend } from './colorLegend.js'
import { sitesOnSingleCountry } from './sitesOnSingleCountry.js'


/*

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')

*/


function selectedCountryMap(country_iso_code, selectedCategory, selectedRelevance, changeCountry) {


    function mouseOver() {

        console.log("Hover")

        d3.select(this)

            .append("g:title")
            .attr('x', 100)
            .attr('y', 100)
            .text(function (d) { return d.name + ", " + d.relevance })

            .transition()
            .duration(1000)
            .attr('r', 3)
        //.attr('r', 0.00001 * zoom.transform.k)




    }


    function mouseOut() {


        d3.select(this)
            .transition()
            .duration(1000)
            .attr('r', 1)
        //.attr('r', 0.000001 * zoom.transform.k)
    }


    function clickfn() {
        console.log("CLICKED")
        d3.select(this)
            .transition()
            .duration(1000)
            .attr('r', 3)

    }



    selectedRelevance = parseInt(selectedRelevance);


    if (changeCountry == true) {
        console.log("Voglio cambiare country", changeCountry);



        d3.select("#row1").select("#mapSingleCountry").remove();

        var width = window.innerWidth / 2;
        var height = window.innerHeight / 2;




        var svg = d3.select("#row1").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "map flex_item_secondary")
            .attr('id', "mapSingleCountry")



        console.log("Country ISO code: ", country_iso_code)




        var projection = d3.geoMercator()
            .translate([0, 0])
            .scale(1)

        var path = d3.geoPath()
            .projection(projection);

        var g = d3.select('#mapSingleCountry').append("g");


        var sitesOnCountry = d3.select('#mapSingleCountry').append('g')

        const colorLegendG = d3.select('#mapSingleCountry').append('g')
            .attr('transform', 'translate(30,200)');

        const categoryScale = d3.scaleOrdinal();


        const zoom = d3.zoom()
            .scaleExtent([0.2, 200])
            .on('zoom', (event) => {
                g.attr('transform', event.transform)
                d3.select('#mapSingleCountry').selectAll(".newCircle")
                    .attr('transform', event.transform)
            })

        d3.select('#mapSingleCountry').call(zoom)




        let selectedColorValue;

        let csvData;

        let countries;


        const onClick = (event, d) => {
            selectedColorValue = d;
            render();

        }


        const render = () => {



            categoryScale
                .domain(csvData.map(d => d.category))
                //.range(['#fc8d59', '#ffffbf', '#91cf60'])
                .range(['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'])


            colorLegendG
                .call(colorLegend, {
                    colorScale: categoryScale,
                    circleRadius: 5,
                    spacing: 20,
                    textOffset: 10,
                    backgroundRectWidth: 90,
                    onClick,
                    selectedColorValue: selectedColorValue
                });


            const single = countries.features.filter(function (d) {
                return d.properties.iso_a2 == country_iso_code;
            })






            //Compute avg latitude and longitude for selected country

            var totCoordinatesOfCountry = [[0, 0], [0, 0]]
            console.log(totCoordinatesOfCountry)


            for (var i = 0; i < single.length; i++) {
                totCoordinatesOfCountry[0][0] += path.bounds(single[i])[0][0]
                totCoordinatesOfCountry[0][1] += path.bounds(single[i])[0][1]
                totCoordinatesOfCountry[1][0] += path.bounds(single[i])[1][0]
                totCoordinatesOfCountry[1][1] += path.bounds(single[i])[1][1]
            }

            totCoordinatesOfCountry[0][0] = totCoordinatesOfCountry[0][0] / single.length
            totCoordinatesOfCountry[0][1] = totCoordinatesOfCountry[0][1] / single.length
            totCoordinatesOfCountry[1][0] = totCoordinatesOfCountry[1][0] / single.length
            totCoordinatesOfCountry[1][1] = totCoordinatesOfCountry[1][1] / single.length



            //Centering the selected country

            var b = totCoordinatesOfCountry,
                s = .10 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];


            projection
                .scale(s)
                .translate(t);


            g.selectAll("path")

                .data(single)
                .enter()
                .append("path")
                .attr('class', 'province')
                .attr("d", path)
                .append('title')
                .text(d => d.properties.gn_name)


            console.log("Sto in sites", selectedCategory, selectedRelevance)







            var circles = d3.select('#mapSingleCountry').selectAll("circle")
                .data(csvData)



                .enter()
                .append("circle")
                .filter(function (d) {
                    //Filter based on relevance and category
                    if (selectedCategory == "All") {
                        if(selectedRelevance == 0)
                        {
                            return d.country_iso == country_iso_code 
                        }
                        else
                        {
                            return d.country_iso == country_iso_code && d.relevance >= selectedRelevance

                        }
                        

                    }
                    else {
                        if(selectedRelevance == 0)
                        {
                            return d.country_iso == country_iso_code && d.category == selectedCategory
                        }
                        else
                        {
                            return d.country_iso == country_iso_code && d.category == selectedCategory && d.relevance >= selectedRelevance
                        }
                    }
                })
                .attr("cx", function (d) {
                    return projection([d.longitude, d.latitude])[0];
                })
                .attr("cy", function (d) {
                    return projection([d["longitude"], d["latitude"]])[1];
                })
                .attr("r", 2)

                .attr('class', 'newCircle')

                .attr("stroke", "black")
                .attr("stroke-width", "0.5px")


                .attr("fill", function (d) {
                    return categoryScale(d.category)

                });



            circles









                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut)
                .on('click', clickfn)


            /*
         
            .merge(circlesEnter)
            .attr('opacity', d => 
            (!selectedColorValue || d.category === selectedColorValue) ? 1 : 0.2)
            */


            /*
        sitesOnCountry.call(sitesOnSingleCountry, {
            csvData,
            country_iso_code,
            selectedCategory,
            selectedRelevance,
            projection,
            categoryScale,
            selectedColorValue,
            zoom
        })
        */
        }
















        loadAndProcessData("./data_files/ne_10m_admin_1_states_provinces.topojson").then(result => {

            countries = result[0]
            csvData = result[1]

            render()

        });
    }




    else {
        let csvData;
        let countries;

        const render = () => {


            var width = window.innerWidth / 2;
            var height = window.innerHeight / 2;



            var projection = d3.geoMercator()
                .translate([0, 0])
                .scale(1)

            var path = d3.geoPath()
                .projection(projection);





            //Compute avg latitude and longitude for selected country

            const single = countries.features.filter(function (d) {
                return d.properties.iso_a2 == country_iso_code;
            })

            var totCoordinatesOfCountry = [[0, 0], [0, 0]]
            console.log(totCoordinatesOfCountry)


            for (var i = 0; i < single.length; i++) {
                totCoordinatesOfCountry[0][0] += path.bounds(single[i])[0][0]
                totCoordinatesOfCountry[0][1] += path.bounds(single[i])[0][1]
                totCoordinatesOfCountry[1][0] += path.bounds(single[i])[1][0]
                totCoordinatesOfCountry[1][1] += path.bounds(single[i])[1][1]
            }

            totCoordinatesOfCountry[0][0] = totCoordinatesOfCountry[0][0] / single.length
            totCoordinatesOfCountry[0][1] = totCoordinatesOfCountry[0][1] / single.length
            totCoordinatesOfCountry[1][0] = totCoordinatesOfCountry[1][0] / single.length
            totCoordinatesOfCountry[1][1] = totCoordinatesOfCountry[1][1] / single.length



            //Centering the selected country

            var b = totCoordinatesOfCountry,
                s = .10 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];


            projection
                .scale(s)
                .translate(t);

            selectedRelevance = parseInt(selectedRelevance);

            d3.select("#mapSingleCountry").selectAll("circle").remove();
          


            console.log(country_iso_code, selectedCategory, selectedRelevance)
            var circles = d3.select("#mapSingleCountry").selectAll("circle")
                .data(csvData)



                .enter()
                .append("circle")
                .filter(function (d) {



                    if (selectedCategory == "All") {
                        if(selectedRelevance == 0)
                        {
                            return d.country_iso == country_iso_code
                        }
                        else
                        {
                            return d.country_iso == country_iso_code && d.relevance >= selectedRelevance

                        }
                        

                    }
                    else {
                        if(selectedRelevance == 0)
                        {
                            return d.country_iso == country_iso_code && d.category == selectedCategory
                        }
                        else
                        {
                            return d.country_iso == country_iso_code && d.category == selectedCategory && d.relevance >= selectedRelevance
                        }
                    }

                  
                })
                .attr("cx", function (d) {
                    return projection([d.longitude, d.latitude])[0];
                })
                .attr("cy", function (d) {
                    return projection([d["longitude"], d["latitude"]])[1];
                })
                .attr("r", 2)

                .attr('class', 'newCircle')

                .attr("stroke", "black")
                .attr("stroke-width", "0.5px")



                /*
                .attr("fill", function (d) {
                    return categoryScale(d.category)
                });
                */




                circles









                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut)
                .on('click', clickfn)

        }



        loadAndProcessData("./data_files/ne_10m_admin_1_states_provinces.topojson").then(result => {

            countries = result[0]
            csvData = result[1]

            render()

        });
    }



    function mouseOver() {

        console.log("Hover")
    
        d3.select(this)
    
        .append("g:title")
        .attr('x', 100)
        .attr('y', 100)
        .text(function(d) { return d.name + ", " + d.relevance })
    
        .transition()
        .duration(1000)
        .attr('r', 3)
        //.attr('r', 0.00001 * zoom.transform.k)
        
        
            
    
    }
    
    
    function mouseOut() {
     
    
        d3.select(this)
            .transition()
            .duration(1000)
            .attr('r', 1)
            //.attr('r', 0.000001 * zoom.transform.k)
    }
    
    
    function clickfn(){
        console.log("CLICKED")
        d3.select(this)
            .transition()
            .duration(1000)
            .attr('r', 3)
            
    }


}




export { selectedCountryMap };