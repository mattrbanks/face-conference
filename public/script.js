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
      peers[userId].name = "matt";
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
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

  console.log("Name: " + x);
  window.location.href = "/dashboard";
  document.getElementById("nameFormId").reset();
}

function roomSubmitHandler() {
  console.log("roomSubmitHandler worked");
  let x = document.forms["roomNameForm"]["roomName"].value;
  console.log("Room Name: " + x);
  //window.location.href = "/new-room";
  let text = x;
  let li = document.createElement("li");
  let node = document.createTextNode(text);
  li.appendChild(node);
  document
    .getElementById("room-list")
    .appendChild(li)
    .addEventListener("click", function () {
      window.location.href = "/new-room";
    });
  document.getElementById("roomNameFormId").reset();
}

// document
//   .getElementById("new-room-btn")
//   .addEventListener("click", function () {});
