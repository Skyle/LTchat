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

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    socket.on("chat message", msg => {
        Message.create({
            inhalt: msg.message,
            author: msg.author
        }).then(res => {
            io.emit("chat message", {
                message: msg.message,
                datum: res.zeit,
                author: msg.author
            });
            console.log(res);
        });
    });
    Message.find()
        .sort({ zeit: -1 })
        .limit(20)
        .then(msgs => {
            msgs.reverse().forEach(msg => {
                socket.emit("chat message", {
                    message: msg.inhalt,
                    datum: msg.zeit,
                    author: msg.author
                });
            });
        });
});

http.listen(3001, function() {
    console.log("listening on *:3001");
});
