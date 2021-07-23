import { AbstractEmitter } from "../../base/emitter"
import { Service } from '../../base/service'
import { Server } from 'socket.io'
import express from 'express'
import http from 'http'

export class Dashboard extends Service {
  emitter: AbstractEmitter
  constructor({ emitter }) {
    super()
    this.emitter = emitter

    const app = express();
    const server = http.createServer(app);

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html');
    });

    
    const io = new Server(8001)
    this.emitter.on('task:input', (input) => {
      io.emit('task:input', input)
    })
  }
}