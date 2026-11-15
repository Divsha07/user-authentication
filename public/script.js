
const authSection = document.getElementById("authSection");
const profileSection = document.getElementById("profileSection");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const message = document.getElementById("message");
const profileMessage = document.getElementById("profileMessage");

const logoutButton = document.getElementById("logoutButton");

let token = sessionStorage.getItem("authToken");

// Switch to Login
loginTab.addEventListener("click", () => {
    loginForm.hidden = false;
    registerForm.hidden = true;

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    message.textContent = "";
});

// Switch to Register
registerTab.addEventListener("click", () => {
    loginForm.hidden = true;
    registerForm.hidden = false;

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    message.textContent = "";
});

// User Registration
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        message.textContent = data.message + " Please log in.";
        message.style.color = "green";

        registerForm.reset();

        loginForm.hidden = false;
        registerForm.hidden = true;

        loginTab.classList.add("active");
        registerTab.classList.remove("active");

        document.getElementById("loginEmail").value = email;

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
    }
});

// User Login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        token = data.token;
        sessionStorage.setItem("authToken", token);

        loginForm.reset();
        message.textContent = "";

        await loadProfile();

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
    }
});

// Load Protected Profile
async function loadProfile() {
    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await fetch("/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        authSection.hidden = true;
        profileSection.hidden = false;

        document.getElementById("profileEmail").textContent =
            data.user.email;

        const date = data.user.createdAt
            ? new Date(data.user.createdAt).toLocaleDateString()
            : "Not available";

        document.getElementById("profileDate").textContent = date;

    } catch (error) {
        sessionStorage.removeItem("authToken");
        token = null;
        showLogin();

        message.textContent = error.message;
        message.style.color = "red";
    }
}

// Logout
logoutButton.addEventListener("click", async () => {
    try {
        if (token) {
            const response = await fetch("/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }
        }

        profileMessage.textContent = "Logout successful!";
        profileMessage.style.color = "green";

    } catch (error) {
        profileMessage.textContent =
            "Session ended locally. " + error.message;
        profileMessage.style.color = "red";

    } finally {
        sessionStorage.removeItem("authToken");
        token = null;

        setTimeout(() => {
            showLogin();
        }, 800);
    }
});

// Show Login Screen
function showLogin() {
    authSection.hidden = false;
    profileSection.hidden = true;

    loginForm.hidden = false;
    registerForm.hidden = true;

    loginTab.classList.add("active");
    registerTab.classList.remove("active");
}

// Check existing session when page loads
if (token) {
    loadProfile();
} else {
    showLogin();
}

