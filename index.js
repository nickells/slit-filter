'use strict';

// Put variables in global scope to make them available to the browser console.
const video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas#main');
const canvasOverlay = window.canvas = document.querySelector('canvas#overlay');
const container = document.getElementById('canvasContainer')
const context = canvas.getContext('2d')
const output = document.getElementById('output')
video.style.display = 'none';
const go = document.getElementById('go')
const reset = document.getElementById('reset')

container.style.position = 'relative'
// container.style.width = '480px'
// container.style.height = '360px'
canvas.style.position = 'absolute'
canvasOverlay.style.position = 'absolute'

canvasOverlay.width = 480;
canvas.width = 480;
canvasOverlay.height = 360;
canvas.height = 360;

const overlayContext = canvasOverlay.getContext('2d')

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

let animate = false
let videoX = 0

go.addEventListener('click', () => {
  animate = !animate
})
reset.addEventListener('click', () => {
  videoX = 0;
})

const flip = true

const videoXToCanvasX = (_videoX) => (_videoX / video.videoWidth) * canvas.width

canvasOverlay.addEventListener('mousemove', event => {
  const { offsetX } = event
  const proportion = offsetX / event.target.scrollWidth
  videoX = proportion * video.videoWidth
})

const loop = () => {
  // get proportion of canvas that matches the video line going thru
  let canvasX = videoXToCanvasX(videoX)

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
  overlayContext.clearRect(0, 0, canvas.width, canvas.height)
  overlayContext.beginPath()
  overlayContext.strokeStyle = 'black'
  overlayContext.moveTo(canvasX+2, canvas.height)
  overlayContext.lineTo(canvasX+2, 0)
  overlayContext.stroke();

  if (animate) {
    videoX++
  }
  if (videoX === video.videoWidth) {
    animate = false
  }

  requestAnimationFrame(loop)
}

loop()

/*
  ideas
  follow mouse
  sine wave
  flip 
*/
