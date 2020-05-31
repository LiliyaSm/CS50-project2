document.addEventListener("DOMContentLoaded", () => {
    element = document.querySelector(".close")
    if (element){
      element.addEventListener("click", () => {
        element.parentElement.classList.add("hide");
      });}
})