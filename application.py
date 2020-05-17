import os

from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)

app.config["SECRET_KEY"] = os.urandom(24)
socketio = SocketIO(app)

global chat_list
chat_list = []

global messages_list
messages_list = {}

@app.route("/")
def index():
     #initial page with login fields

    # if 'user_id' in session:
    #     return redirect(url_for("search"))

    return render_template("index.html")


@app.route("/main", methods=["GET"])
def main():
    username = request.args.get("username")
    print("main")
    print(username)
    return render_template("main.html", chat_list=chat_list)


@app.route("/create_page", methods=["POST"])
def create_page():
    username = request.form.get("username")
    chatname = request.form.get("chatname")
    for chat in chat_list:
        #check if duplicate of an existing chat
        if chat["chatname"] == chatname:
            return jsonify({"success": False})
    chat_list.append({"username": username, "chatname": chatname})
    return jsonify({"success": True})


@app.route("/chat", methods=["GET", "POST"])
def chat():
    chatname = request.args.get("chatname")
    messages = messages_list.get(chatname)
    return render_template("chat.html", messages= messages)


@socketio.on("submit message")
def vote(data):
    chatname = data["chatname"]
    info = {"username": data["username"],
            "message": data["message"], 
            "time": data["time"]}

    if chatname in messages_list:
        messages_list[chatname].append(info)
    else:
        messages_list[chatname] = [info]
    print(messages_list)
    emit("add message", {"data": data}, broadcast=True)
