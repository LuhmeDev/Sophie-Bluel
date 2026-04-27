export function setActiveNav() {
  const links = document.querySelectorAll("nav ul li a");
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
}