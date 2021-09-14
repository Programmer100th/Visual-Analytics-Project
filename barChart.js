import { fromBarchartToSingleCountryHoverIn }   from './singleCountryMap.js'
import { fromBarchartToSingleCountryHoverOut }  from './singleCountryMap.js'
import { fromBarchartToSingleCountryClick }     from './singleCountryMap.js'
import { fromBarchartToScatterplotHoverIn }     from './scatterplot.js'
import { fromBarchartToScatterplotHoverOut }    from './scatterplot.js'
import { changeStarplotIn }                     from './starPlot.js'
import { changeStarplotOut }                    from './starPlot.js'


function visualizeData(data, width, height) {

    const xValue = d => +d.relevance
    const yValue = d => d.name

    


    //Play with margin left for words in vertical axis
    const margin = { top: 25, right: 20, bottom: 30, left: 120 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])
        .range([0, innerWidth]);


    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.1);


    //Use ticks to decide how many maximum ticks can be in xAxis
    const xAxis = d3.axisBottom(xScale).ticks(4);

    //Needed otherwise the label doesn't fit the svg
    const yAxis = d3.axisLeft(yScale).tickFormat(function(d)
    {
        if ((d.length) >= 18) {
            return d.substring(0, 16) + "."
        }
        else {
            return d
        }
    
    });


    const categoryScale = d3.scaleOrdinal();

    categoryScale
        .domain(data.map(d => d.category))
        .range(['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'])


    var svg = document.getElementById('barchart')

    d3.select('#barchartG').remove()


    const g = d3.select(svg).append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('id', 'barchartG');


    var xAxisLabel = g.append("text")
        .attr("class", "x_label")
        //.attr("text-anchor", "end")
        .attr("x", width - 270)
        .attr("y", height - 60)
        .style("font-size", "0.8vw")
        .style("fill", "black")
        .text("Wikipedia's Relevance");
        


        /*

    var yAxisLabel = g.append("text")
        .attr("class", "y_label")
        .attr("text-anchor", "end")
        .attr("y", 10)
        .attr('x', -50)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Site");

        */


    g.append('g').call(xAxis)
        .attr('transform', 'translate(' + 0 + ',' + innerHeight + ')')

        .style("font-size", "1vw");

    g.append('g').call(yAxis)
        .style("font-size", "0.9vw");



    g.selectAll('rect')

        .data(data)
        .enter()
        .append('rect')
        .attr('y', d => yScale(yValue(d)))


        /*
        .attr('y', function(d)
        {
            return yScale(yValue(d)) +   yScale.domain().length
        })

        */


        .attr('class', "barchartRects")


        /*
        .attr("fill", function (d) {
            return categoryScale(d.category)
        })
        */


        .attr("fill", "steelblue")

        .attr('height', yScale.bandwidth())
        //.attr('height', 20)

        .transition()
        .duration(1500)
        .attr('width', d => xScale(xValue(d)));


    g.selectAll('rect')

        .on('click', clicked)
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)


    function clicked(event, d) {

        fromBarchartToSingleCountryClick(d)



    }

    function mouseOver(event, d) {
        console.log(d)


        d3.select(this)
            .transition()
            .duration(500)
            .style("fill", "green")


        d3.select(this)
            .append("g:title")
            .attr('x', 100)
            .attr('y', 100)

            //If relevance is null, put relevance = 0
            .text(function (d) {
                if (d.relevance == "") {
                    return d.name + ", " + d.category + ", " + 0

                }
                else {
                    return d.name + ", " + d.category + ", " + d.relevance
                }
            })


        changeStarplotIn(d.category)
        fromBarchartToSingleCountryHoverIn(d)
        fromBarchartToScatterplotHoverIn(d)
    }



    function mouseOut(event, d) {

        d3.select(this)
            .transition()
            .duration(500)
            .style('fill', "steelblue")


        changeStarplotOut()
        fromBarchartToSingleCountryHoverOut(d)
        fromBarchartToScatterplotHoverOut(d)
    }
}





