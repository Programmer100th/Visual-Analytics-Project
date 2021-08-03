



function myBarChart()
{
    
const width = window.innerWidth/2;
const height = window.innerHeight/2;

const svg = d3.select("#row2").append("svg")
    .attr("width", width)
    .attr("height", height)




d3.csv('./data_files/Population.csv')
.then(data =>
    {
        data.forEach(element => {
            element.Population = +element.Population
        });
        visualizeData(data);
    })


    function visualizeData(data)
    {

        const xValue = d => d.Population
        const yValue = d => d.Country

        const margin = {top: 20, right: 20, bottom: 20, left: 80};

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



        const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        g.append('g').call(xAxis)
        .attr('transform', 'translate(' + 0 + ',' + innerHeight + ')');

        g.append('g').call(yAxis);


        g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('y', d => yScale(yValue(d)))
        .attr('width', d => xScale(xValue(d)))
        .attr('height', yScale.bandwidth())
        .attr('class', "barchartRects")

        .on('click', clicked)
        .on('mouseover', mouseOver)







        function clicked() {

            d3.select(this)
            .attr('class', 'clicked_rect')
            .transition()
            .duration(1000)
            .attr('width', 100)


        }

        function mouseOver(event, d)
        {
            console.log(d)
        }
    }




}


export {myBarChart}


