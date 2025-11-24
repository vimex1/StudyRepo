.PHONY: help build up down restart logs shell migrate createsuperuser collectstatic

# Цвета для вывода
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

help: ## Показать это сообщение помощи
	@echo "$(GREEN)Доступные команды:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'

build: ## Собрать Docker образы
	docker compose build

up: ## Запустить все контейнеры
	docker compose up -d

up-build: ## Собрать и запустить все контейнеры
	docker compose up -d --build

down: ## Остановить все контейнеры
	docker compose down

down-volumes: ## Остановить контейнеры и удалить volumes
	docker compose down -v

restart: ## Перезапустить все контейнеры
	docker compose restart

logs: ## Показать логи всех сервисов
	docker compose logs -f

logs-backend: ## Показать логи бэкенда
	docker compose logs -f backend

logs-frontend: ## Показать логи фронтенда
	docker compose logs -f frontend

logs-db: ## Показать логи базы данных
	docker compose logs -f db

shell: ## Открыть shell в контейнере бэкенда
	docker compose exec backend /bin/bash

shell-db: ## Открыть psql в контейнере БД
	docker compose exec db psql -U postgres -d studyrepo

migrate: ## Применить миграции Django
	docker compose exec backend python manage.py migrate

makemigrations: ## Создать миграции Django
	docker compose exec backend python manage.py makemigrations

createsuperuser: ## Создать суперпользователя Django
	docker compose exec backend python manage.py createsuperuser

collectstatic: ## Собрать статические файлы Django
	docker compose exec backend python manage.py collectstatic --noinput

django-shell: ## Открыть Django shell
	docker compose exec backend python manage.py shell

test: ## Запустить тесты
	docker compose exec backend python manage.py test

ps: ## Показать статус контейнеров
	docker compose ps

clean: ## Остановить контейнеры и удалить volumes и образы
	docker compose down -v --rmi all

start: up-build migrate ## Полный запуск проекта (сборка, запуск, миграции)
	@echo "$(GREEN)Проект запущен!$(RESET)"
	@echo "$(GREEN)Frontend: http://localhost:3000$(RESET)"
	@echo "$(GREEN)Backend: http://localhost:8000$(RESET)"
	@echo "$(GREEN)Admin: http://localhost:8000/admin/$(RESET)"

