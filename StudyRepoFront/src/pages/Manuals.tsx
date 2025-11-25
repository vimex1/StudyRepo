const Manuals: React.FC = () => {
    const manualsData = [
        {
            title: "Предмет№1",
            description: "Описание",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/2900/2900698.png",
            link: "#",
        },
        {
            title: "Предмет№2",
            description: "Описание",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/2900/2900700.png",
            link: "#",
        },
        {
            title: "Предмет№3",
            description: "Описание",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/2900/2900702.png",
            link: "#",
        },
        {
            title: "Digital Logic Lab",
            description: "Methodology & Results",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968364.png",
            link: "#",
        },
        {
            title: "Предмет№4",
            description: "Описание",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/2900/2900704.png",
            link: "#",
        },
        {
            title: "Предмет№5",
            description: "Methodology & Results",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942789.png",
            link: "#",
        },
        {
            title: "Предмет№6",
            description: "Описание",
            imageUrl: "https://cdn-icons-png.flaticon.com/512/2900/2900706.png",
            link: "#",
        },
    ];

    return (
        <div>
            <h1>Diаcntmbloc of subjects</h1>
            <section className="cards">
                {manualsData.map((card, index) => (
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

export default Manuals;
