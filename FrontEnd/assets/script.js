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
    btnDelete.classList.add("suppr-work-btn");
    icon.classList.add("fa-solid", "fa-trash-can", "supp-icon-btn");
    btnDelete.appendChild(icon);
    btnDelete.addEventListener("click", () => {
      Api.deleteWork(this.id)
        .then(() => {
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
        })
        .catch((err) => console.error("Erreur suppression :", err));
    });

    figure.appendChild(img);
    figure.appendChild(btnDelete);
    return figure;
  }

  static chargerProjets(data) {
    const gallery = document.getElementById("gallery");
    data.forEach((work) => {
      const projet = new Projet(
        work.id,
        work.userId,
        work.title,
        work.imageUrl,
        work.category,
      );
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

class PreviewUpload {
  constructor(containerId) {
    const container = document.getElementById(containerId);

    this.fileInput = document.getElementById("file-input");
    this.previewImg = container.querySelector("img");
    this.text = container.querySelector("span");

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
    }
  }

  reset() {
    this.fileInput.value = "";
    this.previewImg.src = this.defaultSrc;

    if (this.text) {
      this.text.style.display = "inline";
    }
  }
}

class Api {
  static fetchWorks() {
    return fetch("http://localhost:5678/api/works").then((response) =>
      response.json(),
    );
  }

  static fetchCategories() {
    return fetch("http://localhost:5678/api/categories").then((response) =>
      response.json(),
    );
  }

  static deleteWork(id) {
    return fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
  }

  static chargerTout() {
    Promise.all([Api.fetchWorks(), Api.fetchCategories()])
      .then(([works, categories]) => {
        Projet.chargerProjets(works);
        Filtre.chargerFiltres(categories);
        console.log("projets :", app.projets);
        console.log("filtres :", app.filtres);
      })
      .catch((err) => console.error("Erreur de chargement :", err));
  }

  static login(email, password) {
    return fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then((response) => {
      if (!response.ok) throw new Error("Identifiants invalides");
      return response.json();
      // retourne { userId: 1, token: "eyJ..." }
    });
  }

  static addWork(formData) {
    return fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: formData,
    }).then((response) => {
      if (!response.ok) throw new Error("Erreur ajout");
      return response.json();
    });
  }
}

class Login {
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

class App {
  constructor() {
    this.projets = [];
    this.filtres = [];
    this.login = new Login();
    // this.popup = new Popup("popup-container", "popup-gallery", "btn-open-popup-container", "btn-close-popup");
    // this.popupGalerie = new PopupGalerie();
    // this.popupAjout = new PopupAjout();
  }

  init() {
    this.login.checkAuth();
    this.login.updateUI();
    this.login.submitLogin();
    this.setActiveNav();

    // On est sur index.html
    if (document.getElementById("gallery")) {
      Api.chargerTout();
      this.popupGalerie = new PopupGalerie();
      this.popupAjout = new PopupAjout();
    }
  }
    setActiveNav() {
    const links = document.querySelectorAll('nav ul li a');
    links.forEach(link => {
      if (link.href === window.location.href) {
        link.classList.add('active');
      }
    });
  }
}

const app = new App();
app.init();
