



function myScatterplot()
{
    
const width = window.innerWidth/2;
const height = window.innerHeight/2;

const svg = d3.select("#row2").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('class', 'flex_item_secondary')




d3.csv('./data_files/whc-sites-2019_original.csv')
.then(data =>
    {
        data.forEach(element => {

     
            element.area_hectares = +element.area_hectares
            element.date_inscribed = +element.date_inscribed

            if(element.area_hectares == "")
            {
                console.log("This site has no hectares")
                element.area_hectares = 0.1
            }

      
    
        });
        visualizeData(data);
    })


    function visualizeData(data)
    {

        const xValue = d => d.date_inscribed
        const yValue = d => d.area_hectares

   
        

        const margin = {top: 20, right: 20, bottom: 20, left: 80};

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;


        const xScale = d3.scaleLinear()
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth]);


        const yScale = d3.scaleLog()
        .domain([d3.max(data, yValue), 1])
        .range([0, innerHeight])
        



        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);



        const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        g.append('g').call(xAxis)
        .attr('transform', 'translate(' + 0 + ',' + innerHeight + ')');

        g.append('g').call(yAxis);


        g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', 2)
        .attr('class', 'scatterplotCircle')

        .on('click', clicked)
        .on('mouseover', mouseOver)







        function clicked() {

            d3.select(this)
            .transition()
            .duration(1000)
            .attr('r', 10)


        }

        function mouseOver(event, d)
        {
            console.log(d)
        }
    }




}



export {myScatterplot};


