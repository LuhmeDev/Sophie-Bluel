export class Api {
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
    return Promise.all([Api.fetchWorks(), Api.fetchCategories()])
      .then(([works, categories]) => {
        return { works, categories }; 
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