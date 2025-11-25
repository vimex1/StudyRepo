import React from "react";

const cardsData = [
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968364.png",
        link: "labs.html",
    },
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942789.png",
        link: "labs.html",
    },
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/3211/3211362.png",
        link: "labs.html",
    },
    {
        title: "Digital Logic Lab",
        description: "Methodology & Results",
        imageUrl: "https://cdn-icons-png.flaticon.com/512/992/992651.png",
        link: "labs.html",
    },
];

const Cards: React.FC = () => {
    return (
        <section className="cards">
            {cardsData.map((card, index) => (
                <a href={card.link} className="card" key={index}>
                    <img src={card.imageUrl} alt={card.title} />
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                </a>
            ))}
        </section>
    );
};

export default Cards;
