import { WebSocketServer, WebSocket } from "ws";
import https from "https"
import ClientStatus from "./types/clientstatus"
import { Status } from "./types/status";
import { TypeMessage } from "./types/clientmessage";
import ClientMessage from "./types/clientmessage";
import { ClientMessageImpl } from "./types/clientmessage";
import handleGreetings from "./wshandles/greetings";
import { promptIAAudio } from "./iafunctions";
import { arrayBuffer } from "stream/consumers";
import { handleClientVoice } from "./wshandles/clientvoice";
const clients = new Map<WebSocket,ClientStatus>();



export function setupWebSocket(server: https.Server)
{
    const wss = new WebSocketServer({server})
    
    
    

    wss.on('connection',(ws:WebSocket)=>{
        clients.set(ws, {context:[]});
        console.log("WS CONNECTED");
        ws.on('message',async (data, isBinary)=>{
        
            try{

                console.log("recebido");
                 const safeSend = (msg: ClientMessage)=>{
                        if(ws.readyState === WebSocket.OPEN)
                        {
                            ws.send(JSON.stringify(msg));
                        }
                    }

                const safeSendAudio = (audio: Buffer | ArrayBuffer) => {
                if (ws.readyState === ws.OPEN) {
                    const bufferToSend = audio instanceof ArrayBuffer ? Buffer.from(audio) : audio;
                    ws.send(bufferToSend, { binary: true });
                }
                };
                if (!isBinary)
                {
                    const msg :ClientMessage  = ClientMessageImpl.fromJSON(JSON.parse(data.toString()));
                    if(msg.status === Status.Greetings) {
                        const contextoAtualizado = await handleGreetings(safeSend, safeSendAudio);
                        const clientStatus = clients.get(ws);
                        if (clientStatus) {
                            clientStatus.context = contextoAtualizado;
                        }
                    }
                }
                else if(isBinary)
                {
                    
                    const audioBlob = new Blob([Buffer.from(data as ArrayBuffer)], { type: 'audio/webm' });
                    const clientStatus = clients.get(ws);
                    if (clientStatus) {
                        const arrayBuffer =await audioBlob.arrayBuffer();
                        const contextoAtualizado = await handleClientVoice(Buffer.from(arrayBuffer),clientStatus.context,safeSendAudio)
                        clientStatus.context = contextoAtualizado;
                    }
                }
                
               
                
            }
            catch(e : any)
            {
                
                const msg : ClientMessage  = {
                    type_message: TypeMessage.StringMessage,
                    status: Status.Greetings,
                    message: e.message
                }
                ws.send(JSON.stringify(msg));
            }
           
           
        })
        ws.on('close', ()=>{
            console.log("WS DISCONNECTED");
        })
    })
}

