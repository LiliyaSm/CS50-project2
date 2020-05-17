if (localStorage.getItem("username")) {
  username = localStorage.getItem("username");
  window.location.href = `/main?username=${escape(username)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".close").onclick = function () {
    document.querySelector("#login-alert").classList.add("hide");
  };

  document.querySelector("#form").onsubmit = function () {
    // Initialize new request
    const username = document.querySelector(".username").value; // change class

    //     ^         Start of string
    // [a-z0-9]  a or b or c or ... z or 0 or 1 or ... 9
    // +         one or more times (change to * to allow empty string)
    // $         end of string
    // /i        case-insensitive

    var regex = /^[a-z0-9]{1,16}$/i;

    if (username.match(regex)) {
      localStorage.setItem("username", username);
      window.location.href = `/main?username=${escape(username)}`;
    } else {
      document.querySelector("#login-alert").classList.remove("hide");
      //clear input field
      document.querySelector("#form input[name='username']").value = "";
    }
    return false;
  };
});
