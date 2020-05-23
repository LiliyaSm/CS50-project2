import os
import time
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_socketio import SocketIO, emit, join_room, leave_room

from loginRequired import login_required


app = Flask(__name__)

app.config["SECRET_KEY"] = os.urandom(24)
socketio = SocketIO(app)

# list of existing chats and chat creators {"username": username, "chatname": chatname}
global chat_list
chat_list = []
#{'chatname': [{'username': 'emma', 'message': 'n', 'time': '5/21/2020, 11:50:57 AM'}, {}}
global messages_list
messages_list = {}

global users
users = []


@app.route("/", methods=["POST", "GET"])
def index():
     #initial page with login fields
    
    if 'username' in session:
        return redirect(url_for("main", username=session["username"]))

    if request.method == "POST":
        # check for empty fields
        username = request.form.get("username")
        if not (username and username.strip()):
            flash('Name can not be empty!', 'danger')
            return render_template("index.html")

        #check if unique
        if username in users:
            # add to session and redirect to search page
            flash('We already have such name', 'danger')
            return render_template("index.html")
        else:
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
    if request.method == "POST":
        chatname = request.form.get("chatname")
        if not (chatname and chatname.strip()):
            flash('Chatname can not be empty!', 'danger')
            return render_template("main.html", chat_list=chat_list)
        
        #check if unique
        for chat in chat_list:
            if chat["chatname"] == chatname:
                #check if duplicate of an existing chat
                flash('We already have such chatname! Please, Choose another one', 'danger')
                return render_template("main.html", chat_list=chat_list)

        else:
        # add to the list and redirect to search page
            chat_list.append({"username": username, "chatname": chatname.strip()})
            return redirect(url_for("chat", chatname=chatname))

    return render_template("main.html", chat_list=chat_list)


# @app.route("/create_page", methods=["POST"])
# def create_page():
#     username = session["username"]
#     chatname = request.form.get("chatname")
#     for chat in chat_list:
#         if chat["chatname"] == chatname:
#             return jsonify({"success": False})
#     return jsonify({"success": True})


@app.route("/chat", methods=["GET", "POST"])
@login_required
def chat():
    # chatname = request.args.get("chatname")
    # messages = messages_list.get(chatname)
    # if messages:
    #     #load last 10
    #     messages = messages[len(messages)-10:len(messages)]
    return render_template("chat.html", username = session["username"])


# @app.route("/load_msgs", methods=["POST"])
# def load_msgs():

#     start = int(request.form.get("start"))
#     end = int(request.form.get("end"))
#     chatname = request.form.get("chatname")

#     try:
#         messages = list(reversed(messages_list.get(chatname)))
#         data = messages[start:end+1]
#     except Exception as e:
#         print(e)
#         data = None

#     # Generate list of msg.

#     # Artificially delay speed of response.
#     time.sleep(1)

#     # Return list of posts.
#     return jsonify(data)


@socketio.on('load_msgs')
def load_msgs(data):

    """ Load new messages after scrolling """

    start = data["start"]
    end = data["end"]
    chatname = data["chatname"] 

    try:
        messages = list(reversed(messages_list.get(chatname)))
        msgs = messages[start:end+1]
    except Exception as e:
        print(e)
        msgs = None

    room = chatname
    join_room(room)
    # Generate list of msg.

    # Artificially delay speed of response.
    time.sleep(1)

    # Return list of posts.
    emit("scrolling", {"data": msgs}, room=room, broadcast=False)


@socketio.on('joined')
def joined(data):
    chatname = data["chatname"] 
    room = chatname
    join_room(room)
    messages = messages_list.get(chatname)
    if messages:
    #     #load last 10
        messages = messages[len(messages)-10:len(messages)]
    # data["username"] = session["username"]

    #broadcast - false because direct msg
    emit("add message", {"data": messages}, room=room, broadcast=False)

@socketio.on("submit message")
def add_msg(data):
    chatname = data["chatname"]
    info = {"username": session["username"],
            "message": data["message"], 
            "time": data["time"]}

    room = chatname
    join_room(room)

    if chatname in messages_list:

        messages_list[chatname].append(info)
        #store only 100 last messages
        if len(messages_list[chatname]) > 100:
           del messages_list[0]
        print(messages_list)
    else:
        messages_list[chatname] = [info]
    data["username"] = session["username"]
    print(messages_list)
    emit("add message", {"data": [data]}, room=room, broadcast=True)
