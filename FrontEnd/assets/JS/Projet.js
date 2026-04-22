import { app } from "./main.js";
import {Api} from "./Api.js";
 
export class Projet {
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
      console.log("chargerProjets appelé, data.length :", data.length);
  console.log("app.projets avant :", app.projets.length);
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
      console.log("app.projets après :", app.projets.length);
  }
}