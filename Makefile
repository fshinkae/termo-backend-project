.PHONY: help build up down logs restart clean test

help:
	@echo "Comandos disponíveis:"
	@echo "  make build    - Constrói a imagem Docker"
	@echo "  make up       - Sobe os containers"
	@echo "  make down     - Para os containers"
	@echo "  make logs     - Mostra logs em tempo real"
	@echo "  make restart  - Reinicia os containers"
	@echo "  make clean    - Remove containers e volumes"
	@echo "  make shell    - Acessa shell do container"

build:
	docker-compose build

up:
	docker-compose up

up-d:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose down -v
	rm -rf data/*.db

shell:
	docker exec -it termo-backend sh

