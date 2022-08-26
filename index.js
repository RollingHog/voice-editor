const VERSION = '1.1.0'

function getEl(str) {
  return document.getElementById(str)
}

try {
  getEl('version_el').innerHTML = VERSION
} catch (error) {}

try {
  var recognition = new window.webkitSpeechRecognition()
  recognition.lang = 'ru'
  recognition.continuous = true

  getEl('b_switch_recognition').onclick = switchRecognition
} catch (e) {
  console.error(e)
  alert('SpeechRecognition failed')
}

var transcript
recognition.onresult = function (event) {

  var current = event.resultIndex

  transcript = event.results[current][0].transcript

  if(checkForCommands(transcript)) {
    return
  }
  addToInput(transcript)

}

recognition.onstart = function () {
  getEl('recog_status').innerText = 'Recognition on'
  getEl('b_switch_recognition').style.backgroundColor = 'red'
}

recognition.onspeechend = function () {
  getEl('recog_status').innerText = 'Recognition off'
}

recognition.onerror = function (_) {

}

function switchRecognition() {
  try {
    recognition.start()
    getEl('b_switch_recognition').style.backgroundColor = 'red'
  } catch (e) {
    recognition.stop()
    getEl('b_switch_recognition').style.backgroundColor = ''
  }
}

var commandsList = [
  ["удалить последнее слово", removeLastWord],
  ["удалить три последних слова", removeLast3Words],
  ["удалить последнее предложение", removeLastSentence],
  // ["удалить последний блок", removeLastBlock],
  ["удалить всё", removeAll],

  // ["следующая строка", nextLine],
  ["новая строка", nextLine],

  ["прекратить распознание", stopRecognition],

  ["нормализовать согласно первой схеме", normalizeWithFirstScheme],
]

function checkForCommands(str) {
  str = str
    .toLowerCase()
    .trim()

  console.log(str)

  for (let i of commandsList) {
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
  var lastIndex = getEl('text_input').value.lastIndexOf(" ")
  getEl('text_input').value = getEl('text_input').value.substring(0, lastIndex)
}

function removeLast3Words() {
  removeLastWord()
  removeLastWord()
  removeLastWord()
}

function removeLastSentence() {
  var arr = getEl('text_input').value.match(/[А-Я]/g)
  var lastIndex = getEl('text_input').value.lastIndexOf(arr[arr.length])
  getEl('text_input').value = getEl('text_input').value.substring(0, lastIndex)
}

function removeAll() {
  getEl('text_input').value = ''
}

function nextLine() {
  getEl('text_input').value += '\n'
}

function stopRecognition() {
  recognition.stop()
}

function normalizeWithFirstScheme() {
  var a = getEl('text_input').value
    .split('\n')
    .map( e => e.trim())

  for(let i in a) {
    if( isNaN(a[i].charAt(0)) ) {
      // it does not start with date
      a[i] = '0.00 ' + a[i]
    }

    a[i] = a[i]
      .replace(/ +\(?представитель/, '(представитель')
      .replace(/2:00/, ' 2 часа,')
      .replaceAll(/(\d)-(\d)/g, '$1$2')
      .replaceAll(/(\d) (\d)/g, '$1$2')
      .replace(/^([^ ]+) ([^ ]+ [^ ]+) ([^ ]+)/, '$1\t$2\t$3\t')
      .replace(/\(представитель/, ' (представитель')
      .replace(/\t(\+7|8)/, '\t7')
  }

  getEl('text_input').value = a.join('\n')
}

function addToInput(str) {
  getEl('text_input').value += str
}

function init() {
  document.getElementById('commands_list').innerHTML =
    commandsList.map(e => `<li onclick="${e[1].name}()">${e[0]}</li>`).join('\n')
}

window.addEventListener('load', init)

window.onbeforeunload = function(_){
  if(getEl('text_input').value)
    return true
}
