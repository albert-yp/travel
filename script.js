const authTabs = document.querySelectorAll("[data-auth-switch]");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

if (authTabs.length && loginForm && registerForm && authMessage) {
    const savedUserKey = "travelUser";

    function showMessage(message, type) {
        authMessage.textContent = message;
        authMessage.className = "auth-message";

        if (type) {
            authMessage.classList.add(type);
        }
    }

    function setActiveForm(target) {
        authTabs.forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.authSwitch === target);
        });

        const isLogin = target === "login";

        loginForm.classList.toggle("active", isLogin);
        registerForm.classList.toggle("active", !isLogin);

        loginForm.hidden = !isLogin;
        registerForm.hidden = isLogin;

        window.location.hash = target;
    }

    authTabs.forEach((tab) => {
        tab.addEventListener("click", function (event) {
            event.preventDefault();
            setActiveForm(this.dataset.authSwitch);
        });
    });

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirm").value;

        if (name.length < 3) {
            showMessage("Nama harus diisi minimal 3 karakter.", "error");
            return;
        }

        if (password.length < 6) {
            showMessage("Password minimal 6 karakter.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Konfirmasi password belum sama.", "error");
            return;
        }

        const userData = { name, email, password };
        localStorage.setItem(savedUserKey, JSON.stringify(userData));

        registerForm.reset();
        setActiveForm("login");
        showMessage("Register berhasil. Sekarang silakan login dengan akun yang baru dibuat.", "success");
    });

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const savedUser = JSON.parse(localStorage.getItem(savedUserKey));

        if (!savedUser) {
            showMessage("Belum ada akun yang tersimpan. Silakan register terlebih dahulu.", "error");
            setActiveForm("register");
            return;
        }

        if (email === savedUser.email && password === savedUser.password) {
            showMessage("Login berhasil. Selamat datang, " + savedUser.name + "!", "success");
            loginForm.reset();
            return;
        }

        showMessage("Email atau password masih salah. Coba lagi ya.", "error");
    });

    const firstTab = window.location.hash === "#register" ? "register" : "login";
    setActiveForm(firstTab);
}
