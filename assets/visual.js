var audioCtx,
	audioEl,
	analyser,
	bufferLength,
	canvasCtx,
	source,
	dataArray,
	visualActive = false,
	WIDTH  = 600,
	HEIGHT = 100;

function visualInit()
{
	var canvas = document.getElementById('player-vis');

	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	canvasCtx = canvas.getContext('2d');
	
	audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	analyser = audioCtx.createAnalyser();
	analyser.minDecibels = -180;
	analyser.maxDecibels = -20;
		
	analyser.fftSize = 2048;
	bufferLength = analyser.frequencyBinCount;
	dataArray = new Uint8Array(bufferLength);
}

function visualStart() {
	radioPlayer.crossOrigin = "anonymous";
	source = audioCtx.createMediaElementSource(radioPlayer);
    source.connect(analyser);
	source.connect(audioCtx.destination);

	visualActive = true;
	draw();
}

function visualStop() {
	visualActive = false;
	
}

function draw()
{
	if (visualActive && settings.visualsActive)
		requestAnimationFrame(draw);
	else { // clean up the canvas 
		canvasCtx.fillStyle = 'rgb(0, 0, 0)';
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		return;
	}

	analyser.getByteTimeDomainData(dataArray);
	
	canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.07)';
	canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

	canvasCtx.strokeStyle = 'rgba(81, 6, 92, 0.95)';
	canvasCtx.lineWidth = 2;

	canvasCtx.beginPath();
	var sliceWidth = WIDTH * 1.0 / bufferLength;
	
	var x = 0;

	for (var i = 0; i < bufferLength; i++) {

		var v = dataArray[i] / 128.0,
			y = v * HEIGHT / 2;

		if(i === 0) {
			canvasCtx.moveTo(x, y);
		} else {
			canvasCtx.lineTo(x, y);
		}

		x += sliceWidth;
    }

    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
}

function error (e) {
	console.log(e); // hm...
}