from typing import Dict, List
import uuid

# from user import User

class Room:
    def __init__(self, id, max_players):
        self._id = id # incrementing by one for each new room
        self._players = []
        self._max_players = max_players        
        self._chat_history: List[Dict] = []
        self._admin = None

    def is_free(self):        
        if len(self._players) >= self._max_players:
            free = False
        else:
            free = True
        
        return free

    def get_id(self):
        return self._id

    def append_to_chat_history(self, time, userId, username, message):
        
        message_item = {
            "time": time, 
            "userid": userId,
            "username": username,
            "msg": message
        }

        self._chat_history.append(message_item)

    def get_chat_history(self):
        return self._chat_history

    def assign_user(self, user):
        self._players.append(user)
        
        if self._admin is None:
            self._admin = user

    def is_user_present(self, userId: str):
        for room_player in self._players:
            if room_player.get_id() == userId:
                return True
        
        return False

    def get_player_names(self) -> List[str]:                
        return [player.get_name() for player in self._players]

    def is_admin(self, user):
        if self._admin.get_id() == user.get_id():
            admin_role = True
        else:
            admin_role = False

        return admin_role
        
        
    