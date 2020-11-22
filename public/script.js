const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer({
  //hosted server
  key: "peerjs",
  host: "face-conference-peerjs-server2.herokuapp.com",
  secure: true,
  port: 443,
});
const myVideo = document.createElement("video");
myVideo.muted = true; // The user should not hear their own voice

let audioButton = document.getElementById("audio-btn"); //Audio ON-OFF toggle button
let videoButton = document.getElementById("video-btn"); //Video ON-OFF toggle button
let inviteLink = document.getElementById("copy-url-btn"); //Invite copy Link Button

inviteLink.onclick = function () {
  let tempInput = document.createElement("input"); //Create Input Element
  text = window.location.href; //Set text variable
  document.body.appendChild(tempInput); //Adding tempInput Input to body
  tempInput.value = text; //Setting the tempInput input value
  tempInput.select(); //Select the tempInput input
  document.execCommand("copy"); //Execute copy command
  document.body.removeChild(tempInput); //Remove tempInput input
  alert(
    "The invite Link is copied to your clipboard. You can email this link to anyone you want to attend your meeting."
  ); //Give alert to user
};

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

    let streamVar = stream;
    let micSwitch = true; // mic is on initially
    console.log(micSwitch);
    let videoSwitch = true; // video of user is on initially
    console.log(videoSwitch);

    //video mute
    videoButton.onclick = function () {
      if (streamVar != null && streamVar.getVideoTracks().length > 0) {
        //If video exists
        videoSwitch = !videoSwitch; //Toggle video of user
        console.log(videoSwitch);

        streamVar.getVideoTracks()[0].enabled = videoSwitch;
        if (videoSwitch === true) {
          document.getElementById("video-on").className = "visible";
          document.getElementById("video-off").className = "invisible";
        } else if (videoSwitch === false) {
          document.getElementById("video-on").className = "invisible";
          document.getElementById("video-off").className = "visible";
        }
      }
    };
    //Audio mute
    audioButton.onclick = function () {
      if (streamVar != null && streamVar.getAudioTracks().length > 0) {
        micSwitch = !micSwitch; //Toggle Mic
        console.log(micSwitch);

        streamVar.getAudioTracks()[0].enabled = micSwitch;
        if (micSwitch === true) {
          document.getElementById("audio-on").className = "visible";
          document.getElementById("audio-off").className = "invisible";
        } else if (micSwitch === false) {
          document.getElementById("audio-on").className = "invisible";
          document.getElementById("audio-off").className = "visible";
        }
      }
    };

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
      //check other console of other user because broadcast is only sent to other users but not you
      peers[userId].name = sessionStorage.getItem("name"); //needs to be dynamic
      //console logs put here will be visible on another users console because of broadcast
    });
  })
  .catch((err) => {
    console.log(err);
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on("open", (id) => {
  //your websocket is used to join a generated room
  socket.emit("join-room", ROOM_ID, id); //room id and user id sent to server
  console.log(ROOM_ID, id);
  console.log(peers);
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

function dashName() {
  socket.emit("send-back-name", { name: "" });
  socket.on("send-back-name", (userName) => {
    console.log(socket.id);
    console.log(userName);
  });
  if (typeof Storage !== "undefined") {
    // Retrieve
    document.getElementById("user-name").innerHTML =
      "Hello " + sessionStorage.getItem("name") + ",";
  } else {
    document.getElementById("user-name").innerHTML =
      "Sorry, your browser does not support Web Storage...";
  }
}

function rename() {
  window.location.href = "/";
}

function submitHandler() {
  console.log("submitHandler worked");
  let x = document.forms["nameForm"]["name"].value;
  console.log("Name: " + x);
  let userDbNumber = x + Math.random();
  console.log(userDbNumber);

  fetch("http://localhost:3001/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: userDbNumber,
    }),
  })
    .then((response) => response.text())
    .then((text) => console.log(text))
    .catch((err) => console.log(err));

  document.getElementById("nameFormId").reset();
  document.getElementById("login-name").style.display = "none";
  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").className = "visible";
  // Check browser support
  if (typeof Storage !== "undefined") {
    // Store
    sessionStorage.setItem("name", x);
    // Retrieve
    document.getElementById("user-name").innerHTML =
      "Hello " + sessionStorage.getItem("name") + ",";
  } else {
    document.getElementById("user-name").innerHTML =
      "Sorry, your browser does not support Web Storage...";
  }
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
  let text = "Room " + Math.random();
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

function scrollToBottom() {
  document.getElementById("login-name").scrollIntoView(false); // scroll to bottom of element
}
