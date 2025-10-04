import dotenv from "dotenv"
import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: "./.env"})

const host = process.env.HOST;
const port = process.env.PORT;

const app = express();

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname,"home.html"));
})

app.get("/about", (req, res, next) => {
    res.sendFile(path.join(__dirname, "about.html"));
})

app.use(express.static(path.join(__dirname, "/public"))); 
//for showing static files like images, etc.

app.get(/.*/, (req, res, next) => {
    res.send("Page not found");
})

app.listen(3000, () => {
    console.log(`app is listening on http://${host}:${port}`)
})