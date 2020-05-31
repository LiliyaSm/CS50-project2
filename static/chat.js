// Start with first message.
let counter = 0;
// Load messages 10 at a time.
const quantity = 10;

document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const chatname = localStorage.getItem("lastChat");

  // Connect to websocket
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  socket.on("connect", () => {
    //When connected to websocket load first 10 messages
    socket.emit("joined", { chatname: chatname });

    // submit new message info
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
      //prevent default reloading and clear the field
      document.querySelector("#message textarea[name='message']").value = "";
      return false;
    };
  });

  // When a message is announced, add to the list
  socket.on("add message", (msg) => {
    if (!msg.data) {
      document.querySelector(".no-msg").classList.remove("hide");
      return;
    }
    if (!document.querySelector(".no-msg").classList.contains("hide")) {
      document.querySelector(".no-msg").classList.add("hide");
    }

    var needToScroll = false;
    msg.data.forEach((element) => {
      //add scroll flag and close button
      if (element.username == username) {
        needToScroll = true;
        element.delete = true;
      }
      add_post(element);
    });

    // scroll to the bottom after first loading or if message is yours
    if (needToScroll || msg.forceScroll) {
      document.querySelector(
        ".message-field"
      ).scrollTop = document.querySelector(".message-field").scrollHeight;
    }
  });

  // handle scrolling old 10 messages event
  socket.on("scrolling", (messages) => {
    if (messages.data) {
      messages.data.forEach((element) => {
        if (element.username == username) {
          element.delete = true;
        }
        add_post_end(element);
      });
    }

    //detecting last scrolling
    if (!messages.data || messages.data.length < 10) {
      document
        .querySelector(".message-field")
        .removeEventListener("scroll", scroll);
      end_message();
    }
    // return scroll to the initial place
    const lastScrollHeight = localStorage.getItem("lastScrollHeight");
    var scrollDiff =
      document.querySelector(".message-field").scrollHeight - lastScrollHeight;
    document.querySelector(".message-field").scrollTop += scrollDiff;
  });

  //message deletion
  socket.on("delete message", (data) => {
    element = document.querySelector(`[data-id = "${data.messageId}"]`);

    if (element) {
      element.style.animationPlayState = "running";
      element.addEventListener("animationend", () => {
        element.closest(".chat-body").remove();
      });
    }
  });

  document
    .querySelector(".message-field")
    .addEventListener("scroll", scroll, false);

  document.querySelector(".logout").onclick = function () {
    localStorage.removeItem("username");
    localStorage.removeItem("lastChat");
  };

  document.querySelector(".back").onclick = function () {
    localStorage.removeItem("lastChat");
  };

  // Load next set of messages.
  function load(lastScrollHeight) {
    // Set start and end msg numbers, and update counter.
    const start = counter;
    const end = start + quantity - 1; // 0-9
    counter = end + 1; // 10

    info = {
      start: start,
      end: end,
      chatname: chatname,
    };

    socket.emit("load_msgs", info);
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
    // handler loads old msgs

    if (event.target.scrollTop === 0) {
      // store initial place of scroll
      var lastScrollHeight = event.target.scrollHeight;
      localStorage.setItem("lastScrollHeight", lastScrollHeight);

      load(lastScrollHeight);
    }
  }

  // get id of deleted message and info to the server
  document.addEventListener("click", (event) => {
    const element = event.target;
    if (element.className === "delete") {
      const li = element.closest(".chat-body");
      const messageId = li.dataset.id;
      info = {
        chatname: chatname,
        username: username,
        messageId: messageId,
      };
      socket.emit("delete message", info);
    }
  });
});
