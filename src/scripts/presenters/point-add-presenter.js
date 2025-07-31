import imageCompression from "browser-image-compression";
import {
  submitPoint,
  fetchPointById,
  updatePoint,
} from "../models/story-model.js";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../API/firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

export class PointAddPresenter {
  constructor() {
    this.view = null;
    this.pointId = null;
  }

  setPointIdForEdit(pointId) {
    this.pointId = pointId;
  }

  setView(view) {
    this.view = view;
  }

  async onPageLoad() {
    this.view.render();
    if (this.pointId) {
      this.view.showLoadingOverlay("Memuat data laporan...");
      try {
        const point = await fetchPointById(this.pointId);
        this.view.prefillForm(point);
      } catch (error) {
        this.view.renderSubmitError(error.message);
      } finally {
        this.view.hideLoadingOverlay();
      }
    }
  }

  async uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const response = await fetch("/.netlify/functions/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photoBase64: reader.result }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to upload to Cloudinary"
            );
          }
          const data = await response.json();
          resolve({ secureUrl: data.secureUrl, publicId: data.publicId });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(new Error("Error reading file: " + error.message));
      };
    });
  }

  async onSubmitPhoto(photo, formData) {
    if (!photo && !this.pointId) {
      this.view.renderSubmitError("Foto wajib diunggah");
      return;
    }

    this.view.showLoadingOverlay("Menyimpan laporan...");

    try {
      let secureUrl, publicId;
      let oldCloudinaryId = null;

      if (this.pointId && photo) {
        const existingPoint = await fetchPointById(this.pointId);
        if (existingPoint && existingPoint.cloudinaryId) {
          oldCloudinaryId = existingPoint.cloudinaryId;
        }
      }

      if (photo) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedPhoto = await imageCompression(photo, options);
        if (compressedPhoto.size > 1048576) {
          this.view.renderSubmitError(
            "Ukuran foto setelah kompresi melebihi 1MB."
          );
          this.view.hideLoadingOverlay();
          return;
        }
        const uploadResult = await this.uploadToCloudinary(compressedPhoto);
        secureUrl = uploadResult.secureUrl;
        publicId = uploadResult.publicId;
      }

      const description = formData.get("description");
      const type = formData.get("type");
      const status = formData.get("status");
      const lat = parseFloat(formData.get("lat"));
      const lon = parseFloat(formData.get("lon"));

      const currentUser = auth.currentUser;
      if (!currentUser) {
        this.view.renderSubmitError(
          "User tidak ditemukan. Silakan login ulang."
        );
        this.view.hideLoadingOverlay();
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const currentUserName = userDocSnap.exists()
        ? userDocSnap.data().name
        : "Tidak diketahui";

      const pointData = {
        description,
        type: type.toLowerCase(),
        status: status.toLowerCase(),
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lon) ? null : lon,
      };

      if (secureUrl && publicId) {
        pointData.photoUrl = secureUrl;
        pointData.cloudinaryId = publicId;
      }

      if (this.pointId) {
        pointData.updatedAt = new Date().toISOString();
        pointData.lastEditedBy = currentUserName; 

        await updatePoint(this.pointId, pointData);
        this.view.renderSubmitSuccess("Laporan berhasil diperbarui!");

        if (oldCloudinaryId) {
          try {
            await fetch("/.netlify/functions/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ public_id: oldCloudinaryId }),
            });
          } catch (deleteError) {
            console.error(
              "Failed to delete old Cloudinary image, but report was updated:",
              deleteError
            );
          }
        }
      } else {
        pointData.submittedBy = currentUserName;
        pointData.userId = currentUser.uid;
        pointData.createdAt = new Date().toISOString();

        await submitPoint(pointData);
        this.view.renderSubmitSuccess("Laporan berhasil ditambahkan!");
      }

      this.view.navigateTo("#/stories");
    } catch (err) {
      console.error("Error in onSubmitPhoto:", err);
      this.view.renderSubmitError("Gagal menyimpan laporan: " + err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}
