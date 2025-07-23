import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getToken } from "../models/auth-model";

export class PointListView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
    this.map = null;
    this.currentPoint = null;
    this.mapReports = null;

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

  showLocationError() {
    alert("Laporan ini tidak memiliki data lokasi.");
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Memuat laporan...</p>
      </div>
    `;
  }

  renderError(message) {
    this.container.innerHTML = `<p class="text-red-600">${message}</p>`;
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  renderPointList(points) {
    points = points.slice().sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt);
      return dateB - dateA;
    });

    this.container.innerHTML = `
        <div class="container mx-auto px-4">
            <a href="#point-list" class="skip-link">Lewati ke konten utama</a>

            <h2 class="font-bold mb-4 text-xl text-center" id="point-list-heading">
                Daftar Titik
            </h2>
            
            <div id="map-reports" style="height: 400px; border-radius: 8px; overflow: hidden; margin-bottom: 1.5rem;"></div>

            <div id="map-loading-container"></div>

            <div id="point-list" tabindex="-1" role="main" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                role="list" aria-labelledby="point-list-heading">
            </div>
        </div>
        <h2 id="modal-title" class="sr-only">Detail Laporan</h2>

        <div id="map-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"
            aria-describedby="point-description point-created" style="
                  display: none;
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.7);
                  justify-content: center;
                  align-items: center;
                  z-index: 1000;
              ">
            <div id="modal-content" tabindex="-1" aria-label="Detail lokasi laporan dalam peta" style="
                    width: 90%;
                    max-width: 800px;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                    outline: none;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                ">
                <div id="media-scroll-container"
                    style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; width: 100%; height: 300px;">
                    <img id="point-photo"
                        style="width: 100%; height: 100%; object-fit: cover; flex-shrink: 0; scroll-snap-align: start;"
                        alt="Foto laporan" />
                    <div id="map" style="width: 100%; height: 100%; flex-shrink: 0; scroll-snap-align: start;"
                        aria-hidden="true">
                    </div>
                </div>

                <div id="media-indicator" style="display: flex; justify-content: center; gap: 8px; margin-top: 8px;">
                    <span class="indicator-dot active-dot"></span>
                    <span class="indicator-dot"></span>
                </div>

                <div id="point-detail" style="padding: 1rem;" aria-live="polite">
                    <h3 id="point-title" class="font-bold mb-4"></h3>
                    <p id="point-description"></p>
                    <p id="point-type"></p>
                    <small id="point-created"></small>
                </div>
            </div>
        </div>
