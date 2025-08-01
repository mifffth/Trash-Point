import * as css from "../styles/styles.css";

import { LoginView } from "./views/login-view.js";
import { RegisterView } from "./views/register-view.js";
import { PointListView } from "./views/point-list-view.js";
import { PointAddView } from "./views/point-add-view.js";
import { NotFoundView } from "./views/not-found-view.js";
import { PointMapView } from "./views/point-map-view.js";

import { LoginPresenter } from "./presenters/login-presenter.js";
import { RegisterPresenter } from "./presenters/register-presenter.js";
import { PointListPresenter } from "./presenters/point-list-presenter.js";
import { PointAddPresenter } from "./presenters/point-add-presenter.js";
import { NotFoundPresenter } from "./presenters/not-found-presenter.js";
import { PointMapPresenter } from "./presenters/point-map-presenter.js";

import { updateAuthUI } from "./utils/auth-ui.js";

const main = document.querySelector("main");
const navbar = document.getElementById("main-nav");
const menuToggle = document.getElementById("menu-toggle");

function renderView() {
  const footer = document.getElementById("site-footer");
  let hash = window.location.hash || "#/";

  if (hash === "#/map") {
    if (footer) footer.style.display = "none";
  } else {
    if (footer) footer.style.display = "block";
  }

  const navLinks = document.querySelectorAll("#main-nav a");
  navLinks.forEach((link) => {
    link.classList.remove("nav-active");
  });

  const activeHash = hash === "#/" || hash === "" ? "#/stories" : hash;

  const activeLink = document.querySelector(
    `#main-nav a[href="${activeHash}"]`
  );
  if (activeLink && activeHash !== "#/add") {
    activeLink.classList.add("nav-active");
  }

  const token = localStorage.getItem("token");
  const loggedIn = !!token;
  if (
    !loggedIn &&
    !["#/login", "#/logout", "#/register", "#/stories", "#/map"].includes(hash)
  ) {
    alert("Anda harus masuk terlebih dahulu!");
    window.location.hash = "#/login";
    return;
  }

  document.startViewTransition(() => {
    let view = null;
    let presenter = null;
    const editMatch = hash.match(/^#\/edit\/(.*)$/);

    if (editMatch) {
      const pointId = editMatch[1];
      view = new PointAddView(main);
      presenter = new PointAddPresenter();
      presenter.setPointIdForEdit(pointId);
    } else {
      switch (hash) {
        case "":
        case "#/":
          view = new PointListView(main);
          presenter = new PointListPresenter();
          break;
        case "#/login":
          view = new LoginView(main);
          presenter = new LoginPresenter();
          break;
        case "#/stories":
          view = new PointListView(main);
          presenter = new PointListPresenter();
          break;
        case "#/map":
          view = new PointMapView(main);
          presenter = new PointMapPresenter();
          break;
        case "#/add":
          view = new PointAddView(main);
          presenter = new PointAddPresenter();
          break;
        case "#/register":
          view = new RegisterView(main);
          presenter = new RegisterPresenter();
          break;
        default:
          view = new NotFoundView(main);
          presenter = new NotFoundPresenter();
      }
    }
    view.setPresenter(presenter);
    presenter.setView(view);
    presenter.onPageLoad();

    setTimeout(() => {
      gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    });
  });
}

window.addEventListener("hashchange", renderView);
window.addEventListener("load", renderView);
window.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();

  document.getElementById("nav-logout").addEventListener("click", () => {
    const confirmLogout = window.confirm("Anda yakin ingin keluar?");

    if (confirmLogout) {
      localStorage.removeItem("token");
      updateAuthUI();

      const msg = document.createElement("div");
      msg.textContent = "Anda telah logout.";
      msg.className = "logout-message";
      main.innerHTML = "";
      main.appendChild(msg);

      gsap.fromTo(
        msg,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );

      setTimeout(() => {
        window.location.hash = "#/login";
      }, 1200);
    }
  });

  document.querySelectorAll("nav a, nav button").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      if (window.innerWidth > 768) {
        gsap.to(link, { scale: 1.1, duration: 0.2, ease: "power2.out" });
      }
    });

    link.addEventListener("mouseleave", () => {
      if (window.innerWidth > 768) {
        gsap.to(link, { scale: 1, duration: 0.2, ease: "power2.out" });
      }
    });
  });

  document.addEventListener("click", (e) => {
    const isClickInsideNav = navbar.contains(e.target);
    const isClickOnToggle = menuToggle.contains(e.target);
    if (!isClickInsideNav && !isClickOnToggle) {
      navbar.classList.remove("show");
    }
  });

  // commented so netlify will always load latest version on other's device too
  // if ("serviceWorker" in navigator) {
  //   window.addEventListener("load", () => {
  //     navigator.serviceWorker
  //       .register("./sw.bundle.js")
  //       .then((registration) => {
  //         console.log("SW registered:", registration);
  //       })
  //       .catch((error) => {
  //         console.error("SW registration failed:", error);
  //       });
  //   });
  // }
});
