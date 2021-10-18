import './styles/index.scss'
import { Machine, interpret } from 'xstate'
import { templateMachine } from './ts/TemplateMachine'

// ES6 import or TypeScript
import { io } from "socket.io-client";


const service = interpret(templateMachine)
    .onTransition(state => {
        console.log(state.value)
    })
    .start();


document.getElementById('openBtn').addEventListener('click', function () {
    // service.send('OPEN');

    // In case your front is not served from the same domain as your server, you have to pass the URL of your server.
    // const socket = io();
    
    const socket = io("http://127.0.0.1:5000/");

    // GOOD
    socket.on("connect", () => {
        // ...
        console.log("connect connect connect")

        socket.send('Xstate client has connected or sth')
    });
  
    socket.on("data", () => { /* ... */ });


    // var socket = io("http://127.0.0.1:5000/");
    // socket.on('connect', function() {
    //     socket.emit('my event', {data: 'I\'m connected!'});
    // });

});
const app = document.getElementById('#root')
