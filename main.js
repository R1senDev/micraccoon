const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const sensitivityCanvas = document.getElementById('sensitivityCanvas');
const sensitivityContext = sensitivityCanvas.getContext('2d');

const settingsBtn = document.getElementById('settings');
const sensitivity1 = document.getElementById('sensitivity1');
const sensitivity2 = document.getElementById('sensitivity2');
const calibrateBtn = document.getElementById('calibrate');

function switchSettings() {
	if (document.getElementById('settings').hidden) {
		document.getElementById('settings').hidden = false;
	} else {
		document.getElementById('settings').hidden = true;
	}
}

let backgroundColor = 'white';

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

class Raccoon_ {
	constructor() {
		this.isBlinking = false;
		this.mouthState = 0;
		this.sizeMultiplier = 0.5;
	}
	get width() {
		return Math.round(raccoonSprites.idle.width * this.sizeMultiplier);
	}
	get height() {
		return Math.round(raccoonSprites.idle.height * this.sizeMultiplier);
	}
}
let raccoon = new Raccoon_();

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
	speaking: 40,
	screaming: 60,
};

volume.updateRelative = function() {
	volume.current.relative = volume.current.absolute + volume.zero;
}

let instructionsHidden = false;
function hideInstructions() {
	if (!instructionsHidden) {
		instructionsHidden = true;
		let opacity = 0.4;
		let opacityDescreaser = setInterval(function() {
			if (opacity >= 0) {
				opacity -= 0.005;
				document.getElementById('instructions').style.opacity = opacity;
			} else {
				clearInterval(opacityDescreaser);
			}
		}, 10);
	}
}

function redraw() {
	context.fillStyle = backgroundColor;
	sensitivityContext.fillStyle = 'white';
	sensitivityContext.fillRect(0, 0, sensitivityCanvas.width, sensitivityCanvas.height);
	if (volume.current.absolute < 100) {
		sensitivityContext.fillStyle = 'green';
	} else {
		if (volume.current.absolute < 150) {
			sensitivityContext.fillStyle = 'yellow';
		} else {
			sensitivityContext.fillStyle = 'red';
		}
	}
	context.fillRect(0, 0, canvas.width, canvas.height);
	sensitivityContext.fillRect(0, 0, volume.current.relative, 20);
	sensitivityContext.fillStyle = 'grey';
	sensitivityContext.strokeRect(0, 0, sensitivityCanvas.width, sensitivityCanvas.height);
	sensitivityContext.strokeRect(1, 1, sensitivityCanvas.width - 1, sensitivityCanvas.height - 1);
	volume.updateRelative();
	canvas.width = raccoon.width;
	canvas.height = raccoon.height;
	// Игра "найди костыль и ничего не трогай"
	if (volume.current.relative < volume.speaking) {
		if (raccoon.isBlinking) {
			context.drawImage(raccoonSprites.idleBlinking, 0, 0, raccoonSprites.idleBlinking.width, raccoonSprites.idleBlinking.height, 0, 0, raccoon.width, raccoon.height);
		} else {
			context.drawImage(raccoonSprites.idle, 0, 0, raccoonSprites.idle.width, raccoonSprites.idle.height, 0, 0, raccoon.width, raccoon.height);
		}
	} else {
		if (volume.current.relative < volume.screaming) {
			hideInstructions();
			if (raccoon.isBlinking) {
				context.drawImage(raccoonSprites.openMouthBlinking, 0, 0, raccoonSprites.openMouthBlinking.width, raccoonSprites.openMouthBlinking.height, 0, 0, raccoon.width, raccoon.height);
			} else {
				context.drawImage(raccoonSprites.openMouth, 0, 0, raccoonSprites.openMouth.width, raccoonSprites.openMouth.height, 0, 0, raccoon.width, raccoon.height);
			}
		} else {
			hideInstructions();
			if (raccoon.isBlinking) {
				context.drawImage(raccoonSprites.screamingBlinking, 0, 0, raccoonSprites.screamingBlinking.width, raccoonSprites.screamingBlinking.height, 0, 0, raccoon.width, raccoon.height);
			} else {
				context.drawImage(raccoonSprites.screaming, 0, 0, raccoonSprites.screaming.width, raccoonSprites.screaming.height, 0, 0, raccoon.width, raccoon.height);
			}
		}
	}
}

function calibrate(reset) {
	if (!reset) {
		volume.zero = volume.current.absolute;
		volume.updateRelative();
		console.log(`Calibrated! Now volume.zero == ${volume.zero}.`);
	} else {
		volume.zero = 0;
		volume.updateRelative();
		console.log(`Reset! Now volume.zero == ${volume.zero}.`);
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
		volume.current.absolute = Math.round(average);
	};
})
.catch(function(err) {
	if (confirm('Нужно разрешить доступ к микрофону. Обновить страницу для повторного запроса разарешения?')) {
		window.location.reload();
	}
});

let redrawInterval = setInterval(redraw, 20);
redraw();