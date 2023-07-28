const Room = require('./room');
const { MAX_PLAYER_COUNT, MIN_PLAYER_COUNT } = require('./constants');
const crypto = require('crypto')

function get_free_room(rooms) {
    let is_every_room_full = true;
    let result_room = null;
    let room_index = -1;

    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].is_free()) {
            is_every_room_full = false;
            result_room = rooms[i];
            room_index = i;
            break;
        }
    }

    if (is_every_room_full) {
        const room_id = crypto.randomUUID();
        const new_room = new Room(room_id, MAX_PLAYER_COUNT, MIN_PLAYER_COUNT);
        rooms.push(new_room);
        room_index = rooms.length - 1;
        result_room = new_room;
    }

    return [room_index, result_room];
}

function find_room_of_user(userId, rooms) {
    for (const room of rooms) {
        if (room.is_user_present(userId)) {
            return room;
        }
    }

    return null;
}

function filter_out_userid(chat_history) {
    const filtered_users = chat_history.map(({ userid, ...rest }) => rest);
    return filtered_users;
}

function get_room_name_by_index(room_index) {
    const room_names = [
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
    ];

    let room_name = "";

    if (room_index <= room_names.length - 1) {
        room_name = room_names[room_index] + " " + (room_index + 1);
    } else {
        room_name = String(room_index + 1);
    }

    return room_name;
}

module.exports = {
    get_free_room,
    find_room_of_user,
    filter_out_userid,
    get_room_name_by_index,
};
