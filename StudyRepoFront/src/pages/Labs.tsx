const Labs: React.FC = () => {
    const testData = [
        {
            material: "Название",
            type: "Методика",
            date: "2023-10-26",
            status: "Одобрено",
        },
        {
            material: "Название",
            type: "Лекция",
            date: "2023-09-15",
            status: "На рассмотрении",
        },
        {
            material: "Название",
            type: "Лабораторная работа",
            date: "2023-08-01",
            status: "В разработке",
        },
        {
            material: "Название",
            type: "Методика",
            date: "2023-07-20",
            status: "Одобрено",
        },
        {
            material: "Название",
            type: "Лабораторная работа",
            date: "2023-06-05",
            status: "Одобрено",
        },
        {
            material: "Название",
            type: "Лекция",
            date: "2023-05-10",
            status: "Устаревший",
        },
    ];

    return (
        <div className="labs-page">
            <h1>Список материалов</h1>
            <button className="add-material-btn">Добавить материал</button>
            <table>
                <thead>
                    <tr>
                        <th>Материал</th>
                        <th>Тип</th>
                        <th>Дата</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {testData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.material}</td>
                            <td>{item.type}</td>
                            <td>{item.date}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Labs;
