// ------------------- LOGIN -------------------
async function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    console.log(email);
    console.log(password);

    if (!email || !password) {
        message.textContent = "Please fill both fields.";
        message.style.color = "red";
        return;
    }

    try {
        const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        console.log(data.message);

        message.textContent = data.message || "Login response received";
        message.style.color = res.ok ? "green" : "red";

        // Redirect to /home if login successful
        if (res.ok && data.redirect) {
            localStorage.setItem("email", email);

            setTimeout(() => {
                window.location.href = data.redirect;
            }, 600);
        }
    } catch (err) {
        message.textContent = "Network error. Please try again.";
        message.style.color = "red";
    }
}

// Attach function to form
document.getElementById("loginform").addEventListener("submit", login);
