// username = localStorage.getItem("username");

if (localStorage.getItem("lastChat")) {
  window.location.href = `/chat?chatname=${localStorage.getItem("lastChat")}`;
}

document.addEventListener("DOMContentLoaded", () => {
  element = document.querySelector(".close");
  if (element) {
    element.addEventListener("click", () => {
      element.parentElement.classList.add("hide");
    });
  }
});
