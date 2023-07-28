class User {
   constructor(user_socket_id, name) {
       this._user_socket_id = user_socket_id; // socket id from the client
       this._name = name; // name entered by the user in the client UI
       this._is_admin = false;
   }

   get_id() {
       return this._user_socket_id;
   }

   get_name() {
       return this._name;
   }

   get_is_admin() {
       return this._is_admin;
   }

   set_is_admin(is_admin) {
       this._is_admin = is_admin;
   }
}

module.exports = User;