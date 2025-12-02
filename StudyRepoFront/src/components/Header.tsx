import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const Header = ({
    activeSection,
    setActiveSection,
}: {
    activeSection: string;
    setActiveSection: (section: string) => void;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);

    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword1, setRegPassword1] = useState("");
    const [regPassword2, setRegPassword2] = useState("");

    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProtectedNavClick = (section: string) => {
        if ((section === "labs" || section === "manuals") && !currentUser) {
            setIsLoginMode(true);
            setIsModalOpen(true);
            return;
        }
        setActiveSection(section);
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const storedUsername = window.localStorage.getItem("labhub_username");
        if (storedUsername) {
            setCurrentUser(storedUsername);
        }
    }, []);

    const handleAccountClick = () => {
        if (currentUser) {
            setIsAccountMenuOpen((prev) => !prev);
        } else {
            setIsLoginMode(true);
            setIsModalOpen(true);
            setError(null);
        }
    };

    const closeModal = () => {
        if (isLoading) return;
        setIsModalOpen(false);
        setError(null);
    };

    const saveAuthState = (username: string, authData: any | null = null) => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem("labhub_username", username);
        if (authData) {
            window.localStorage.setItem(
                "labhub_auth",
                JSON.stringify(authData)
            );
        }
        setCurrentUser(username);
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!regUsername || !regEmail || !regPassword1 || !regPassword2) {
            setError("Заполните все поля");
            return;
        }

        if (regPassword1 !== regPassword2) {
            setError("Пароли не совпадают");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
                body: JSON.stringify({
                    username: regUsername,
                    email: regEmail,
                    password1: regPassword1,
                    password2: regPassword2,
                }),
            });

            if (!response.ok) {
                let message = "Не удалось зарегистрироваться";
                try {
                    const data = await response.json();
                    if (data && typeof data === "object") {
                        const firstKey = Object.keys(data)[0];
                        if (firstKey) {
                            const value = (data as any)[firstKey];
                            if (Array.isArray(value) && value.length > 0) {
                                message = value[0];
                            } else if (typeof value === "string") {
                                message = value;
                            }
                        }
                    }
                } catch {}
                throw new Error(message);
            }

            let authData: any = null;
            try {
                authData = await response.json();
            } catch {}

            saveAuthState(regUsername, authData);

            setRegUsername("");
            setRegEmail("");
            setRegPassword1("");
            setRegPassword2("");

            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message || "Произошла ошибка");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!loginUsername || !loginPassword) {
            setError("Введите логин и пароль");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
                body: JSON.stringify({
                    username: loginUsername,
                    password: loginPassword,
                }),
            });

            if (!response.ok) {
                let message = "Не удалось войти";
                try {
                    const data = await response.json();
                    if (data && typeof data === "object") {
                        const firstKey = Object.keys(data)[0];
                        if (firstKey) {
                            const value = (data as any)[firstKey];
                            if (Array.isArray(value) && value.length > 0) {
                                message = value[0];
                            } else if (typeof value === "string") {
                                message = value;
                            }
                        }
                    }
                } catch {}
                throw new Error(message);
            }

            let authData: any = null;
            try {
                authData = await response.json();
            } catch {}

            saveAuthState(loginUsername, authData);

            setLoginUsername("");
            setLoginPassword("");

            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message || "Произошла ошибка");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("labhub_username");
            window.localStorage.removeItem("labhub_auth");
        }
        setCurrentUser(null);
        setIsAccountMenuOpen(false);
    };

    const switchToLogin = () => {
        setIsLoginMode(true);
        setError(null);
    };

    const switchToRegister = () => {
        setIsLoginMode(false);
        setError(null);
    };

    const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (isLoginMode) {
            return handleLogin(e);
        }
        return handleRegister(e);
    };

    return (
        <header>
            <a
                href="#"
                onClick={() => setActiveSection("main")}
                className="logo"
            >
                LibHub
            </a>
            <nav>
                <a
                    href="#"
                    onClick={() => handleProtectedNavClick("labs")}
                    className={activeSection === "labs" ? "active" : ""}
                >
                    Материалы
                </a>
                <a
                    href="#"
                    onClick={() => handleProtectedNavClick("manuals")}
                    className={activeSection === "manuals" ? "active" : ""}
                >
                    Дисциплины
                </a>
            </nav>

            <div style={{ position: "relative" }}>
                <button className="account-btn" onClick={handleAccountClick}>
                    {currentUser ? currentUser : "Account"}
                </button>

                {currentUser && isAccountMenuOpen && (
                    <div className="account-menu">
                        <div className="account-menu-username">
                            Вошли как <span>@{currentUser}</span>
                        </div>
                        <button
                            type="button"
                            className="account-menu-logout"
                            onClick={handleLogout}
                        >
                            Выйти
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-btn" onClick={closeModal}>
                            &times;
                        </span>

                        <div className="auth-toggle">
                            <button
                                type="button"
                                className={
                                    isLoginMode
                                        ? "auth-toggle-btn active"
                                        : "auth-toggle-btn"
                                }
                                onClick={switchToLogin}
                            >
                                Войти
                            </button>
                            <button
                                type="button"
                                className={
                                    !isLoginMode
                                        ? "auth-toggle-btn active"
                                        : "auth-toggle-btn"
                                }
                                onClick={switchToRegister}
                            >
                                Регистрация
                            </button>
                        </div>

                        <h2 className="auth-title">
                            {isLoginMode ? "Вход в аккаунт" : "Регистрация"}
                        </h2>

                        <form onSubmit={handleAuthSubmit} className="auth-form">
                            {isLoginMode ? (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Имя пользователя"
                                        value={loginUsername}
                                        onChange={(e) =>
                                            setLoginUsername(e.target.value)
                                        }
                                    />
                                    <input
                                        type="password"
                                        placeholder="Пароль"
                                        value={loginPassword}
                                        onChange={(e) =>
                                            setLoginPassword(e.target.value)
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Имя пользователя"
                                        value={regUsername}
                                        onChange={(e) =>
                                            setRegUsername(e.target.value)
                                        }
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={regEmail}
                                        onChange={(e) =>
                                            setRegEmail(e.target.value)
                                        }
                                    />
                                    <input
                                        type="password"
                                        placeholder="Пароль"
                                        value={regPassword1}
                                        onChange={(e) =>
                                            setRegPassword1(e.target.value)
                                        }
                                    />
                                    <input
                                        type="password"
                                        placeholder="Повторите пароль"
                                        value={regPassword2}
                                        onChange={(e) =>
                                            setRegPassword2(e.target.value)
                                        }
                                    />
                                </>
                            )}

                            {error && <p className="auth-error">{error}</p>}

                            <button
                                className="register-btn"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? isLoginMode
                                        ? "Входим..."
                                        : "Регистрируем..."
                                    : isLoginMode
                                    ? "Войти"
                                    : "Зарегистрироваться"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
