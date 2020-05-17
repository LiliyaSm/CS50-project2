document.addEventListener("DOMContentLoaded", () => {
  // Connect to websocket
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  // When connected, configure buttons
  socket.on("connect", () => {
    document.querySelector("#message").onsubmit = () => {
      const message = document.querySelector("#message input[name='message']")
        .value;
      const time = new Date().toLocaleString(); // 11/16/2015, 11:18:48 PM
      const username = localStorage.getItem("username");

      //get chat name from URL
      let params = new URLSearchParams(location.search);
      const chatname = params.get("chatname");

      const info = {
        message: message,
        username: username,
        time: time,
        chatname: chatname,
      };

      socket.emit("submit message", info);
      document.querySelector("#message input[name='message']").value = "";
      //prevent default reloading
      return false;
    };
  });

  // When a new message is announced, add to the list
  socket.on("add message", (msg) => {
    const template = Handlebars.compile(document.querySelector('#result').innerHTML);

    const content = template({ "values": msg.data });
    document.querySelector(".chat").innerHTML += content;

    if (document.querySelector(".no-msg"))
      {document.querySelector(".no-msg").classList.add("hide")};
});
  
});
