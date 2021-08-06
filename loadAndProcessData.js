
export const loadAndProcessData = (jsonFile) => 

    Promise.all([
        d3.csv('./data_files/geoviewsnew.csv'),
        //d3.json("./countries-50m.json")
        //d3.json("./ne_10m_admin_1_states_provinces.topojson")
        d3.json(jsonFile)
        //110 m is much more responsive
        // il 10m admin 1 non fa venire gli stati centrati, pero sarebbe il migliore...
        //in questo caso va caMBIATO anche lo scale
    ]).then(([csvData, topoJSONData]) => {


        const countries = topojson.feature(topoJSONData, topoJSONData.objects.unnamed);

        const sitesPerCountryMap = d3.rollup(csvData, v => v.length, d => d.country_iso);
       

        //Converting map to array
        var sitesPerCountryArray = Array.from(sitesPerCountryMap, ([name, sites_number]) => ([name, sites_number]));

        //Adding to count of sites also the transboundary sites 

        /*
        for (var i = 0; i < sitesPerCountryArray.length; i++) {
            if (sitesPerCountryArray[i][0].includes(',')) {
                var listOfCountries = sitesPerCountryArray[i][0].split(',')
                listOfCountries.forEach(country => {
                    for (var j = 0; j < sitesPerCountryArray.length; j++) {
                        if (sitesPerCountryArray[j][0] == country) {
                            sitesPerCountryArray[j][1] += 1
                        }
                    }
                })
            }
        }
        */


        


        //Adding the property "sites_number" to the original topoJSON file

        

        countries.features.forEach(element => {

            //In topojson file some iso_a2 are undefined (-99). Hardcoding right iso code

            if (element.properties.ISO_A2 == -99 && element.properties.NAME == "Norway") {
                element.properties.ISO_A2 = "NO"
            }

            else if (element.properties.ISO_A2 == -99 && element.properties.NAME == "France") {
                element.properties.ISO_A2 = "FR"
            }

            for (var i = 0; i < sitesPerCountryArray.length; i++) {

                if ((sitesPerCountryArray[i][0]) == element.properties.ISO_A2) {
                    element.properties["sites_number"] = sitesPerCountryArray[i][1]
                }

            }


            //Put 0 if no sites are in the country
            if (element.properties["sites_number"] == null) {

                element.properties["sites_number"] = 0
            }



        });

        var arrayOfCountries = sitesPerCountryArray.map(x => x[0]);
        console.log(arrayOfCountries);

        console.log("COUNTRIES", countries);
        console.log("SitesPerCountryArray", sitesPerCountryArray);

        

    return ([countries, csvData]);
    });



