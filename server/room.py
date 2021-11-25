from typing import Dict, List
import uuid

# from user import User

class Room:
    def __init__(self, id, max_players):
        self._id = id # incrementing by one for each new room
        self._players = []
        self._max_players = max_players        
        self._chat_history: List[List] = []

    def is_free(self):        
        if len(self._players) >= self._max_players:
            free = False
        else:
            free = True
        
        return free

    def get_id(self):
        return self._id

    def append_to_chat_history(self, userId, username, message):
        self._chat_history.append([userId, username, message])

    def get_chat_history(self):
        return self._chat_history

    def assign_user(self, user):
        self._players.append(user)

    def is_user_present(self, userId: str):
        for room_player in self._players:
            print('room_player_id', room_player.get_id())
            print('message_player_id', userId)
            if room_player.get_id() == userId:
                return True
        
        return False

