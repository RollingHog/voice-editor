const VERSION = '1.3.5'

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

  transcript = checkForAbbreviations(transcript)

  addToInput(transcript)

}

recognition.onstart = function () {
  // getEl('recog_status').innerText = 'Recognition on'
  getEl('b_switch_recognition').style.backgroundColor = 'red'
}

recognition.onspeechend = function () {
  // getEl('recog_status').innerText = 'Recognition off'
  getEl('b_switch_recognition').style.backgroundColor = ''
}

recognition.onerror = function (_) {

}

function switchRecognition() {
  try {
    recognition.start()
    getEl('b_switch_recognition').style.backgroundColor = 'red'
    return 'start'
  } catch (e) {
    recognition.stop()
    getEl('b_switch_recognition').style.backgroundColor = ''
    return 'end'
  }
}

var commandsList = [
  ["удалить последнее слово", removeLastWord],
  ["удалить три последних слова", removeLast3Words],
  ["удалить последнее предложение", removeLastSentence],
  ["удалить последнюю строку", removeLastLine],
  ["удалить всё", removeAll],

  ["следующая строка", nextLine],
  ["новая строка", nextLine],

  ["продублировать последнюю строку", duplicateLastLine],

  ["прекратить распознание", stopRecognition],

  ["нормализовать", normalizeWithFirstScheme],
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

function removeLastLine() {
  const str = getEl('text_input').value
  getEl('text_input').value = str.substring(0, str.lastIndexOf('\n'))
}

function removeAll() {
  getEl('text_input').value = ''
}

function nextLine() {
  getEl('text_input').value += '\n'
}

function duplicateLastLine() {
  let str = getEl('text_input').value
  if(str.endsWith('\n')) {
    str = getEl('text_input').value = str.slice(0,-1)
  }
  getEl('text_input').value += str.substring(str.lastIndexOf('\n'))
}

function stopRecognition() {
  recognition.stop()
}

function normalizeWithFirstScheme() {
  var a = getEl('text_input').value
    .trim()
    .split('\n')
    .map( e => e.trim())

  for(let i in a) {

    a[i] = a[i]
      .replace(/  +/g, ' ')
      .replace(/ +\(?представитель\)?/, '(представитель)')
      .replace(/2:00/, ' 2 часа,')
      .replaceAll(/(\d)-(\d)/g, '$1$2')
      .replaceAll(/(\d) (\d)/g, '$1$2')
      .replace(/^([^ ]+ [^ ]+) ([^ ]+) ?/, '$1\t$2\t')
      .replace(/\(представитель/, ' (представитель')
      .replace(/\t(\+7|8)/, '\t7')
  }

  getEl('text_input').value = a.join('\n')
}

const abbrList = [
  ["кроссов(ок|ка)", "кросс"],
  ["петух", "пит"],
  ["венера", "КВД"],
  ["танк", "КВВ"],
]

function checkForAbbreviations(str) {

  for (let i of abbrList) {
    str = str.replace(new RegExp(i[0], 'gi'), i[1])
  }

  return str
}

function addToInput(str) {
  getEl('text_input').value += str
}

function init() {
  document.getElementById('commands_list').innerHTML =
    commandsList.map(e => `<li onclick="${e[1].name}()">${e[0]}</li>`).join('\n')
}

function checkHotkeys(e) {
  // console.log(e)
  switch (e.code) {
    case 'ControlRight':
      if(switchRecognition() == 'end') {
        setTimeout(_ => addToInput('\n'), 100)
      }
      break
    case 'Digit0':
      if(!e.ctrlKey) return
      normalizeWithFirstScheme()
      break
    case 'KeyD':
      if(!e.ctrlKey) return
      duplicateLastLine()
      break
    default:
      return true
  }

  e.preventDefault()
  e.stopPropagation()
  return false
}

window.addEventListener('load', init)

window.addEventListener('keydown', checkHotkeys, true)

window.onbeforeunload = function(_){
  if(getEl('text_input').value)
    return true
}
