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
let blinkingTime = 50;
let blinkingInterval = setInterval(function() {
	raccoon.isBlinking = true;
	setTimeout(function() {
		raccoon.isBlinking = false;
	}, blinkingTime);
}, blinkingIntervalValue + blinkingTime);
let volume = {
	current: 0,
	zero: 1,
	speaking: {
		absolute: 51,
		relative: 50
	},
	screaming: {
		absolute: 76,
		relative: 75
	}
	update: setInterval(function() {
		volume.speaking.relative = volume.speaking.absolute + volume.zero;
		volume.screaming.relative = volume.screaming.absolute + volume.zero;
	}, 50),
};

function redraw() {
	context.fillStyle = backgroundColor;
	context.fillRect(0, 0, canvas.width, canvas.height);
	if (volume.current < volume.speaking.absolute) {
		if (raccoon.isBlinking) {
			//context.drawImage(raccoonSprites.blinking, 0, 0, , , 0, 0, , );
		} else {
			//context.drawImage(raccoonSprites.idle, 0, 0, , , 0, 0, , );
		}
	} else {
		if (volume.current < volume.shouting.relative) {
			if (raccoon.isBlinking) {
				//context.drawImage(raccoonSprites.openMouthBlinking, 0, 0, , , 0, 0, , );
			} else {
				//context.drawImage(raccoonSprites.openMouth, 0, 0, , , 0, 0, , );
			}
		} else {
			if (raccoon.isBlinking) {
				//context.drawImage(raccoonSprites.shoutingBlinking, 0, 0, , , 0, 0, , );
			} else {
				//context.drawImage(raccoonSprites.shouting, 0, 0, , , 0, 0, , );
			}
		}
	}
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
		volume.current = Math.round(average);
	};
})
.catch(function(err) {
	console.error(err);
});

redraw();
