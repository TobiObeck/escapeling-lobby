import uuid

class Room:
    def __init__(self, id, max_players):
        self._id = id # incrementing by one for each new room
        self._number_players = 0 
        self._max_players = max_players
        self._chat_history = [[], []]  # mapping from user id to message (list keeps order of send messages)

    def is_free(self):        
        if self._number_players >= self._max_players:
            free = False
        else:
            free = True
        
        return free

    def add_player(self):
        self._number_players += 1

    def get_id(self):
        return self._id

    def append_to_chat_history(self, user, message):
        self._chat_history[0].append(user)
        self._chat_history[1].append(message)

    def get_chat_history(self):
        return self._chat_history
