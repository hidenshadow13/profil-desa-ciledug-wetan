import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    auth
} from "./firebase-config.js";


const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const eyeIcon =
    document.getElementById("eyeIcon");

const loginButton =
    document.getElementById("loginButton");

const loginText =
    document.getElementById("loginText");

const loginMessage =
    document.getElementById("loginMessage");


// ==============================
// TOGGLE PASSWORD
// ==============================

togglePassword.addEventListener(
    "click",
    () => {

        const hidden =
            passwordInput.type === "password";

        passwordInput.type =
            hidden
                ? "text"
                : "password";

        if (hidden) {

            eyeIcon.innerHTML = `
                <path
                    d="M3 3l18 18"
                />

                <path
                    d="M10.58 10.58
                    a2 2 0 0 0 2.83 2.83"
                />

                <path
                    d="M9.88 4.24
                    A10.94 10.94 0 0 1 12 4
                    c7 0 10 8 10 8
                    a18.5 18.5 0 0 1-3.15 4.15"
                />

                <path
                    d="M6.61 6.61
                    A18.5 18.5 0 0 0 2 12
                    s3 8 10 8
                    a10.94 10.94 0 0 0
                    4.24-.88"
                />
            `;

            togglePassword.setAttribute(
                "aria-label",
                "Sembunyikan password"
            );

        } else {

            eyeIcon.innerHTML = `
                <path
                    d="M2 12s3.5-7 10-7
                    10 7 10 7-3.5 7-10 7
                    S2 12 2 12Z"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="3"
                />
            `;

            togglePassword.setAttribute(
                "aria-label",
                "Tampilkan password"
            );
        }

    }
);


// ==============================
// LOGIN
// ==============================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        clearMessage();

        if (!email || !password) {

            showMessage(
                "Email dan password wajib diisi.",
                "error"
            );

            return;
        }


        loginButton.disabled = true;

        loginText.textContent =
            "Memproses...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            showMessage(
                "Login berhasil.",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "./dashboard.html";

            }, 500);


        } catch (error) {

            console.error(
                "Firebase Login Error:",
                error
            );


            showMessage(
                firebaseErrorMessage(
                    error.code
                ),
                "error"
            );


            loginButton.disabled = false;

            loginText.textContent =
                "Masuk";
        }

    }
);


// ==============================
// CEK SESSION
// ==============================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {
            return;
        }

        window.location.href =
            "./dashboard.html";

    }
);


// ==============================
// ERROR MESSAGE
// ==============================

function firebaseErrorMessage(code) {

    switch (code) {

        case "auth/invalid-credential":
            return "Email atau password salah.";

        case "auth/user-not-found":
            return "Akun admin tidak ditemukan.";

        case "auth/wrong-password":
            return "Password yang dimasukkan salah.";

        case "auth/invalid-email":
            return "Format email tidak valid.";

        case "auth/user-disabled":
            return "Akun admin telah dinonaktifkan.";

        case "auth/too-many-requests":
            return "Terlalu banyak percobaan. Coba lagi nanti.";

        default:
            return "Login gagal. Silakan coba kembali.";
    }

}


function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;

    loginMessage.className =
        `login-message ${type}`;
}


function clearMessage() {

    loginMessage.textContent = "";

    loginMessage.className =
        "login-message";
}