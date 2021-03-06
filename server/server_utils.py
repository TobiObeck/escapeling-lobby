import uuid
from typing import List
from room import Room
from constants import MAX_PLAYER_COUNT, MIN_PLAYER_COUNT


def get_free_room(rooms: List[Room]):
    """Checks whether there is a room with a free spot or the server creates a new one"""

    is_every_room_full = True
    result_room = None
    room_index = -1

    # check if rooms exist and are empty
    for i, room in enumerate(rooms):
        if room.is_free():
            is_every_room_full = False
            result_room = room
            room_index = i
            break

    # create new room
    if is_every_room_full:
        room_id = str(uuid.uuid4())
        new_room = Room(id=room_id,
                        max_players=MAX_PLAYER_COUNT,
                        min_players=MIN_PLAYER_COUNT)
        rooms.append(new_room)
        room_index = len(rooms)-1
        result_room = new_room

    return (room_index, result_room)

def find_room_of_user(userId: str, rooms: List[Room]):
    for room in rooms:
        if room.is_user_present(userId):
            return room

def filter_out_userid(chat_history):
    """
    remove userId, sensitive information, not intended for client
    """

    filtered_users = [{key: val for key, val in d.items() if key != 'userid'} for d in chat_history]

    return filtered_users

def get_room_name_by_index(room_index: int):
    room_names = [
        "Spaceship",
        "Starbase",
        "Asteroid",
        "Hyperdrive",
        "Zealot",
        "Hyperion",
        "Protoss",
        "Zurk",
        "Klinğon",
        "Kaplumbağa"
    ]

    room_name = ""

    if room_index <= len(room_names)-1:
        room_name = room_names[room_index] + " " + str(room_index+1)
    else:
        room_name = str(room_index+1)

    return room_name
    