// Start with first post.
let counter = 0;

// Load posts 10 at a time.
const quantity = 10;
username = localStorage.getItem("username");
var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
);

//get chat name from URL
let params = new URLSearchParams(location.search);
const chatname = params.get("chatname");
localStorage.setItem("lastChat", chatname);
console.log(localStorage);

document.addEventListener(
  "DOMContentLoaded",

  () => {
   

    // after loading scroll to the bottom
    document.querySelector(".message-field").scrollTop = document.querySelector(
      ".message-field"
    ).scrollHeight;

    document
      .querySelector(".message-field")
      .addEventListener("scroll", scroll, false);


    // Connect to websocket



    // When connected
    socket.on("connect", () => {
      //load first messages
      socket.emit("joined", { chatname: chatname });

      document.querySelector("#message").onsubmit = () => {
        const message = document.querySelector(
          "#message textarea[name='message']"
        ).value;
        const time = new Date().toLocaleString(); // 11/16/2015, 11:18:48 PM

        const info = {
          message: message,
          time: time,
          chatname: chatname,
        };

        socket.emit("submit message", info);
        document.querySelector("#message textarea[name='message']").value = "";
        //prevent default reloading
        return false;
      };
    });

    // When a new message is announced, add to the list
    socket.on("add message", (msg) => {
      if (!msg.data) {
        document.querySelector(".no-msg").classList.remove("hide");
        return;
      }
      if (!document.querySelector(".no-msg").classList.contains("hide")) {
        document.querySelector(".no-msg").classList.add("hide");
      }

      msg.data.forEach((element) => {
        add_post(element);
        //scroll only if message is yours
        if (element.username == username) {
          document.querySelector(
            ".message-field"
          ).scrollTop = document.querySelector(".message-field").scrollHeight;
        }
      });
    });

    document.querySelector(".logout").onclick = function () {
      localStorage.removeItem("username");
      localStorage.removeItem("lastChat");
    };

    document.querySelector(".back").onclick = function () {
      localStorage.removeItem("lastChat");
    };

    //   window.history.pushState(null, "main", "/main");

    //   window.onpopstate = function (event) {
    //     localStorage.removeItem("lastChat");
    //   };
  }
);

// Load next set of messages.
function load(lastScrollHeight) {
  // Set start and end msg numbers, and update counter.
  const start = counter;
  const end = start + quantity - 1; // 10-19
  counter = end + 1; //20

  counter = {
      start:start,
      end:end,
      chatname:chatname
  }

    socket.emit("load_msgs", counter);
    socket.on("scrolling", (messages)=>{
        
    messages.data.forEach(add_post_end);

    //detecting last scrolling
    if (messages.data.length < 10) {
      end_message();
      document
        .querySelector(".message-field")
        .removeEventListener("scroll", scroll);
    }

    // return scroll to the place before loading
    var scrollDiff =
      document.querySelector(".message-field").scrollHeight - lastScrollHeight;
    document.querySelector(".message-field").scrollTop += scrollDiff;

    });
}

function add_post(data) {
  // add new message to the div bottom

  const template = Handlebars.compile(
    document.querySelector("#result").innerHTML
  );
  const content = template({ values: data });
  document.querySelector(".chat").innerHTML += content;
  // update counter because number of msgs +1
  counter++;
}

function add_post_end(data) {
  // add old messages to the top of div

  const template = Handlebars.compile(
    document.querySelector("#result").innerHTML
  );
  const content = template({ values: data });
  document.querySelector(".chat").innerHTML =
    content + document.querySelector(".chat").innerHTML;
}

function end_message() {
  // alert that all msgs are scrolled

  var li = document.createElement("li");
  li.appendChild(document.createTextNode("These are all messages!"));

  li.className = "text-center";

  document
    .querySelector(".chat")
    .insertBefore(li, document.querySelector(".chat").firstChild);
}

function scroll(event) {
  // handler loads ner msgs

  if (event.target.scrollTop === 0) {
    // store initial place of scroll
    var lastScrollHeight = event.target.scrollHeight;
    load(lastScrollHeight);
  }
}

// window.onpopstate = function (event) {
//   localStorage.removeItem("lastChat");
// };



  // Open new request to get new msgs.
//   const request = new XMLHttpRequest();
//   request.open("POST", "/load_msgs");
//   request.onload = () => {
//     const data = JSON.parse(request.responseText);

//     data.forEach(add_post_end);

//     //detecting last scrolling
//     if (data.length < 10) {
//       end_message();
//       document
//         .querySelector(".message-field")
//         .removeEventListener("scroll", scroll);
//     }

//     // return scroll to the place before loading
//     var scrollDiff =
//       document.querySelector(".message-field").scrollHeight - lastScrollHeight;
//     document.querySelector(".message-field").scrollTop += scrollDiff;
//   };

//   let params = new URLSearchParams(location.search);
//   const chatname = params.get("chatname");
//   // Add start and end points to request data.
//   const data = new FormData();
//   data.append("start", start);
//   data.append("end", end);
//   data.append("chatname", chatname);
//   // Send request.
//   request.send(data);