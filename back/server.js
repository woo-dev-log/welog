const express = require('express');
const app = express();
const port = process.env.PORT || 3690;
const mysql = require('./mysql');
const path = require('path');
const http = require('http');
const { setupSocketIO } = require('./socket');
const { setupMiddlewares } = require('./middlewares');
const userRoutes = require('./routes/user');
const boardRoutes = require('./routes/board');
const commentRoutes = require('./routes/comment');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notification');

setupMiddlewares(app);

app.use('/api', userRoutes);
app.use('/api', boardRoutes);
app.use('/api', commentRoutes);
app.use('/api', chatRoutes);
app.use('/api', notificationRoutes);

const server = http.createServer(app);

const io = setupSocketIO(server, mysql);

app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, './dist', 'index.html'));
});

server.listen(port, () => {
    console.log(port + " port listening on!!");
})