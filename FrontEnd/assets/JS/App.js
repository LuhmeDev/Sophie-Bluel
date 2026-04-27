import { Api } from "./Api.js";
import { Projet } from "./Projet.js";
import { Filtre } from "./Filtre.js";
import { Login } from "./Login.js";
import { PopupGalerie, PopupAjout } from "./Popup.js";
import { setActiveNav } from "./Active-nav.js";
setActiveNav();

export class App {
  constructor() {
    this.projets = [];
    this.filtres = [];
    this.login = new Login();
  }

  init() {
    this.login.checkAuth();
    this.login.updateUI();
    this.login.submitLogin();

    // On est sur index.html
    if (document.getElementById("gallery")) {
      Api.chargerTout().then(({ works, categories }) => {
        Projet.chargerProjets(works);
        Filtre.chargerFiltres(categories);
        this.popupGalerie = new PopupGalerie();
        this.popupAjout = new PopupAjout();
      });
    }
  }
  // setActiveNav() {
  //   const links = document.querySelectorAll("nav ul li a");
  //   links.forEach((link) => {
  //     if (link.href === window.location.href) {
  //       link.classList.add("active");
  //     }
  //   });
  // }
}
