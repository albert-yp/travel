const STORAGE_KEYS = {
    savedUser: "travelUser",
    currentUser: "travelCurrentUser",
    bookings: "travelBookings"
};

const authTabs = document.querySelectorAll(".auth-tab[data-auth-switch]");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const bookingNameInput = document.getElementById("bookingName");
const bookingEmailInput = document.getElementById("bookingEmail");
const bookingPackageInput = document.getElementById("bookingPackage");
const bookingDateInput = document.getElementById("bookingDate");
const bookingPeopleInput = document.getElementById("bookingPeople");
const bookingNoteInput = document.getElementById("bookingNote");

function readStorage(key) {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        return null;
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getSavedUser() {
    return readStorage(STORAGE_KEYS.savedUser);
}

function getCurrentUser() {
    return readStorage(STORAGE_KEYS.currentUser);
}

function showAuthMessage(message, type) {
    if (!authMessage) {
        return;
    }

    authMessage.textContent = message;
    authMessage.className = "auth-message";

    if (type) {
        authMessage.classList.add(type);
    }
}

function showBookingMessage(message, type) {
    if (!bookingMessage) {
        return;
    }

    bookingMessage.textContent = message;
    bookingMessage.className = "booking-message";

    if (type) {
        bookingMessage.classList.add(type);
    }
}

function setActiveForm(target) {
    if (!loginForm || !registerForm || !authTabs.length) {
        return;
    }

    authTabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.authSwitch === target);
    });

    const isLogin = target === "login";

    loginForm.classList.toggle("active", isLogin);
    registerForm.classList.toggle("active", !isLogin);
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
}

function renderGuestNavbar(container) {
    container.innerHTML = [
        '<a href="auth.html#login" class="btn btn--ghost btn--sm">Login</a>',
        '<a href="auth.html#register" class="btn btn--primary btn--sm">Register</a>'
    ].join("");
}

function renderLoggedInNavbar(container, user) {
    container.innerHTML = "";

    const userStatus = document.createElement("span");
    userStatus.className = "navbar__user";
    userStatus.append("Halo, ");

    const userName = document.createElement("strong");
    userName.textContent = user.name;
    userStatus.appendChild(userName);

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "btn btn--ghost btn--sm navbar__logout";
    logoutButton.textContent = "Logout";

    container.append(userStatus, logoutButton);
}

function renderNavbarAuth() {
    const currentUser = getCurrentUser();
    const authContainers = document.querySelectorAll(".navbar__auth");

    authContainers.forEach((container) => {
        container.classList.toggle("navbar__auth--logged-in", Boolean(currentUser));

        if (currentUser) {
            renderLoggedInNavbar(container, currentUser);
            return;
        }

        renderGuestNavbar(container);
    });

    document.querySelectorAll(".navbar__logout").forEach((button) => {
        button.addEventListener("click", handleLogout);
    });
}

function syncBookingUserData() {
    if (!bookingForm || !bookingNameInput || !bookingEmailInput) {
        return;
    }

    const currentUser = getCurrentUser();

    if (currentUser) {
        bookingNameInput.value = currentUser.name;
        bookingEmailInput.value = currentUser.email;
        showBookingMessage(
            "Sedang login sebagai " + currentUser.name + ". Nama dan email terisi otomatis.",
            ""
        );
        return;
    }

    bookingNameInput.value = "";
    bookingEmailInput.value = "";
    showBookingMessage(
        "Isi form booking berikut. Jika sudah login, nama dan email akan terisi otomatis.",
        ""
    );
}

function handleLogout() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    renderNavbarAuth();
    syncBookingUserData();

    if (authMessage) {
        setActiveForm("login");
        showAuthMessage("Anda sudah logout dari akun.", "success");
    }
}

function bindPasswordToggles() {
    const toggleButtons = document.querySelectorAll("[data-password-toggle]");

    toggleButtons.forEach((button) => {
        const targetId = button.dataset.passwordToggle;
        const targetInput = document.getElementById(targetId);
        const icon = button.querySelector("i");

        if (!targetInput || !icon) {
            return;
        }

        button.addEventListener("click", function () {
            const isHidden = targetInput.type === "password";

            targetInput.type = isHidden ? "text" : "password";
            icon.className = isHidden ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
            button.setAttribute(
                "aria-label",
                isHidden ? "Sembunyikan password" : "Tampilkan password"
            );
        });
    });
}

