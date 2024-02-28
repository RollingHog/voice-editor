const VERSION = '1.6.2'

function getEl(str) {
  return document.getElementById(str)
}

try {
  getEl('version_el').innerHTML = VERSION
} catch (error) { }

try {
  var recognition = new window.webkitSpeechRecognition()
  recognition.lang = 'ru'
  recognition.continuous = true

  getEl('b_switch_recognition').onclick = switchRecognition
} catch (e) {
  console.error(e)
  alert('SpeechRecognition failed')
}

const textarea = {
  /**
   * @param {string} str
   */
  set adder(str) {
    getEl('text_input').value += str
  },

  /**
   * @param {string} str
   */
  set setter(str) {
    getEl('text_input').value = str
  },
}

var transcript
recognition.onresult = function (event) {

  var current = event.resultIndex

  transcript = event.results[current][0].transcript

  if (checkForCommands(transcript)) {
    return
  }

  transcript = checkForAbbreviations(transcript)

  if (getEl('inp_add_space').checked) transcript += ' '
  if (getEl('inp_add_newline').checked) transcript += '\n'

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
  ["исправить типографию", fixTypography, 'Alt+0'],

  ["удалить последнее слово", removeLastWord],
  ["удалить три последних слова", removeLast3Words],
  ["удалить последнее предложение", removeLastSentence],
  ["удалить последнюю строку", removeLastLine],
  ["удалить всё", removeAll],

  ["следующая строка", nextLine],
  ["новая строка", nextLine],

  ["продублировать последнюю строку", duplicateLastLine, 'Ctrl+D'],

  ["прекратить распознание", stopRecognition],

  ["нормализовать", normalizeWithFirstScheme],
]

function checkForCommands(str) {
  str = str
    .toLowerCase()
    .trim()

  console.log(str)

  for (let i of commandsList) {
    if (str.search(new RegExp(i[0])) == 0) {
      if (i.length == 2)
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
  textarea.setter = getEl('text_input').value.substring(0, lastIndex)
}

function removeLast3Words() {
  removeLastWord()
  removeLastWord()
  removeLastWord()
}

function removeLastSentence() {
  var arr = getEl('text_input').value.match(/[А-Я]/g)
  var lastIndex = getEl('text_input').value.lastIndexOf(arr[arr.length])
  textarea.setter = getEl('text_input').value.substring(0, lastIndex)
}

function removeLastLine() {
  const str = getEl('text_input').value
  textarea.setter = str.substring(0, str.lastIndexOf('\n'))
}

function removeAll() {
  textarea.setter = ''
}

function nextLine() {
  textarea.adder = '\n'
}

function duplicateLastLine() {
  let str = getEl('text_input').value
  if (str.endsWith('\n')) {
    str = textarea.setter = str.slice(0, -1)
  }
  textarea.adder = str.substring(str.lastIndexOf('\n')) + '\n'
}

function stopRecognition() {
  recognition.stop()
}

function normalizeWithFirstScheme() {
  var a = getEl('text_input').value
    .trim()
    .split('\n')
    .map(e => e.trim())

  for (let i in a) {

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

  textarea.setter = a.join('\n')
}

function fixTypography() {
  textarea.setter = getEl('text_input').value
    .replace(/запятая/g, ',')
    .replace(/точка/g, '.')
    .replace(/кавычка/g, '"')
    .replace(/скоб(оч)?ка открывается/g, '(')
    .replace(/скоб(оч)?ка закрывается/g, ')')
    .replace(/двоеточие/g, ':')
    .replace(/(знак вопроса|вопросительный знак)/g, '?')
    .replace(/восклицательный знак/g, '!')
    .replace(/ ([,.!?:;)])/g, '$1')
    .replace(/([(]) /g, '$1')
    .replace(/" ([^"]+) "/g, '"$1"')
    .replace(/([,.!?:;])([^ .!])/g, '$1 $2')
    .replace(/^[а-я]/g, function (match) { return match.toUpperCase() })
    .replace(/([.!?]) ([а-я])/g, function (match) { return match.toUpperCase() })
    .replace(/([а-я,]) ([А-Я][а-я]+)/g, function (match, _gr1, _gr2) { return match.toLowerCase() })
    .replace(/ {2}/g, ' ')
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
  textarea.adder = str
}

function init() {
  document.getElementById('commands_list').innerHTML =
    commandsList.map(e => `<li onclick="${e[1].name}()">${e[0]}${e[2] ? `&nbsp;<kbd>${e[2]}</kbd>` : ''}</li>`).join('\n')

  getEl('b_cut').onclick = _ => {
    fixTypography()
    navigator.clipboard.writeText(getEl('text_input').value)
    getEl('text_input').value = ''
  }
  getEl('text_input').focus()
}

function checkHotkeys(e) {
  // console.log(e)
  switch (e.code) {
    case 'ControlRight':
      switchRecognition()
      break
    case 'Digit0':
      if (!e.altKey) return
      fixTypography()
      break
    case 'KeyD':
      if (!e.ctrlKey) return
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

window.onbeforeunload = function (_) {
  if (getEl('text_input').value)
    return true
}
