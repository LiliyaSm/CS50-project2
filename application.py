import os
import time
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_socketio import SocketIO, emit, join_room, leave_room
from loginRequired import login_required
import re


app = Flask(__name__)

app.config["SECRET_KEY"] = os.urandom(24)
socketio = SocketIO(app)

# list of existing chats and chat creators {"username": username, "chatname": chatname}
global chat_list
chat_list = []

#{'chatname': [{'username': 'emma', 'message': 'hello', 'time': '5/21/2020, 11:50:57 AM'}, {}]}
global messages_list
messages_list = {}

#list of users
global users
users = []

# unique id for every message
global message_id
message_id = 0


@app.route("/", methods=["POST", "GET"])
def index():
    """ Initial page with login fields """
    
    if 'username' in session:
        return redirect(url_for("main", username=session["username"]))

    if request.method == "POST":
        # check for empty fields
        username = request.form.get("username")
        if not (username and username.strip()):
            flash('Name can not be empty!', 'danger')
            return render_template("index.html")

        #check if this user is already on server
        if username in users:
            flash('We already have such name', 'danger')
            return render_template("index.html")
        else:
            # add to session and redirect to search page
            session["username"] = username.strip()
            users.append(username.strip())
            return redirect(url_for("main", username=session["username"]))

    return render_template("index.html")



@app.route("/logout", methods=['GET'])
def logout():
    """ Logout user and delete cookie """

    # Remove from list
    try:
        users.remove(session['username'])
    except ValueError:
        pass

    # Delete cookie
    session.clear()
    return redirect("/")


@app.route("/main/<string:username>", methods=["GET", "POST"])
@login_required

def main(username):

    """ Render main page with chat list"""

    if request.method == "POST":
        chatname = request.form.get("chatname")
        if not (chatname and chatname.strip()):
            flash('Chatname can not be empty!', 'danger')
            return render_template("main.html", chat_list=chat_list)
        
        #check if unique
        for chat in chat_list:
            if chat["chatname"].lower() == chatname.lower():
                #check if duplicate of an existing chat
                flash('We already have this chatname! Please, choose another one', 'danger')
                return render_template("main.html", chat_list=chat_list)

        pattern = r'^[a-z0-9 ]{1,16}$'
        if re.match(pattern, chatname, re.IGNORECASE):
        # add to the list and redirect to chat page
            chat_list.append({"username": username, "chatname": chatname.strip()})
            return redirect(url_for("chat", chatname=chatname))
        else:
            flash(
                'Chat name must be between 1 to 16 characters, contain only Latin letters, digits and spaces', 'danger')
            return render_template("main.html", chat_list=chat_list)
    return render_template("main.html", chat_list=chat_list)


@app.route("/chat/<string:chatname>", methods=["GET", "POST"])
@login_required

def chat(chatname):

    """ Render chat page """

    return render_template("chat.html", username=session["username"], chatname=chatname)


@socketio.on('load_msgs')
def load_msgs(data):

    """ Load old messages after scrolling """

    start = data["start"]
    end = data["end"]
    chatname = data["chatname"] 
    
    # Generate list of msgs
    try:
        messages = list(reversed(messages_list.get(chatname)))
        msgs = messages[start:end+1]
    except Exception as e:
        print(e)
        msgs = None

    # Artificially delay speed of response.
    time.sleep(1)

    # Return list of posts.
    emit("scrolling", {"data": msgs}, broadcast=False)


@socketio.on('joined')
def joined(data):

    """ Load last 10 messages after entering a chat room """

    chatname = data["chatname"]
    room = chatname
    join_room(room)

    messages = messages_list.get(chatname)
    if messages:
    #     #load last 10
        messages = messages[len(messages)-10:len(messages)]

    #broadcast - false because direct msg.
    emit("add message", {"data": messages, "forceScroll": True}, broadcast=False)

@socketio.on("submit message")
def add_msg(data):

    """ Add new messages to storage and return with username """

    global message_id
    chatname = data["chatname"]
    info = {"username": session["username"],
            "message": data["message"], 
            "time": data["time"],
            "message_id": message_id
            }

    #add additional info to data
    data["message_id"] = message_id
    data["username"] = session["username"]

    if chatname in messages_list:
        messages_list[chatname].append(info)
        #store only 100 last messages
        if len(messages_list[chatname]) > 100:
           del messages_list[0]
        print(messages_list)
    else:
        messages_list[chatname] = [info]
    message_id = message_id + 1

    emit("add message", {"data": [data]}, room=chatname, broadcast=True)


@socketio.on("delete message")
def del_message(data):

    """ Delete message from list """

    chatname = data["chatname"]
    messageId = int(data["messageId"])
    username = data["username"]

    #find message by author and id
    msg_to_del = [x for x in messages_list[chatname]
                  if (x['message_id'] == messageId and x['username'] == username)]

    print(msg_to_del)
    messages_list[chatname].remove(msg_to_del[0])
    print(messages_list[chatname])

    emit("delete message", {"messageId": messageId}, room=chatname)
    
