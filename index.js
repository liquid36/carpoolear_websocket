import { WsSendMessage } from './classes.js' 


require('dotenv').config({path: '../backend/.env'});



let redis = require('redis');
let secret = process.env.JWT_SECRET;
let redisPort = process.env.REDIS_PORT || '6379';
let redisHost = process.env.REDIS_HOST || '172.19.0.4';
let redisClient = redis.createClient(redisPort, redisHost); 

let Noderavel = require('@movilizame/noderavel');



let queueWorker = new Noderavel({
    client: redisClient,
    driver: 'redis',
    scope: {
        'STS\\Jobs\\WsSendMessage': WsSendMessage
    }
});

queueWorker.on('job', ({name, data}) => {
    switch (name) {
        case 'STS\\Jobs\\WsSendMessage':
            let channel = `user-${data.to}`;
            let payload = data.message;
            io.to(channel).emit('new-message', payload);
            break;
    } 
});

queueWorker.listen();

let jwt = require('jsonwebtoken');

let server = require('http').createServer();
let io = require('socket.io')(server);
server.listen(8890);

io.on('connection', function (socket) {
 
    console.log("new client connected");
 
    socket.on('auth', function (token) {
        jwt.verify(token, secret, function (err, encode) {
            if (err) {
                socket.emit('auth', {status: false});
            } else {
                let userId = encode.sub;
                socket.join(`user-${userId}`);
                socket.emit('auth', {status: true});
                console.log(`user-${userId} Auth`);
            }
        }); 
    });
 
    socket.on('disconnect', function() {
        redisClient.quit();
    });
 
});
