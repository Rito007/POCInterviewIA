import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import https from "https";
import selfsigned from "selfsigned";
import path = require("path");
import router from "./routes/routes";

dotenv.config();
import { setupWebSocket } from "./wserver";
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY não definida no .env!");
  process.exit(1);
}
const app = express();
const sslAttrs= [{
    name: "commonName",
    value: "localhost"
}];
if (!fs.existsSync('key.pem') || !fs.existsSync('cert.pem'))
{
    const sign = selfsigned.generate(sslAttrs,{days: 365});
    fs.writeFileSync('key.pem',sign.private);
    fs.writeFileSync('cert.pem',sign.cert);
}
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}
const server = https.createServer(options,app);
server.listen(3443);
console.log("Server iniciado");

app.use(express.static(path.join(__dirname,"public")));
app.use("/", router);
setupWebSocket(server);
console.log("Server WSS iniciado"); 

