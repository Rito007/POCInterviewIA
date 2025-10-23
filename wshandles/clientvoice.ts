import { RawData } from "ws"
import { MessageContext } from "../types/clientstatus"
import { promptIAAudio, SpeechToText } from "../iafunctions"

export async function handleClientVoice(data: Buffer, context :MessageContext[], safeSendAudio : Function) : Promise<MessageContext[]>{
    
    const transcription = await SpeechToText(data)
    if(transcription)
    {
        context.push({
        role: 'user',
        content : transcription.text
        })
    }
    else{
        throw Error("Erro na transcrição");
    }
    
    const {audio, contexto} = await promptIAAudio(context);
    safeSendAudio(audio)
    return contexto
}