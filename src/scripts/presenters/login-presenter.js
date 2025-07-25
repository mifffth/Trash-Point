import { loginUser, saveToken, resetPassword } from "../models/auth-model.js";
import { updateAuthUI } from "../utils/auth-ui.js";

export class LoginPresenter {
  constructor() {
    this.view = null;
  }

  setView(view) {
    this.view = view;
  }

  async onPageLoad() {
    this.view.render();
  }

  async onRegisterClicked() {
    this.view.navigateTo("#/register");
  }

  async onLoginSubmit(email, password) {
    this.view.showLoadingOverlay("Tunggu sebentar...");
    try {
      const token = await loginUser(email, password);
      saveToken(token);

      updateAuthUI();
      this.view.showAlert("Login berhasil!");
      this.view.navigateTo("#/stories");
    } catch (err) {
      this.view.showAlert(err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }

  async onForgotPassword(email) {
    if (!email) {
      this.view.showAlert(
        "Silakan masukkan alamat email Anda terlebih dahulu."
      );
      return;
    }
    this.view.showLoadingOverlay("Mengirim email reset password...");
    try {
      const result = await resetPassword(email);
      this.view.showAlert(result.message);
    } catch (err) {
      this.view.showAlert(err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}
