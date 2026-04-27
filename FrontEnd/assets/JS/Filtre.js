import { app } from "./App-init.js";
import { Projet } from "./Projet.js";

export class Filtre {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  createFiltreHTML() {
    const button = document.createElement("button");
    button.textContent = this.name;
    button.classList.add("filtre-btn");
    button.dataset.id = this.id;
    button.addEventListener("click", () => {
      this.filtrerProjets(this.id);
      this.setActiveButton(button);
    });

    return button;
  }

  filtrerProjets(categoryId) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    const projetsFiltres =
      categoryId === null
        ? app.projets // ← app.projets
        : app.projets.filter((p) => p.category.id === categoryId);
    projetsFiltres.forEach((projet) => {
      gallery.appendChild(projet.createGalleryHTML());
    });
  }

  setActiveButton(activeButton) {
    document.querySelectorAll(".filtre-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    activeButton.classList.add("active");
  }
  static chargerFiltres(data) {
    const filtrecontainer = document.getElementById("filtrecontainer");

    const buttonTous = document.createElement("button");
    buttonTous.textContent = "Tous";
    buttonTous.classList.add("filtre-btn", "active");
    buttonTous.addEventListener("click", () => {
      const filtreTous = new Filtre(null, "Tous");
      filtreTous.filtrerProjets(null);
      filtreTous.setActiveButton(buttonTous);
    });
    filtrecontainer.appendChild(buttonTous);

    data.forEach((category) => {
      const filtre = new Filtre(category.id, category.name);
      app.filtres.push(filtre);
      filtrecontainer.appendChild(filtre.createFiltreHTML());
    });
  }
}