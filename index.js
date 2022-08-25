const VERSION = '1.0.0'

try {
  version_el.innerHTML = VERSION
} catch (error) {}

window.onbeforeunload = function(e){
  if(text_input.value)
    return true
}

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
  recog_status.innerText = 'Recognition off'
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
    ["удалить три последних слова", removeLast3Words],
    ["удалить последнее предложение", removeLastSentence],
    ["удалить последний блок", removeLastBlock],
    ["удалить всё", removeAll],
    
    ["следующая строка", nextLine],
    ["новая строка", nextLine],

    ["прекратить распознание", recognition.stop],

    ["нормализовать согласно первой схеме", normalizeWithFirstScheme],
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

function removeLast3Words() {
  removeLastWord()
  removeLastWord()
  removeLastWord()
}

function removeLastSentence() {
  var arr = text_input.value.match(/[А-Я]/g)
  var lastIndex = text_input.value.lastIndexOf(arr[arr.length]);
  text_input.value = text_input.value.substring(0, lastIndex);
}

function removeLastBlock() {
  //ha
}

function removeAll() {
  text_input.value = ''
}

function nextLine() {
  text_input.value += '\n'
}

function normalizeWithFirstScheme() {
  var a = text_input.value
    .split('\n')
    .map( e => e.trim())

  for(let i in a) {
    if( isNaN(a[i].charAt(0)) ) {
      // it does not start with date
      a[i] = '0.00 ' + a[i] 
    }

    a[i] = a[i]
      .replace(/ +\(?представитель/, '\(представитель')
      .replace(/2:00/, ' 2 часа,')
      .replaceAll(/(\d)-(\d)/g, '$1$2')
      .replaceAll(/(\d) (\d)/g, '$1$2')
      .replace(/^([^ ]+) ([^ ]+ [^ ]+) ([^ ]+)/, '$1\t$2\t$3\t')
      .replace(/\(представитель/, ' \(представитель')
      .replace(/\t(\+7|8)/, '\t7')
  }

  text_input.value = a.join('\n')
}

function addToInput(str) {
  text_input.value += transcript
}
