# Chat-app

### [Live](https://chat-app-lh2l.onrender.com/)

A simple real-time chat application built with Vue 3 and Socket.io.
The project uses a session-based user model and persistent message storage to ensure consistent chat history. Messages are stored in a PostgreSQL database using Prisma.

![app preview](https://github.com/GalacticByte/Simple-Vue-Chat/blob/main/app-screenshot.png)

## Functionalities

- User login (session-based)
- User logout
- Send messages with timestamp information
- Real-time typing indicator
- Real-time messaging via Socket.io
- Persistent message storage in database
- Immutable author snapshot stored with each message to preserve chat history consistency

## Technologies

- TypeScript (used across the entire project)

### Frontend

- Vue 3
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express

### Real-time Communication

- Socket.io (client & server)

### Authentication

- JWT

### Database

- PostgreSQL
- Prisma

## Setup

To run this project, install it locally using npm:

#### Server

```
$ cd server
$ npm install
$ npm run dev

```

#### Client

```
$ cd client
$ npm install
$ npm run dev

```

#### Shared

```
$ cd shared
$ npm install
$ npm run build

```

## Architecture and Design Decisions

This project includes both frontend and minimal backend logic to support real-time chat functionality and ensure data consistency.

Users are managed as session-based entities: they are stored in the database upon login and removed on logout.
Messages are persistent and include an immutable snapshot of the author's nickname at the time of sending, ensuring chat history remains consistent even after a user disconnects.

The architecture and data handling were intentionally designed for this portfolio project to demonstrate practical development skills and real-time application concepts.