function myBarChartFirstTime() {



    const width = window.innerWidth / 3;
    const height = window.innerHeight / 9 * 4;


    const svg = d3.select("#row2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "col-sm flex_item_secondary")
        .attr('id', "barchart")


    var noDataText = svg.append("text")

        .attr('id', 'noDataAvailableBarchart')
        .attr("y", '50%')
        .attr('x', '50%')
        .attr('text-anchor', "middle")
        .style('display', 'none')
        .text("No data available");





    d3.tsv("./data_files/geoviewsnew_2.tsv")
        .then(data => {
            var newData = []

            data.filter(function (row) {
                if (row['relevance'] >= 0 && row['country_iso'] == "IT") {
                    newData.push(row)
                }

            })

            //Order the sites by relevance in descending order
            newData.sort((a, b) => b.relevance - a.relevance)

            //Takes the 10 sites with highest relevance
            newData = newData.slice(0, 10)

            visualizeData(newData, width, height);
        })






}

function myBarChart(selectedCountry, selectedCategories, selectedRelevance) {


    console.log("Attuali in barchart:", selectedCountry, selectedCategories, selectedRelevance)

    selectedRelevance = parseInt(selectedRelevance)

    const width = window.innerWidth / 3;
    const height = window.innerHeight / 9 * 4;

    d3.tsv("./data_files/geoviewsnew_2.tsv")
        .then(data => {
            var newData = []




            data.filter(function (row) {
                if (row['relevance'] != "") {
                    if (selectedCountry == null || selectedCountry == "World") {
                        if (selectedCategories.includes(row['category']) && row['relevance'] >= selectedRelevance) {
                            newData.push(row)
                        }

                    }
                    else {
                        if (row['country_iso'] == selectedCountry && row['relevance'] >= selectedRelevance && selectedCategories.includes(row['category'])) {
                            newData.push(row)
                        }

                    }
                }

            })




            if (newData.length == 0) {


                var barchartG = document.getElementById('barchartG')
                barchartG.style.display = 'none';

                var noDataText = document.getElementById('noDataAvailableBarchart')
                noDataText.style.display = 'block';

            }

            else {


                var noDataText = document.getElementById('noDataAvailableBarchart')
                noDataText.style.display = 'none';


                var barchartG = document.getElementById('barchartG')
                barchartG.style.display = 'block';



                //Order the sites by relevance in descending order
                newData.sort((a, b) => b.relevance - a.relevance)

                //Takes the 10 sites with highest relevance
                newData = newData.slice(0, 10)

                visualizeData(newData, width, height);
            }


        })

}


function highlightRectangleOn(bar) {
    var myBarchart = document.getElementById('barchart')
    var selectedBar = d3.select(myBarchart)
        .selectAll(".barchartRects")
        .filter(function (d) {
            return d.name == bar.name
        })

        .transition()
        .duration(1000)
        .style("fill", "green")

}

function highlightRectangleOff(bar) {
    var myBarchart = document.getElementById('barchart')
    var selectedBar = d3.select(myBarchart)
        .selectAll(".barchartRects")
        .filter(function (d) {
            return d.name == bar.name
        })

        .transition()
        .duration(1000)
        .style('fill', "steelblue")

}

function highlightBarsOn(bar) {
    console.log(bar)
    var myBarchart = document.getElementById('barchart')
    var selectedBars = d3.select(myBarchart)
        .selectAll(".barchartRects")
        .filter(function (d) {
            return d.category != bar
        })
        .transition()
        .duration(1000)
        .attr("opacity", 0.4)

}

function highlightBarsOff() {
    var myBarchart = document.getElementById('barchart')
    var selectedBars = d3.select(myBarchart)
        .selectAll(".barchartRects")
        .transition()
        .duration(1000)
        .attr("opacity", 1)

}



function fromSingleCountryToBarchartHoverIn(bar) {
    highlightRectangleOn(bar)
}


function fromSingleCountryToBarchartHoverOut(bar) {
    highlightRectangleOff(bar)
}

function fromScatterplotToBarchartHoverIn(bar) {
    highlightRectangleOn(bar)

}

function fromScatterplotToBarchartHoverOut(bar) {
    highlightRectangleOff(bar)
}

function fromStarplotToBarchartHoverIn(bar) {
    highlightBarsOn(bar)
}

function fromStarplotToBarchartHoverOut(bar) {
    highlightBarsOff(bar)
}



export { myBarChart }
export { myBarChartFirstTime }
export { fromSingleCountryToBarchartHoverIn }
export { fromSingleCountryToBarchartHoverOut }
export { fromScatterplotToBarchartHoverIn }
export { fromScatterplotToBarchartHoverOut }
export { fromStarplotToBarchartHoverIn }
export { fromStarplotToBarchartHoverOut }
