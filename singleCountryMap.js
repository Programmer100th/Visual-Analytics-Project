import { colorLegend }                              from './colorLegend.js'
import { fromSingleCountryToBarchartHoverIn }       from './barChart.js'
import { fromSingleCountryToBarchartHoverOut }      from './barChart.js'
import { fromSingleCountryToScatterplotHoverIn }    from './scatterplot.js'
import { fromSingleCountryToScatterplotHoverOut }   from './scatterplot.js'
import { changeStarplotIn }                         from './starPlot.js'
import { changeStarplotOut }                        from './starPlot.js'


let map;
let geocoder;
let currentTsvData = []

function createGeoJsonFile(data) {
    var sites_geojson = {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "features": []
    };

    data.forEach(row => {
        var obj = {}
        var geometry = {}
        var properties = {}
        geometry['type'] = "Point"
        geometry['coordinates'] = [row['longitude'], row['latitude']]

        properties['name'] = row['name']
        properties['country'] = row['country']
        properties['category'] = row['category']
        properties['country_iso'] = row['country_iso']
        if (row['relevance'] == "") {
            properties['relevance'] = 0
        }
        else {
            properties['relevance'] = parseInt(row['relevance'])
        }

        obj['type'] = "Feature"
        obj['geometry'] = geometry
        obj['properties'] = properties


        sites_geojson.features.push(obj)

    })

    return sites_geojson;
}


function addHeatMapLayer(sites_geojson, tresholdZoom) {



    d3.select('#colorLegendBase').remove();

    var num_sites = sites_geojson.features.length;


    map.addSource('sites_distribution', {
        type: 'geojson',
        data: sites_geojson
    })




    map.addLayer(
        {
            id: 'heatmapLayer',
            type: 'heatmap',
            source: 'sites_distribution',
            maxzoom: tresholdZoom,
            paint: {
                // increase weight as diameter breast height increases
                'heatmap-weight': {
                    property: 'relevance',
                    type: 'exponential',
                    stops: [
                        [0, 0.3],
                        [300, 1]
                    ]
                },
                // increase intensity as zoom level increases
                'heatmap-intensity': {
                    stops: [
                        [0, Math.ceil(100 / num_sites)],
                        [3, 1],
                        [tresholdZoom, 5]
                    ]
                },
                // assign color values be applied to points depending on their density
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(236,222,239,0)',
                    //'#feedde',
                    0.2,
                    //'rgb(208,209,230)',
                    '#feedde',

                    0.4,
                    //'rgb(166,189,219)',
                    '#fdbe85',

                    0.6,
                    //'rgb(103,169,207)',
                    '#fd8d3c',

                    0.8,
                    //'rgb(28,144,153)'
                    '#e6550d'

                ],
                // increase radius as zoom increases
                'heatmap-radius': {
                    stops: [
                        [0, Math.ceil(500 / num_sites)],
                        [tresholdZoom, 15]
                    ]
                },
                // decrease opacity to transition into the circle layer
                'heatmap-opacity': {
                    default: 1,
                    stops: [
                        [tresholdZoom - 1, 1],
                        [tresholdZoom, 0.3]
                    ]
                }
            }
        },
        'waterway-label'
    );



    // add heatmap layer here
    // add circle layer here



}


function handleZoom(data, pointsAreOnMap, tresholdZoom) {


    if (map.getZoom() > tresholdZoom) {


        d3.selectAll(".sitesSingleCountry").exit()
        d3.selectAll(".sitesSingleCountry").remove()
        pointsAreOnMap = true
        putPointsOnMap(currentTsvData)

    }



    map.on('zoom', () => {



        if (currentTsvData.length > 100) {


            var currentZoom = map.getZoom();

            if (currentZoom > tresholdZoom && pointsAreOnMap == false) {
                d3.selectAll(".sitesSingleCountry").exit()
                d3.selectAll(".sitesSingleCountry").remove()
                pointsAreOnMap = true
                putPointsOnMap(currentTsvData)

            }
            else if (currentZoom <= tresholdZoom && pointsAreOnMap == true) {
                d3.select('#colorLegendBase').remove();
                d3.selectAll(".sitesSingleCountry").exit()
                d3.selectAll(".sitesSingleCountry").remove()
                pointsAreOnMap = false


            }
        }





    })

}


function singleCountryMapFirstTime() {


    var mapDiv = document.createElement("div");
    mapDiv.id = "map";
    mapDiv.class = "col-sm-6 flex_item_primary";

    document.getElementById("row1").appendChild(mapDiv);


    mapboxgl.accessToken = 'pk.eyJ1IjoicHJvZ3JhbW1lcjEwMHRoIiwiYSI6ImNrc2dkaWh2cjExcGQyd3RidGp4bmJ2engifQ.d2gGexRnrH1v7UjVYsBx2A';
    map = new mapboxgl.Map({
        container: 'map', // container ID


        //Optimize the performance but we need to understand if it affects something important

        //style: 'mapbox://styles/mapbox/streets-v11', // style URL
        style: 'mapbox://styles/mapbox/streets-v11?optimize=true', // style URL


        center: [12.75, 41.0], // starting position [lng, lat]
        zoom: 2 // starting zoom


    });

    map.addControl(new mapboxgl.NavigationControl());


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



    d3.tsv("./data_files/onlySitesWithWikipediaPage.tsv")
        .then(data => {

            var newData = []

            data.filter(function (row) {

                if (row['country_iso'] == "IT") {

                    newData.push(row)
                }

            })



            currentTsvData = newData;



            var tresholdZoom = 10;

            var sites_geojson = createGeoJsonFile(newData);

            map.on('load', () => {

                addHeatMapLayer(sites_geojson, tresholdZoom);
            });

            handleZoom(newData, false, tresholdZoom);





        });


}




