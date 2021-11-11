from typing import List
from flask import Flask
from flask_socketio import SocketIO, send, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, 
    cors_allowed_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:8080"],
    logger=True,
    engineio_logger=True)
class User:
    def __init__(self, socket_id, name):
        self._socket_id = socket_id # socket id from the client
        self._name = name # name entered by the user in the client UI
        self._room_id = None 

    def set_room(self, room_id):
        self._room_id = room_id

class Room:
    def __init__(self, id):
        self._id = id # incrementing by one for each new room
        self._number_players = 0 


rooms: List[Room] = []
users: List[User] = []

@socketio.on('join')
def handle_join(json):
    print('received json!!!: ' + str(json))
    print('received user id: ' + json["userid"])
    print('received user username: ' + json["username"])
    newUser = User(json["userid"], json["username"])
    users.append(newUser)

    print("printing all the connected users")
    for user in users:
        print(user._socket_id, user._name)

if __name__ == '__main__':
    socketio.run(app)