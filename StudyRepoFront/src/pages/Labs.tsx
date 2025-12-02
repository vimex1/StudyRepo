import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

type Topic = {
    id: number | string;
    name?: string;
    title?: string;
    short_name?: string;
};

type Task = {
    id?: number | string;
    title?: string;
    name?: string;
    type?: string;
    status?: string;
    created_at?: string;
    topic?: Topic | number | string | null;
    has_solution?: boolean;
    solution_available?: boolean;
    solution?: string | null;
    [key: string]: any;
};

type EnrichedTask = Task & {
    __topicId: number | string;
    __topicTitle: string;
};

const PAGE_SIZE = 10;

const Labs: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [topicsError, setTopicsError] = useState<string | null>(null);

    const [tasks, setTasks] = useState<EnrichedTask[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [topicFilter, setTopicFilter] = useState<string>("all");
    const [page, setPage] = useState(1);

    const [downloading, setDownloading] = useState<{
        id: number | string;
        kind: "file" | "solution";
    } | null>(null);

    const getAccessToken = (): string | null => {
        if (typeof window === "undefined") return null;
        try {
            const raw = window.localStorage.getItem("labhub_auth");
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && "access" in parsed) {
                return (parsed as any).access as string;
            }
            return null;
        } catch {
            return null;
        }
    };

    const getTopicTitle = (topic: Topic): string => {
        return (
            topic.title ||
            topic.name ||
            topic.short_name ||
            `Дисциплина #${topic.id}`
        );
    };

    const getTaskTitle = (task: Task): string => {
        return (
            task.title ||
            task.name ||
            (typeof task.id !== "undefined"
                ? `Материал #${task.id}`
                : "Материал")
        );
    };

    const normalizeStatus = (status?: string | null): string | undefined => {
        if (!status) return status ?? undefined;
        return status.replace(/\s+/g, "_");
    };

    const formatDate = (value?: string): string => {
        if (!value) return "";
        try {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return value;
            return d.toLocaleDateString("ru-RU");
        } catch {
            return value;
        }
    };

    const hasSolution = (task: Task): boolean => {
        const raw =
            (task as any).has_solution ??
            (task as any).hasSolution ??
            (task as any).solution_available ??
            (task as any).solution;
        if (typeof raw === "boolean") return raw;
        if (typeof raw === "number") return raw === 1;
        if (typeof raw === "string") return raw.trim().length > 0;
        return false;
    };

    const loadTopics = async () => {
        setTopicsLoading(true);
        setTopicsError(null);
        try {
            const headers: HeadersInit = {
                Accept: "application/json",
            };
            const token = getAccessToken();
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/api/labs/topics`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                throw new Error("Не удалось загрузить список дисциплин");
            }

            const data = await response.json();
            let items: Topic[] = [];

            if (Array.isArray(data)) {
                items = data as Topic[];
            } else if (data && typeof data === "object") {
                if (Array.isArray((data as any).results)) {
                    items = (data as any).results;
                } else if (Array.isArray((data as any).items)) {
                    items = (data as any).items;
                }
            }

            setTopics(items);
        } catch (e: any) {
            setTopicsError(
                e.message || "Не удалось загрузить список дисциплин"
            );
        } finally {
            setTopicsLoading(false);
        }
    };

    const loadTasksForTopic = async (topic: Topic): Promise<EnrichedTask[]> => {
        const headers: HeadersInit = {
            Accept: "application/json",
        };
        const token = getAccessToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(
            `${API_BASE_URL}/api/labs/tasks/${topic.id}`,
            { method: "GET", headers }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return [];
            }
            throw new Error(
                `Не удалось загрузить материалы для ${getTopicTitle(topic)}`
            );
        }

        const data = await response.json();
        let items: Task[] = [];

        if (Array.isArray(data)) {
            items = data as Task[];
        } else if (data && typeof data === "object") {
            if (Array.isArray((data as any).results)) {
                items = (data as any).results;
            } else if (Array.isArray((data as any).items)) {
                items = (data as any).items;
            }
        }

        return items.map((task) => ({
            ...task,
            __topicId: topic.id,
            __topicTitle: getTopicTitle(topic),
        }));
    };

    const loadAllTasks = async (topicsToUse: Topic[]) => {
        setTasksLoading(true);
        setTasksError(null);

        try {
            const results = await Promise.all(
                topicsToUse.map((topic) =>
                    loadTasksForTopic(topic).catch(() => [] as EnrichedTask[])
                )
            );
            const merged = results.flat();

            merged.sort((a, b) => {
                const da = a.created_at ? new Date(a.created_at).getTime() : 0;
                const db = b.created_at ? new Date(b.created_at).getTime() : 0;
                return db - da;
            });

            setTasks(merged);
        } catch (e: any) {
            setTasksError(e.message || "Не удалось загрузить материалы");
        } finally {
            setTasksLoading(false);
        }
    };

    useEffect(() => {
        loadTopics();
    }, []);

    useEffect(() => {
        if (topics.length === 0) return;
        loadAllTasks(topics);
    }, [topics]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleTopicFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setTopicFilter(e.target.value);
        setPage(1);
    };

    const filteredTasks = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return tasks.filter((task) => {
            if (
                topicFilter !== "all" &&
                String(task.__topicId) !== topicFilter
            ) {
                return false;
            }

            if (!query) return true;

            const haystack = [
                getTaskTitle(task),
                task.type,
                task.status,
                task.__topicTitle,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [tasks, searchQuery, topicFilter]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
    }, [filteredTasks.length]);

    const paginatedTasks = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return filteredTasks.slice(start, end);
    }, [filteredTasks, page]);

    const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));
    const handleNextPage = () =>
        setPage((prev) => Math.min(totalPages, prev + 1));

    const downloadTaskFile = async (task: Task, kind: "file" | "solution") => {
        if (!task.id) return;
        const token = getAccessToken();
        if (!token) {
            alert("Сначала войдите в систему, чтобы скачивать файлы.");
            return;
        }

        setDownloading({ id: task.id, kind });

        try {
            const headers: HeadersInit = { Accept: "*/*" };
            headers["Authorization"] = `Bearer ${token}`;

            const suffix =
                kind === "solution" ? "download-solution" : "download";

            const response = await fetch(
                `${API_BASE_URL}/api/labs/tasks/${task.id}/${suffix}`,
                { method: "GET", headers }
            );

            if (!response.ok) {
                if (response.status === 404 && kind === "solution") {
                    alert("Для этого материала нет загруженного решения.");
                    return;
                }
                throw new Error("Не удалось скачать файл.");
            }

            const blob = await response.blob();

            let filename = `task-${task.id}${
                kind === "solution" ? "-solution" : ""
            }`;
            const disposition =
                response.headers.get("Content-Disposition") ||
                response.headers.get("content-disposition");

            if (disposition) {
                const match = disposition.match(
                    /filename\*?=(?:UTF-8''|")?([^\";]+)/i
                );
                if (match && match[1]) {
                    filename = decodeURIComponent(match[1].replace(/"/g, ""));
                }
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            alert(e.message || "Ошибка при скачивании файла.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="labs-page">
            <h1>Материалы</h1>
            <p className="page-subtitle">
                Полный список лабораторных, задач и методических материалов по
                всем дисциплинам.
            </p>

            <div className="labs-filters">
                <div className="labs-search">
                    <label htmlFor="labs-search-input">Поиск</label>
                    <input
                        id="labs-search-input"
                        type="text"
                        className="search-input"
                        placeholder="Название материала или дисциплины..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="labs-filter">
                    <label htmlFor="labs-topic-filter">Дисциплина</label>
                    <select
                        id="labs-topic-filter"
                        value={topicFilter}
                        onChange={handleTopicFilterChange}
                    >
                        <option value="all">Все дисциплины</option>
                        {topics.map((topic) => (
                            <option key={topic.id} value={String(topic.id)}>
                                {getTopicTitle(topic)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {topicsLoading && (
                <div className="loading-row">
                    <span className="spinner" /> Загружаем дисциплины...
                </div>
            )}

            {topicsError && (
                <div className="alert alert-error">{topicsError}</div>
            )}

            {tasksLoading && (
                <div className="loading-row">
                    <span className="spinner" /> Загружаем материалы...
                </div>
            )}

            {tasksError && (
                <div className="alert alert-error">{tasksError}</div>
            )}

            {!tasksLoading && filteredTasks.length === 0 && !tasksError && (
                <p className="empty-state">
                    Материалы не найдены. Попробуйте изменить запрос или фильтр
                    по дисциплине.
                </p>
            )}

            {!tasksLoading && filteredTasks.length > 0 && (
                <>
                    <div className="table-wrapper">
                        <table className="labs-table">
                            <thead>
                                <tr>
                                    <th>Материал</th>
                                    <th>Тип</th>
                                    <th>Дисциплина</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                    <th>Файлы</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTasks.map((task) => {
                                    const statusKey = normalizeStatus(
                                        task.status
                                    );
                                    const isFileLoading =
                                        downloading &&
                                        downloading.id === task.id &&
                                        downloading.kind === "file";
                                    const isSolutionLoading =
                                        downloading &&
                                        downloading.id === task.id &&
                                        downloading.kind === "solution";

                                    return (
                                        <tr key={task.id ?? getTaskTitle(task)}>
                                            <td>{getTaskTitle(task)}</td>
                                            <td>{task.type || "—"}</td>
                                            <td>{task.__topicTitle || "—"}</td>
                                            <td>
                                                {formatDate(task.created_at)}
                                            </td>
                                            <td>
                                                {task.status ? (
                                                    <span
                                                        className={
                                                            statusKey
                                                                ? `status status-${statusKey}`
                                                                : "status"
                                                        }
                                                    >
                                                        {task.status}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td>
                                                <div className="download-group">
                                                    <button
                                                        type="button"
                                                        className="download-link"
                                                        onClick={() =>
                                                            downloadTaskFile(
                                                                task,
                                                                "file"
                                                            )
                                                        }
                                                        disabled={
                                                            isFileLoading ||
                                                            false
                                                        }
                                                    >
                                                        {isFileLoading
                                                            ? "Файл..."
                                                            : "Файл"}
                                                    </button>

                                                    {hasSolution(task) && (
                                                        <button
                                                            type="button"
                                                            className="download-link download-link-secondary"
                                                            onClick={() =>
                                                                downloadTaskFile(
                                                                    task,
                                                                    "solution"
                                                                )
                                                            }
                                                            disabled={
                                                                isSolutionLoading ||
                                                                false
                                                            }
                                                        >
                                                            {isSolutionLoading
                                                                ? "Решение..."
                                                                : "Решение"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                type="button"
                                onClick={handlePrevPage}
                                disabled={page === 1}
                            >
                                Назад
                            </button>
                            <span>
                                Страница {page} из {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={handleNextPage}
                                disabled={page === totalPages}
                            >
                                Вперёд
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Labs;
