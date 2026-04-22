import { app } from "./main.js";
import { Api } from "./Api.js";
import { Projet } from "./Projet.js";

export class Popup {
  constructor(popupContainerId, btnOpenId, btnCloseId) {
    this.popupContainer = document.getElementById(popupContainerId);
    this.btnClose = document.getElementById(btnCloseId);

    if (btnOpenId) {
      // ← seulement si un btnOpenId est fourni
      this.btnOpen = document.getElementById(btnOpenId);
      this.btnOpen.addEventListener("click", () => this.open());
    }

    this.btnClose.addEventListener("click", () => this.close());
    window.addEventListener("click", (e) => {
      if (e.target === this.popupContainer) this.close();
    });
  }

  open() {
    this.popupContainer.style.display = "flex";
  }

  close() {
    this.popupContainer.style.display = "none";
  }
}

export class PopupGalerie extends Popup {
  constructor() {
    super("popup-container", "btn-open-popup-container", "btn-close-popup");
    this.popupGallery = document.getElementById("popup-gallery");
    this.btnOpenAjout = document.getElementById("popup-button-ajouter");

    this.btnOpenAjout.addEventListener("click", () => {
      this.close(); // ferme la galerie
      app.popupAjout.open(); // ouvre la popup ajout
    });
  }

  open() {
    this.popupCreateGallery();
    super.open(); // ajouter super appelle open() du parent
  }

  popupCreateGallery() {
    this.popupGallery.innerHTML = "";
    app.projets.forEach((projet) => {
      this.popupGallery.appendChild(projet.createPopupHTML());
    });
  }
}

export class PopupAjout extends Popup {
  constructor() {
    super("popup-ajout-container", null, "btn-close-ajout");
    this.preview = new PreviewUpload("upload-container");
    this.btnValider = document.getElementById("popup-button-valider");
    this.titre = document.getElementById("titre");
    this.selectCategory = document.getElementById("select-category");
    this.fileInput = document.getElementById("file-input");
    this.chargerCategories();
    this.btnValider.disabled = true;
    this.titre.addEventListener("input", () => this.verifierFormulaire());
    this.selectCategory.addEventListener("change", () => this.verifierFormulaire());
    this.fileInput.addEventListener("change", () => this.verifierFormulaire());
    this.btnValider.addEventListener("click", () => this.submitForm());

    this.btnPrecedent = document.getElementById("btn-precedent-ajout");
    this.btnPrecedent.addEventListener("click", () => {
    this.close();
    app.popupGalerie.open();
  });
  }

  verifierFormulaire() {
    const titre = this.titre.value;
    const categorie = this.selectCategory.value;
    const fichier = this.fileInput.files[0];

    if (titre && categorie && fichier) {
      this.btnValider.disabled = false;
    } else {
      this.btnValider.disabled = true;
    }
  }

  chargerCategories() {
    this.selectCategory.innerHTML = "";
    Api.fetchCategories().then((categories) => {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        this.selectCategory.appendChild(option);
      });
    });
  }

  submitForm() {
    const title = this.titre.value;
    const category = this.selectCategory.value;
    const image = this.fileInput.files[0];

    if (!title || !category || !image) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image);

    const categoryId = parseInt(this.selectCategory.value);
    const categoryName = this.selectCategory.options[this.selectCategory.selectedIndex].text;

    Api.addWork(formData)
      .then((newWork) => {
        const projet = new Projet(
          newWork.id,
          newWork.userId,
          newWork.title,
          newWork.imageUrl,
          {
            id: categoryId,
            name: categoryName,
          },
        );
        app.projets.push(projet);

        const gallery = document.getElementById("gallery");
        gallery.appendChild(projet.createGalleryHTML());

        this.close();
        this.titre.value = "";
        this.preview.reset();
      })
      .catch((err) => console.error("Erreur ajout :", err));
  }
}

export class PreviewUpload {
  constructor(containerId) {
    const container = document.getElementById(containerId);

    this.fileInput = document.getElementById("file-input");
    this.previewImg = container.querySelector("img");
    this.text = container.querySelector("span");
    this.text2 = container.querySelector("p");
    this.label = container.querySelector("label");
    

    this.defaultSrc = this.previewImg.src;

    this.init();
  }

  init() {
    this.fileInput.addEventListener("change", () => this.handleChange());
  }

  handleChange() {
    const file = this.fileInput.files[0];
    if (!file) return;

    this.previewImg.src = URL.createObjectURL(file);

    if (this.text) {
      this.text.style.display = "none";
      this.text2.style.display = "none";
      this.label.style.margin = "0";
    }
  }

  reset() {
    this.fileInput.value = "";
    this.previewImg.src = this.defaultSrc;

    if (this.text) {
      this.text.style.display = "inline";
      this.text2.style.display = "inline";
      this.label.style.margin = "20px 0";
    }
  }
}