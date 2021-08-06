import { putCountryOnMap } from './selectedCountryMap.js'
import {myBarChart} from './barChart.js';


function myHeader()
{


    



    d3.csv("./data_files/geoviewsnew.csv")
    .then(csvData =>
    {
        const sitesPerCountryMap = d3.rollup(csvData, v => v.length, (d => d.country_iso));

        console.log(sitesPerCountryMap)

        //Converting map to array
        var sitesPerCountryArray = Array.from(sitesPerCountryMap, ([name, sites_number]) => ([name, sites_number]));

        var arrayOfCountries = sitesPerCountryArray.map(x => x[0]);
        console.log(arrayOfCountries);



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

        console.log(finalArrayOfCountries)





        createCountryMenu(finalArrayOfCountries);


     
        



        var categoriesMap = d3.rollup(csvData, v => v.length, d => d.category);
        var categoriesArray = Array.from(categoriesMap, ([category, sites_number]) => ([category, sites_number]));
        var arrayOfCategories = categoriesArray.map(x => x[0]);
        console.log(arrayOfCategories)

        createCategoryMenu(arrayOfCategories);




        var countryMenu = document.getElementById("countryMenu");
        var categoryMenu = document.getElementById("categoryMenu");

        activateMenuListeners(countryMenu, categoryMenu)

       

    });

    

           
        
    





    


    function activateMenuListeners(countryMenu, categoryMenu)
    {
        
        categoryMenu.addEventListener("change", function()
        {
            var selectedCategory = categoryMenu.options[categoryMenu.selectedIndex].text;
            console.log(selectedCategory)

            var currentCountry = countryMenu.options[countryMenu.selectedIndex].value;

            myBarChart(currentCountry, selectedCategory)

        });


        
        countryMenu.addEventListener("change", function()
        {
            var selectedCountry = countryMenu.options[countryMenu.selectedIndex].value;
            console.log(selectedCountry)

            var currentCategory = categoryMenu.options[categoryMenu.selectedIndex].text;







            //Setta categoria country e relevance nei grafici da qui!
            putCountryOnMap("CIAO", 4, selectedCountry)
            myBarChart(selectedCountry, currentCategory)

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


}

export {myHeader}



