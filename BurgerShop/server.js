import dotenv from "dotenv"
import express from "express"
import fs from "fs";
import path from "path"
import { json } from "stream/consumers";
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: "./.env"})

const host = process.env.HOST;
const port = process.env.PORT;
const SECRET_KEY = parseInt(process.env.SECRET_KEY);

const app = express();

// XOR encryption/decryption (simple demo; not secure)
function xorEncryptDecrypt(text, key) {
  if (typeof text !== "string") return "";
  return text
    .split("")
    .map((char) => String.fromCharCode(char.charCodeAt(0) ^ key))
    .join("");
}

function readDB() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "db.json"), "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // If db.json doesn't exist or is invalid, create a fresh structure
    const init = { users: [] };
    writeDB(init);
    return init;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(path.join(__dirname, "db.json"), JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write db.json:", err);
    throw err;
  }
}

app.use(express.json());

app.use(express.static(path.join(__dirname, "/public"))); 
//for showing static files like images, etc.

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname,"login.html"))
})

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"))
});

app.get("/home", (req, res, next) => {
    res.sendFile(path.join(__dirname,"home.html"));
})

app.get("/about", (req, res, next) => {
    res.sendFile(path.join(__dirname, "about.html"));
})

app.get("/order", (req, res, next) => {
    res.sendFile(path.join(__dirname, "order.html"));
})

app.get("/bill", (req, res, next) => {
    res.sendFile(path.join(__dirname, "bill.html"));
})

app.get("/addtheaddons", (req, res, next) => {
    res.sendFile(path.join(__dirname, "addons.html"));
})


// ===== API: SIGNUP =====
app.post("/api/signup", (req, res) => {
    const { username, email, password } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: "username, email and password are required." });
    }

    const db = readDB();
    
    const exists = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(400).json({ message: "User already exists." });

    const encrypted = xorEncryptDecrypt(password, SECRET_KEY);
    db.users.push({ username, email: email.toLowerCase(), password: encrypted });
    writeDB(db);

    return res.json({ message: "Signup successful" });
});


// ===== API: LOGIN =====
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "email and password are required." });
    }

    const db = readDB();
    const user = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (!user) return res.status(404).json({ message: "User not found." });

    const decrypted = xorEncryptDecrypt(user.password, SECRET_KEY);
    if (decrypted !== password) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.json({ message: "Login successful", redirect: "/home" });
});

// ===== API: FETCH BURGERS =====
app.get("/api/burgers", (req, res) => {
    const db = readDB();
    res.json(db.burgers || []);
});

// ===== API: POST ORDERS =====
app.post("/api/orders", (req, res) => {
    const { email, cart, total } = req.body;

    if (!email || !cart || cart.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    const db = readDB();
    if (!db.orders) db.orders = [];

    const userOrders = db.orders.filter(order => order.email === email);

    let nextOrderNumber = 1;
    if (userOrders.length > 0) {
        const orderNumbers = userOrders.map(order => {
            const parts = order.id.split("#");
            return parseInt(parts[1], 10);
        });
        nextOrderNumber = Math.max(...orderNumbers) + 1;
    }

    const newOrderId = `${email}#${nextOrderNumber}`;

    const newOrder = {
        id: newOrderId,
        email,
        items: cart,
        total,
        createdAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    writeDB(db);

    res.status(201).json({
        message: "Order placed successfully!",
        orderId: newOrderId,
        order: newOrder,
        redirect: "/bill"
    });
});

// ===== API: FETCH ORDERS =====
app.get("/api/orders", (req, res) => {
    const db = readDB();
    res.json(db.orders || []);
});

// ===== API: Generate Bill =====
app.post("/api/bill", (req, res) => {
    const { cart, email } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty, cannot generate bill." });
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.05; // 5% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Generate unique bill id
    const billId = "BILL-" + Date.now();

    const bill = {
        id: billId,
        email: email,
        items: cart,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        createdAt: new Date().toISOString()
    };

    // Optionally, you can save it in db.json under 'bills' if you want
    const db = readDB();
    if (!db.bills) db.bills = [];
    db.bills.push(bill);
    writeDB(db);

    return res.json({ message: "Bill generated successfully", bill });
});


app.get(/.*/, (req, res, next) => {
    res.send("Page not found");
})

app.listen(port, () => {
    console.log(`app is listening on http://${host}:${port}`)
})