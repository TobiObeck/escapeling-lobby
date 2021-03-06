from typing import Dict, List, overload

from user import User

class Room:
    def __init__(self, id, max_players, min_players):
        self._id = id # incrementing by one for each new room
        self._players = []
        self._max_players = max_players
        self._min_players = min_players
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


    def append_to_chat_history(self, time, userid, username, message, type="user"):
        
        message_item = {
            "time": time, 
            "userid": userid,
            "username": username,
            "msg": message,
            "type": type
        }

        self._chat_history.append(message_item)

    def add_user_left_message_to_history(self, username, userid):
        self.append_to_chat_history("", userid, username, "", "user-left")
    
    def add_user_joined_message_to_history(self, username, userid):
        self.append_to_chat_history("", userid, username, "", "user-joined")


    def get_chat_history(self):
        return self._chat_history


    def assign_user(self, user):
        self._players.append(user)
        
        if self._admin is None:
            self._admin = user
            user.set_is_admin(True)

    def reassign_admin(self):
        if len(self._players) > 0:
            self._players[0]
            self._players[0].set_is_admin(True)
            self._admin = self._players[0]
        else:
            self._admin = None

    def is_user_present(self, userid: str):
        for room_player in self._players:
            if room_player.get_id() == userid:
                return True
        
        return False

    def get_user(self, userid: str):
        for room_player in self._players:
            if room_player.get_id() == userid:
                return room_player
        return None

    def get_players(self) -> List[str]:
        
        all_players: List[Dict] = []
        
        for i, player in enumerate(self._players):
            temp_player = {
                'name': player.get_name(),
                'id': player.get_id(),
                'is_admin': player.get_is_admin()
            }
            all_players.append(temp_player)

        return all_players

    def remove_player(self, userid):
        for i, user in enumerate(self._players):
            if user.get_id() == userid:
                del self._players[i]

        # no players are left, clean up messages in room
        if len(self._players) == 0:
            self._chat_history = []


    def is_player_admin(self, user: User):
        if self._admin.get_id() == user.get_id():
            admin_role = True
        else:
            admin_role = False

        return admin_role

    def check_show_instructions_locally(self):
        if len(self._players) >= self._min_players:
            show_instructions = True
        else:
            show_instructions = False
        
        # print('inside check function', show_instructions)
        return show_instructions
    
    def check_show_instructions_globally(self):
        if len(self._players) == self._min_players:
            show_instructions = True
        else:
            show_instructions = False
        
        return show_instructions