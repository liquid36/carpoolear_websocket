let jwt = require('jsonwebtoken');
let redis = require('redis');

let server = require('http').createServer();
let io = require('socket.io')(server);
server.listen(8890); 


let secret = 'GNU0yagwZuyueXKV0OSfyNXLIqk9bpeR';

// [TODO] ENV VAR

let redisClient = redis.createClient(6379, '172.19.0.3'); 
redisClient.subscribe('user-notify'); 

redisClient.on("message", function(channel, plainText) {
    console.log(channel);
    let message = JSON.parse(plainText);
    let payload = message.data;
    switch (channel) {
        case 'user-notify':
            io.to(`user-${payload.user.id}`).emit(message.event, payload);
            break;
    }
    // console.log("mew message in queue "+ message + " channel " + channel);
    
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