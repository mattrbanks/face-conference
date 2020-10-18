const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

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

app.get("/new-room", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.post("/dashboard", (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("got it");
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
  // let newGenId = "";
  // function generateId(v4) {
  //   let newId = `/${uuidV4()}`;
  // }

  socket.on("generate-id", (v4) => {
    // I need to somehow generate a uuid here and send it back to script.js
    // client side for use int he event listener for the generated list item
    let newId = `/${uuidV4()}`;
    io.emit("new-id-generated", newId);
  });
});

server.listen(process.env.PORT || 3001, () =>
  console.log("server is up and running")
);
