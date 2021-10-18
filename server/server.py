from flask import Flask
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5500", "http://localhost:8080"], logger=True, engineio_logger=True)

@socketio.on('message')
def handleMessage(msg):
    print('message', msg)
    send(msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)