var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const mongoose = require("mongoose");
mongoose.connect(
    "mongodb://localhost/chat",
    { useNewUrlParser: true }
);
const Message = mongoose.model("Message", {
    inhalt: String,
    zeit: { type: Date, default: Date.now },
    author: String,
    active: { type: Boolean, default: true }
});

io.on("connection", function(socket) {
    Message.find()
        .sort({ zeit: -1 })
        .limit(10)
        .then(msgs => {
            msgs.reverse().forEach(msg => {
                socket.emit("chat message", {
                    id: msg._id,
                    active: msg.active,
                    message: msg.inhalt,
                    datum: msg.zeit,
                    author: msg.author
                });
            });
        });
    socket.on("chat message", msg => {
        console.log(msg);

        Message.create({
            inhalt: msg.message,
            author: msg.author
        }).then(res => {
            io.emit("chat message", {
                id: res._id,
                active: true,
                message: res.inhalt,
                datum: msg.zeit,
                author: res.author
            });
        });
    });
});

http.listen(3001, function() {
    console.log("listening on *:3001");
});