function singleCountryMap(country_iso_code, selectedCategories, selectedRelevance, changeCountry) {

    console.log("Attuali in SingleCountryMap:", country_iso_code, selectedCategories, selectedRelevance)

    function filterData() {

        d3.tsv("./data_files/onlySitesWithWikipediaPage.tsv")
            .then(data => {

                var newData = []

                data.filter(function (row) {

                    if (row['relevance'] == "") {
                        row['relevance'] = 0;
                    }


                    if (selectedCategories.includes(row['category']) && row['relevance'] >= selectedRelevance && row['country_iso'] == country_iso_code) {
                        newData.push(row)

                    }


                });



                currentTsvData = newData;



                var numSitesTsv = newData.length;


                var heatMapLayer = map.getLayer('heatmapLayer');

                if (typeof heatMapLayer !== 'undefined') {
                    map.removeLayer('heatmapLayer')
                    map.removeSource('sites_distribution');

                }


                var tresholdZoom = 10;


                if (numSitesTsv != 0) {

                    if (numSitesTsv > 100) {





                        var sites_geojson = createGeoJsonFile(newData);

                        addHeatMapLayer(sites_geojson, tresholdZoom);

                        handleZoom(newData, false, tresholdZoom);

                    }

                    else {



                        handleZoom(newData, false, tresholdZoom);


                        putPointsOnMap(newData)

                    }
                }


                //Remove the legend if there are no points to show on map
                else
                {
                    d3.select('#colorLegendBase').remove()
                }




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


        //.range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']);
        .range([
            '#ff7f00', //Arancione scuro
            '#a6cee3', //Celeste
            '#33a02c', //Verde scuro
            '#e31a1c', //Rosso
            '#6a3d9a', //Viola
            '#fdbf6f', //Arancione chiaro
            '#1f78b4', //Blu
            '#b2df8a', //Verde chiaro
            '#fb9a99', //Rosa salmone
            '#cab2d6', //Lilla
        ]);


    var singleCountryMapSvg = document.getElementById('mapSingleCountry')

    var dots = d3.select(singleCountryMapSvg)
        .selectAll(".sitesSingleCountry")
        .exit()
        .data(newData)
        .enter()
        .append("circle")
        .attr('class', 'sitesSingleCountry')
        .attr("r", 5)
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


    //Here I handle color legend

    d3.select('#colorLegendBase').remove();

    var g = d3.select('#mapSingleCountry').append("g")
        .attr('id', 'colorLegendBase')

    const colorLegendG = d3.select('#colorLegendBase').append('g')
        .attr('transform', 'translate(' + window.innerWidth / 40 + ',' + window.innerHeight / 15 + ')')
        .attr('id', 'colorLegendSingleCountry');


    colorLegendG
        .call(colorLegend, {
            colorScale: categoryScale,
            circleRadius: 5,
            spacing: 15,
            textOffset: 10,
            backgroundRectWidth: "12vw",
        });

}


function project(d) {
    return map.project(new mapboxgl.LngLat(d["longitude"], d["latitude"]));
}



function mouseOver(event, d) {

    console.log(d)

    d3.select(this)


        .attr('stroke-width', 5)

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


    changeStarplotIn(d.category)
    fromSingleCountryToBarchartHoverIn(d);
    fromSingleCountryToScatterplotHoverIn(d);

}


function mouseOut(event, d) {

    d3.select(this)
        .transition()
        .duration(1000)
        .attr('r', 5)
        .attr('stroke-width', "1px");


    changeStarplotOut()
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

        .attr('stroke-width', 5)
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


function circlesIn(category) {

    var singleCountryMapSvg = document.getElementById('mapSingleCountry')
    var myDot = d3.select(singleCountryMapSvg)
        .selectAll(".sitesSingleCountry")
        .filter(function (d) {
            return d.category != category
        })

        //.transition()         // the computational time increases 
        //.duration(1000)       
        .attr('opacity', 0.0);  //0.05

}

function circlesOut(category) {

    var singleCountryMapSvg = document.getElementById('mapSingleCountry')
    var myDot = d3.select(singleCountryMapSvg)
        .selectAll(".sitesSingleCountry")
        .filter(function (d) {
            return d.category != category
        })

        //.transition()
        //.duration(1000)
        .attr('opacity', 1);

}





function fromBarchartToSingleCountryHoverIn(point) {


    makeCircleBigger(point)

    map.flyTo({
        center: [point.longitude, point.latitude], //[lng, lat]
        zoom: 5
    })

}



function fromBarchartToSingleCountryHoverOut(point) {

    makeCircleSmaller(point)

}




function fromBarchartToSingleCountryClick(point) {
    map.flyTo({
        center: [point.longitude, point.latitude], //[lng, lat]
        zoom: 15
    })

}



function fromScatterplotToSingleCountryHoverIn(point) {
    makeCircleBigger(point)



    //Da aggiungere se mettiamo le coordinate nello scatterplot
    /*
    map.flyTo({
        center: [point.longitude, point.latitude] //[lng, lat]
    })

    */

}

function fromScatterplotToSingleCountryHoverOut(point) {
    makeCircleSmaller(point)

}

function fromStarplotToSingleCountryHoverIn(category) {
    circlesIn(category)

}

function fromStarplotToSingleCountryHoverOut(category) {
    circlesOut(category)

}


export { singleCountryMap };
export { singleCountryMapFirstTime }
export { fromBarchartToSingleCountryHoverIn }
export { fromBarchartToSingleCountryHoverOut }
export { fromBarchartToSingleCountryClick }
export { fromScatterplotToSingleCountryHoverIn }
export { fromScatterplotToSingleCountryHoverOut }
export { fromStarplotToSingleCountryHoverIn }
export { fromStarplotToSingleCountryHoverOut }