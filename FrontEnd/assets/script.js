class Projet {
  constructor(id, title, imageUrl, category, userID) {
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
    const button = document.createElement("button");
    button.textContent = this.name;
    button.classList.add("filtre-btn");
    return button;
  }
}

const projets = [];
const filtres = [];

fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((data) => {
    const gallery = document.getElementById("gallery"); // const pour récuprér la div gallery ou je vais injecter tous les nouveaux projets

    data.forEach((work) => {
      const projet = new Projet(
        work.id,
        work.title,
        work.imageUrl,
        work.category,
        work.userId,
      ); // Nouvelle instance pour chaque projet en récupérant la class projet créer pour et s'en servir de partern d'instance
      projets.push(projet); // push le nouveau projet dans le tableau projets

      gallery.appendChild(projet.createGalleryHTML()); // Injection dans le DOM
    });

    console.log(projets); // Toutes tes instances
  });

fetch("http://localhost:5678/api/categories")
  .then((response) => response.json())
  .then((data) => {
    const filtrecontainer = document.getElementById("filtrecontainer");

    data.forEach((category) => {
      const filtre = new Filtre(category.id, category.name);

      filtres.push(filtre);

      filtrecontainer.appendChild(filtre.createFiltreHTML());
    });
    console.log(filtres);
  });
