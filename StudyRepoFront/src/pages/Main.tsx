import Hero from "../components/Hero.tsx";

const cardsData = [
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968364.png",
        link: "/labs",
    },
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942789.png",
        link: "/labs",
    },
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/3211/3211362.png",
        link: "/labs",
    },
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/992/992651.png",
        link: "/labs",
    },
];

const Main: React.FC = () => {
    return (
        <div>
            <Hero />
            <section className="cards">
                {cardsData.map((card, index) => (
                    <a href={card.link} className="card" key={index}>
                        <img src={card.imageUrl} alt={card.title} />
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                    </a>
                ))}
            </section>
        </div>
    );
};

export default Main;
