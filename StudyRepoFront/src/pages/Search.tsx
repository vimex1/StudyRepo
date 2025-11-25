const Search: React.FC = () => {
    return (
        <div className="search-page">
            <h1>Search</h1>
            <input
                type="text"
                className="search-input"
                placeholder="Поиск лаб или методичек..."
            />
            <p>Введите ключевые слова для поиска лабораторных или методичек.</p>
        </div>
    );
};

export default Search;