function initializeAuthPage() {
    if (!loginForm || !registerForm || !authMessage) {
        return;
    }

    authTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
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
            showAuthMessage("Nama harus diisi minimal 3 karakter.", "error");
            return;
        }

        if (password.length < 6) {
            showAuthMessage("Password minimal 6 karakter.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showAuthMessage("Konfirmasi password belum sama.", "error");
            return;
        }

        const userData = { name, email, password };
        saveStorage(STORAGE_KEYS.savedUser, userData);

        registerForm.reset();
        document.getElementById("loginEmail").value = email;
        setActiveForm("login");
        showAuthMessage("Register berhasil. Sekarang silakan login dengan akun yang baru dibuat.", "success");
        window.location.hash = "login";
    });

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const savedUser = getSavedUser();

        if (!savedUser) {
            showAuthMessage("Belum ada akun yang tersimpan. Silakan register terlebih dahulu.", "error");
            setActiveForm("register");
            window.location.hash = "register";
            return;
        }

        if (email === savedUser.email && password === savedUser.password) {
            saveStorage(STORAGE_KEYS.currentUser, {
                name: savedUser.name,
                email: savedUser.email
            });

            loginForm.reset();
            renderNavbarAuth();
            syncBookingUserData();
            showAuthMessage("Login berhasil. Selamat datang, " + savedUser.name + "!", "success");
            return;
        }

        showAuthMessage("Email atau password masih salah. Coba lagi ya.", "error");
    });

    const currentUser = getCurrentUser();
    const firstTab = window.location.hash === "#register" ? "register" : "login";

    setActiveForm(firstTab);

    if (currentUser) {
        showAuthMessage("Anda sedang login sebagai " + currentUser.name + ".", "success");
    }

    window.addEventListener("hashchange", function () {
        const nextTab = window.location.hash === "#register" ? "register" : "login";
        setActiveForm(nextTab);
    });
}

function initializeBookingForm() {
    if (
        !bookingForm ||
        !bookingMessage ||
        !bookingNameInput ||
        !bookingEmailInput ||
        !bookingPackageInput ||
        !bookingDateInput ||
        !bookingPeopleInput ||
        !bookingNoteInput
    ) {
        return;
    }

    const today = new Date().toISOString().split("T")[0];
    bookingDateInput.min = today;
    syncBookingUserData();

    document.querySelectorAll(".booking-trigger").forEach((button) => {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const packageName = this.dataset.bookingPackage;

            if (packageName) {
                bookingPackageInput.value = packageName;
                showBookingMessage("Paket " + packageName + " sudah dipilih. Silakan lengkapi data booking.", "");
            }

            document.getElementById("booking").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const bookingData = {
            name: bookingNameInput.value.trim(),
            email: bookingEmailInput.value.trim(),
            packageName: bookingPackageInput.value,
            departureDate: bookingDateInput.value,
            people: bookingPeopleInput.value,
            note: bookingNoteInput.value.trim(),
            bookedAt: new Date().toLocaleString("id-ID")
        };

        if (!bookingData.packageName) {
            showBookingMessage("Silakan pilih paket wisata terlebih dahulu.", "error");
            return;
        }

        const savedBookings = readStorage(STORAGE_KEYS.bookings) || [];
        savedBookings.push(bookingData);
        saveStorage(STORAGE_KEYS.bookings, savedBookings);

        bookingForm.reset();
        bookingPeopleInput.value = "2";
        syncBookingUserData();
        bookingPackageInput.value = "";

        showBookingMessage(
            "Booking berhasil disimpan untuk " + bookingData.packageName + " atas nama " + bookingData.name + ".",
            "success"
        );
    });
}

renderNavbarAuth();
bindPasswordToggles();
initializeAuthPage();
initializeBookingForm();
