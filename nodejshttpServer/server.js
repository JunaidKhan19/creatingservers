import dotenv from "dotenv";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filname = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filname);

dotenv.config({path:"./.env"})

const host = process.env.HOST;
const port = process.env.PORT;

const server = http.createServer((req, res)=>{
    if(req.url === "/"){
        res.writeHead(200, {"Content-Type": "text/html"});
        const readStream = fs.createReadStream(path.join(__dirname, "mainPage.html"), "utf-8");
        readStream.pipe(res);
    } else if(req.url === "/home"){
        res.writeHead(200, {"Content-Type": "text/html"});
        const readStream = fs.createReadStream(path.join(__dirname, "home.html"), "utf-8");
        readStream.pipe(res);
    } else {
        res.writeHead(400, {"Content-Type": "text/plain"});
        res.end("Page not found");
    }
})

server.listen(port, () => {
    console.log(`server is listening on port http://${host}:${port}`);
})