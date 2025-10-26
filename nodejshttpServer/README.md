This is a server based on node.js (http module).
http modules creates a server that shows the html pages when hitting the routes (eg:- /home, /about, etc..)
This mechanism is for understanding how the frontend logic is being served on server.

The fs module of node.js helps to read the html files and and write it on the server.
fs.createReadStream method takes the file path as the parameter and reads it and this is stored in a readStream variable.
this readStream  variable now can send the readed data by using .pipe() method.

fileURLToPath is used to work with directory in module-type js files.

Steps to create server:
//in the server.js file
//step1: write the import statements
import dotenv from "dotenv";
import http from "http"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "fileURLToPath"

step2: declaration of the filepath and dotenv variables  
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({path: "./.env"})

const host = process.env.HOST;
const post = process.env.PORT;


//step3: create and listen server
const server = http.createServer((req, res)=>{})

server.listen(port, ()=>{
    console.log(`server listening on http://${host}:${port}`)
})

//step4: writing server-sites logic
//now inside the(   const server = http.createServer((req, res)=> { //here we rite logic })   )

const server = http.createServer((req, res)=>{
    if(req.url === "/"){
        res.writeHead(200, {"content-type" : "text/html"});
        const readStream = fs.createReadStream(path.join(__dirname, "mainpage.html"), "utf-8");
        readStream.pipe(res);
    } else if(req.url === "/home"){
        res.writeHead(200, {"content-type" : "text/html"});
        const readStream = fs.createReadStream(path.join(__dirname, "home.html"), "utf-8");
        readStream.pipe(res)
    } else{
        res.writeHead(400, "content-type" : "text/plain");
        res.end("Page not found");
    }
})
