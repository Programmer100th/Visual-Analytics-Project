import { worldMap }         from './worldMap.js';
import { evidenceCountryBoundaries }         from './worldMap.js';
import { singleCountryMap } from './singleCountryMap.js'
import { myBarChart }       from './barChart.js';
import { myStarPlot }       from './starPlot.js';
import { myScatterplot }    from './scatterplot.js';



function myHeader() {


    d3.tsv("./data_files/onlySitesWithWikipediaPage.tsv")
        .then(csvData => {
            const sitesPerCountryMap = d3.rollup(csvData, v => v.length, (d => d.country_iso));

            //Converting map to array
            var sitesPerCountryArray = Array.from(sitesPerCountryMap, ([name, sites_number]) => ([name, sites_number]));

            var arrayOfCountries = sitesPerCountryArray.map(x => x[0]);

            var dictOfCountries = {}

            arrayOfCountries.forEach(countryName => {
                csvData.forEach(row => {
                    if (row.country_iso == countryName) {
                        dictOfCountries[row.country_iso] = row.country;
                    }
                })
            });



            //delete strange key of dictionary
            delete (dictOfCountries[""])

            var finalArrayOfCountries = []

            for (const [key, value] of Object.entries(dictOfCountries)) {
                finalArrayOfCountries.push([[value], [key]])
            }

            finalArrayOfCountries.sort()


            createCountryMenu(finalArrayOfCountries);


            var categoriesMap = d3.rollup(csvData, v => v.length, d => d.category);
            var categoriesArray = Array.from(categoriesMap, ([category, sites_number]) => ([category, sites_number]));
            var arrayOfCategoriesWrong = categoriesArray.map(x => x[0]);



            //Needed because when there are "" in the name of the site, it takes as category the longitude
            var arrayOfCategories = []

            arrayOfCategoriesWrong.forEach(function(element) {
                if(element[0] >= 'A')
                {
                    console.log("ECCO")
                    arrayOfCategories.push(element)
                }

            })

            console.log(arrayOfCategories)
                
            
            createCategoryMenu(arrayOfCategories);



            var countryMenu = document.getElementById("countryMenu");
            var categoryMenu = document.getElementById("categoryMenu");
            var relevanceMenu = document.getElementById("relevanceMenu");

            activateMenuListeners(countryMenu, categoryMenu, relevanceMenu)

           


        });








    function activateMenuListeners(countryMenu, categoryMenu, relevanceMenu) {

        categoryMenu.addEventListener("change", function () {
     
            var selectedCategories = $('#categoryMenu').val();
            if(selectedCategories == null)
            {
                selectedCategories = []
            }

            var currentCountry = countryMenu.options[countryMenu.selectedIndex].value;
            var currentRelevance = document.getElementById('relevanceMenu').value

            singleCountryMap(currentCountry, selectedCategories, currentRelevance, false)
            myBarChart(currentCountry, selectedCategories, currentRelevance)
            worldMap(selectedCategories, currentRelevance)
            myStarPlot(currentCountry, currentRelevance)
            myScatterplot(currentCountry, selectedCategories, currentRelevance)

         
        });



        countryMenu.addEventListener("change", function () {

            var selectedCountry = countryMenu.options[countryMenu.selectedIndex].value;
            var currentCategories = $('#categoryMenu').val();
            var currentRelevance = document.getElementById('relevanceMenu').value

            if(currentCategories == null)
            {
                currentCategories = []
            }


            singleCountryMap(selectedCountry, currentCategories, currentRelevance, true)
            myBarChart(selectedCountry, currentCategories, currentRelevance)
            myStarPlot(selectedCountry, currentRelevance)
            myScatterplot(selectedCountry, currentCategories, currentRelevance)

            evidenceCountryBoundaries(selectedCountry)

        });


        relevanceMenu.addEventListener("change", function () {


            var selectedRelevance = document.getElementById('relevanceMenu').value
            var relevanceLabel = document.getElementById('sliderLabel');
            relevanceLabel.innerHTML = selectedRelevance

            var currentCountry = countryMenu.options[countryMenu.selectedIndex].value;
            var currentCategories = $('#categoryMenu').val();

            if(currentCategories == null)
            {
                currentCategories = []
            }


            

            singleCountryMap(currentCountry, currentCategories, selectedRelevance, false)
            myBarChart(currentCountry, currentCategories, selectedRelevance)
            worldMap(currentCategories, selectedRelevance)
            myStarPlot(currentCountry, selectedRelevance)
            myScatterplot(currentCountry, currentCategories, selectedRelevance)

        

            

        });




    }



    function createCountryMenu(finalArrayOfCountries) {



        var selectList = document.getElementById("countryMenu")

        //Create and append the options
        var option = document.createElement("option");
        option.value = "World";
        option.text = "World";
        selectList.appendChild(option);


        for (var i = 0; i < finalArrayOfCountries.length; i++) {
            var option = document.createElement("option");
            option.value = finalArrayOfCountries[i][1];
            option.text = finalArrayOfCountries[i][0];
            selectList.appendChild(option);
        }


        for (var i = 0; i < selectList.length; i++) {
            if (selectList[i].value == "IT") {
                selectList[i].selected = true;

            }
        }



        //Needed otherwise options are not visible in menu
        $('#countryMenu').selectpicker('refresh');


    }


    function createCategoryMenu(array) {

        console.log(array)


        var selectList = document.getElementById("categoryMenu")




        for (var i = 0; i < array.length; i++) {
            var option = document.createElement("option");
            option.value = array[i];
            option.text = array[i];
            if (array[i] != "United States")  //When the rollup is executed, it finds US as category, with no reason
            {
                selectList.appendChild(option);
            }


            selectList[i].selected = true;

        }

        





        //Needed otherwise options are not visible in menu
        $('#categoryMenu').selectpicker('refresh');


    }


}

export { myHeader }



