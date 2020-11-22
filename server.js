const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  console.log(require("dotenv").config());
}
const mongoose = require("mongoose");

const users = {};

mongoose.set("useFindAndModify", false);
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to db!");
    server.listen(process.env.PORT || 3001, () =>
      console.log("server is up and running")
    );
  }
);

const Room = require("./models/rooms.model"); //should rooms be lowercase?

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/dashboard", (req, res) => {
  res.render("home");
});

app.get("/new-room", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

//passing data from server to ejs file
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.post("/dashboard", (req, res) => {
  const newRoom = new Room({
    room: req.body.room,
  });

  newRoom
    .save()
    .then(() => res.json("Room added! " + req.body.room))
    .catch((err) => res.status(400).json("Error: " + err));
});

app.post("/", (req, res) => {
  res.send("got it! " + req.body.name);
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId); // roomId is a url route so you join it, via websocket, by going to the url roomId
    socket.to(roomId).broadcast.emit("user-connected", userId); //share your stream with all people in same room but yourself

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId); //delete your stream with all people in same room
    });
  });

  socket.on("user-name", (userName) => {
    users[socket.id] = userName;
  });

  socket.on("send-back-name", (obj) => {
    let socketId = socket.id;
    obj.name = users[socketId];
    socket.emit("send-back-name", Object.entries(users));
  });

  socket.on("generate-id", (v4) => {
    // generate a uuid here and send it back to script.js
    // client side for use in the event listener for the generated list item
    let newId = `/${uuidV4()}`;
    io.emit("new-id-generated", newId);
  });
});
