const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
const cors = require("cors");

const {
  get_free_room,
  find_room_of_user,
  filter_out_userid,
  get_room_name_by_index,
} = require("./server_utils");
const Room = require("./room");
const User = require("./user");
const { PORT } = require("./constants");

const app = express();
// Enable CORS for all routes
// app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// const PORT = process.env.PORT || 3000;

const rooms = [];
const users = [];

app.use(express.static("client/dist"));

app.get("/*", (req, res) => {
  res.sendFile("index.html", { root: "client/dist" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("Client disconnected RIP", socket.id);

    const disconnected_userid = socket.id;
    const room = rooms.find((room) =>
      room.is_user_present(disconnected_userid)
    );

    if (room) {
      const disconnected_user = room.get_user(disconnected_userid);

      room.add_user_left_message_to_history(
        disconnected_user.get_name(),
        disconnected_user.get_id()
      );

      const is_admin = room.is_player_admin(disconnected_user);

      room.remove_player(disconnected_userid);

      if (is_admin) {
        room.reassign_admin();
      }

      const disconnected_payload = {
        username: disconnected_user.get_name(),
        chathistory: filter_out_userid(room.get_chat_history()),
        users: room.get_players(),
        showinstructionslocally: room.check_show_instructions_locally(),
        showinstructionsglobally: room.check_show_instructions_globally(),
      };

      //   socket.to(room.get_id()).emit("user-disconnected", disconnected_payload);
      io.to(room.get_id()).emit("user-disconnected", disconnected_payload);
    }
  });

  socket.on("join", (json) => {
    const { username, userid } = json;

    console.log(`${username} (${userid}) joined!`);

    const newUser = new User(userid, username + 'ha!');
    users.push(newUser);

    const [room_index, free_room] = get_free_room(rooms);    
    socket.join(free_room.get_id());
    free_room.assign_user(newUser);

    free_room.add_user_joined_message_to_history(username, userid);

    const connected_payload = {
      username: username,
      chathistory: filter_out_userid(free_room.get_chat_history()),
      isadmin: free_room.is_player_admin(newUser),
      users: free_room.get_players(),
      showinstructionslocally: free_room.check_show_instructions_locally(),
      showinstructionsglobally: free_room.check_show_instructions_globally(),
      roomname: get_room_name_by_index(room_index),
    };

    console.log(connected_payload);

    //   socket.to(free_room.get_id()).emit("user-connected", connected_payload);
    // socket.emit("user-connected", connected_payload);
    io.to(free_room.get_id()).emit("user-connected", connected_payload);
  });

  socket.on("send_message", (json) => {
    const { userId, username, msg } = json;
    const chat_room = find_room_of_user(userId, rooms);

    if (chat_room) {
      const current_time = get_current_time_as_str();
      chat_room.append_to_chat_history(current_time, userId, username, msg);

      const chat_payload = {
        time: current_time,
        username: username,
        msg: msg,
      };

      io.to(chat_room.get_id()).emit("broadcast-message", chat_payload);
    }
  });
});

function get_current_time_as_str() {
  const now = new Date();
  const current_time = now.toTimeString().slice(0, 8);
  return current_time;
}
