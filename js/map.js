/**
 * Step 1: Work on the same thing! (https://github.com/NHSDigital/map-viewer)
 * Step 2: Add Bubble Map
 * Step 3: Modes of transport
 * Step 4: Isochrone Center Location
 * Step 5: Make a Jira for Choropleth
 * Step 6: Discuss "Output Bundle"
 * Step 7: Put this on the "proper" checklist
 */

let map = null;

let ccgBoundaryLayer = null;
let msoaBoundaryGeoJSON = null;
let msoaBoundaryLayer = null;
let isochroneTime = 60;
let isochroneInterval = 30;
let isochroneDebounceInterval = null;
let currentIsochrone = [];

const CCGBoundaryLayerOptions = {
  style: {
    color: "#005EB8",
    weight: 1,
    fillOpacity: 0.05,
    opacity: 0.6
  }
};

const MSOABoundaryLayerOptions = {
  style: {
    color: "#009639",
    weight: 1,
    fillOpacity: 0.05,
    opacity: 0.6
  }
};

const setupLeaflet = async () => {
  map = L.map("map", { minZoom: 4, maxZoom: 18 });

  // Centred Over England
  map.setView([53, -4], 7);

  // OpenStreetMap Tile Server
  L.tileLayer(
    "	https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ).addTo(map);

  // Load CCG Boundary Data and MSOA Data
  await Promise.all([loadCCGBoundaryData(), loadMSOABoundaryData()]);
  await redrawIsochrones();
  map.on("contextmenu", e => {
    console.log(e.latlng);
  });
  // Ready
  console.log("Map Ready");
};

const loadMSOALayerFromCCGLayer = async layerProperties => {
  if (msoaBoundaryGeoJSON === null) {
    await loadMSOABoundaryData();
  }
  alert("TODO: Write a script to split up the MSOA data");
};

const bindEventHandlerForMSOALoad = event => {
  const elements = document.getElementsByClassName("load-msoa-layer-via-ccg");
  Array.from(elements).forEach(element => {
    element.addEventListener("click", e => {
      e.preventDefault();
      loadMSOALayerFromCCGLayer(event.layer.feature.properties);
    });
  });
};

/**
 * Builds the Leaflet GeoJSON layer using the Generalised CCG Boundary Data
 * from ONS.
 */
const loadCCGBoundaryData = async () => {
  const fetchedData = await fetch("/assets/CCGBoundaries.geojson");
  const { features } = await fetchedData.json();
  ccgBoundaryLayer = L.geoJSON(features, CCGBoundaryLayerOptions);
  ccgBoundaryLayer.eachLayer(layer => {
    layer.bindPopup(`
      <p>${layer.feature.properties.ccg19nm}</p>
      <a href="#" class="load-msoa-layer-via-ccg">Load MSOA Data for this CCG</a>`);
  });
  ccgBoundaryLayer.on("click", bindEventHandlerForMSOALoad);
};

const loadMSOABoundaryData = async () => {
  const fetchedData = await fetch("/assets/MSOAData.geojson");
  msoaBoundaryGeoJSON = await fetchedData.json();
  msoaBoundaryLayer = L.geoJSON(
    msoaBoundaryGeoJSON.features,
    MSOABoundaryLayerOptions
  );
};

const toggleLayer = async (layer, toggle) => {
  if (toggle) {
    layer.addTo(map);
  } else {
    map.removeLayer(layer);
  }
};

/**
 * Toggles the CCG Boundary data being displayed
 *
 * @param {Boolean} toggle
 */
const toggleCCGBoundaryData = async toggle => {
  if (ccgBoundaryLayer === null && toggle) {
    await loadCCGBoundaryData();
  }
  toggleLayer(ccgBoundaryLayer, toggle);
};

const toggleMSOABoundaryData = async toggle => {
  if (msoaBoundaryLayer === null && toggle) {
    await loadCCGBoundaryData();
  }
  toggleLayer(msoaBoundaryLayer, toggle);
};

const redrawIsochrones = async () => {
  currentIsochrone.forEach(layer => map.removeLayer(layer));
  currentIsochrone = null;
  const middleCoordinates = [-1.54841, 53.796143];
  const headers = new Headers();
  headers.set(
    "Accept",
    "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8"
  );
  headers.set("Content-Type", "application/json");
  headers.set(
    "Authorization",
    "5b3ce3597851110001cf6248aa986a24b58349fb894b2fdfd506b08e"
  );

  const sectionCount = Math.ceil(isochroneTime / isochroneInterval);
  const range = Array.from(new Array(sectionCount + 1).keys())
    .map(index => {
      return isochroneTime * 60 - 60 * index * (isochroneTime / sectionCount);
    })
    .filter(x => x > 0);

  const response = await fetch(
    "https://api.openrouteservice.org/v2/isochrones/driving-car",
    {
      method: "POST",

      headers: headers,
      body: JSON.stringify({
        locations: [middleCoordinates],
        range: range
      })
    }
  );
  const geoJson = await response.json();
  const colours = ["red", "orange", "yellow", "green"];

  currentIsochrone = geoJson.features
    .map((feature, index) =>
      L.geoJSON(feature, {
        ...CCGBoundaryLayerOptions,
        permanent: true,
        style: {
          ...CCGBoundaryLayerOptions.style,
          fillOpacity: 0.15,
          color: colours[index]
        }
      })
    )
    .reverse();
  currentIsochrone.forEach(layer => layer.addTo(map));
};

const debounceRedrawIsochrones = () => {
  if (isochroneDebounceInterval !== null) {
    clearTimeout(isochroneDebounceInterval);
  }
  isochroneDebounceInterval = setTimeout(() => {
    redrawIsochrones();
    isochroneDebounceInterval = null;
  }, 250);
};

window.addEventListener("load", setupLeaflet);

document
  .getElementById("ccg-boundary-toggle")
  .addEventListener("change", ({ currentTarget }) =>
    toggleCCGBoundaryData(currentTarget.checked)
  );

document
  .getElementById("msoa-boundary-toggle")
  .addEventListener("change", ({ currentTarget }) =>
    toggleMSOABoundaryData(currentTarget.checked)
  );

const isochroneTimeRangeEl = document.getElementById("isochrone-time-range");
const isochroneIntervalRangeEl = document.getElementById(
  "isochrone-interval-range"
);
const isochroneTimeRangeLabelEl = document.getElementById(
  "isochrone-time-range-label"
);
const isochroneIntervalRangeLabelEl = document.getElementById(
  "isochrone-interval-range-label"
);

const recalculateRangeAndLabels = ({ currentTarget }) => {
  if (currentTarget.id === "isochrone-time-range") {
    isochroneTimeRangeLabelEl.innerHTML = `${currentTarget.value} ${
      currentTarget.value === "1" ? "minute" : "minutes"
    }`;
    isochroneIntervalRangeEl.max = currentTarget.value;
    isochroneIntervalRangeLabelEl.innerHTML = `${
      isochroneIntervalRangeEl.value
    } ${isochroneIntervalRangeEl.value === "1" ? "minute" : "minutes"}`;
  } else {
    isochroneIntervalRangeLabelEl.innerHTML = `${currentTarget.value} ${
      currentTarget.value === "1" ? "minute" : "minutes"
    }`;
  }
  isochroneTime = Number(isochroneTimeRangeEl.value);
  isochroneInterval = Number(isochroneIntervalRangeEl.value);
  debounceRedrawIsochrones();
};

isochroneTimeRangeEl.addEventListener("input", recalculateRangeAndLabels);
isochroneIntervalRangeEl.addEventListener("input", recalculateRangeAndLabels);

const isochroneFromHere = e => {};

document.getElementById("map").addEventListener("contextmenu", e => {});
