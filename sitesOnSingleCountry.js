export const sitesOnSingleCountry = (selection, props) => {
    const {
        csvData, 
        country_iso_code, 
        selectedCategory,
        selectedRelevance,
        projection, 
        categoryScale,
        selectedColorValue,
        zoom} = props;


    console.log("Sto in sites", selectedCategory, selectedRelevance)







    var circles = selection.selectAll("circle")
        .data(csvData)

      

        .enter()
        .append("circle")
        .filter(function (d) {
            //Filter based on relevance and category
            return d.country_iso == country_iso_code && d.category == selectedCategory && d.relevance >= selectedRelevance
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

