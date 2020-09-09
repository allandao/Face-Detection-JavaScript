const webcamVideo = document.getElementById('face-recognition-video-input');

// Promise.all(iterable); - An iterable object such as an Array. Iterable refers to an object that can return a member one at a time
// Promise.all helps to aggregate a group of promises, which is helpful for async operations.
// Promise: A promise is an object that may produce a single value some time in the future
// https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-promise-27fc71e77261
// Async calls in parallel, greatly helping speed loading in the models
Promise.all([
  // Classes from face-api.js
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo(){
  navigator.mediaDevices.getUserMedia({ video: {}}).then((stream) => 
    { webcamVideo.srcObject = stream; }, 
    (err) => console.error(err)
  );
}

webcamVideo.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(webcamVideo);
  document.body.append(canvas);
  const canvasDisplaySize = { width: webcamVideo.width, height: webcamVideo.height }
  faceapi.matchDimensions(canvas, canvasDisplaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(webcamVideo,
    new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    // .tinyFaceDetectorOptions() -> leads to 'not a constructor' error
    console.log(detections);
    const resizedDetections = faceapi.resizeResults(detections, canvasDisplaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})

//startWebcamVideo(); Not needed since the function is called after Promise.all