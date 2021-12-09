class User:
    def __init__(self, user_socket_id, name):
        self._user_socket_id = user_socket_id # socket id from the client
        self._name = name # name entered by the user in the client UI

    def get_id(self):
        return self._user_socket_id
    
    def get_name(self):
        return self._name