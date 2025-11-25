import { useState } from "react";
import Header from "./components/Header.tsx";
import Main from "./pages/Main.tsx";
import Labs from "./pages/Labs.tsx";
import Manuals from "./pages/Manuals.tsx";
import Search from "./pages/Search.tsx";
import Footer from "./components/Footer.tsx";
import "./App.css";

const App = () => {
    const [activeSection, setActiveSection] = useState("main");

    return (
        <div>
            <Header
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <div className="content-wrapper">
                {activeSection === "main" && <Main />}
                {activeSection === "labs" && <Labs />}
                {activeSection === "manuals" && <Manuals />}
                {activeSection === "search" && <Search />}
            </div>
            <Footer />
        </div>
    );
};

export default App;
