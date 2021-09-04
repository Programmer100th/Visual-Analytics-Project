import { coordinateWithBarchart } from './singleCountryMap.js'




function visualizeData(data, width, height) {

    const xValue = d => +d.relevance
    const yValue = d => d.name


    //Play with margin left for words in vertical axis
    const margin = { top: 20, right: 20, bottom: 20, left: 150 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])
        .range([0, innerWidth]);


    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.1);



    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);



    const categoryScale = d3.scaleOrdinal();

    categoryScale
        .domain(data.map(d => d.category))
        .range(['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'])


    var svg = document.getElementById('barchart')

    d3.select('#barchartG').remove()


    const g = d3.select(svg).append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('id', 'barchartG');

    g.append('g').call(xAxis)
        .attr('transform', 'translate(' + 0 + ',' + innerHeight + ')')
        .style("font-size", "15px");

    g.append('g').call(yAxis)
        .style("font-size", "15px");


    g.selectAll('rect')

        .data(data)
        .enter()
        .append('rect')
        .attr('y', d => yScale(yValue(d)))
        .attr('width', d => xScale(xValue(d)))
        .attr('height', yScale.bandwidth())
        .attr('class', "barchartRects")


        /*
        .attr("fill", function (d) {
            return categoryScale(d.category)
        })
        */

        .attr("fill", "steelblue")

        .on('click', clicked)
        .on('mouseover', mouseOver)


    function clicked() {

        d3.select(this)
            .attr('class', 'clicked_rect')
            .transition()
            .duration(1000)
            .attr('width', 100)


    }

    function mouseOver(event, d) {
        console.log(d)
        coordinateWithBarchart(d)
    }
}





function myBarChartFirstTime() {



    const width = window.innerWidth / 3;
    const height = window.innerHeight / 7 * 3;


    const svg = d3.select("#row2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "flex_item_secondary")
        .attr('id', "barchart")

    d3.tsv("./data_files/geoviewsnew.tsv")
        .then(data => {
            var newData = []

            data.filter(function (row) {
                if (row['relevance'] >= 0) {
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

function myBarChart(selectedCountry, selectedCategory, selectedRelevance) {

    console.log("Attuali in barchart:", selectedCountry, selectedCategory, selectedRelevance)

    selectedRelevance = parseInt(selectedRelevance)

    const width = window.innerWidth / 3;
    const height = window.innerHeight / 7 * 3;

    d3.tsv("./data_files/geoviewsnew.tsv")
        .then(data => {
            var newData = []

            data.filter(function (row) {
                if (selectedCountry == null || selectedCountry == "World") {
                    if (selectedCategory == "All" && row['relevance'] >= selectedRelevance) {
                        newData.push(row)

                    }
                    else if (row['relevance'] >= selectedRelevance && row['category'] == selectedCategory) {

                        newData.push(row)

                    }

                }
                else {
                    if (row['country_iso'] == selectedCountry && row['relevance'] >= selectedRelevance) {
                        if (selectedCategory == "All") {

                            newData.push(row)


                        }
                        else if (row['category'] == selectedCategory) {
                            newData.push(row)
                        }
                    }



                }

            })

            //Order the sites by relevance in descending order
            newData.sort((a, b) => b.relevance - a.relevance)

            //Takes the 10 sites with highest relevance
            newData = newData.slice(0, 10)

            visualizeData(newData, width, height);
        })


}



function coordinateViewSingleCountry(bar) {
    var myBarchart = document.getElementById('barchart')
    var selectedBar = d3.select(myBarchart)
        .selectAll(".barchartRects")
        .filter(function (d) {
            return d.name == bar.name
        })

        .transition()
        .duration(1000)
        .style("fill", "green")
        .transition()
        .duration(1000)
        .style('fill', "steelblue")



}


export { myBarChart }
export { myBarChartFirstTime }
export { coordinateViewSingleCountry }


