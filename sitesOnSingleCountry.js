export const sitesOnSingleCountry = (selection, props) => {
    const {
        csvData, 
        country_iso_code, 
        projection, 
        categoryScale,
        selectedColorValue} = props;







    var circles = selection.selectAll("circle")
        .data(csvData)

      

        .enter()
        .append("circle")
        .filter(function (d) {
            //Filter based on relevance and category
            return d.country_iso == country_iso_code //&& d.relevance > 400
        })
        .attr("cx", function (d) {
            return projection([d.longitude, d.latitude])[0];
        })
        .attr("cy", function (d) {
            return projection([d["longitude"], d["latitude"]])[1];
        })
        .attr("r", 0.3)

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

        

        

 
        


        
        

        
}







function mouseOver() {

    console.log("APP")

    d3.select(this)

    .append("g:title")
    .attr('x', 100)
    .attr('y', 100)
	.text(function(d) { return d.name + ", " + d.relevance });

    /*
    
    d3.select(this.parentNode).append("title")//appending it to path's parent which is the g(group) DOM
    
        .attr('x', projection([d.longitude, d.latitude])[0])
        .attr('y', projection([d["longitude"], d["latitude"]])[1])

        .attr("class", "myLabel")//adding a label class
        .text(function () {
            return d.name
        });
    */

    

    d3.select(this)
        .transition()
        .duration(1000)
        .attr('r', 3)
        

}


function mouseOut() {
    //d3.selectAll(".myLabel").remove()//this will remove the text on mouse out

    d3.select(this)
        .transition()
        .duration(1000)
        .attr('r', 1)
}


function clickfn(){
    console.log("CLICKED")
    d3.select(this)
        .transition()
        .duration(1000)
        .attr('r', 3)
}

