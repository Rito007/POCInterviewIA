const ws = new WebSocket('wss://localhost:3443');
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let debug_ai = document.getElementById("debug_ai");
let mediaRecorder= null;
let SILENCE_THRESHOLD = 55;
let SILENCE_MAX_SECONDS = 5;
let recordingVoice = false
let audioBuffer = []
let tempoVoz= null;
let iaFalar = false;
let talking = false;

let analyser;



ws.onopen = () => {
    console.log("Conectado ao WebSocket");
    debug_ai.innerHTML = "Conectado à IA";
};

ws.onmessage = async (event) => {
    if (event.data instanceof Blob) {
        try {
            iaFalar = true;
            const arrayBuffer = await event.data.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();

            debug_ai.innerHTML = "IA a falar...";
            source.onended = () => {
                iaFalar = false;
                startRecording();
                debug_ai.innerHTML = "Esperando sua resposta...";
            };
        } catch (err) {
            console.error("Erro ao reproduzir áudio:", err);
        }
        return;
    }


    try {
        const msg = JSON.parse(event.data);
        if (msg.type_message === "StringMessage") {
            debug_ai.innerHTML = msg.message;
        }
    } catch (e) {
        console.error("Erro ao parsear mensagem:", e);
    }
};

const startGreetingButton = document.getElementById("startCall");
startGreetingButton.onclick = async () => {
    const micReady = await setupMicrophone();
    startRecording();
    if (ws.readyState === WebSocket.OPEN && false) {
        ws.send(JSON.stringify({
            type_message: "StringMessage",
            status: "Greetings",
            message: ""
        }));
        debug_ai.innerHTML = "A iniciar Greeting...";
    }
    if(micReady)
    {
        console.log("Mic ready");
    }
    else
    {
        debug_ai.innerHTML = "Aceitar microfone";
    }
};

const stopCallButton = document.getElementById("stopCall");
stopCallButton.onclick = () => {
    recordingVoice = false;
    debug_ai.innerHTML = "Chamada parada.";
    console.log("Parar chamada");
};




const setupMicrophone = async ()=>{
    
    try{
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});  
        const permission = (await navigator.permissions.query({name:'microphone'})).state;
        console.log(permission);
        if(permission === 'granted')
        {
        
            setupMediaRecorder(stream);

            
            return true;
        }
        else{
            throw Error;
        }
        
    }
    catch(e){
        console.log(e.message);
        return false;
    }
}


const verificarSilencio =async ()=>{
    mediaRecorder.requestData();
    if(!recordingVoice)
        return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data)
    const db = getDecibels(data)    
    decibel_value.innerHTML= db.toFixed(2); 
    if(db >= SILENCE_THRESHOLD && !iaFalar)
    {
        console.log("Comecou a falar");
        talking = true
        tempoVoz = Date.now();
    }
    else if(db < SILENCE_THRESHOLD && talking)
    {
        if(Date.now()-tempoVoz > (SILENCE_MAX_SECONDS*1000))
        {
            talking = false;
            tempoVoz = null
            console.log("Parou de falar");
            stopRecording();
        }
    }
    setTimeout(verificarSilencio, 200)
}

const startRecording = async ()=>{
    audioBuffer = []
    recordingVoice = true
    verificarSilencio();
}


const stopRecording = async ()=>{
    recordingVoice = false;
    const blob = new Blob(audioBuffer,{type:'audio/webm'})
    ws.send(blob);
}


const getDecibels = (data)=>{
    let sum= 0;

    for(let i=0; i<data.length; i++)
    {
        const val = (data[i] - 128) /128;
        sum += val**2;
    }
    const rms  = Math.sqrt(sum/data.length)
    return 20*Math.log10(rms) +80;
}
const setupMediaRecorder = async (stream)=>{
    
    mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/webm; codecs=opus'});
    mediaRecorder.ondataavailable = (e)=>{
        audioBuffer.push(e.data);
    }
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    mediaRecorder.start();
}

