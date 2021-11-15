class User:
    def __init__(self, socket_id, name):
        self._socket_id = socket_id # socket id from the client
        self._name = name # name entered by the user in the client UI
        self._room_id = None 

    def join_room(self, room):
        self._room_id = room._id
        room.add_player()