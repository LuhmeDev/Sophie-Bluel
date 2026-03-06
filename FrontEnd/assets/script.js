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
}

class Filtre {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  createFiltreHTML() {
    const button = document.createElement("button"); // Crée un bouton
    button.textContent = this.name; // ajoute le texte du bouton
    button.classList.add("filtre-btn"); // ajoute une class
    button.dataset.id = this.id; // Stocke l'id de la catégorie dans le bouton
    button.addEventListener("click", () => {
      // ajoute un éveènement lorsque je clique sur le bouton
      filtrerProjets(this.id); // Appelle la fonction de filtrage avec l'id
      setActiveButton(button); // Met à jour le bouton actif
    });

    // retourne le boutton pour l'injecter dans le DOM
    return button;
  }
}

const projets = [];
const filtres = [];

fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((data) => {
    console.log("data de l'api", data);

    const gallery = document.getElementById("gallery"); // const pour récuprér la div gallery ou je vais injecter tous les nouveaux projets

    data.forEach((work) => {
      const projet = new Projet(
        work.id,
        work.userId,
        work.title,
        work.imageUrl,
        work.category,
      ); // Nouvelle instance pour chaque projet en récupérant la class projet créer pour et s'en servir de partern d'instance
      projets.push(projet); // push le nouveau projet dans le tableau projets

      gallery.appendChild(projet.createGalleryHTML()); // Injection dans le DOM
    });

    console.log("projet :", projets); // Toutes tes instances
  });

fetch("http://localhost:5678/api/categories")
  .then((response) => response.json())
  .then((data) => {
    const filtrecontainer = document.getElementById("filtrecontainer");

    const buttonTous = document.createElement("button");
    buttonTous.textContent = "Tous";
    buttonTous.classList.add("filtre-btn", "active"); // Actif par défaut
    buttonTous.addEventListener("click", () => {
      filtrerProjets(null); // null = afficher tout
      setActiveButton(buttonTous);
    });
    filtrecontainer.appendChild(buttonTous);

    data.forEach((category) => {
      const filtre = new Filtre(category.id, category.name);

      filtres.push(filtre);

      filtrecontainer.appendChild(filtre.createFiltreHTML());
    });
    console.log("filtres", filtres);
  });

// Fonction de filtrage
function filtrerProjets(categoryId) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = ""; // Vide la galerie

  const projetsFiltres =
    categoryId === null
      ? projets // Si "Tous", affiche tout
      : projets.filter((p) => p.category.id === categoryId); // Sinon filtre par id

  projetsFiltres.forEach((projet) => {
    gallery.appendChild(projet.createGalleryHTML());
  });
}

// Fonction pour gérer le bouton actif (optionnel mais recommandé pour le CSS)
function setActiveButton(activeButton) {
  document.querySelectorAll(".filtre-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  activeButton.classList.add("active");
}
