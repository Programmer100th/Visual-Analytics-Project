//window.addEventListener("load", getWikipediaData, true);


function getWikipediaData()
{

    

    d3.csv('./data_files/whc-sites-2019_original.csv')
    .then(csvData => {


    
        csvData.forEach(elem =>
            {
                var url = "https://en.wikipedia.org/w/api.php"; 
        var params = {
            action: "query",
            list: "search",
            srsearch: elem.name_en,
            format: "json"
        };

   
        
        url = url + "?origin=*";
        Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

       
        
        fetch(url)
            .then(function(response){return response.json();})
            .then(function(response) {
                console.log("Site: ", response.query.search[0])
                console.log("Word count: ", response.query.search[0].wordcount)
                console.log("-----------------------")

               
            })
            .catch(function(error){console.log(error);})
    })

})


   

     

      
    
        

    listOfSites = ["Villa Adriana (Tivoli)", "Archaeological Area of Agrigento"]



    /*
   var url = "https://en.wikipedia.org/w/api.php"; 

   var params = {
       action: "query",
       list: "search",
       srsearch: "Nelson Mandela",
       format: "json"
   };
   
   url = url + "?origin=*";
   Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
   
   fetch(url)
       .then(function(response){return response.json();})
       .then(function(response) {
           if (response.query.search[0].title === "Nelson Mandela"){
               console.log("Your search page 'Nelson Mandela' exists on English Wikipedia" );
  
           }
       })
       .catch(function(error){console.log(error);})

    */


    for (var i=0; i<listOfSites.length; i++)
    {
        var url = "https://en.wikipedia.org/w/api.php"; 
        var params = {
            action: "query",
            list: "search",
            srsearch: listOfSites[i],
            format: "json"
        };

     
        
        url = url + "?origin=*";
        Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

     
        
        fetch(url)
            .then(function(response){return response.json();})
            .then(function(response) {
                console.log(response.query.search[0])
          
               
            })
            .catch(function(error){console.log(error);})
    }
    
}
