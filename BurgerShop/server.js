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
const DB_PATH = path.join(__dirname, "db.json");


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
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
        const init = { users: [], burgers: [], cart: [], orders: [] };
        fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2), "utf8");
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

// app.use(express.static(path.join(__dirname, "/public"))); 
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

app.get("/bill/", (req, res, next) => {
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

// ------------------- ADD burger to cart -------------------
app.put("/api/cart", (req, res) => {
    const { email, cart } = req.body;

    if (!email || !cart || !Array.isArray(cart) || cart.length === 0) {
        console.log("Validation failed: missing email or empty cart");
        return res.status(400).json({ message: "Email and cart are required" });
    }

    const db = readDB();
    if (!db.cart) db.cart = [];


    const cartToSave = cart.map(item => ({
        email,
        id: item.id,
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        addons: item.addons|| [] // empty initially
    }));

    // Push each burger individually
    cartToSave.forEach(item => {
        db.cart.push(item);
    });

    writeDB(db); // ensure DB always written

    console.log("Cart saved successfully for user:", email);
    res.json({ message: "burger added to cart successfully"});
});


// ------------------- FETCH CART -------------------
app.get("/api/cart", (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const db = readDB();
    const cart = (db.cart || []).filter(item => item.email === email);
    res.json(cart);
});

// ------------------- UPDATE CART ITEM (Addons / Price / Quantity) -------------------
app.put("/api/cart/:itemId", (req, res) => {
    const { itemId } = req.params;
    const { email, addons, price } = req.body;

    if (!email && !itemId) return res.status(400).json({ message: "Invalid request" });

    const db = readDB();
    const cartItem = db.cart.find(
        item => item.email === email && item.itemId === itemId
    );

    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    if (!addons || !price) return console.log("no addons selected");

    cartItem.addons = Array.isArray(addons) ? addons : [];
    cartItem.price = price; 

    writeDB(db);

    res.json({ message: "Cart item updated", cartItem });
});

// ------------------- DELETE CART ITEM -------------------
app.delete("/api/cart/:itemId", (req, res) => {
    const { itemId } = req.params;
    const { email } = req.body;

    if (!email || !itemId) return res.status(400).json({ message: "Invalid request" });

    const db = readDB();
    const initialLength = db.cart.length;

    db.cart = db.cart.filter(
    item => !(item.email === email && item.itemId === itemId)
    );


    if (db.cart.length === initialLength) {
        return res.status(404).json({ message: "Cart item not found" });
    }

    writeDB(db);
    res.json({ message: "Cart item deleted" });
});



// ===== API: POST ORDERS =====
app.post("/api/placeOrder", (req, res) => {
    const { email, cart } = req.body;

    if (!email || !cart || cart.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    const db = readDB();
    db.orders = db.orders || [];

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

    const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0), 0);

    const newOrder = {
        id: newOrderId,
        email,
        items: cart.map(item => ({
            itemId: item.itemId || item.id,
            id: item.id,
            name: item.name,
            addons: item.addons || [],
            price: item.price
        })),
        totalAmount,
        createdAt: new Date().toISOString(),
        status: "Placed"
    };

    db.orders.push(newOrder);
    if (db.cart) {
        db.cart = db.cart.filter(item => item.email !== email);
    }
    writeDB(db);

    res.status(201).json({
        success: true,
        message: "Order placed successfully!",
        orderId: newOrderId,
        order: newOrder,
        redirect: `/bill?orderId=${newOrderId}`
    });
});



// ===== API: FETCH ORDERS =====
app.get("/api/orders", (req, res) => {
    const db = readDB();
    res.json(db.orders || []);
});

// ===== API: FETCH single order by orderId =====
app.get("/api/orders/:orderId", (req, res) => {
    const { orderId } = req.params;   
    const decodedOrderId = decodeURIComponent(orderId);
    const db = readDB();
    const order = db.orders.find(o => o.id === decodedOrderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
});

app.use(express.static(path.join(__dirname, "/public"))); 
//for showing static files like images, etc.

app.get(/.*/, (req, res, next) => {
    res.send("Page not found");
})

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(port, () => {
    console.log(`app is listening on http://${host}:${port}`)
})