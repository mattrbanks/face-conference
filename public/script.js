const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer({
  //host: "/",
  //port: "3002",
  debug: "3",
  //key: "peerjs",
  //host: "face-conference-peerjs-server2.herokuapp.com/",
  //port: 9000,
  secure: true,
  port: 443,
  //path: "face-conference-peerjs-server2.herokuapp.com/",
});
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
console.log(peers);
let roomIdTempHolder = [];
console.log(roomIdTempHolder);
let newRoom = window.location.href;
console.log(newRoom);
console.log(window.location.href);
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
      peers[userId].name = "matt"; //needs to be dynamic
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id); //room id and user id sent to server
  console.log(ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function submitHandler() {
  console.log("submitHandler worked");
  let x = document.forms["nameForm"]["name"].value;
  socket.emit("user-name", x);
  console.log("Name: " + x);
  window.location.href = "/dashboard";
  document.getElementById("nameFormId").reset();
  loadNameDash();
}

function roomSubmitHandler() {
  let generatedId = "";
  let theNewId = "";
  socket.emit("generate-id", () => {
    //THIS NEEDS TO TRIGGER THE SERVER TO GENERATE A UUID AND SEND IT BACK HERE FOR USE
    console.log("call server for uuid");
  });
  socket.on("new-id-generated", (newId) => {
    console.log(newId);
    console.log(generatedId);
    generatedId = newId.slice(0);
    theNewId = newId.slice(0);
    console.log(generatedId);
    console.log(theNewId);

    fetch("http://localhost:3001/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: theNewId,
      }),
    })
      .then((response) => response.text())
      .then((text) => console.log(text))
      .catch((err) => console.log(err));
  });
  let x = document.forms["roomNameForm"]["roomName"].value;
  console.log("Room Name: " + x);
  let text = x;
  let li = document.createElement("li");
  let node = document.createTextNode(text);
  li.appendChild(node);
  document
    .getElementById("room-list")
    .appendChild(li)
    .addEventListener("click", function () {
      window.location.href = generatedId; //this needs to be a generated uuid url - so "/uuid"
      roomIdTempHolder.push(newRoom);
      window.location.href = roomIdTempHolder[0];
      roomIdTempHolder = [];
    });
  document.getElementById("roomNameFormId").reset();
}

document.getElementById("url").innerText = `${window.location.href}`;