import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

type Topic = {
    id: number | string;
    name?: string;
    title?: string;
    short_name?: string;
    description?: string | null;
};

type Task = {
    id?: number | string;
    title?: string;
    name?: string;
    type?: string;
    status?: string;
    created_at?: string;
    has_solution?: boolean;
    solution_available?: boolean;
    solution?: string | null;
    [key: string]: any;
};

const PAGE_SIZE = 10;

const Manuals: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [topicsError, setTopicsError] = useState<string | null>(null);

    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState<string | null>(null);
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

    const getTopicInitials = (topic: Topic): string => {
        const name = getTopicTitle(topic);
        const words = name.split(/\s+/).filter(Boolean);
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
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
            (task as any).solution ??
            (task as any).solution_file_url ??
            (task as any).solutionFileUrl;

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

    const openTopic = async (topic: Topic) => {
        setSelectedTopic(topic);
        setTasks([]);
        setTasksError(null);
        setPage(1);
        setTasksLoading(true);

        try {
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
                    setTasks([]);
                    return;
                }
                throw new Error("Не удалось загрузить материалы дисциплины");
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
                } else {
                    // одиночный объект — одна задача
                    items = [data as Task];
                }
            }

            items.sort((a, b) => {
                const da = a.created_at ? new Date(a.created_at).getTime() : 0;
                const db = b.created_at ? new Date(b.created_at).getTime() : 0;
                return db - da;
            });

            setTasks(items);
        } catch (e: any) {
            setTasksError(
                e.message || "Не удалось загрузить материалы дисциплины"
            );
        } finally {
            setTasksLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedTopic(null);
        setTasks([]);
        setTasksError(null);
        setPage(1);
    };

    useEffect(() => {
        loadTopics();
    }, []);

    const paginatedTasks = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return tasks.slice(start, end);
    }, [tasks, page]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(tasks.length / PAGE_SIZE) || 1);
    }, [tasks.length]);

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
        <div className="container manuals-page">
            <h1>Дисциплины</h1>
            <p className="page-subtitle">
                Выберите дисциплину, чтобы открыть все лабораторные, задания и
                методические материалы.
            </p>

            {topicsError && (
                <div className="alert alert-error">{topicsError}</div>
            )}

            {topicsLoading && (
                <div className="loading-row">
                    <span className="spinner" /> Загружаем список дисциплин...
                </div>
            )}

            {!topicsLoading && !topicsError && topics.length === 0 && (
                <p className="empty-state">
                    Пока нет доступных дисциплин. Обратитесь к администратору
                    или попробуйте позже.
                </p>
            )}

            {!topicsLoading && topics.length > 0 && (
                <section className="cards">
                    {topics.map((topic) => (
                        <button
                            key={topic.id}
                            type="button"
                            className="card card-button discipline-card"
                            onClick={() => openTopic(topic)}
                        >
                            <div className="discipline-avatar">
                                <span>{getTopicInitials(topic)}</span>
                            </div>
                            <div className="discipline-content">
                                <h3>{getTopicTitle(topic)}</h3>
                                {topic.description && (
                                    <p>{topic.description}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </section>
            )}

            {selectedTopic && (
                <div className="materials-modal" onClick={closeModal}>
                    <div
                        className="materials-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="close-btn"
                            onClick={closeModal}
                            aria-label="Закрыть"
                        >
                            ×
                        </button>

                        <h2>{getTopicTitle(selectedTopic)}</h2>
                        <p className="modal-subtitle">
                            Материалы по дисциплине: лабораторные работы,
                            задания и методички.
                        </p>

                        {tasksError && (
                            <div className="alert alert-error">
                                {tasksError}
                            </div>
                        )}

                        {tasksLoading && (
                            <div className="loading-row">
                                <span className="spinner" /> Загружаем
                                материалы...
                            </div>
                        )}

                        {!tasksLoading && tasks.length === 0 && !tasksError && (
                            <p className="empty-state">
                                Для этой дисциплины пока нет загруженных
                                материалов.
                            </p>
                        )}

                        {!tasksLoading && tasks.length > 0 && (
                            <>
                                <ul className="materials-list">
                                    {paginatedTasks.map((task) => {
                                        const isFileLoading =
                                            downloading &&
                                            downloading.id === task.id &&
                                            downloading.kind === "file";
                                        const isSolutionLoading =
                                            downloading &&
                                            downloading.id === task.id &&
                                            downloading.kind === "solution";

                                        return (
                                            <li
                                                key={
                                                    task.id ??
                                                    getTaskTitle(task)
                                                }
                                                className="materials-item"
                                            >
                                                <div className="materials-info">
                                                    <div className="materials-title">
                                                        {getTaskTitle(task)}
                                                    </div>
                                                    <div className="materials-meta">
                                                        {task.type && (
                                                            <span className="materials-chip">
                                                                {task.type}
                                                            </span>
                                                        )}
                                                        {task.status && (
                                                            <span className="materials-chip secondary">
                                                                {task.status}
                                                            </span>
                                                        )}
                                                        {task.created_at && (
                                                            <span className="materials-date">
                                                                {formatDate(
                                                                    task.created_at
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="download-group">
                                                    <button
                                                        type="button"
                                                        className="download-btn"
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
                                                            className="download-btn download-btn-secondary"
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
                                            </li>
                                        );
                                    })}
                                </ul>

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
                </div>
            )}
        </div>
    );
};

export default Manuals;
