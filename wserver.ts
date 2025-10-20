import { WebSocketServer, WebSocket } from "ws";
import https from "https"
import ClientStatus from "./types/clientstatus"
import { Status } from "./types/status";
const clients = new Map<WebSocket,ClientStatus>();

export function setupWebSocket(server: https.Server)
{
    const wss = new WebSocketServer({server})

    wss.on('connection',(ws:WebSocket)=>{
        clients.set(ws, {status: Status.Greetings, context:""});




       
    })
}