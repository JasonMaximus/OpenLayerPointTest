import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Fill, Stroke, Style, Text, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj';

// Define colorful styles
const defaultStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({
      color: 'rgba(0, 190, 0, 0.9)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.8)',
      width: 1,
    }),
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({ color: '#000' }),
    stroke: new Stroke({
      color: '#fff',
      width: 2,
    }),
    offsetY: -15, // Offset to lift the text above the point
  }),
});

// Initialize variables to track selected feature and its style
let selectedFeature = null;
let selectedStyle = null;

// Fetch GeoJSON data from external file
fetch('dataset.json')
  .then(response => response.json())
  .then(data => {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(data, {
        featureProjection: 'EPSG:3857'
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: defaultStyle, // Set default style for all features
    });

    // Define the base map layer
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Map initialization
    const map = new Map({
      layers: [baseLayer, vectorLayer],
      target: 'map',
      view: new View({
        center: fromLonLat([126.9784, 37.566]), // Center on Seoul
        zoom: 7,
      }),
    });

    // Event listener for map click
    map.on('click', function(event) {
      highlightFeature(event);
    });

    // Function to handle feature highlighting
    function highlightFeature(event) {
      // Get the clicked feature
      const clickedFeature = map.forEachFeatureAtPixel(event.pixel, function(feature) {
        return feature;
      });

      if (clickedFeature) {
        // Reset style of previously selected feature
        if (selectedFeature) {
          selectedFeature.setStyle(defaultStyle);
        }

        // Apply highlight style to the clicked feature
        selectedStyle = new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: 'rgba(255, 0, 0, 0.4)',
            }),
            stroke: new Stroke({
              color: '#FF3333',
              width: 2,
            }),
          }),
          text: new Text({
            text: clickedFeature.get('name'),
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({
              color: '#fff',
              width: 2,
            }),
            offsetY: -15, // Offset to lift the text above the point
          }),
        });

        clickedFeature.setStyle(selectedStyle);

        // Update selected feature and its style
        selectedFeature = clickedFeature;

        // Show the image gallery modal
        showImageGallery(clickedFeature);
        Facility.currentData = clickedFeature;
      }
    }

    // Function to show image gallery in a modal
    function showImageGallery(feature) {
      const images = feature.get('images');
      if (!images || images.length === 0) return;

      const indicators = document.querySelector('#carouselExample .carousel-indicators');
      const inner = document.querySelector('#carouselExample .carousel-inner');
      let flooritem = "";

      // Clear existing items
      indicators.innerHTML = '';
      inner.innerHTML = '';
      if($("#modalToolbar .btn-group.dropup").length > 0){
        $("#modalToolbar .btn-group.dropup").html("");
      }

      $("#modalToolbar").prepend(`<div class="btn-group dropup">
        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" id="modalToolbarTitle">
          Floor
        </button>
        <ul class="dropdown-menu" id="modalToolbarItem">
        </ul>
      </div>`);

      images.forEach((image, index) => {
        const indicator = document.createElement('li');
        indicator.setAttribute('data-target', '#carouselExample');
        indicator.setAttribute('data-slide-to', index.toString());
        if (index === 0) indicator.classList.add('active');
        indicators.appendChild(indicator);

        const item = document.createElement('div');
        item.classList.add('carousel-item');
        item.classList.add('item-'+ (index + 1));
        if (index === 0) item.classList.add('active');

        const img = document.createElement('img');
        img.classList.add('d-block', 'w-100', 'img-fluid', 'carousel-img'); // Added 'img-fluid' and 'carousel-img' classes
        img.src = image;
        img.alt = 'Slide ' + (index + 1);
        item.appendChild(img);

        inner.appendChild(item);
        flooritem += `<li><a class="dropdown-item" href="#" onclick="Facility.changeFloor(${index})">${(index === 0) ? "Tampak Depan" : "Lantai "+ (index)}</a></li>`;
        if(index === 0){
          $("#modalToolbarTitle").html("Tampak Depan");
        }
      });

      $('#exampleModal').modal('show');
      $("#modalToolbarItem").append(flooritem);

      $('#exampleModal').on('shown.bs.modal', function () {
        // Initialize the carousel manually
        $('#carouselExample').carousel({
          interval: false  // Disable automatic sliding
        });
      });
    }

    // Function to toggle image size
    function toggleImageSize() {
    }

    // Event listener for map hover
    map.on('pointermove', function(event) {
      const hoveredFeature = map.forEachFeatureAtPixel(event.pixel, function(feature) {
        return feature;
      });

      if (hoveredFeature) {
        map.getTargetElement().style.cursor = 'pointer';
        hoveredFeature.setStyle(new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({
              color: 'rgba(0, 190, 0, 0.9)',
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.8)',
              width: 1,
            }),
          }),
          text: new Text({
            text: hoveredFeature.get('name'),
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({
              color: '#fff',
              width: 2,
            }),
            offsetY: -15, // Offset to lift the text above the point
          }),
        }));
      } else {
        map.getTargetElement().style.cursor = '';
      }
    });
  })
  .catch(error => console.error('Error loading GeoJSON data:', error));
