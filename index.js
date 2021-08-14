import {myHeader} from './header.js'
import {worldMap} from './worldMap.js';
import {myBarChart} from './barChart.js';
import {myScatterplot} from './scatterplot.js';
import {selectedCountryMap} from './selectedCountryMap.js'
import {myStarPlot} from './starPlot.js';


myHeader()
worldMap("All", 0);
myBarChart("World", "All", 0);
//myScatterplot();
selectedCountryMap("World", "All", 0, true);
myStarPlot("World");
