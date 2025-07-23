import L from "leaflet";
import "leaflet/dist/leaflet.css";

export class PointMapView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
    this.map = null;

    L.Marker.prototype.options.icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      shadowAnchor: [12, 41],
    });
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `
      <div id="map-container"></div>
    `;
    this.initMap();
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  initMap() {
    this.map = L.map("map-container").setView(
      [-7.722365404293603, 110.3582296767887],
      15
    );
    const baseLayers = {
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
        }
      ),
      OpenTopoMap: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          attribution: "Map data: © OpenTopoMap contributors",
        }
      ),
      "Esri World Imagery": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ),
    };

    const overlayLayers = {};

    const layersControl = L.control
      .layers(baseLayers, overlayLayers)
      .addTo(this.map);

    baseLayers["OpenStreetMap"].addTo(this.map);

    fetch("./data/JABAN_49_4326.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("GeoJSON data loaded:", data);
        console.log("Type:", data.type);
        console.log("Features count:", data.features?.length || "No features");

        const geojsonLayer = L.geoJSON(data, {
          style: function (feature) {
            console.log("Styling feature:", feature);
            return {
              color: "#3388ff",
              weight: 3,
              opacity: 1,
              fillOpacity: 0.5,
            };
          },
          onEachFeature: function (feature, layer) {
            console.log("Feature:", feature);
            if (feature.properties) {
              layer.bindPopup("Feature Name: " + feature.properties.NAME);
            }
          },
        });

        console.log(
          "GeoJSON Layer created:",
          geojsonLayer.getLayers().length,
          "layers"
        );

        layersControl.addOverlay(geojsonLayer, "Jaban");
        geojsonLayer.addTo(this.map);

        this.geojsonLayer = geojsonLayer;
      })

      .catch((error) =>
        console.error("Error loading the GeoJSON file:", error)
      );

    const listButton = L.control({ position: "topright" });
    listButton.onAdd = function () {
      const button = L.DomUtil.create("button", "leaflet-bar");
      button.innerHTML =
        '<i class="fa-solid fa-list-ul" style="font-size: 27px;"></i>';
      button.setAttribute("aria-label", "Lihat daftar laporan");
      button.style.backgroundColor = "white";
      button.style.padding = "8px";
      button.style.borderRadius = "4px";
      button.style.boxShadow = "0 4px 12px rgba(68, 55, 55, 0.1)";
      button.style.cursor = "pointer";

      button.onclick = () => {
        this.presenter.onListButtonClicked();
      };

      return button;
    }.bind(this);

    listButton.addTo(this.map);
  }

  displayPoints(points) {
    points.forEach((point) => {
      if (point.latitude && point.longitude) {
        L.marker([point.latitude, point.longitude]).addTo(this.map).bindPopup(`
            <strong>${point.description}</strong><br>
            <a href="https://www.google.com/maps/place/${point.latitude},${
          point.longitude
        }" 
               target="_blank" 
               rel="noopener">
              ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}
            </a>
          `);
      }
    });
  }

  renderError(message) {
    this.container.innerHTML = `<p class="text-red-600">${message}</p>`;
  }
}
