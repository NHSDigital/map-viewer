let map = null;

let choroplethLoading = false;
let ccgBoundaryLayer = null;
let msoaBoundaryGeoJSON = null;
let hospitalData = null;
let snsConstant = 2000;
let choroplethCenter = null;
let modeOfTransportOption = "driving-car";
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

function openContextMenu(e) {
  console.log(this);
  const popup = L.popup()
    .setContent(
      '<a href="#" class="change-choropleth-location">Set Choropleth Location</a>'
    )
    .setLatLng(e.latlng);
  popup.openOn(this);
  Array.from(
    document.getElementsByClassName("change-choropleth-location")
  ).forEach(el => {
    console.log(el);
    el.addEventListener("click", clickEvent => {
      clickEvent.preventDefault();
      const { lat, lng } = e.latlng;
      document.getElementById("isochrone-latitude-label").innerHTML = lat;
      document.getElementById("isochrone-longitude-label").innerHTML = lng;
      choroplethCenter = [lng, lat];
      map.closePopup(popup);
      redrawIsochrones();
    });
  });
}

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

  map.on("contextmenu", openContextMenu);

  // Load CCG Boundary Data and MSOA Data
  await Promise.all([
    loadCCGBoundaryData(),
    loadMSOABoundaryData(),
    loadHospitalData()
  ]);
  drawBubblesFromHospitalData();

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

const loadHospitalData = async () => {
  const fetchedData = await fetch("/assets/sensitive/HospitalData.json");
  hospitalData = await fetchedData.json();
};

const toggleLayer = async (layer, toggle) => {
  if (toggle) {
    layer.addTo(map);
  } else {
    map.removeLayer(layer);
  }
};

const toggleLoadingText = toggle => {
  const el = document.getElementById("isochrone-loading");
  const timeSlider = document.getElementById("isochrone-time-range");
  const intervalSlider = document.getElementById("isochrone-interval-range");
  const modeOfTransport = document.getElementById("mode-of-transport-dropdown");
  timeSlider.disabled = toggle;
  intervalSlider.disabled = toggle;
  modeOfTransport.disabled = toggle;
  if (toggle) {
    el.classList.add("is-shown");
  } else {
    el.classList.remove("is-shown");
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
  choroplethLoading = true;

  const errorEl = document.getElementById("isochrone-error");
  if (choroplethCenter === null) {
    errorEl.innerHTML =
      "Choropleth center must be set. You can set the center by right clicking on the map.";
    errorEl.classList.add("is-shown");
    return;
  } else {
    errorEl.innerHTML = "";
    errorEl.classList.remove("is-shown");
  }
  toggleLoadingText(true);
  currentIsochrone.forEach(layer => map.removeLayer(layer));
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
    `https://api.openrouteservice.org/v2/isochrones/${modeOfTransportOption}`,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        locations: [choroplethCenter],
        range: range
      })
    }
  );
  const geoJson = await response.json();

  const colours = ISOCHRONE_COLOURS[sectionCount];

  currentIsochrone.forEach(layer => map.removeLayer(layer));

  currentIsochrone = geoJson.features.reverse().map((feature, index) => {
    let finalFeature = null;
    if (index === geoJson.features.length - 1) {
      finalFeature = feature;
    } else {
      finalFeature = turf.difference(feature, geoJson.features[index + 1]);
    }
    return L.geoJSON(finalFeature, {
      ...CCGBoundaryLayerOptions,
      permanent: true,
      style: {
        ...CCGBoundaryLayerOptions.style,
        fillOpacity: 0.15,
        color: colours[index]
      }
    });
  });
  choroplethLoading = false;
  toggleLoadingText(false);
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
    isochroneIntervalRangeEl.min = Math.ceil(currentTarget.value / 10);
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
};

const drawBubblesFromHospitalData = () => {
  const data = hospitalData.sort((a, b) => (a[3] < b[3] ? -1 : 1));

  const patientCount = data.reduce((count, nextVal) => count + nextVal[3], 0);
  let showSNSBox = false;

  data.forEach(hospital => {
    const [lat, long, _, currentDeaths, hospitalName, postcode] = hospital;
    if (currentDeaths > snsConstant) {
      L.circle([lat, long], (currentDeaths / patientCount) * 1000000, {
        color: "blue",
        fillColor: "#00bfff",
        weight: 1,
        fillOpacity: 0.05,
        opacity: 0.6
      })
        .bindPopup(
          currentDeaths.toString(10) +
            " people fulfilling the inclusion criteria at " +
            hospitalName.toString(10) +
            ", " +
            postcode.toString(10)
        )
        .addTo(map);
    } else {
      showSNSBox = true;
    }
  });

  if (showSNSBox) {
    L.control
      .messagebox("options")
      .addTo(map)
      .show("Some data missing due to small number suppression");
  }
};

isochroneTimeRangeEl.addEventListener("input", recalculateRangeAndLabels);
isochroneIntervalRangeEl.addEventListener("input", recalculateRangeAndLabels);

isochroneTimeRangeEl.addEventListener("change", debounceRedrawIsochrones);
isochroneIntervalRangeEl.addEventListener("change", debounceRedrawIsochrones);

const isochroneFromHere = e => {};

document
  .getElementById("mode-of-transport-dropdown")
  .addEventListener("change", e => {
    modeOfTransportOption = e.currentTarget.value;
    debounceRedrawIsochrones();
  });
