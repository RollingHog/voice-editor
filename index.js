try {
  var recognition = new webkitSpeechRecognition();
  recognition.lang = 'ru'
} catch (e) {
  console.error(e);
  alert('SpeechRecognition failed')
}

recognition.continuous = true;

recognition.onresult = function (event) {

  console.log(event)

  var current = event.resultIndex;

  var transcript = event.results[current][0].transcript;

  text_input.value += ' '+transcript
};

recognition.onstart = function () {
  instructions.innerText = 'Recognition on'
  led.style.backgroundColor = 'red'
}

recognition.onspeechend = function () {
  instructions.innerText = 'Recognition off (no sound timeout)'
  led.style.backgroundColor = 'grey'
}

recognition.onerror = function (event) {

}