from typing import List
from flask import Flask
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from room import Room
from datetime import datetime
from user import User
import uuid

MIN_PLAYER_COUNT = 3
MAX_PLAYER_COUNT = 4
rooms: List[Room] = []
users: List[User] = []

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, 
    cors_allowed_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:8080"],
    logger=True,
    engineio_logger=True)
      

def get_free_room():
    is_every_room_full = True
    result_room = None

    # check if rooms exist and are empty
    for room in rooms:
        if room.is_free():
            is_every_room_full = False
            result_room = room
            break

    # create new room
    if is_every_room_full:
        room_id = str(uuid.uuid4())
        new_room = Room(id=room_id,
                        max_players=MAX_PLAYER_COUNT)
        rooms.append(new_room)
        result_room = new_room

    return result_room

def find_room_of_user(userId: str):
    for room in rooms:
        if room.is_user_present(userId):
            return room


@socketio.on('join')
def handle_join(json):
    print('received json!!!: ' + str(json))
    print('received user id: ' + json["userid"])
    print('received user username: ' + json["username"])

    # initialize user
    newUser = User(json["userid"], json["username"])
    users.append(newUser)
    
    # handle room assignment and join
    free_room = get_free_room()
    join_room(free_room.get_id())
    free_room.assign_user(newUser)
    
    chat_history = filter_out_userid(free_room.get_chat_history())

    print('here array or dict?', chat_history)

    connected_payload = {
        'username': json["username"],
        'chathistory': chat_history,
        'isadmin': free_room.is_admin(newUser)
    }

    emit("user-connected", connected_payload, room=free_room.get_id())
    
    # random stuff for testing
    # print("printing all the connected users")
    # for user in users:
    #     print(user._user_socket_id, user._name)

def filter_out_userid(chat_history):
    """
    remove userId, sensitive information, not intended for client
    """

    filtered_users = [{'time': msg_item['time'], 'username': msg_item['username'], 'msg': msg_item['msg']} for msg_item in chat_history]

    # alternative way to do it I guess
    # filtered_users = [{k: v for k, v in d.iteritems() if k != 'userid'} for d in free_room.get_chat_history()]

    return filtered_users


@socketio.on('send_message')
def handle_send_message(json):
    # get room of user
    chat_room = find_room_of_user(json['userId'])

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


# leftovers ----------------
"""
@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    send(username + ' has entered the room.', to=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send(username + ' has left the room.', to=room)
"""