/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Put variables in global scope to make them available to the browser console.
const video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas');
const context = canvas.getContext('2d')
const output = document.getElementById('output')
video.style.display = 'none';


canvas.width = 480;
canvas.height = 360;

const constraints = {
  audio: false,
  video: true,
  width: 2,
  height: 2
};


function handleSuccess(stream) {
  window.stream = stream; // make stream available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
window.context = context

const resolution = 200
const w = resolution
const h = (canvas.height / canvas.width) * resolution

document.body.style.transition = 'background-color: 100ms'

const targetWarmth = 1.05

const loop = () => {
  // draw video to the canvas
  context.drawImage(video, 0, 0, w, h);
  const data = context.getImageData(0, 0, w, h).data
  const pixels = []

  // pixels come in groups of 4 at a time, rgbargbargba
  // map to an object with {r, g, b, a} so we can digest it
  let currentPixel = 0
  const map = ['r', 'g', 'b', 'a']
  for (let i = 0; i < data.length; i++) {
    let index = i % 4
    if (!pixels[currentPixel]) pixels[currentPixel] = {}
    pixels[currentPixel][map[index]] = data[i]
    if (index === 3) currentPixel++
  }

  // get total sum of all r g b
  const balance = pixels.reduce((sums, item) => {
    return {
      r: item.r + sums.r,
      g: item.g + sums.g,
      b: item.b + sums.b,
    }
  }, {
    r: 0,
    g: 0,
    b: 0,
  })

  // divide to get average out of 255
  balance.r = balance.r / pixels.length
  balance.g = balance.g / pixels.length
  balance.b = balance.b / pixels.length

  // calculate what is needed to get to 'neutral'
  const warmth = balance.r / balance.b // if this is "1" it is neutral

  const baseBrightness = 230 // out of 255, if all rgba are 200 then we get a light gray. we will modify this to be warmer or cooler
  
  const background = `rgb(${baseBrightness / warmth}, ${baseBrightness}, ${baseBrightness * warmth})`

  document.body.style.backgroundColor = background

  output.innerHTML = JSON.stringify({
    balance,
    warmth,
    bgColor: background
  }, null, 2)
  requestAnimationFrame(loop)
}

loop()

let visible = true
document.getElementById('toggle').addEventListener('click',() => {
  visible = !visible
  if (!visible) document.getElementById('container').style.opacity = 0
  else document.getElementById('container').style.opacity = 1
})