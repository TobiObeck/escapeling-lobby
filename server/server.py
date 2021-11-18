from typing import List
from flask import Flask
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from room import Room
from user import User
import uuid

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

    # random stuff for testing
    emit("user-connected", json["username"] + ' has entered the room.', room=free_room.get_id())

    print("printing all the connected users")
    for user in users:
        print(user._user_socket_id, user._name)

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

@socketio.on('send_message')
def handle_send_message(json):
    print("handle_send_message()", json)
    
    # get room of user
    chat_room = find_room_of_user(json['userId'])

    print("rooms", rooms, len(rooms))
    print("chat_room", chat_room)

    # store message to room chat history
    chat_room.append_to_chat_history(json['userId'], json['msg'])

    # send message to all users within that room    
    
    payload = {
        "username": json["username"],
        "msg": json["msg"]
    }

    print("payload", payload)
    
    emit("broadcast-message", payload, room=chat_room.get_id())


if __name__ == '__main__':
    socketio.run(app)
