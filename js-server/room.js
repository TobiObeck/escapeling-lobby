const User = require('./user');

class Room {
    constructor(id, max_players, min_players) {
        this._id = id; // incrementing by one for each new room
        this._players = [];
        this._max_players = max_players;
        this._min_players = min_players;
        this._chat_history = [];
        this._admin = null;
    }

    is_free() {
        return this._players.length < this._max_players;
    }

    get_id() {
        return this._id;
    }

    append_to_chat_history(time, userid, username, message, type = "user") {
        const message_item = {
            "time": time,
            "userid": userid,
            "username": username,
            "msg": message,
            "type": type
        };
        this._chat_history.push(message_item);
    }

    add_user_left_message_to_history(username, userid) {
        this.append_to_chat_history("", userid, username, "", "user-left");
    }

    add_user_joined_message_to_history(username, userid) {
        this.append_to_chat_history("", userid, username, "", "user-joined");
    }

    get_chat_history() {
        return this._chat_history;
    }

    assign_user(user) {
        this._players.push(user);

        if (this._admin === null) {
            this._admin = user;
            user.set_is_admin(true);
        }
    }

    reassign_admin() {
        if (this._players.length > 0) {
            this._players[0].set_is_admin(true);
            this._admin = this._players[0];
        } else {
            this._admin = null;
        }
    }

    is_user_present(userid) {
        return this._players.some(room_player => room_player.get_id() === userid);
    }

    get_user(userid) {
        return this._players.find(room_player => room_player.get_id() === userid) || null;
    }

    get_players() {
        const all_players = this._players.map(player => ({
            'name': player.get_name(),
            'id': player.get_id(),
            'is_admin': player.get_is_admin()
        }));

        return all_players;
    }

    remove_player(userid) {
        this._players = this._players.filter(user => user.get_id() !== userid);

        // no players are left, clean up messages in the room
        if (this._players.length === 0) {
            this._chat_history = [];
        }
    }

    is_player_admin(user) {
        return this._admin && this._admin.get_id() === user.get_id();
    }

    check_show_instructions_locally() {
        return this._players.length >= this._min_players;
    }

    check_show_instructions_globally() {
        return this._players.length === this._min_players;
    }
}

module.exports = Room;