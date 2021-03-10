try {
  var recognition = new webkitSpeechRecognition();
  recognition.lang = 'ru'
  recognition.continuous = true;
  
  b_switch_recognition.onclick = switchRecognition
} catch (e) {
  console.error(e);
  alert('SpeechRecognition failed')
}

var transcript
recognition.onresult = function (event) {

  var current = event.resultIndex;

  transcript = event.results[current][0].transcript;
  
  if(checkForCommands(transcript)) {
    return
  }
  addToInput(transcript)

};

recognition.onstart = function () {
  recog_status.innerText = 'Recognition on'
  b_switch_recognition.style.backgroundColor = 'red'
}

recognition.onspeechend = function () {
  recog_status.innerText = 'Recognition off (no sound timeout)'
}

recognition.onerror = function (event) {

}

function switchRecognition() {
  try {
    recognition.start()
    b_switch_recognition.style.backgroundColor = 'red'
  } catch (e) {
    recognition.stop()
    b_switch_recognition.style.backgroundColor = ''
  }
}

function checkForCommands(str) {
  str = str
    .toLowerCase()
    .trim()
    
  console.log(str)
  
  var list = [
    ["удалить последнее слово", removeLastWord],
    ["удалить последний блок", removeLastBlock],
  ]
  
  for (let i of list) {
    if( str.search(new RegExp(i[0])) == 0 ) {
      if(i.length == 2)
        i[1]()
      else
        i[1](i[2])
      return true
    }
  }
  
  return false
}

function removeLastWord() {
  var lastIndex = text_input.value.lastIndexOf(" ");
  text_input.value = text_input.value.substring(0, lastIndex);
}

function removeLastBlock() {
  //ha
}

function addToInput(str) {
  text_input.value += ' '+transcript
}