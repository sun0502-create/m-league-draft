import { supabase } from "./supabase.js";

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


// ========================================
// すでにログイン済みなら大会画面へ
// ========================================

async function checkCurrentSession() {

    const {
        data: { session },
        error
    } =
        await supabase.auth.getSession();

    if (error) {

        console.error(
            "Session error:",
            error
        );

        return;
    }

    if (session) {

        window.location.href =
            "/";

    }

}

checkCurrentSession();


// ========================================
// ログイン
// ========================================

loginButton.addEventListener(
    "click",
    async function () {

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;

        if (
            !email ||
            !password
        ) {

            loginMessage.textContent =
                "メールアドレスとパスワードを入力してください。";

            return;
        }

        loginMessage.textContent =
            "ログイン中...";

        const {
            data,
            error
        } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                "ログインに失敗しました。";

            return;
        }

        console.log(
            "Login success:",
            data
        );

        console.log(
            "Login session:",
            data.session
        );


        if (!data.session) {

            loginMessage.textContent =
                "ログインセッションを取得できませんでした。";

            console.error(
                "Session was not created after login."
            );

            return;
        }


        loginMessage.textContent =
            "ログインしました。";


        const {
            data: sessionCheck,
            error: sessionCheckError
        } =
            await supabase.auth.getSession();


        console.log(
            "Session immediately after login:",
            sessionCheck.session
        );

        console.log(
            "Session check error:",
            sessionCheckError
        );


        if (
            sessionCheckError ||
            !sessionCheck.session
        ) {

            loginMessage.textContent =
                "ログインセッションの保存に失敗しました。";

            return;
        }


        window.location.href =
            "/";

    }
);


// ========================================
// Enterキーでもログイン
// ========================================

loginPassword.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            loginButton.click();

        }

    }
);