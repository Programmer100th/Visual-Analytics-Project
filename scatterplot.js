import { fromScatterplotToSingleCountryHoverIn } from './singleCountryMap.js'
import { fromScatterplotToSingleCountryHoverOut } from './singleCountryMap.js'
import { fromScatterplotToBarchartHoverIn } from './barChart.js'
import { fromScatterplotToBarchartHoverOut } from './barChart.js'


function visualizeData(data, width, height) {

    const xValue = d => d.x
    const yValue = d => d.y




    const margin = { top: 20, right: 20, bottom: 20, left: 80 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;



    var xExtents = d3.extent(data, xValue);
    var yExtents = d3.extent(data, yValue);


    const xScale = d3.scaleLinear()

        //.domain(d3.extent(data, xValue))
        .domain([xExtents[0] - 2, xExtents[1]])
        .range([0, innerWidth]);


    const yScale = d3.scaleLinear()

        //.domain(d3.extent(data, yValue))
        .domain([yExtents[0] - 3, yExtents[1]])
        .range([innerHeight, 0])



    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const categoryScale = d3.scaleOrdinal();

    categoryScale
        .domain(data.map(d => d.category))
        .range(['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'])

    console.log(categoryScale.domain())



    var svg = document.getElementById('myScatterplot')



    /*

    const zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on('zoom', (event) => {
            g.attr('transform', event.transform)
            d3.select(svg).selectAll(".scatterplotCircle")
                .attr('transform', event.transform)
        })

    d3.select(svg).call(zoom)

    */

    d3.select('#scatterplotG').remove()

    const g = d3.select(svg).append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('id', 'scatterplotG');

    g.append('g').call(xAxis)
        .attr('transform', 'translate(' + 0 + ',' + innerHeight + ')')
        .style("font-size", "15px");

    g.append('g').call(yAxis)
        .style("font-size", "15px");

    console.log(data)


    g.selectAll('.scatterplotCircle')
        .data(data)
        .enter()
        .append('circle')
        //.attr('cy', d => d.y)
        //.attr('cx', d => d.x)
        .attr('cx', d => xScale(xValue(d)))
        .attr('cy', d => yScale(yValue(d)))
        .attr('r', 5)
        .attr('class', 'scatterplotCircle')


        /*
        .attr("fill", function (d) {
            return categoryScale(d.category)
        })
        */

        .attr("fill", "steelblue")

        .on('click', clicked)
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)


}



function clicked() {

    d3.select(this)
        .transition()
        .duration(1000)
        .attr('r', 10)


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
                return d.name + ", " + d.category + ", " + 0

            }
            else {
                return d.name + ", " + d.category + ", " + d.relevance
            }
        })

    fromScatterplotToSingleCountryHoverIn(d)
    fromScatterplotToBarchartHoverIn(d)
}


function mouseOut(event, d) {

    d3.select(this)
        .transition()
        .duration(1000)
        .attr('r', 7)
        .attr('stroke-width', "1px");

    fromScatterplotToSingleCountryHoverOut(d)
    fromScatterplotToBarchartHoverOut(d)

}






function myScatterplotFirstTime() {

    const width = window.innerWidth / 3;
    const height = window.innerHeight / 7 * 3;

    const svg = d3.select("#row2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr('class', 'flex_item_secondary')
        .attr('id', 'myScatterplot');




    d3.tsv('./data_files/points_new.tsv')
        .then(data => {

            var newData = []

            data.filter(function (row) {
                if (row['country_iso'] == "IT") {
                    newData.push(row)
                }

            })


            console.log(newData)

            visualizeData(newData, width, height);
        });




}







function myScatterplot(selectedCountry, selectedCategory, selectedRelevance) {

    const width = window.innerWidth / 3;
    const height = window.innerHeight / 7 * 3;

    selectedRelevance = parseInt(selectedRelevance)

    d3.tsv('./data_files/points_new.tsv')
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



            console.log(newData)

            visualizeData(newData, width, height);
        });

}



function makeCircleBigger(point) {
    var scatterplotSvg = document.getElementById('myScatterplot')
    var myDot = d3.select(scatterplotSvg)
        .selectAll(".scatterplotCircle")
        .filter(function (d) {
            return d.name == point.name
        })



        .attr('stroke-width', 10)
        .transition()
        .duration(1000)
        .attr('r', 20);

}


function makeCircleSmaller(point) {
    var scatterplotSvg = document.getElementById('myScatterplot')
    var myDot = d3.select(scatterplotSvg)
        .selectAll(".scatterplotCircle")
        .filter(function (d) {
            return d.name == point.name
        })

        .transition()
        .duration(1000)
        .attr('r', 5)
        .attr('stroke-width', "1px")

}




function fromSingleCountryToScatterplotHoverIn(point) {
    makeCircleBigger(point)
}


function fromSingleCountryToScatterplotHoverOut(point) {
    makeCircleSmaller(point)



}

