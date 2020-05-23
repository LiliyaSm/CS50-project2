
document.addEventListener("DOMContentLoaded", () => {
  
  document.addEventListener("click", (event) => {
    const element = event.target;
    if (element.className === "close") {
      element.parentElement.classList.add("hide");

    }
  });

})



// document.addEventListener("DOMContentLoaded", () => {

//   document.querySelector("#form").onsubmit = function () {
//       const template = Handlebars.compile(document.querySelector("#alert").innerHTML);
//       const username = document.querySelector(".username").value.trim(); // change class

//     //     ^         Start of string
//     // [a-z0-9]  a or b or c or ... z or 0 or 1 or ... 9
//     // +         one or more times (change to * to allow empty string)
//     // $         end of string
//     // /i        case-insensitive

//     var regex = /^[a-z0-9 ]{1,16}$/i;

//     if (username.match(regex)) {
//       localStorage.setItem("username", username);
//       const request = new XMLHttpRequest();
//       request.open("POST", "/login");
//       request.onload = () => {
//         const data = JSON.parse(request.responseText);
//         // success - unique name
//         if (data.success) {
//           // window.location.href = `/chat?chatname=${escape(chatname)}`;
//           window.location.href = `/main/${username}`;
//         } else {
//           const alert = template({
//             text:
//               "Something went wrong! May be we already have the same user",
//           });
//             document.querySelector(".wrap-main").innerHTML =
//               alert + document.querySelector(".wrap-main").innerHTML;
//             close();
//           //clear input field
//           document.querySelector("#create input[name='create']").value = "";
//         }
//       };
//         const data = new FormData();
//         data.append("username", username);
//         request.send(data);

//     } else {
//         //does not match regex
//           const alert = template({
//             text:
//               "Login must be between 1 to 16 characters, contain only Latin letters, digits and spaces",
//           });
//           document.querySelector(".wrap-main").innerHTML =
//             alert + document.querySelector(".wrap-main").innerHTML;
//           close();
//       //clear input field
//       document.querySelector("#form input[name='username']").value = "";
//     }

    
//   };
// });

