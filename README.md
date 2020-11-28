<p align="center"><img alt="Face Conference Login Screen" src="https://github.com/mattrbanks/professional-portfolio/blob/master/src/images/faceConferenceImg.png?raw=true" /></p>

<h1 align="center">
  Face Conference
</h1>

This is a video chat web application that can generate meetings for you and your friends to talk, face to face, privately online. This website utilizes WebRTC technology. The world is changing fast and video meetings are becoming more common. I wanted to experiment with WebRTC and this is a little project for me to familiarize myself with the technology.

## Technologies Used

- **JavaScript**

- **PeerJS**

- **EJS**

- **WebRTC**

- **Express**

- **Node**

- **Mongodb**

- **Socket.io**

## How Face Conference Works

1. Once on the landing page, tap the red down arrow or scroll down to login with any name. The name will appear on your dashboard. This login name will be used for additional features in the future. For now it just appears on the dashboard via session storage.
2. Once you are on the dashboard you can create a private room or you can join the public demo lobby. In either case, just click the room you want and it will take you inside the room.
3. Inside each room there is a button to copy the room url to the clipboard. There is another button that goes to gmail so the url can be shared via email. Each url is unique and is only accessible to those who possess it. Every room created is sent to a database with a timestamp for admin to keep track of created rooms. Each video call room has buttons to disable video and audio for each individual user. There is also an end call button that takes a user back to the dashboard.

## The Images

The images used on this site are all from Pixabay, Pexels, and Unsplash. These sites are all free image databases with no copyright restrictions on a Creative Commons license.

## Visit the website:

[face-conference.herokuapp.com](https://face-conference.herokuapp.com/)
