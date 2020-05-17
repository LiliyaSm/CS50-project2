document.addEventListener("DOMContentLoaded", () => {
  
document.querySelector(".close").onclick = function () {
  document.querySelector("#chat-alert").classList.add("hide");
};

  document.querySelector(".logout").onclick = function () {
    //redirect by flask on index page
    localStorage.removeItem("username");
    // window.location.href = "/index";
  };

  document.querySelector("#create").onsubmit = function () {
    const chatname = 
    document.querySelector("#create input[name='create']").value;

    const request = new XMLHttpRequest();
    request.open("POST", "/create_page");

    // Callback function for when request completes
    request.onload = () => {
      const data = JSON.parse(request.responseText);
      if (data.success) {
      window.location.href = `/chat?chatname=${escape(chatname)}`;
      console.log(localStorage.getItem("username"));
    } else {
      document.querySelector("#chat-alert").classList.remove("hide");

      //clear input field
      document.querySelector("#create input[name='create']").value = "";
        }

    };

    username = localStorage.getItem("username");
    // Add data to send with request
    const data = new FormData();

    data.append("username", username);
    data.append("chatname", chatname);

    // Send request to the server
    request.send(data);
    return false;

  };
});
