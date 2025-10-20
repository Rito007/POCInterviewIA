import express from "express";
import fs from "fs";
import https from "https";
import selfsigned from "selfsigned";
import path = require("path");
import router from "./routes/routes";



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

app.use(express.static(path.join(__dirname,"public")));
app.use("/", router);

