class Projet {
  constructor(id, userID, title, imageUrl, category) {
    this.id = id;
    this.userID = userID;
    this.title = title;
    this.imageUrl = imageUrl;
    this.category = {
      id: category.id,
      name: category.name,
    };
  }

  // Méthode qui crée les balises html et les imbriques entre-elle.
  //   Le patern souhaitait :
  //     <figure>
  //     <img src="" alt=""/>
  //     <figcaption></figcaption>
  //   </figure>

  createGalleryHTML() {
    // Création des éléments HTML
    const figure = document.createElement("figure"); // const pour crétion du conteneur principal figure
    const img = document.createElement("img"); // const pour création de la div image du projet
    const figcaption = document.createElement("figcaption"); // const pour la création de la div figcaption du projet

    // Attribution des valeurs qu'il y aura dans les balise créer via les constante
    img.src = this.imageUrl; // doit recevoir l'image reçu de la BDD
    img.alt = this.title; // doit recevoir le titre de l'image l'alt reçu de la BDD
    figcaption.textContent = this.title; // doit recevoir le titre du projet reçu de la BDD

    // Assemblage des éléments : img et figcaption sont ajoutés dans figure
    figure.appendChild(img); // ajoute la balise img dans la balise figure
    figure.appendChild(figcaption); // ajoute la balise figcaption dans la balise figure

    // Retourne la figure complète pour l'injecter dans le DOM
    return figure;
  }
  createPopupHTML() {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = this.imageUrl;
    img.alt = this.title;

    const btnDelete = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash-can");
    btnDelete.appendChild(icon);
    btnDelete.addEventListener("click", () => {
      Api.deleteWork(this.id).then(() => {
        // Supprime du tableau app.projets
        app.projets = app.projets.filter((p) => p.id !== this.id);
        // Supprime du DOM de la popup
        figure.remove();
        // Met à jour la galerie principale
        const gallery = document.getElementById("gallery");
        gallery.innerHTML = "";
        app.projets.forEach((projet) => {
          gallery.appendChild(projet.createGalleryHTML());
        });
      });
    });

    figure.appendChild(img);
    figure.appendChild(btnDelete);
    return figure;
  }

  static chargerProjets(data) {
    const gallery = document.getElementById("gallery");
    data.forEach((work) => {
      const projet = new Projet(work.id, work.userId, work.title, work.imageUrl, work.category);
      app.projets.push(projet); // ← app.projets
      gallery.appendChild(projet.createGalleryHTML());
    });
  }
}

class Filtre {
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

class Popup {
  constructor(popupContainerId, btnOpenId, btnCloseId) {
    this.popupContainer = document.getElementById(popupContainerId);
    this.btnClose = document.getElementById(btnCloseId);

    if (btnOpenId) { // ← seulement si un btnOpenId est fourni
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

class PopupGalerie extends Popup {
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

class PopupAjout extends Popup {
  constructor() {
    super("popup-ajout-container", null, "btn-close-ajout");
    this.btnValider = document.getElementById("popup-button-valider");
    this.btnValider.addEventListener("click", () => {
      this.submitForm();
    });
  }

  open() {
    this.chargerCategories();
    super.open();
  }

  chargerCategories() {
    const select = document.getElementById("select-category");
    select.innerHTML = "";
    Api.fetchCategories().then((categories) => {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });
    });
  }

  submitForm() {
    const title = document.getElementById("titre").value;
    const category = document.getElementById("select-category").value;
    const fileInput = document.getElementById("file-input");
    const image = fileInput.files[0];

    // Vérification que tous les champs sont remplis
    if (!title || !category || !image) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    // FormData construit automatiquement le multipart/form-data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image);

    Api.addWork(formData).then((newWork) => {
      // Ajoute le nouveau projet dans app.projets
      const projet = new Projet(newWork.id, newWork.userId, newWork.title, newWork.imageUrl, newWork.category);
      app.projets.push(projet);

      // Met à jour la galerie principale
      const gallery = document.getElementById("gallery");
      gallery.appendChild(projet.createGalleryHTML());

      // Ferme la popup et réinitialise le formulaire
      this.close();
      document.getElementById("titre").value = "";
      fileInput.value = "";
    });
  }
}

class Api {
  static fetchWorks() {
    return fetch("http://localhost:5678/api/works").then((response) =>
      response.json()
    );
  }

  static fetchCategories() {
    return fetch("http://localhost:5678/api/categories").then((response) =>
      response.json()
    );
  }

  static deleteWork(id) {
    return fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        "accept": "*/*"
      }
    });
  }

  static addWork(formData) {
    return fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        "accept": "application/json"
      },
      body: formData // FormData gère automatiquement le multipart/form-data
    }).then((response) => response.json());
  }

  static chargerTout() {
    Promise.all([Api.fetchWorks(), Api.fetchCategories()]).then(
      ([works, categories]) => {
        Projet.chargerProjets(works);
        Filtre.chargerFiltres(categories);
        console.log("projets :", app.projets); // ← app.projets
        console.log("filtres :", app.filtres); // ← app.filtres
      }
    );
  }
}

class App {
  constructor() {
    this.projets = [];
    this.filtres = [];
    // this.popup = new Popup("popup-container", "popup-gallery", "btn-open-popup-container", "btn-close-popup");
    // this.popupGalerie = new PopupGalerie();
    // this.popupAjout = new PopupAjout();
  }

  init() {
    Api.chargerTout();
    this.popupGalerie = new PopupGalerie();
    this.popupAjout = new PopupAjout();
  }
}

const app = new App();
app.init();