`;

    if (!points.length) {
      this.container.innerHTML =
        '<h2 class="font-bold mb-4 text-xl">Belum ada laporan</h2>';
      if (this.mapReports) {
        this.mapReports.remove();
        this.mapReports = null;
      }
      return;
    }

    const mainContent = document.querySelector("#point-list");
    const skipLink = document.querySelector(".skip-link");
    const listEl = this.container.querySelector("#point-list");
    const mapModal = this.container.querySelector("#map-modal");
    const modalContent = this.container.querySelector("#modal-content");
    const mapEl = document.querySelector("#map-reports");

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });

    points.forEach((point, index) => {
      const item = document.createElement("article");
      item.className =
        "bg-white rounded-xl shadow-2xl overflow-hidden p-4 flex flex-col gap-2 text-sm";
      item.setAttribute("tabindex", "0");
      item.innerHTML = `
    <img src="${point.photoUrl}" 
     class="cursor-pointer object-cover w-full h-auto max-h-100 max-w-100" 
     loading="lazy" /><p class="text-gray-700">${point.description}</p>
    <p class="text-gray-700">Jenis titik: <strong class="uppercase">${
      point.type
    }</strong></p>
    <p class="text-gray-700">
      Status:
      <span class="inline-block px-2 py-1 rounded-full text-white text-xs font-semibold uppercase ${
        point.status === "aktif" ? "bg-green-500" : "bg-red-500"
      }">
        ${point.status === "aktif" ? "Aktif" : "Tidak Aktif"}
      </span>
    </p>
   `;

      item.style.cursor = "pointer";
      item.addEventListener("click", () => {
        this.presenter.onPointSelected(point);
      });
      listEl.appendChild(item);
    });

    mapModal.addEventListener("click", (e) => {
      if (e.target === mapModal) {
        mapModal.style.display = "none";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mapModal.style.display === "flex") {
        mapModal.style.display = "none";
      }
    });

    mapModal.addEventListener("keydown", (e) => {
      const focusableElements = modalContent.querySelectorAll(
        'button, [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    });

    if (
      this.mapReports &&
      this.mapReports.getContainer() &&
      !this.mapReports.getContainer().isConnected
    ) {
      this.mapReports.remove();
      this.mapReports = null;
    }

    if (!this.mapReports) {
      this.mapReports = L.map(mapEl).setView(
        [-7.721256721020204, 110.35888839226011],
        15
      );
      const baseLayers = {
        OpenStreetMap: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap",
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
      baseLayers["OpenStreetMap"].addTo(this.mapReports);
      L.control.layers(baseLayers).addTo(this.mapReports);

      const mapsButton = L.control({ position: "topright" });
      mapsButton.onAdd = function () {
        const button = L.DomUtil.create("button", "leaflet-bar");
        button.innerHTML =
          '<i class="fa-solid fa-map" style="font-size: 24.5px;"></i>';
        button.setAttribute("aria-label", "Temukan lokasi saya");
        button.style.backgroundColor = "white";
        button.style.padding = "8px";
        button.style.borderRadius = "4px";
        button.style.boxShadow = "0 4px 12px rgba(68, 55, 55, 0.1)";
        button.style.cursor = "pointer";

        button.onclick = () => {
          this.presenter.onMapButtonClicked();
        };

        return button;
      }.bind(this);

      mapsButton.addTo(this.mapReports);
    }

    points.forEach((point) => {
      if (point.latitude && point.longitude) {
        L.marker([point.latitude, point.longitude]).addTo(this.mapReports)
          .bindPopup(`
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

  async renderPoint(point) {
    this.currentPoint = point;
    const mapModal = this.container.querySelector("#map-modal");
    const modalContent = this.container.querySelector("#modal-content");
    const pointPhoto = this.container.querySelector("#point-photo");

    pointPhoto.src = point.photoUrl;
    pointPhoto.alt = `Foto dari ${point.submittedBy || 'Tidak diketahui'}`;

    const mediaContainer = this.container.querySelector(
      "#media-scroll-container"
    );
    const indicatorDots = this.container.querySelectorAll(".indicator-dot");

    mediaContainer.addEventListener("scroll", () => {
      const scrollPosition = mediaContainer.scrollLeft;
      const containerWidth = mediaContainer.offsetWidth;

      const activeIndex = Math.round(scrollPosition / containerWidth);

      indicatorDots.forEach((dot, index) => {
        dot.classList.toggle("active-dot", index === activeIndex);
      });
    });

    indicatorDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        mediaContainer.scrollTo({
          left: mediaContainer.offsetWidth * index,
          behavior: "smooth",
        });
      });
    });

    const mapEl = this.container.querySelector("#map");
    mapEl.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });

    mapModal.style.display = "flex";
    modalContent.focus();

    const pointDetail = this.container.querySelector("#point-detail");

    pointDetail.innerHTML = `
      <h2 class="text-gray-700">Laporan oleh: <strong class="font-semibold">${point.submittedBy || 'Tidak diketahui'}
      </strong></h2>
      <p class="text-gray-700">${point.description}</p>
      <p class="text-gray-700">Jenis titik: <strong class="uppercase">${
      point.type
    }</strong></p>
      <p class="text-gray-700">
        Status:
        <span class="inline-block px-2 py-1 rounded-full text-white text-xs font-semibold ${
          point.status === "aktif" ? "bg-green-500" : "bg-red-500"
        }">
          ${point.status === "aktif" ? "Aktif" : "Tidak Aktif"}
        </span>
      </p>
      <small class="text-gray-500">Dibuat: ${
        point.createdAt
          ? new Date(
              point.createdAt.toDate
                ? point.createdAt.toDate()
                : point.createdAt
            ).toLocaleString()
          : "Tanggal tidak tersedia"
      }</small>
   `;

    const isLoggedIn = !!getToken();

    if (isLoggedIn) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "modal-delete-button bg-red-600 text-white hover:bg-red-700 p-3 rounded-md shadow-lg";
      deleteBtn.innerHTML =
        '<i class="fa-solid fa-trash" style="color: white;"></i>';
      deleteBtn.style.position = "absolute";
      deleteBtn.style.bottom = "1rem";
      deleteBtn.style.right = "1rem";
      deleteBtn.setAttribute("aria-label", "Hapus laporan ini");

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
          this.presenter.onDeletePointClicked(point.id);
          const mapModal = this.container.querySelector("#map-modal");
          mapModal.style.display = "none";
        }
      });

      modalContent.appendChild(deleteBtn);
    }

    if (this.map === null) {
      const mapEl = this.container.querySelector("#map");
      this.map = L.map(mapEl).setView([point.latitude, point.longitude], 13);

      const baseLayers = {
        OpenStreetMap: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap",
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
      baseLayers["OpenStreetMap"].addTo(this.map);
      L.control.layers(baseLayers).addTo(this.map);
    } else {
      this.map.setView([point.latitude, point.longitude], 13);
    }

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });
    L.marker([point.latitude, point.longitude])
      .addTo(this.map)
      .bindPopup(
        `
        <strong>${point.description}</strong><br>
        <a href="https://www.google.com/maps/place/${point.latitude},${
          point.longitude
        }" 
          target="_blank" 
          rel="noopener">
          ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}
        </a>
      `
      )
      .openPopup();
  }
}
