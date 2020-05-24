// Start with first post.
let counter = 0;
// Load posts 10 at a time.
const quantity = 10;

const username = localStorage.getItem("username");
//get chat name from URL
let params = new URLSearchParams(location.search);
const chatname = params.get("chatname");


//save current chat for future sessions
localStorage.setItem("lastChat", chatname);

document.addEventListener(
  "DOMContentLoaded",
  () => {
          // after loading scroll to the bottom
          // document.querySelector(".message-field").scrollTop = document.querySelector(
          //   ".message-field"
          // ).scrollHeight;

          // Connect to websocket
          var socket = io.connect(
            location.protocol + "//" + document.domain + ":" + location.port
          );

          // When connected to websocket
          socket.on("connect", () => {
            //load first 10 messages
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
              document.querySelector(
                "#message textarea[name='message']"
              ).value = "";
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

            var needToScroll = false;
            msg.data.forEach((element) => {
                //scroll only if message is yours
                if (element.username == username) {
                    needToScroll = true;
                    element.delete = true;
                }
                add_post(element);
            });

            if (needToScroll || msg.forceScroll) {
              document.querySelector(
                ".message-field"
              ).scrollTop = document.querySelector(
                ".message-field"
              ).scrollHeight;
            }
          });
          
          // handle scrolling event from server
          socket.on("scrolling", (messages) => {
            if (messages.data) {
              messages.data.forEach(add_post_end);
            }

            //detecting last scrolling
            if (!messages.data || messages.data.length < 10) {
              // если последние 10??
              document
                .querySelector(".message-field")
                .removeEventListener("scroll", scroll);
              end_message();
            }
            // return scroll to the initial place
            const lastScrollHeight = localStorage.getItem("lastScrollHeight");
            var scrollDiff =
              document.querySelector(".message-field").scrollHeight -
              lastScrollHeight;
            document.querySelector(".message-field").scrollTop += scrollDiff;

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
            const end = start + quantity - 1; // 10-19
            counter = end + 1; //20

            counter = {
              start: start,
              end: end,
              chatname: chatname,
            };

            socket.emit("load_msgs", counter);
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
                localStorage.setItem("lastScrollHeight", lastScrollHeight);

                load(lastScrollHeight);
            }
          }
        });
