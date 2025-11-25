import { useState } from "react";

const Header = ({
    activeSection,
    setActiveSection,
}: {
    activeSection: string;
    setActiveSection: (section: string) => void;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAccountClick = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <header>
            <a
                href="#"
                onClick={() => setActiveSection("main")}
                className="logo"
            >
                LabHub
            </a>
            <nav>
                <a
                    href="#"
                    onClick={() => setActiveSection("labs")}
                    className={activeSection === "labs" ? "active" : ""}
                >
                    Labs
                </a>
                <a
                    href="#"
                    onClick={() => setActiveSection("manuals")}
                    className={activeSection === "manuals" ? "active" : ""}
                >
                    Manuals
                </a>
                <a
                    href="#"
                    onClick={() => setActiveSection("search")}
                    className={activeSection === "search" ? "active" : ""}
                >
                    Search
                </a>
            </nav>
            <button className="account-btn" onClick={handleAccountClick}>
                Account
            </button>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-btn" onClick={closeModal}>
                            &times;
                        </span>
                        <h2>Регистрация</h2>
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Пароль" />
                        <button className="register-btn">
                            Зарегистрироваться
                        </button>
                        <p>
                            Уже есть аккаунт? <a href="#">Войти</a>
                        </p>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
