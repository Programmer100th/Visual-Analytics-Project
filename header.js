import {worldMap} from './worldMap.js';
import { singleCountryMap } from './singleCountryMap.js'
import {myBarChart} from './barChart.js';
import { myStarPlot } from './starPlot.js';



function myHeader()
{


    d3.tsv("./data_files/geoviewsnew.tsv")
    .then(csvData =>
    {
        const sitesPerCountryMap = d3.rollup(csvData, v => v.length, (d => d.country_iso));

        //Converting map to array
        var sitesPerCountryArray = Array.from(sitesPerCountryMap, ([name, sites_number]) => ([name, sites_number]));

        var arrayOfCountries = sitesPerCountryArray.map(x => x[0]);

        var dictOfCountries = {}

        arrayOfCountries.forEach(countryName => {
            csvData.forEach(row => {
                if(row.country_iso == countryName)
                {
                    dictOfCountries[row.country_iso] = row.country;                
                }
            })
        });



        //delete strange key of dictionary
        delete(dictOfCountries[""])

        var finalArrayOfCountries = []

        for (const [key, value] of Object.entries(dictOfCountries)) {
            finalArrayOfCountries.push([[value], [key]])
        }

        finalArrayOfCountries.sort()


        createCountryMenu(finalArrayOfCountries);


        var categoriesMap = d3.rollup(csvData, v => v.length, d => d.category);
        var categoriesArray = Array.from(categoriesMap, ([category, sites_number]) => ([category, sites_number]));
        var arrayOfCategories = categoriesArray.map(x => x[0]);

        createCategoryMenu(arrayOfCategories);



        var relevanceArray = [0, 50, 100, 200, 500, 1000];
        createRelevanceMenu(relevanceArray)




        var countryMenu = document.getElementById("countryMenu");
        var categoryMenu = document.getElementById("categoryMenu");
        var relevanceMenu = document.getElementById("relevanceMenu");

        activateMenuListeners(countryMenu, categoryMenu, relevanceMenu)


    });

    

           
        
    


    function activateMenuListeners(countryMenu, categoryMenu, relevanceMenu)
    {
        
        categoryMenu.addEventListener("change", function()
        {
            var selectedCategory = categoryMenu.options[categoryMenu.selectedIndex].text;
            console.log(selectedCategory)

            var currentCountry = countryMenu.options[countryMenu.selectedIndex].value;
            var currentRelevance = relevanceMenu.options[relevanceMenu.selectedIndex].value;

            singleCountryMap(currentCountry, selectedCategory, currentRelevance, false)
            myBarChart(currentCountry, selectedCategory, currentRelevance)
            worldMap(selectedCategory, currentRelevance)
            myStarPlot(currentCountry)

        });


        
        countryMenu.addEventListener("change", function()
        {
            var selectedCountry = countryMenu.options[countryMenu.selectedIndex].value;
            console.log(selectedCountry)

            var currentCategory = categoryMenu.options[categoryMenu.selectedIndex].text;
            var currentRelevance = relevanceMenu.options[relevanceMenu.selectedIndex].value;

   
            singleCountryMap(selectedCountry, currentCategory, currentRelevance, true)
            myBarChart(selectedCountry, currentCategory, currentRelevance)
            myStarPlot(selectedCountry)

        });


        relevanceMenu.addEventListener("change", function()
        {
            var selectedRelevance = relevanceMenu.options[relevanceMenu.selectedIndex].value;
            console.log(selectedRelevance)


            var currentCountry = countryMenu.options[countryMenu.selectedIndex].value;
            var currentCategory = categoryMenu.options[categoryMenu.selectedIndex].text;
            
         
            singleCountryMap(currentCountry, currentCategory, selectedRelevance, false)
            myBarChart(currentCountry, currentCategory, selectedRelevance)
            worldMap(currentCategory, selectedRelevance)
            myStarPlot(currentCountry)

        });


        

    }



    function createCountryMenu(finalArrayOfCountries)
    {
        var myParent = document.getElementById("divCountryMenu")

        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "countryMenu";
        myParent.appendChild(selectList);

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
        
    }


    function createCategoryMenu(array)
    {
        var myParent = document.getElementById("divCategoryMenu")

       

        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "categoryMenu";
        myParent.appendChild(selectList);

        //Create and append the options
        var option = document.createElement("option");
            option.value = "All";
            option.text = "All";
            selectList.appendChild(option);


        for (var i = 0; i < array.length; i++) {
            var option = document.createElement("option");
            option.value = array[i];
            option.text = array[i];
            selectList.appendChild(option);
        }
    }





    function createRelevanceMenu(relevanceArray)
    {
        var myParent = document.getElementById("divRelevanceMenu")

       
        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "relevanceMenu";
        myParent.appendChild(selectList);

        //Create and append the options
        for (var i = 0; i < relevanceArray.length; i++) {
            var option = document.createElement("option");
            option.value = relevanceArray[i];
            option.text = "Min relevance: " + relevanceArray[i];
            selectList.appendChild(option);
        }
    }


}

export {myHeader}



