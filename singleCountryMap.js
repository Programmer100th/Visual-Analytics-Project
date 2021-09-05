import { colorLegend } from './colorLegend.js'
import { fromSingleCountryToBarchartHoverIn } from './barChart.js'
import { fromSingleCountryToBarchartHoverOut } from './barChart.js'
import { fromSingleCountryToScatterplotHoverIn } from './scatterplot.js'
import { fromSingleCountryToScatterplotHoverOut } from './scatterplot.js'


let map;
let geocoder;



function singleCountryMapFirstTime() {


    var mapDiv = document.createElement("div");
    mapDiv.id = "map";
    mapDiv.class = "flex_item_primary";

    document.getElementById("row1").appendChild(mapDiv);


    mapboxgl.accessToken = 'pk.eyJ1IjoicHJvZ3JhbW1lcjEwMHRoIiwiYSI6ImNrc2dkaWh2cjExcGQyd3RidGp4bmJ2engifQ.d2gGexRnrH1v7UjVYsBx2A';
    map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [12.75, 41.0], // starting position [lng, lat]
        zoom: 2 // starting zoom

    });


    geocoder = new MapboxGeocoder({ // Initialize the geocoder
        accessToken: mapboxgl.accessToken, // Set the access token
        language: 'en-EN',
        mapboxgl: mapboxgl, // Set the mapbox-gl instance
        marker: false, // Do not use the default marker style
        types: 'country',
    });

    // Add the geocoder to the map
    map.addControl(geocoder);


    geocoder.query("IT");


    var container = map.getCanvasContainer();
    var svg = d3
        .select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('id', "mapSingleCountry")
        .style("position", "absolute")
        .style("z-index", 2);


    var g = d3.select('#mapSingleCountry').append("g")
        .attr('id', 'colorLegendBase')

    const colorLegendG = d3.select('#colorLegendBase').append('g')
        .attr('transform', 'translate(30,270)')
        .attr('id', 'colorLegendSingleCountry');


    d3.tsv("./data_files/geoviewsnew_2.tsv")
        .then(data => {

            var newData = []


            data.filter(function (row) {



                if (row['country_iso'] == "IT") {

                    newData.push(row)
                }

            })


            putPointsOnMap(newData)




        });


}




function singleCountryMap(country_iso_code, selectedCategory, selectedRelevance, changeCountry) {



    function filterData() {

        d3.tsv("./data_files/geoviewsnew_2.tsv")
            .then(data => {

                var newData = []


                data.filter(function (row) {


                    if (selectedCategory == "All") {

                        if (selectedRelevance == 0) {


                            if (row['country_iso'] == country_iso_code) {

                                newData.push(row)
                            }
                        }
                        else {
                            if (row['country_iso'] == country_iso_code && row['relevance'] >= selectedRelevance) {

                                newData.push(row)
                            }

                        }
                    }
                    else {
                        if (selectedRelevance == 0) {


                            if (row['country_iso'] == country_iso_code && row['category'] == selectedCategory) {

                                newData.push(row)
                            }
                        }
                        else {
                            if (row['country_iso'] == country_iso_code && row['relevance'] >= selectedRelevance && row['category'] == selectedCategory) {

                                newData.push(row)
                            }

                        }

                    }
                });


                console.log(newData)


                putPointsOnMap(newData)





            });

    }



    selectedRelevance = parseInt(selectedRelevance);

    d3.select('#mapSingleCountry').selectAll(".sitesSingleCountry").remove();


    if (changeCountry == true) {

        geocoder.query(country_iso_code);
        filterData()
    }


    else {

        filterData()
    }


}



function putPointsOnMap(newData) {

    const categoryScale = d3.scaleOrdinal();

    categoryScale
        .domain(newData.map(d => d.category))
        //.range(['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'])
        .range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']);


    var singleCountryMapSvg = document.getElementById('mapSingleCountry')

    var dots = d3.select(singleCountryMapSvg)
        .selectAll(".sitesSingleCountry")
        .data(newData)
        .enter()
        .append("circle")
        .attr('class', 'sitesSingleCountry')
        .attr("r", 7)
        .attr("stroke", "black")
        .attr("stroke-width", "1px")


        .attr("fill", function (d) {
            return categoryScale(d.category)
        });


    dots

        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)




 

    map.on("viewreset", render);
    map.on("move", render);
    map.on("moveend", render);
    render(); // Call once to render


    function render() {
        dots
            .attr("cx", function (d) {
                return project(d).x;
            })
            .attr("cy", function (d) {
                return project(d).y;
            });
    }



  

    const colorLegendG = document.getElementById('colorLegendSingleCountry');



    d3.select(colorLegendG)
        .call(colorLegend, {
            colorScale: categoryScale,
            circleRadius: 5,
            spacing: 25,
            textOffset: 10,
            backgroundRectWidth: 200,
        });

}


function project(d) {
    return map.project(new mapboxgl.LngLat(d["longitude"], d["latitude"]));
}



function mouseOver(event, d) {

    console.log(d)

    d3.select(this)


        .attr('stroke-width', 10)

        .transition()
        .duration(1000)
        .attr('r', 20)





    d3.select(this)
        .append("g:title")
        .attr('x', 100)
        .attr('y', 100)

        //If relevance is null, put relevance = 0
        .text(function (d) {
            if (d.relevance == "") {
                return d.name + ", " + 0

            }
            else {
                return d.name + ", " + d.relevance
            }
        })

    fromSingleCountryToBarchartHoverIn(d);
    fromSingleCountryToScatterplotHoverIn(d);

}




function mouseOut(event, d) {

    d3.select(this)



        .transition()
        .duration(1000)
        .attr('r', 7)
        .attr('stroke-width', "1px");



    fromSingleCountryToBarchartHoverOut(d);
    fromSingleCountryToScatterplotHoverOut(d)

}



function makeCircleBigger(point) {

    var singleCountryMapSvg = document.getElementById('mapSingleCountry')
    var myDot = d3.select(singleCountryMapSvg)
        .selectAll(".sitesSingleCountry")
        .filter(function (d) {
            return d.name == point.name
        })



        .attr('stroke-width', 10)
        .transition()
        .duration(1000)
        .attr('r', 20);

}


function makeCircleSmaller(point) {

    var singleCountryMapSvg = document.getElementById('mapSingleCountry')
    var myDot = d3.select(singleCountryMapSvg)
        .selectAll(".sitesSingleCountry")
        .filter(function (d) {
            return d.name == point.name
        })

        .transition()
        .duration(1000)
        .attr('r', 5)
        .attr('stroke-width', "1px")

}





function fromBarchartToSingleCountryHoverIn(point) {


    makeCircleBigger(point)

}



function fromBarchartToSingleCountryHoverOut(point) {

    makeCircleSmaller(point)

}




function fromBarchartToSingleCountryClick(point) {
    map.flyTo({
        center: [point.longitude, point.latitude], //[lng, lat]
        zoom: 10
    })

}



function fromScatterplotToSingleCountryHoverIn(point) {
    makeCircleBigger(point)

}

function fromScatterplotToSingleCountryHoverOut(point) {
    makeCircleSmaller(point)

}


export { singleCountryMap };
export { singleCountryMapFirstTime }
export { fromBarchartToSingleCountryHoverIn }
export { fromBarchartToSingleCountryHoverOut }
export { fromBarchartToSingleCountryClick }
export { fromScatterplotToSingleCountryHoverIn }
export { fromScatterplotToSingleCountryHoverOut }