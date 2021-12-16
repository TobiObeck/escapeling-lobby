import os
from datetime import datetime
from typing import List

from flask import Flask, send_from_directory, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room

from server_utils import get_free_room, find_room_of_user, filter_out_userid
from room import Room
from user import User

SECRET_KEY = os.environ.get('SECRET_KEY')

rooms: List[Room] = []
users: List[User] = []
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def catch_all(path):
    file_path = os.path.dirname(os.path.realpath(__file__))
    repo_root_path = os.path.abspath(os.path.join(file_path, ".."))
    my_path = os.path.abspath(repo_root_path + "/client/dist")
    print("path", path)
    print(my_path)
    print(os.path.dirname(app.instance_path))
    return send_from_directory(my_path, path)


@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('404.html'), 404 # TODO create 404.html

socketio = SocketIO(app, 
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True)
      

@socketio.on('join')
def handle_join(json):
    username = json["username"]
    userid = json["userid"]

    print(f"{username} ({userid}) joined!")

    # initialize user
    newUser = User(userid, username)
    users.append(newUser)
    
    # handle room assignment and join
    free_room = get_free_room(rooms)
    join_room(free_room.get_id())
    free_room.assign_user(newUser)
    
    free_room.add_user_joined_message_to_history(username, userid)
    
    connected_payload = {
        'username': username,
        'chathistory': filter_out_userid(free_room.get_chat_history()),
        'isadmin': free_room.is_player_admin(newUser),
        'usernames': free_room.get_player_names(),
        'showinstructionslocally': free_room.check_show_instructions_locally(),
        'showinstructionsglobally': free_room.check_show_instructions_globally()
    }

    print(connected_payload)

    emit("user-connected", connected_payload, room=free_room.get_id())

@socketio.on('send_message')
def handle_send_message(json):
    # get room of user
    chat_room = find_room_of_user(json['userId'], rooms)

    # store message to room chat history
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    chat_room.append_to_chat_history(current_time, json['userId'], json['username'], json['msg'])

    # send message to all users within that room
    chat_payload = {
        "time": current_time,
        "username": json["username"],
        "msg": json["msg"]
    }

    emit("broadcast-message", chat_payload, room=chat_room.get_id())

if __name__ == '__main__':
    socketio.run(app)