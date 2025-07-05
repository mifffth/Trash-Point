// test/src/scripts/presenters/story-add-presenter.js
import imageCompression from 'browser-image-compression';
import { submitPoint } from '../models/story-model.js';
// Removed: import { app, trashPoints, cloudinary_URL } from '../API/api.env';

export class PointAddPresenter {
  constructor() {
    this.view = null;
  }

  setView(view) {
    this.view = view;
  }

  async onPageLoad() {
    this.view.render();
  }

  async uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const response = await fetch('/.netlify/functions/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoBase64: reader.result }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload to Cloudinary via Netlify function');
          }

          const data = await response.json();
          resolve({
            secureUrl: data.secureUrl,
            publicId: data.publicId
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(new Error('Error reading file: ' + error.message));
      };
    });
  }

  async onSubmitPhoto(photo, formData) {
    if (!photo) {
      this.view.renderSubmitError('Foto wajib diunggah');
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true
    };

    let compressedPhoto;
    try {
      compressedPhoto = await imageCompression(photo, options);
    } catch (compressionErr) {
      this.view.renderSubmitError('Gagal mengompresi foto: ' + compressionErr.message);
      return;
    }

    if (compressedPhoto.size > 1048576) {
      this.view.renderSubmitError('Foto setelah kompresi masih lebih dari 1MB, mohon gunakan kamera web/pilih foto lain');
      return;
    }

    formData.set('photo', compressedPhoto);

    this.view.showLoadingOverlay('Mengunggah laporan...');

    try {
      const { secureUrl, publicId } = await this.uploadToCloudinary(photo); 

      const description = formData.get('description');
      const type = formData.get('type');
      const status = formData.get('status');
      const lat = parseFloat(formData.get('lat'));
      const lon = parseFloat(formData.get('lon'));

      const allowedTypes = ['bank sampah', 'tpa', 'tempat sampah umum'];
      const allowedStatuses = ['aktif', 'tidak aktif'];

      if (!allowedTypes.includes(type.toLowerCase())) {
        this.view.renderSubmitError('Tipe tidak valid. Pilih: bank sampah, TPA, atau tempat sampah umum.');
        return;
      }

      if (!allowedStatuses.includes(status.toLowerCase())) {
        this.view.renderSubmitError('Status tidak valid. Pilih: aktif atau tidak aktif.');
        return;
      }

      const pointData = {
        description: description,
        photoUrl: secureUrl,
        cloudinaryId: publicId,
        type: type.toLowerCase(),
        status: status.toLowerCase(),
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lon) ? null : lon,
      };

      await submitPoint(pointData);

      this.view.renderSubmitSuccess();
      this.view.navigateTo('#/stories');
    } catch (err) {
      console.error('Error in onSubmitPhoto:', err);
      this.view.renderSubmitError('Gagal menambahkan cerita: ' + err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}