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
    const img = document.createElement("img");
    img.src = this.imageUrl;
    img.alt = this.title;
    return img;
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
  constructor(modalId, popupGalleryId, btnOpenId, btnCloseId) {
    this.modal = document.getElementById(modalId);
    this.popupGallery = document.getElementById(popupGalleryId);
    this.btnOpen = document.getElementById(btnOpenId);
    this.btnClose = document.getElementById(btnCloseId);

    this.btnOpen.addEventListener("click", () => this.open());
    this.btnClose.addEventListener("click", () => this.close());
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
  }

  open() {
    this.populateGallery();
    this.modal.style.display = "flex";
  }

  close() {
    this.modal.style.display = "none";
  }

populateGallery() {
  this.popupGallery.innerHTML = "";
  app.projets.forEach((projet) => { // ← app.projets
    this.popupGallery.appendChild(projet.createPopupHTML());
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
    this.popup = new Popup("modal", "popup-gallery", "btn-open-popup-container", "btn-close-popup");
  }

  init() {
    Api.chargerTout();
  }
}

const app = new App();
app.init();


 