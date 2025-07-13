import L from "leaflet";
import "leaflet/dist/leaflet.css";

export class PointAddView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `
    <a href="#point-form" class="skip-link">Lewati ke konten utama</a>

    <article id="form-map-wrapper"
            style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); width: 100%; max-width: 960px; display: flex; flex-direction: column; justify-content: center; margin: 0 auto;">
      <h2 class="font-bold mb-4 text-xl text-center">Tambah Titik</h2>

      <div class="form-map-wrapper" style="display: flex; flex-wrap: wrap; gap: 2rem;">
        
        <form id="point-form"
              tabindex="-1"
              role="main"
              style="flex: 1 1 300px; display: flex; flex-direction: column;">

          <label for="description">Deskripsi:</label>
          <textarea id="description"
                    name="description"
                    required
                    aria-label="Deskripsi Laporan"
                    style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; font-size: 1rem; margin-bottom: 1rem; width: 100%;"></textarea>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">Tipe Lokasi:</label>
            <label><input type="radio" name="type" value="Bank sampah" required> Bank sampah</label><br>
            <label><input type="radio" name="type" value="TPA"> TPA</label><br>
            <label><input type="radio" name="type" value="Tempat sampah umum"> Tempat sampah umum</label>
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">Status:</label>
            <label><input type="radio" name="status" value="Aktif" required> Aktif</label><br>
            <label><input type="radio" name="status" value="Tidak aktif"> Tidak aktif</label>
          </div>

          <label for="photo">Upload Gambar:</label>
          <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <button type="button"
                  id="upload-button"
                  aria-label="Pilih gambar dari file"
                  style="background: #10b981; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer;">
                  Pilih File
          </button>
          <input type="file"
                  id="photo-upload"
                  name="photo"
                  accept="image/*"
                  style="display: none;"> 
          <button type="button"
                  id="camera-button"
                  aria-label="Buka kamera untuk mengambil foto"
                  style="background: #0ea5e9; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer;">
              Kamera
          </button>
          <input type="file"
                  id="photo-camera"
                  name="photo"
                  accept="image/*"
                  capture="environment"
                  style="display: none;">
          </div>

          <div id="camera-preview"
              style="display: none; text-align: center; width: 100%; margin-top: 0.5rem;">
            <img id="photo-preview"
                style="display: none; width: 100%; max-width: 400px; border-radius: 8px;"
                alt="Pratinjau foto yang diambil">
            <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem;">
              <button type="button"
                      id="cancel-button"
                      aria-label="Batalkan dan hapus foto"
                      style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer;">
                Batal
              </button>
            </div>
          </div>

          <label for="lat">Latitude:</label>
          <input type="number" step="any" id="lat" name="lat" required
          style="margin-bottom: 1rem; padding: 8px; border-radius: 6px; border: 1px solid #ccc;">

          <label for="lon">Longitude:</label>
          <input type="number" step="any" id="lon" name="lon" required
          style="margin-bottom: 1rem; padding: 8px; border-radius: 6px; border: 1px solid #ccc;">

          <button type="submit"
                  aria-label="Kirim Laporan beserta deskripsi dan gambar"
                  style="margin-top: 1rem; padding: 12px 24px; background: #0369a1; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer;">
            Kirim Laporan
          </button>

        </form>

        <div id="map-add"
            aria-label="Peta lokasi"
            style="flex: 1 1 300px; min-width: 280px; height: flex; border: 1px solid #ccc; border-radius: 8px;">
        </div>
      </div>
    </article>
    `;

    this.initMap();
    this.initSubmit();
    this.initCamera();
    this.initUpload();

    const mainContent = document.querySelector("#point-form");
    const skipLink = document.querySelector(".skip-link");

    L.Marker.prototype.options.icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      shadownAnchor: [12, 41],
    });

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });
  }

  initUpload() {
    const uploadButton = document.getElementById("upload-button");
    const photoUpload = document.getElementById("photo-upload");

    uploadButton.addEventListener("click", () => {
      photoUpload.click();
    });

    photoUpload.addEventListener("change", (event) => {
      this.handlePhotoChange(event.target);
    });
  }

  renderSubmitError(message) {
    alert(message);
  }

  renderSubmitSuccess() {
    alert("Laporan berhasil ditambahkan!");
  }
  initMap() {
    const map = L.map("map-add").setView(
      [-7.721256721020204, 110.35888839226011],
      16
    );
    const baseLayers = {
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap",
        }
      ),
      OpenTopoMap: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          attribution: "Map data: &copy; OpenTopoMap contributors",
        }
      ),
      "Esri World Imagery": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ),
    };
    baseLayers["OpenStreetMap"].addTo(map);
    L.control.layers(baseLayers).addTo(map);

    let marker;

    const locateButton = L.control({ position: "topright" });
    locateButton.onAdd = function () {
      const button = L.DomUtil.create("button", "leaflet-bar");
      button.innerHTML = '<i class="fa-solid fa-crosshairs" style="font-size: 27px;"></i>';
      button.style.backgroundColor = "white";
      button.style.padding = "8px";
      button.style.borderRadius = "4px";
      button.style.boxShadow = "0 4px 12px rgba(68, 55, 55, 0.1)";
      button.onclick = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              map.setView([latitude, longitude], 13);

              document.getElementById("lat").value = latitude;
              document.getElementById("lon").value = longitude;

              if (marker) map.removeLayer(marker);
              marker = L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(
                  `Lokasi Anda: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
                )
                .openPopup();
            },
            (error) => {
              console.error("Geolocation error:", error);
              alert("Gagal mendapatkan lokasi Anda!");
            }
          );
        } else {
          alert("Geolocation tidak didukung di browser Anda.");
        }
      };
      return button;
    };
    locateButton.addTo(map);

    map.on("click", function (e) {
      const { lat, lng } = e.latlng;
      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lng;

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`Koordinat: ${lat.toFixed(3)}, ${lng.toFixed(3)}`)
        .openPopup();
    });

    const latInput = document.getElementById("lat");
    const lonInput = document.getElementById("lon");

    function updateMarkerFromInput() {
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      if (!isNaN(lat) && !isNaN(lon)) {
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`Koordinat: ${lat.toFixed(3)}, ${lon.toFixed(3)}`)
          .openPopup();
        map.setView([lat, lon], 13);
      }
    }

    latInput.addEventListener("change", updateMarkerFromInput);
    lonInput.addEventListener("change", updateMarkerFromInput);
  }

  initCamera() {
    const cameraButton = document.getElementById("camera-button");
    const photoCamera = document.getElementById("photo-camera");
    const cancelButton = document.getElementById("cancel-button");

    cameraButton.addEventListener("click", () => {
      photoCamera.click();
    });

    photoCamera.addEventListener("change", (event) => {
      this.handlePhotoChange(event.target);
    });

    cancelButton.addEventListener("click", () => {
      photoCamera.value = "";
      document.getElementById("photo-upload").value = "";
      document.getElementById("photo-preview").src = "";
      document.getElementById("photo-preview").style.display = "none";
      document.getElementById("camera-preview").style.display = "none";
      cancelButton.textContent = "Batal";
    });
  }

  initSubmit() {
    const form = document.getElementById("point-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const descriptionInput = form.querySelector("#description");
      const cleanedDescription = descriptionInput.value.trim();

      descriptionInput.value = cleanedDescription;

      const photoInput = document.getElementById("photo-upload");
      const photo = photoInput.files[0];
      const formData = new FormData(form);
      this.presenter.onSubmitPhoto(photo, formData);
    });
  }

  handlePhotoChange(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 1024;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob.size > 1024 * 1024) {
            alert("Gambar terlalu besar (>1MB). Silakan ambil ulang.");
            return;
          }

          const previewUrl = URL.createObjectURL(blob);
          const photoPreview = document.getElementById("photo-preview");
          const cameraPreview = document.getElementById("camera-preview");

          photoPreview.src = previewUrl;
          photoPreview.style.display = "block";
          cameraPreview.style.display = "block";

          const compressedFile = new File([blob], "photo.jpg", {
            type: "image/jpeg",
          });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(compressedFile);

          document.getElementById("photo-upload").files = dataTransfer.files;
          document.getElementById("photo-camera").files = dataTransfer.files;
        },
        "image/jpeg",
        0.85
      );
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  captureImageFromVideo(video) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  canvasToFile(canvas, callback) {
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "captured-photo.jpg", {
          type: "image/jpeg",
        });
        callback(file);
      },
      "image/jpeg",
      0.95
    );
  }

  showLoadingOverlay(text) {
    this.overlay = document.createElement("div");
    this.overlay.className = "loading-overlay";
    this.overlay.textContent = text;
    document.body.appendChild(this.overlay);
    gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  }

  hideLoadingOverlay() {
    if (this.overlay) {
      gsap.to(this.overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => this.overlay.remove(),
      });
    }
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
