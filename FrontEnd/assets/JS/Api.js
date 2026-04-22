export class Api {
  static BASE_URL = "http://localhost:5678/api";

  static fetchWorks() {
    return fetch(`${Api.BASE_URL}/works`).then((response) =>
      response.json(),
    );
  }

  static fetchCategories() {
    return fetch(`${Api.BASE_URL}/categories`).then((response) =>
      response.json(),
    );
  }

  static deleteWork(id) {
    return fetch(`${Api.BASE_URL}/works/${id}`, {
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
    return fetch(`${Api.BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then((response) => {
      if (!response.ok) throw new Error("Identifiants invalides");
      return response.json();
    });
  }

  static addWork(formData) {
    return fetch(`${Api.BASE_URL}/works`, {
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