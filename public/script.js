let myStream;
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myStream = stream;
    addVideoStream(myVideo, stream);
    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });

    socket.on('createMessage', (message) => {
      const messageList = document.getElementById('messages_list');
      messageList.insertAdjacentHTML(
        'beforeend',
        `<li class="message"><small>user</small><br/>${message}</li>`
      );
    });

    document.addEventListener('keydown', (e) => {
      let msg = document.getElementById('chat_message');
      if (e.key === 'Enter' && msg.value.length > 0) {
        socket.emit('message', msg.value);
        msg.value = '';
      }
    });
  });

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const muteUnmute = () => {
  const enabled = myStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const playStop = () => {
  let enabled = myStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
};
