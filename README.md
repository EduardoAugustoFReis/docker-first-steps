# 📅 Agenda API

API REST desenvolvida com **NestJS** para gerenciamento de agenda entre **clientes** e **nutricionistas**, permitindo criação de usuários, autenticação, definição de disponibilidade, agendamento de consultas e envio de notificações por e-mail.

Este projeto foi desenvolvido com foco nas boas práticas de backend e estudo de **Docker**, **PostgreSQL**, **Prisma**, **JWT** e **NestJS**.

---

## 🚀 Tecnologias Utilizadas

* **Node.js 20**
* **NestJS**
* **PostgreSQL**
* **Prisma ORM**
* **JWT Authentication**
* **Role-based Access Control (RBAC)**
* **Docker & Docker Compose**
* **Nodemailer (SMTP / Mailtrap)**

---

## 🧩 Funcionalidades

### 👤 Usuários

* Cadastro de usuários
* Listagem paginada de usuários
* Detalhes de um usuário
* Atualização e remoção
* Promoção de usuário para **NUTRITIONIST** (apenas ADMIN)

### 🔐 Autenticação

* Login com e-mail e senha
* Geração de token JWT
* Endpoint para obter usuário autenticado (`/auth/me`)

### 🗓️ Disponibilidade (Nutritionist)

* Criar horários disponíveis
* Listar próprios horários
* Remover horários

### 📅 Agendamentos (Appointments)

* Cliente agenda consulta
* Cliente lista seus agendamentos
* Nutricionista visualiza agenda (com filtros)
* Nutricionista confirma consulta
* Cliente cancela consulta

### ✉️ E-mails Automáticos

* Consulta agendada (cliente)
* Consulta confirmada (cliente)
* Consulta cancelada (cliente)
* Nova consulta agendada (nutricionista)
* Consulta cancelada (nutricionista)

---

## 🔑 Papéis do Sistema

* **CLIENT**: usuário padrão
* **NUTRITIONIST**: pode criar disponibilidade e gerenciar agenda
* **ADMIN**: pode promover usuários

O controle é feito via **Guards + Decorators (`@Roles`)**.

---

## 🧪 Rotas Principais

### Auth

```
POST   /auth        -> login
GET    /auth/me     -> usuário autenticado
```

### Users

```
POST   /users
GET    /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
PATCH  /users/:id/promote-to-nutritionist (ADMIN)
```

### Availability

```
POST   /availability            (NUTRITIONIST)
GET    /availability            (CLIENT)
GET    /availability/me         (NUTRITIONIST)
DELETE /availability/:id        (NUTRITIONIST)
```

### Appointments

```
POST   /appointments                  (CLIENT)
GET    /appointments/my               (CLIENT)
GET    /appointments/nutritionist/agenda (NUTRITIONIST)
PATCH  /appointments/:id/confirm      (NUTRITIONIST)
PATCH  /appointments/:id/cancel       (CLIENT)
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@postgres:5432/DB_NAME
DATABASE_URL_LOCAL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_pass
MAIL_FROM=no-reply@agenda.com
```

---

## 🐳 Rodando com Docker

* Para subir o container 
```bash
docker-compose up 
```
* Para subir o container sem travar o terminal
 ```bash
docker-compose up -d 
```
* Para parar o container
```bash
docker-compose down
```


A API estará disponível em:

```
http://localhost:3000
```

---

## 🛠️ Rodando Localmente (sem Docker)

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

---

## 📌 Observações
* O envio de e-mails usa **Mailtrap** para ambiente de desenvolvimento
---

## 📚 Objetivo do Projeto

Este projeto foi criado com o objetivo de:

* Praticar arquitetura backend
* Aprender Docker na prática
* Trabalhar com autenticação, autorização e domínio real
* Envio de E-mail 
---

## 📄 Licença

Este projeto é apenas para fins educacionais e de portfólio.
