// main.js
// Ce fichier est le point d'entrée unique de l'application.
// App.js est importé par plusieurs modules (Projet.js, Filtre.js, Popup.js...)
// Si on instanciait app directement dans App.js, chaque import de App.js
// risquerait de déclencher une nouvelle exécution et donc de créer plusieurs
// instances de app, causant des doublons dans la galerie et les tableaux.
// En isolant l'instanciation ici, on garantit qu'app est créé une seule fois
// et partagé par tous les modules via import { app } from "./main.js".

import { App } from "./App.js";

export const app = new App();
app.init();