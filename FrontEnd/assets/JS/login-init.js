// login-init.js
// Ce fichier est le point d'entrée de la page login.html.
// On n'utilise pas App.js ici car il chargerait toute l'application (galerie, popups...)
// ce qui n'est pas nécessaire sur la page de connexion.
// On instancie uniquement Login pour gérer l'authentification.

import { Login } from "./Login.js";

const login = new Login();
login.checkAuth();
login.submitLogin();