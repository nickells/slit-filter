'use strict';

// Put variables in global scope to make them available to the browser console.
const video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas');
const context = canvas.getContext('2d')
const output = document.getElementById('output')
video.style.display = 'none';
const go = document.getElementById('go')
const reset = document.getElementById('reset')

canvas.width = 480;
canvas.height = 360;

const constraints = {
  audio: false,
  video: true,
  // width: 3,
  // height: 3
};

function handleSuccess(stream) {
  window.stream = stream; // make stream available to browser console
  video.srcObject = stream;
  console.dir(video)
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
window.context = context


console.log(video)

let animate = false
let videoX = 0

go.addEventListener('click', () => {
  animate = !animate
})
reset.addEventListener('click', () => {
  videoX = 0;
})

const flip = true

const loop = () => {
  // get proportion of canvas that matches the video line going thru
  let canvasX = (videoX / video.videoWidth) * canvas.width

  // draw video to the canvas
  context.drawImage(video, 
    videoX, // source X start
    0, // source Y start
    video.videoWidth - videoX, // source width
    video.videoHeight,  // source height
    canvasX, // destination X start
    0, // destination Y start
    canvas.width - canvasX,  // destination width
    canvas.height // destination height
  )
  ;
  // const data = context.getImageData(0, 0, w, h).data

  // draw the line
  context.beginPath()
  context.strokeStyle = 'white'
  context.moveTo(canvasX+2, canvas.height)
  context.lineTo(canvasX+2, 0)
  context.stroke();

  if (animate) {
    videoX++
  }
  if (videoX === video.videoWidth) {
    animate = false
  }

  requestAnimationFrame(loop)
}

loop()
