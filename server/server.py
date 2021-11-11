from flask import Flask
from flask_socketio import SocketIO, send, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, 
    cors_allowed_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:8080"],
    logger=True,
    engineio_logger=True)

@socketio.on('connection')
def handleConnection(msg):
    print('server got connection with msg:', msg)
    print('server has id', socketio.id)

# server-side event handler for an unnamed event:
@socketio.on('message')
def handle_message(data):    
    print('received message: ' + data)
    send(data, broadcast=True)

# The above example uses string messages. Another type of unnamed events use JSON data:
@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


# The most flexible type of event uses custom event names. 
# The message data for these events can be 
# string, bytes, int, or JSON:
@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))

if __name__ == '__main__':
    socketio.run(app)