import L from "leaflet";

const baseUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master";

export const markerIcons = {
  "bank sampah": L.icon({
    iconUrl: `${baseUrl}/img/marker-icon-green.png`,
    shadowUrl: `${baseUrl}/img/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  }),
  tpa: L.icon({
    iconUrl: `${baseUrl}/img/marker-icon-red.png`,
    shadowUrl: `${baseUrl}/img/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  }),
  "tempat sampah umum": L.icon({
    iconUrl: `${baseUrl}/img/marker-icon-blue.png`,
    shadowUrl: `${baseUrl}/img/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  }),
  "sumur kompos": L.icon({
    iconUrl: `${baseUrl}/img/marker-icon-yellow.png`,
    shadowUrl: `${baseUrl}/img/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  }),
  "spl": L.icon({
    iconUrl: `${baseUrl}/img/marker-icon-violet.png`,
    shadowUrl: `${baseUrl}/img/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  }),
};
