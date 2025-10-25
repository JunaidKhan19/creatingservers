import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { upload } from "./multer.js"; 

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

app.get("/addBurger", (req, res, next) => {
    res.sendFile(path.join(__dirname, "addBurger.html"));
})

app.get("/addtheaddons", (req, res, next) => {
    res.sendFile(path.join(__dirname, "addons.html"));
})

app.get("/reports", (req, res, next) => {
    res.sendFile(path.join(__dirname, "adminReports.html"));
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
    db.users.push({ 
        username, 
        email: email.toLowerCase(), 
        password: encrypted,
        role: "user" 
    });
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

    return res.json({ 
        message: "Login successful", 
        redirect: "/home",
        username: user.username,
        email: user.email,
        role: user.role
    });
});

// ===== API: ADD BURGERS =====
app.post("/api/burgers", upload.single("image"), async (req, res) => {
    try {
        const { role, name, desc, price } = req.body;

        if (role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Only admin can add burgers." });
        }

        const db = readDB();
        const burgers = db.burgers || [];

        let addons = [];
        if (req.body.addons) {
        try {
            addons = JSON.parse(req.body.addons);
        } catch {
            addons = [];
        }
        }

        const imagePath = req.file ? req.file.filename : (req.body.image || "default.jpg");

        const newBurger = {
            id: burgers.length > 0 ? burgers[burgers.length - 1].id + 1 : 1,
            name,
            desc,
            price: Number(price),
            image: imagePath,
            addons: addons.map((addon, index) => ({
                id: index + 1,
                name: addon.name,
                price: Number(addon.price),
            })),
        };

        burgers.push(newBurger);
        db.burgers = burgers;
        writeDB(db);

        res.status(201).json({
        message: "Burger added successfully!",
        burger: newBurger,
        });
    } catch (error) {
        console.error("Error adding burger:", error);
        res.status(500).json({ message: "Error adding burger" });
    }
});

// ===== API: DELETE BURGERS =====
app.delete("/api/burgers/:id", (req, res) => {
    const { role } = req.body;
    const burgerId = parseInt(req.params.id);

    if (role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Only admin can delete burgers." });
    }

    const db = readDB();
    const burgers = db.burgers || [];

    const burgerIndex = burgers.findIndex(b => b.id === burgerId);
    if (burgerIndex === -1) {
        return res.status(404).json({ message: "Burger not found." });
    }

    const imagePath = path.join(__dirname, "public", "images", burgers[burgerIndex].image);
    if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
            if (err) console.warn("Failed to delete image:", err);
        });
    }

    burgers.splice(burgerIndex, 1);
    db.burgers = burgers;
    writeDB(db);

    res.json({ message: "Burger deleted successfully!" });
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
    const { email, addons, price, actualPrice } = req.body;
    console.log("PUT body received:", req.body);
    console.log("Received actualPrice:", actualPrice);
    console.log("email:", email, " price: ", price);

    if (!email && !itemId) return res.status(400).json({ message: "Invalid request" });

    const db = readDB();
    const cartItem = db.cart.find(
        item => item.email === email && item.itemId === itemId
    );

    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    cartItem.actualPrice = actualPrice;

    if (Array.isArray(addons)) cartItem.addons = addons;
    if (typeof price === "number" && !isNaN(price)) cartItem.price = price;

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
            price: item.price,
            actualPrice: item.actualPrice,
            quantity : item.quantity,
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

    const encodedId = encodeURIComponent(newOrderId);
    res.status(201).json({
        success: true,
        message: "Order placed successfully!",
        orderId: newOrderId,
        order: newOrder,
        redirect: `/bill?orderId=${encodedId}`
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

app.get("/api/stats", (req, res) => {
    const db = readDB();
    const orders = db.orders;

    if (!orders || orders.length === 0) {
        return res.json({ message: "No orders yet.", stats: {} });
    }

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = orders.length;

    const burgerSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!burgerSales[item.name]) burgerSales[item.name] = 0;
            burgerSales[item.name] += item.price;
        });
    });

    const salesPerDay = {};
    orders.forEach(order => {
        const day = new Date(order.createdAt).toLocaleDateString();
        salesPerDay[day] = (salesPerDay[day] || 0) + order.totalAmount;
    });

    const avgOrderValue = totalSales / totalOrders;

    res.json({
        totalSales,
        totalOrders,
        avgOrderValue,
        burgerSales,
        salesPerDay
    });
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