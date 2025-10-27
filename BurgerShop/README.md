# 🍔 Burger Shop — Full-Stack Web Project  

A full-stack burger ordering system built using **Node.js**, **Express.js**, 
and a simple **file-based database (`db.json`)**.  
It simulates an online burger shop where **users** can browse and order burgers, 
while **admins** can manage products and view customer orders.  

--------------------------------------------------------------------------------------------

## 🚀 Features  

### 👥 Authentication  
- 🔐 **Admin/User login and signup**  
- 🧠 **Passwords encrypted** using XOR logic for demonstration  
- 💾 **Session persistence** — remembers the logged-in user using email in local storage  

### 🧑‍💼 Admin Panel  
- ➕ Add new products (name, price, addons, etc.)  
- 📦 Manage all user orders  
- 📈 View graphical sales data in the dashboard  

### 🛍️ User Interface  
- 🍔 Browse available burgers  
- 🧾 Select addons dynamically (extra cheese, fries, sauces, etc.)  
- 🛒 Add or remove items from cart  
- 💰 View auto-calculated total and grand total  
- 📦 Place orders — User can see past orders, instantly reflected on the admin panel.

### 🧾 Billing  
- ✅ Bill generation after successful order placement  
- 🧮 Auto calculation of burger + addons cost  

--------------------------------------------------------------------------------------------

## 🧠 Tech Stack  

|      Layer           |            Technologies Used                |
|:---------------------|:--------------------------------------------|
| **Frontend**         | HTML, CSS, JavaScript                       |
| **Backend**          | Node.js, Express.js                         |
| **Database**         | `db.json` file (mock DB)                    |
| **Authentication**   | XOR encryption & equality check             |
| **Storage**          | Public folder for images, JS, and CSS files |

--------------------------------------------------------------------------------------------

## 🧭 Pages Overview  

| Page | Description |
|------|--------------|
| **Home** | Displays all available burgers with images and prices |
| **Order** | Shows the user’s order history |
| **Bill** | Displays bill summary with total and addons |
| **About** | Information about the project and developer |


--------------------------------------------------------------------------------------------


## 📁 Folder Structure  

BurgerShop/
│
├── public/
│ ├── css/
│ │ ├── about.css
│ │ ├── addons.css
│ │ └── (other styles)
│ ├── images/
│ └── //all js files
│
├── //all html files
├── server.js
├── db.json
├── index.js
├── package.json
└── README.md

--------------------------------------------------------------------------------------------
## Screenshots

<p align="center">
  <img src="./screenshots/01 SignupPage.jpg" alt="Signup Page" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/02 LoginPage.jpg" alt="Login Page" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/03 AdminsHomePage.jpg" alt="Admin home Page" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/04 AdminAddBurgerPage1.jpg" alt="Admin Add Burger Page 1" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/04 AdminAddBurgerPage2.jpg" alt="Admin Add Burger Page 2" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/04 AdminAddBurgerPage3.jpg" alt="Admin Add Burger Page 3" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/05 AdminOrderPage.jpg" alt="Admin Order Page" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/06 AdminReportsPage_BarGrapgh.jpg" alt="Admin Reports Page BarGrapgh" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/06 AdminReportsPage_PieChart.jpg" alt="Admin Reports Page PieChart" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/07 UserHomePage.jpg" alt="User Home Page" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/08 UserHomePageCart.jpg" alt="User Home Page Cart" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/09 UserAddAddonsScreen.jpg" alt="User Add Addons Screen" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/10 UserOrderPage.jpg" alt="User Order Page" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/11 UserorderPlacedBillPage.png" alt="User Order Placed BillPage" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/12 UserPlaceOrderConfirmation.jpg" alt="User Place Order Confirmation" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/13 UserPlaceOrderConfirmedMessage.jpg" alt="User Place Order Confirmed Message" width="600"/>
</p>

<p align="center">
  <img src="./screenshots/14 AboutPage.jpg" alt="About Page" width="600"/>
</p>

--------------------------------------------------------------------------------------------

## 🧑‍💻 About the Developer  

Hi, I’m **Khan Junaid**, a passionate full-stack web developer who enjoys building secure, 
scalable, and creative applications.  
This project demonstrates practical backend logic, routing, and authentication using Node.js 
and Express.js.  
It’s intentionally kept simple and educational, with `db.json` as a mock database.

> 💡 *Note:*  
> This project was created for learning purposes — to explore how backend routes, authentication, 
> and file-based data management work together.

--------------------------------------------------------------------------------------------

## ⚙️ How to Run the Project  

1. Clone the repository  
   ```bash
   git clone https://github.com/JunaidKhan19/BurgerShop.git
   cd BurgerShop

2. Install dependencies
   npm install

3. Run the app
   npm run dev

4. Open your browser and go to
   👉 http://localhost:3000

--------------------------------------------------------------------------------------------

## 📫 Connect With Me  

<p align="center">
  <a href="mailto:khanjunaid1719@gmail.com" target="_blank">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
  </a>
  &nbsp;
  <a href="https://github.com/JunaidKhan19" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-000000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  &nbsp;
  <a href="https://www.linkedin.com/in/junaidkhan1719/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
</p>
