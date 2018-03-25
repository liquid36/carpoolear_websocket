require('dotenv').config({path: '../backend/.env'});

let jwt = require('jsonwebtoken');
let redis = require('redis');

let server = require('http').createServer();
let io = require('socket.io')(server);
server.listen(8890);


let secret = process.env.JWT_SECRET;
let redisPort = process.env.REDIS_PORT || '6379';
let redisHost = process.env.REDIS_HOST || '172.19.0.4';
// [TODO] ENV VAR

let redisClient = redis.createClient(redisPort, redisHost); 

redisClient.on('ready', () => {
    console.log('Ready Events');
    redisClient.psubscribe('user-*'); 
});

redisClient.on('pmessage', function(pattern, channel, plainText) {
    console.log(channel, plainText);
    let message = JSON.parse(plainText);
    let payload = message.data;
    io.to(channel).emit(message.event, payload);
    
});

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