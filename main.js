const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let backgroundColor = 'green';

let raccoonSprites = {
	idle: new Image(),
	idleBlinking: new Image(),
	openMouth: new Image(),
	openMouthBlinking: new Image(),
	screaming: new Image(),
	screamingBlinking: new Image(),
};
raccoonSprites.idle.src = 'idle.png';
raccoonSprites.idleBlinking.src = 'idleBlinking.png';
raccoonSprites.openMouth.src = 'openMouth.png';
raccoonSprites.openMouthBlinking.src = 'openMouthBlinking.png';
raccoonSprites.screaming.src = 'screaming.png';
raccoonSprites.screamingBlinking.src = 'screamingBlinking.png';

let raccoon = {
	isBlinking: false,
	mouthState: 0,
}

let blinkingIntervalValue = 3000;
let blinkingTime = 100;
let blinkingInterval = setInterval(function() {
	raccoon.isBlinking = true;
	setTimeout(function() {
		raccoon.isBlinking = false;
	}, blinkingTime);
}, blinkingIntervalValue + blinkingTime);
let volume = {
	current: {
		relative: 0,
		absolute: 0
	},
	zero: 1,
	speaking: 30,
	screaming: 65,
};

volume.updateRelative = function() {
	volume.current.relative = volume.current.absolute + volume.zero;
}

function redraw() {
	context.fillStyle = backgroundColor;
	context.fillRect(0, 0, canvas.width, canvas.height);
	volume.updateRelative();
	if (volume.current.relative < volume.speaking) {
		if (raccoon.isBlinking) {
			context.drawImage(raccoonSprites.idleBlinking, 0, 0, raccoonSprites.idleBlinking.width, raccoonSprites.idleBlinking.height, 0, 0, raccoonSprites.idleBlinking.width, raccoonSprites.idleBlinking.height);
		} else {
			context.drawImage(raccoonSprites.idle, 0, 0, raccoonSprites.idle.width, raccoonSprites.idle.height, 0, 0, raccoonSprites.idle.width, raccoonSprites.idle.height);
		}
	} else {
		if (volume.current.relative < volume.screaming) {
			if (raccoon.isBlinking) {
				context.drawImage(raccoonSprites.openMouthBlinking, 0, 0, raccoonSprites.openMouthBlinking.width, raccoonSprites.openMouthBlinking.height, 0, 0, raccoonSprites.openMouthBlinking.width, raccoonSprites.openMouthBlinking.height);
			} else {
				context.drawImage(raccoonSprites.openMouth, 0, 0, raccoonSprites.openMouth.width, raccoonSprites.openMouth.height, 0, 0, raccoonSprites.openMouth.width, raccoonSprites.openMouth.height);
			}
		} else {
			if (raccoon.isBlinking) {
				//context.drawImage(raccoonSprites.shoutingBlinking, 0, 0, , , 0, 0, , );
			} else {
				//context.drawImage(raccoonSprites.screaming, 0, 0, , , 0, 0, , );
			}
		}
	}
}

function calibrate() {
	volume.zero = volume.current.absolute;
}

navigator.mediaDevices.getUserMedia({
	audio: true
})
.then(function(stream) {
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	const microphone = audioContext.createMediaStreamSource(stream);
	const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

	analyser.smoothingTimeConstant = 0.8;
	analyser.fftSize = 1024;

	microphone.connect(analyser);
	analyser.connect(scriptProcessor);
	scriptProcessor.connect(audioContext.destination);
	scriptProcessor.onaudioprocess = function() {
		const array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(array);
		const arraySum = array.reduce((a, value) => a + value, 0);
		const average = arraySum / array.length;
		volume.current.absolute = Math.round(average);
	};
})
.catch(function(err) {
	console.error(err);
});

let redrawInterval = setInterval(redraw, 20);
redraw();