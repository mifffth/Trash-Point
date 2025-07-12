export class RegisterView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `
      <a href="#register-form" class="skip-link">
        Lewati ke konten utama
      </a>

      <div id="register-container" style="display: flex; height: 100vh; font-family: 'Poppins', sans-serif;">
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px;">
          <h2 style="font-weight: 700; font-size: 24px; margin-bottom: 24px;">DAFTAR</h2>
          <p style="color: #676767; margin-bottom: 24px;">
            Silahkan daftar untuk membuat akun baru
          </p>
          <form id="register-form"
                tabindex="-1"
                role="main"
                class="register-form"
                style="width: 100%; max-width: 320px;">
            <div style="margin-bottom: 16px;">
              <label for="name">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Nama"
                aria-label="Masukkan nama lengkap anda"
                style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
                required 
              />
            </div>
            <div style="margin-bottom: 16px;">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Email@email.com"
                aria-label="Masukkan alamat email anda"
                autocomplete="email"
                style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
                required 
              />
            </div>
            <div style="margin-bottom: 24px;">
              <label for="password">Kata sandi</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Password (minimal 8 karakter)"
                minlength="8"
                aria-label="Masukkan password anda"
                autocomplete="new-password"
                style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
                required 
              />
            </div>
            <div style="text-align: center;">
              <button 
                type="submit" 
                style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                Daftar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    gsap.from(".register-form", {
      y: 50,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    const mainContent = document.querySelector("#register-form");
    const skipLink = document.querySelector(".skip-link");

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });

    const form = this.container.querySelector("#register-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
      this.presenter.onRegisterSubmit(name, email, password);
    });
  }

  renderRegisterSuccess() {
    alert("Pendaftaran berhasil!");
  }

  renderRegisterError(message) {
    alert(message);
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
