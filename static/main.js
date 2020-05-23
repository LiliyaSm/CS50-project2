// username = localStorage.getItem("username");



if (localStorage.getItem("lastChat")) {
      window.location.href = `/chat?chatname=${localStorage.getItem("lastChat")}`;
    }
    
    document.addEventListener("DOMContentLoaded", () => {
        
        document.addEventListener("click", (event) => {
            const element = event.target;
            if (element.className === "close") {
                element.parentElement.classList.add("hide");
            }
        });

        // localStorage.setItem("username", window.location.pathname) ;
    });
        
        
