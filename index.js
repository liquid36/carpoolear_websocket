let jwt = require('jsonwebtoken');
let redis = require('redis');

let server = require('http').createServer();
let io = require('socket.io')(server);

let secret = 'GNU0yagwZuyueXKV0OSfyNXLIqk9bpeR';

// [TODO] ENV VAR

let redisClient = redis.createClient(6379, '172.19.0.4'); 

server.listen(8890); 

redisClient.subscribe('user-notify'); 
 
redisClient.on("message", function(channel, message) {
    console.log("mew message in queue "+ message + " channel " + channel);
    io.emit(channel, message);
});

io.on('connection', function (socket) {
 
    console.log("new client connected");
 
    socket.on('auth', function (data) {
        jwt.verify(data, secret, function (err, encode) {
            console.log(err, encode);
            if (err) {
                socket.emit('auth', {status: false});
            } else {
                socket.emit('auth', {status: true});
            }
        });
    });
 
    socket.on('disconnect', function() {
        redisClient.quit();
    });
 
});