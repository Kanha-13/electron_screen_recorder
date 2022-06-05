const videoElement = document.querySelector('video')
const startBtn = document.getElementById("startBtn")
const stopBtn = document.getElementById("stopBtn")
const { ipcRenderer } = require('electron')
const videoSelectBtn = document.getElementById("videoSelectBtn")
const openWindowMenu = () => {
  ipcRenderer.invoke("OPEN_WINDOW_LIST");
}
videoSelectBtn.onclick = openWindowMenu;

let mediaRecorder;
const recordedChunks = [];

ipcRenderer.on('menuOpened', async (e, source) => {
  videoSelectBtn.innerText = source.name;
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  }
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  videoElement.srcObject = stream;
  videoElement.play();

  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options)
  mediaRecorder.ondataavailable = handelDataAvailable;
  mediaRecorder.onstop = handelStop;
})


function handelDataAvailable(e) {
  console.log("video data available")
  recordedChunks.push(e.data)
}

async function handelStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  })

  console.log(blob.arrayBuffer)
  const buffer = Buffer.from(await blob.arrayBuffer());
  ipcRenderer.send("show:dialog", buffer)
}

startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};
