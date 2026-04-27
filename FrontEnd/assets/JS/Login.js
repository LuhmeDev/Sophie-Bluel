import { Api } from "./Api.js";
import { setActiveNav } from "./Active-nav.js";
setActiveNav();

export class Login {
  constructor() {
    this.token = sessionStorage.getItem("token");
    this.loginNav = document.getElementById("nav-login");
    this.btnPopup = document.getElementById("btn-open-popup-container");
    this.filtreContainer = document.getElementById("filtrecontainer");
    this.editMode = document.getElementById("edit-mode-container");
  }

  submitLogin() {
    const btnLogin = document.getElementById("login-boutton");
    const form = document.getElementById("login-form");

    if (btnLogin) btnLogin.addEventListener("click", () => this.handleSubmit());
    if (form)
      form.addEventListener("submit", () => {
        this.handleSubmit();
      });
  }

  handleSubmit() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("Mdp").value;

    Api.login(email, password)
      .then((data) => {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userId", data.userId);
        window.location.href = "index.html";
      })
      .catch((err) => {
        console.error(err);
        const msg = document.getElementById("error-msg");
        if (msg) msg.style.display = "block";
      });
  }

  /**
   * Met à jour le lien de navigation selon l'état de connexion.
   * - Connecté → affiche "logout" et gère la déconnexion au clic.
   * - Non connecté → affiche "login".
   */
  checkAuth() {
    if (!this.loginNav) return;

    if (this.token) {
      this.loginNav.textContent = "logout";
      this.loginNav.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        window.location.href = "index.html";
      });
    } else {
      this.loginNav.textContent = "login";
    }
  }

  /**
   * - Adapte l'interface selon que l'utilisateur est connecté ou non.
   * - Connecté → affiche le bouton popup et le mode édition, masque les filtres.
   * - Non connecté → masque le bouton popup et le mode édition, affiche les filtres.
   */
  updateUI() {
    const isLogged = Boolean(this.token);

    if (this.btnPopup) {
      if (isLogged) {
        this.btnPopup.style.display = "flex";
      } else {
        this.btnPopup.style.display = "none";
      }
    }

    if (this.filtreContainer) {
      if (isLogged) {
        this.filtreContainer.style.display = "none";
      } else {
        this.filtreContainer.style.display = "flex";
      }
    }

    if (this.editMode) {
      if (isLogged) {
        this.editMode.style.display = "flex";
      } else {
        this.editMode.style.display = "none";
      }
    }
  }
}