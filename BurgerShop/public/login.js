// ------------------- LOGIN -------------------
async function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

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

        message.textContent = data.message || "Login response received";
        message.style.color = res.ok ? "green" : "red";

        // Redirect to /home if login successful
        if (res.ok && data.redirect) {
            localStorage.setItem("email", email);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role); // ✅ store admin/user role

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
