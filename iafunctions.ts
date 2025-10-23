import fs from "fs";
import OpenAI, { toFile } from "openai";
import { MessageContext } from "./types/clientstatus";
import { Readable } from "stream";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Função completa para gerar áudio de entrevista com contexto
 * @param contexto Contexto atual da conversa (array de mensagens)
 * @returns Objeto com { texto, audio, contextoAtualizado }
 */
export async function promptIAAudio(
  contexto: MessageContext[],
): Promise<{ texto: string; audio: Buffer | null; contexto: MessageContext[] }> {
  try {
    // --- 1️⃣ Gerar texto ---
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: contexto,  
      max_completion_tokens: 800,
    });

    const textoGerado = response.choices[0].message.content?.trim() || "";
    console.log("🗣️ Texto gerado pela Cátia:", textoGerado.slice(0, 150) + "...");

    if (!textoGerado) {
      return { texto: "", audio: null, contexto };
    }

    // --- 2️⃣ Adicionar a resposta da IA ao contexto ---
    const contextoAtualizado : MessageContext[] = [
      ...contexto,
      { role: "assistant", content: textoGerado },
    ];

    // --- 3️⃣ Gerar áudio ---
    const speech = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: textoGerado,
    });

    const arrayBuffer = await speech.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("🎧 Áudio gerado com sucesso");

    return { texto: textoGerado, audio: buffer, contexto: contextoAtualizado };
  } catch (err: any) {
    console.error("❌ Erro ao gerar áudio:", err);
    return { texto: "Ocorreu um erro ao gerar a resposta.", audio: null, contexto };
  }
}

export async function SpeechToText(audioBuffer: Buffer)
{

  const convertedAudio = await toFile(Readable.from(audioBuffer), 'audio.mp3')
  const transcription = await client.audio.transcriptions.create({
        file: convertedAudio,
        model: "whisper-1",
        language: "pt"
    });
    return transcription;
}
