# Nexo

App de finanças pessoais: controle receitas e despesas, categorize movimentos, acompanhe o mês e exporte para Excel.

Feito como projeto de portfólio — stack completa (frontend + API + banco), com design system próprio.

## Como funciona

- **Frontend:** React + TypeScript + Tailwind (Vite) — telas e design system
- **Backend:** Django + DRF + JWT — API autenticada por usuário
- **Banco:** PostgreSQL (Docker) ou SQLite (local rápido)

Cada conta só vê os próprios dados. Dá para cadastrar categorias com cor, lançar transações, filtrar por período, ver o resumo no painel e baixar uma planilha.

### Telas
| Rota | O que faz |
|------|-----------|
| `/` | Landing |
| `/login` · `/register` | Acesso |
| `/dashboard` | Saldo, receitas, despesas e gráfico |
| `/transactions` | Lista, filtros, CRUD e Excel |
| `/categories` | Categorias |
| `/profile` | Dados, senha e exclusão de conta |

## Como rodar (recomendado no Windows)

Dois terminais.

**1. Backend**
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

$env:USE_SQLITE="1"
$env:DEBUG="1"
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8000
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

Abra **http://localhost:3000**

Login de teste: `demo` / `demo123`  
(ou crie sua própria conta em **Criar conta**)

> O `seed_demo` cria o usuário demo e algumas categorias. Sem esse comando, o banco começa vazio.

## Docker (opcional)

Com Docker instalado:

```bash
docker-compose up --build
```

- App: http://localhost:3000  
- API: http://localhost:8000/api/

## Estrutura

```
frontend/   → React (Vite) + design system
backend/    → Django API
```

## Stack

React · TypeScript · Tailwind · Recharts · Django · DRF · SimpleJWT · ExcelJS
