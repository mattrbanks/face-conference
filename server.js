const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
require("dotenv").config();
const mongoose = require("mongoose");

//const users = { someid: "some name" };
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
    //app.listen(3000, () => console.log("Server Up and running"));
  }
);

const Room = require("./models/rooms.model"); //should rooms be lowercase?

app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(express.static(__dirname + "/public"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/dashboard", (req, res) => {
  res.render("home");
});

// let userNameTemp = [];
// app.get("/:dashboard", (req, res) => {
//   console.log("user name received: " + userNameTemp[0]);
//   if (userNameTemp.length !== 0) {
//     let userNameDash = userNameTemp[0].slice(0);
//     res.render("home", { data: { userName: userNameDash } });
//   }

//   //userNameTemp = [];
// });

app.get("/new-room", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

//passing data from server to ejs file
app.get("/:room", (req, res) => {
  //console.log(req.params);
  res.render("room", { roomId: req.params.room });
});

app.post("/dashboard", (req, res) => {
  console.log(req.body.room);
  console.log(typeof req.body.room);
  const newRoom = new Room({
    room: req.body.room,
  });

  newRoom
    .save()
    .then(() => res.json("Room added! " + req.body.room))
    .catch((err) => res.status(400).json("Error: " + err));
  // console.log(req.body);
  // res.send(req.body);
});

app.post("/", (req, res) => {
  console.log(req.body.name);
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
    // console.log("Got the user name: " + userName);
    // console.log(socket.id);
    users[socket.id] = userName;
    console.log(users);
    console.log(users[socket.id]);
    //socket.emit("send-back-name", userName);
    // userNameTemp.push(userName);
    // console.log(userNameTemp);
  });

  socket.on("send-back-name", (obj) => {
    console.log(users);
    console.log(obj);
    let socketId = socket.id;
    obj.name = users[socketId];
    console.log(obj);
    console.log(users);
    console.log(socket.id);
    console.log(socket.id in users);
    socket.emit("send-back-name", Object.entries(users));
    // if (socket.id in users) {
    //   console.log("id is here");
    // }
  });

  socket.on("generate-id", (v4) => {
    // I need to somehow generate a uuid here and send it back to script.js
    // client side for use int he event listener for the generated list item
    let newId = `/${uuidV4()}`;
    io.emit("new-id-generated", newId);
  });
});

// server.listen(process.env.PORT || 3001, () =>
//   console.log("server is up and running")
// );