function fromBarchartToScatterplotHoverIn(point) {
    makeCircleBigger(point)

}

function fromBarchartToScatterplotHoverOut(point) {
    makeCircleSmaller(point)

}














function scatterplotProf() {
    var chiavi

    var dataSelection = [];




    var margin = { top: 20, right: 20, bottom: 110, left: 50 },
        margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
        //width = 960 - margin.left - margin.right,
        //height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;



    const width = window.innerWidth / 3;
    const height = window.innerHeight / 7 * 3;

    var parseDate = d3.timeParse("%b %Y");

    var x = d3.scaleLinear().range([0, width]),
        x2 = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed);

    var brushTot = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("end", selected);

    var focus;

    var dati

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    function drawScatter(data) {

        var svg = d3.select("#row2").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('id', 'scatterplot');

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


        //x.domain(d3.extent(data, function (d) { return +d[chiavi[0]]; }));
        //y.domain(d3.extent(data, function (d) { return +d[chiavi[1]]; }));

        x.domain(d3.extent(data, function (d) { return d }));
        y.domain(d3.extent(data, function (d) { return d }));

        x2.domain(x.domain());
        y2.domain(y.domain());



        // append scatter plot to main chart area 
        var dots = focus.append("g");
        dots.attr("clip-path", "url(#clip)");
        dots.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr('class', 'dot')
            .attr("r", 5)
            .attr("fill", "grey")
            .attr("opacity", ".3")
            .attr("cx", function (d) { return x(+d[chiavi[0]]); })
            .attr("cy", function (d) { return y(+d[chiavi[1]]); })
            .style("fill", function (d) { return color(d[chiavi[2]]); });


        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(chiavi[1]);

        svg.append("text")
            .attr("transform",
                "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
                (height + margin.top + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text(chiavi[0]);

        focus.append("g")
            .attr("class", "brushT")
            .call(brushTot);

        // append scatter plot to brush chart area      
        var dots = context.append("g");
        dots.attr("clip-path", "url(#clip)");
        dots.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr('class', 'dotContext')
            .attr("r", 3)
            .style("opacity", .5)
            .attr("cx", function (d) { return x2(d[chiavi[0]]); })
            .attr("cy", function (d) { return y2(d[chiavi[1]]); })
            .style("fill", function (d) { return color(d[chiavi[2]]); });

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

    }


    d3.csv("./data_files/pca.csv", function (error, data) {

        /*
        chiavi = d3.keys(data[0])
        if (error) throw error;
        var l = data.length;
        for (i = 0; i < l; i++) {
            data[i].id = i
        }
        */


        drawScatter(data)

    })

    //create brush function redraw scatterplot with selection
    function brushed() {
        var selection = d3.event.selection;
        console.log(selection)
        x.domain(selection.map(x2.invert, x2));
        focus.selectAll(".dot")
            .attr("cx", function (d) { return x(d[chiavi[0]]); })
            .attr("cy", function (d) { return y(d[chiavi[1]]); });
        focus.select(".axis--x").call(xAxis);
    }

    function selected() {
        dataSelection = []
        //console.log(selection[0][0]);
        /*focus.selectAll(".dot").filter(function(d){
        if ((x(d.sepalLength) > selection[0][0]) && (x(d.sepalLength) < selection[1][0]) && (y(d.sepalWidth) > selection[0][1]) && (y(d.sepalWidth) < selection[1][1])) {
            dataSelection.push(d)
            return true
        }
        })
        .attr("fill","red")*/
        var selection = d3.event.selection;

        if (selection != null) {
            focus.selectAll(".dot")
                /*  .style("fill",function(d){
                 if ((x(d[chiavi[0]]) > selection[0][0]) && (x(d[chiavi[0]]) < selection[1][0]) && (y(d[chiavi[1]]) > selection[0][1]) && (y(d[chiavi[1]]) < selection[1][1])) {
                     dataSelection.push(d.id)
                     return "red"
                 }
                 else
                 {
                     return color(d[chiavi[2]])
                 }
             })*/
                .style("opacity", function (d) {
                    if ((x(d[chiavi[0]]) > selection[0][0]) && (x(d[chiavi[0]]) < selection[1][0]) && (y(d[chiavi[1]]) > selection[0][1]) && (y(d[chiavi[1]]) < selection[1][1])) {
                        dataSelection.push(d.id)
                        return "1.0"
                    }
                    else {
                        return "0.3"
                    }
                })


        }
        else {
            focus.selectAll(".dot")
                .style("fill", function (d) { return color(d[chiavi[2]]); })
                .style("opacity", ".3")
            console.log("reset");
        }


    }
}





export { myScatterplot };
export { myScatterplotFirstTime };
export { fromSingleCountryToScatterplotHoverIn }
export { fromSingleCountryToScatterplotHoverOut }
export { fromBarchartToScatterplotHoverIn }
export { fromBarchartToScatterplotHoverOut }



export { scatterplotProf }

