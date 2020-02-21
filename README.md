# DigiTrial Map Viewer

## About 
NHS DigiTrials Interactive Map utilises OpenStreetMap tileserver (to be hosted locally), Leaflet JS library, and enables users to view clinical query data (queried in Databricks in DAE) in the form of a bubble map, and view potential time taken for patients to travel to selected trial centers through use of isochrone mappings (taking into consideration walking times, cycling times, and driving times), utilising OpenRouteService API (to be hosted locally).

## Features 
### Bubble Map
In this version of the map-viewer, to visualise data from clinical queries done in Databricks in DAE, the data is manually added to the data directory (and in a specific format) to then plot in the form of a bubble map. Adding data to the data directory isn't done automatically.
Bubbles can be clicked on to find out information of plotted data.

### Isochrone Map
Isochrone functionality works with plotted postcodes, where the postcode data is manually added to the data directory (and in a specific format), so the number of postcodes of hospitals within an isochrone is specified. Adding postcode data to the data directory isn't done automatically.

### Heat/ Choropleth Map
There are MSOA and CCG boundary data available (with toggle functionalities) for use with heat maps (the heap maps have not yet been started).

### Setup 
1. Clone
2. Start node server/ server
3. Interact with map
