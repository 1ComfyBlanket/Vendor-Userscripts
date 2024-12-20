// ==UserScript==
// @name         Events Calendar Avatars
// @namespace    http://tampermonkey.net/
// @version      2.66
// @description  Retrieve Google events calendar avatars at a higher resolution with much fewer inputs.
// @author       Wilbert Siojo
// @match        https://calendar.google.com/calendar/*
// @match        https://lh3.googleusercontent.com/*
// @match        https://acornapp.net/portal/home*
// @match        https://acornapp.net/portal/review*
// @match        https://www.acorntech.io/portal/home*
// @match        https://www.acorntech.io/portal/review*
// @match        https://acorntech.org/portal/home*
// @match        https://acorntech.org/portal/review*
// @match        http://localhost:8083/*
// @match        https://getcovey.com/covey/admin*
// @match        http://localhost:8080/covey/admin*
// @match        https://contacts.google.com/*
// @match        https://www.linkedin.com/*
// @icon         https://www.google.com/s2/favicons?domain=simply-how.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.setClipboard
// @grant        window.close
// ==/UserScript==

const SEARCH_BUTTON_CSS_CLASS = 'searchButton'
const DEFAULT_USER_AVATAR = 'default-user'
const DEFAULT_INITIAL_AVATAR = '/a/'
const ORIGINAL_AVATAR_SIZE = 's0-p-k-rw-no'
const DEFAULT_USER_AVATAR_SIZE = '(2560×2560)'

// Disable TrustedHTML for Google Contacts
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createHTML: (string, sink) => string,
    // createScriptURL: (string, sink) => string
    // createScript: (string, sink) => string
  })
}

// Inject CSS into the page
function addGlobalStyle(cssTrustedScript) {
  let head, style
  head = document.getElementsByTagName('head')[0]
  if (!head) {
    return
  }
  style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = cssTrustedScript
  head.appendChild(style)
}

// Style the button
addGlobalStyle(`
    .searchButton {
        box-shadow:inset 0px 1px 1px 0px #54a3f7;
        background-color:#007dc1;
        border-radius:4px;
        border:1px solid #124d77;
        display:inline-block;
        cursor:pointer;
        color:#ffffff;
        font-family:Arial;
        font-size:13px;
        padding:8px 8px;
        text-decoration:none;
        text-shadow:0px 1px 0px #154682;
        margin-left: 5px;
        text-transform:capitalize;
    }
    .searchButton:hover {
        background-color:#0061a7;
    }
    .searchButton:active {
        position:relative;
        top:1px;
    }
    .reverseImageSearchButton {
        box-shadow:inset 0px 1px 1px 0px #81b622;
        background-color:#59981a;
        border-radius:4px;
        border:1px solid #3d550c;
        padding:5px 8px;
    }
    .reverseImageSearchButton:hover {
        background-color:#3d550c;
    }
    .exposedEmail {
        background-color:#ffadad;
        border-radius:5px;
        border:1px solid #ff7070;
        display:inline-block;
        color:#000000;
        padding:0px 6px;
        text-decoration:none;
    }
`)

// "kx3Hed" is the guest tab in Gcal
function guestTab() {
  const div = document.getElementsByClassName('C32Mpb Zlotdb')[0]
  const guestTab = div.children[1].children[0]
  return guestTab
}

// "Ax4B8 ZAGvjd" is the "Create contact" in Contacts
function contactSearchBar() {
  return document.getElementsByClassName('U26fgb iZrPLc')
}

// "jPtXgd" is all of the listed email avatars
function emailAvatars() {
  return document.getElementsByClassName('xsCLGd')
}

// "gb_C gb_Ma gb_h" is the user account tab that contains the logged in user's name and email
function userEmail() {
  return document
      .getElementsByClassName('gb_d gb_ya gb_z')[0]
      ?.getAttribute('aria-label')
}

// "nBzcnc Wm6kRe Zce9sc K8SUFe X4Mf1d" is the Gcal email list starting from the email row element
function emailRows() {
  return document.getElementsByClassName('nBzcnc Wm6kRe Zce9sc K8SUFe X4Mf1d')
}

// Return the remove button from the given emailRow
function removeEmailButton(emailRow) {
  return emailRow.children[2].children[0].children[2].children[0]
}

// Capture the Gcal email input field by either placeholder text or classname
function emailInputField() {
  const placeholderLanguages = [
    'Add guests',
    'Añadir invitados',
    'Agregar invitados',
    'Magdagdag ng mga bisita',
  ]
  let input
  placeholderLanguages.some(placeholder => {
    input = document.querySelector(`[placeholder = "${placeholder}"]`)
    return input
  })
  if (!input) {
    input =
        document.getElementsByClassName('VfPpkd-fmcmS-wGMbrd') ??
        document.getElementsByClassName('whsOnd zHQkBf')

    for (let i = 0; i < input.length; i++) {
      if (!input[i]) {
        continue
      }
      if (input[i].offsetWidth === 320) {
        input = input[i]
      }
    }
  }

  return input
}

// Create and place buttons
function createButtons() {
  // "Open Images" button
  const openAvatarsButton = document.createElement('a')
  openAvatarsButton.addEventListener('click', openImages, false)
  openAvatarsButton.appendChild(document.createTextNode('Open Images'))
  const openAvatar = guestTab()
  openAvatar.parentNode.insertBefore(openAvatarsButton, openAvatar)
  openAvatarsButton.className = SEARCH_BUTTON_CSS_CLASS

  // "Copy Contacts" button
  const copyEmailsButton = document.createElement('a')
  copyEmailsButton.addEventListener(
      'click',
      () => {
        GM.setValue('gcalToAcornCopyEmails', true)
      },
      false
  )
  copyEmailsButton.appendChild(document.createTextNode('Copy Contacts'))
  openAvatar.parentNode.insertBefore(copyEmailsButton, openAvatar)
  copyEmailsButton.className = SEARCH_BUTTON_CSS_CLASS

  // "Clear All" button
  const clearEmailsButtons = document.createElement('a')
  clearEmailsButtons.addEventListener('click', clearEmailList, false)
  clearEmailsButtons.appendChild(document.createTextNode('Clear All'))
  openAvatar.parentNode.insertBefore(clearEmailsButtons, openAvatar)
  clearEmailsButtons.className = SEARCH_BUTTON_CSS_CLASS
}

// Create and place buttons for Contacts
function contactCreateButton() {
  // Prevent multiple buttons from being made
  if (
      !contactSearchBar().length ||
      contactSearchBar()[0].parentNode.children.length > 1
  ) {
    return
  }
  // "Open Images" button
  const openAvatarsButton = document.createElement('a')
  openAvatarsButton.addEventListener('click', contactOpenEmailAvatars, false)
  openAvatarsButton.appendChild(document.createTextNode('Open Images'))
  const openAvatar = contactSearchBar()[0]
  openAvatar.parentNode.insertBefore(openAvatarsButton, openAvatar.nextSibling)
  //Set className for CSS
  openAvatarsButton.className = SEARCH_BUTTON_CSS_CLASS
}

function contactOpenEmailAvatars() {
  document.querySelector(
      '#yDmH0d > c-wiz > div.QkOsze > div:nth-child(6) > div:nth-child(2) > div > div > div > div.E6Tb7b.psZcEd > div.v2jl3d > svg.NSy2Hd.cdByRd.RTiFqe.IRJKEb'
  ).click
  const imageArray = document.getElementsByClassName('i0Sdn')
  const uniqueImages = []
  for (let i = 0; i < imageArray.length; i++) {
    // Retrieve email
    let email =
        imageArray[i].parentElement.nextSibling.nextSibling.children[0].innerText
    // Retrieve avatar URL
    let imageLink = imageArray[i].nextSibling.outerHTML
        .split('"')[5]
        .split('s36')
    imageLink = `${imageLink[0]}${ORIGINAL_AVATAR_SIZE}`
    if (uniqueImages.includes(imageLink)) {
      continue
    }
    uniqueImages.push(imageLink)
    if (imageLink.includes('no/photo')) {
      continue
    }
    GM.setValue(imageLink, email)
    window.open(imageLink)
  }
}

/****
 *. Clickable avatars in Gcal hover card
 *. The hover card is directly from Google Contacts thus in order to execute this it must be loaded from that URL
 ********/

// Determine whether the script is running on the hover card or sidebar
let hoverCardInstance = false
if (window.location.href.includes('hovercard')) {
  hoverCardInstance = true
}

function hoverCardAvatar() {
  let avatar
  if (hoverCardInstance) {
    avatar = document.getElementsByClassName('oMU93c')[0]
  } else {
    avatar = document.getElementsByClassName('nj9uHf')[0]
  }
  return avatar
}
function hoverCardAvatarButton() {
  const avatar = hoverCardAvatar()
  avatar.removeEventListener('click', hoverCardOpenEmailAvatar)
  avatar.addEventListener('click', hoverCardOpenEmailAvatar, false)
}

function hoverCardOpenEmailAvatar() {
  // Retrieve email
  let email
  if (hoverCardInstance) {
    email = this.parentElement.nextSibling.children[1].children[0].innerText
  } else {
    email = this.parentElement.parentElement.nextSibling.children[0].innerText
  }
  // Retrieve avatar URL
  let imageLinkIdx
  if (hoverCardInstance) {
    imageLinkIdx = 5
  } else {
    imageLinkIdx = 3
  }
  let imageLink = this.outerHTML.split('"')[imageLinkIdx].split('=')
  imageLink = `${imageLink[0]}=${ORIGINAL_AVATAR_SIZE}`
  if (imageLink.includes(DEFAULT_USER_AVATAR)) {
    return
  }
  GM.setValue(imageLink, email)
  window.open(imageLink)
}

/****
 *. End of implementation for clickable avatars in Gcal hover card
 ********/

/****
 *. Persist Gcal and Google Contacts sidebar emails in storage
 ********/

async function storeSidebarContactsEmails() {
  /*
   * Contacts sidebar shrinks contents to fit into user's screen
   * This is to allow all email rows to load as they can't be
   * extracted if they're culled for being too far off the screen
   * */
  const html = document.getElementsByTagName('html')[0]
  const emailListContainer = document.getElementsByClassName('gTiOTb C8Dkz')[0]
  let emailListHeight = emailListContainer?.style?.height
  if (emailListHeight) {
    emailListHeight = emailListHeight.substring(0, emailListHeight.length - 2)
    const windowHeight = window.innerHeight
    const zoom = windowHeight / emailListHeight
    html.style.zoom = zoom < 1 ? zoom : 1
  }

  const emailRows = document.getElementsByClassName('hRP3bd')
  const user = await GM.getValue('userEmail', '')
  let emailList = []
  let emailListFiltered = []
  for (let i = 0; i < emailRows.length; i++) {
    const emails = emailRows[i].parentElement.nextSibling.children
    let imageUrl = emailRows[i].src.split('=')[0]
    imageUrl = `${imageUrl}=${ORIGINAL_AVATAR_SIZE}`
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i].innerText
      emailList.push({ email: email, avatar: imageUrl })
      if (
          email.includes('@') &&
          !imageUrl.includes(DEFAULT_USER_AVATAR) &&
          !imageUrl.includes(DEFAULT_INITIAL_AVATAR) &&
          !imageUrl.includes('gstatic.com') &&
          !user.includes(email)
      ) {
        emailListFiltered.push({ email: email, avatar: imageUrl })
      }
      if (
          i === 0 ||
          emails[0].innerText === emails[1].innerText ||
          !emails[0].innerText.includes('@')
      ) {
        continue
      }
      emails[i].className = 'exposedEmail'
    }
  }
  const emailListString = JSON.stringify(emailList)
  const emailListFilteredString = JSON.stringify(emailListFiltered)
  GM.setValue('contactEmailList', emailListString)
  GM.setValue('contactEmailListFiltered', emailListFilteredString)
}

async function storeGcalEmails() {
  const emailRows = emailAvatars()
  const user = await GM.getValue('userEmail', '')
  let emailList = []
  for (let i = 0; i < emailRows.length; i++) {
    const email =
        emailRows[i].parentElement.parentElement.parentElement.getAttribute(
            'data-hovercard-id'
        )
    let imageUrl = emailRows[i]
        .getAttribute('style')
        .split('"')[1]
        .split('=')[0]
    imageUrl = `${imageUrl}=${ORIGINAL_AVATAR_SIZE}`
    if (
        !imageUrl.includes(DEFAULT_USER_AVATAR) &&
        !imageUrl.includes(DEFAULT_INITIAL_AVATAR) &&
        !user.includes(email)
    ) {
      emailList.push({ email: email, avatar: imageUrl })
    }
  }
  const emailListString = JSON.stringify(emailList)
  GM.setValue('gcalEmailList', emailListString)
}

/****
 *. End of implementation for persisting Gcal and Google Contacts sidebar emails in storage
 ********/

async function removeEmailsWithoutAvatarFromList() {
  const functionInProgress = await GM.getValue(
      'removeEmailsWithoutAvatarFromList'
  )
  if (functionInProgress) {
    return
  }
  GM.setValue('removeEmailsWithoutAvatarFromList', true)
  // Waits until page is visible and delays to allow avatars to load
  const waitUntilPageIsVisible = setInterval(() => {
    if (document.hidden) {
      return
    }
    clearInterval(waitUntilPageIsVisible)
    setTimeout(async () => {
      const gcalEmailListString = await GM.getValue('gcalEmailList')
      const contactEmailListString = await GM.getValue(
          'contactEmailListFiltered'
      )
      const gcalEmailList = JSON.parse(gcalEmailListString)
      const contactEmailList = JSON.parse(contactEmailListString)
      const emails = emailRows()
      const emailsWithNoAvatar = []
      for (let emailRow of emails) {
        const email = emailRow.getAttribute('data-hovercard-id')
        const emailInGcalList = gcalEmailList.some(e => e.email === email)
        const emailInContactList = contactEmailList.some(e => e.email === email)
        if (!emailInGcalList && !emailInContactList) {
          const removeButton = removeEmailButton(email)
          emailsWithNoAvatar.unshift(removeButton)
        }
      }
      emailsWithNoAvatar.forEach(e => e.click())
      GM.setValue('removeEmailsWithoutAvatarFromList', false)
    }, 1500)
  }, 100)
}

async function openImages() {
  const emailListString = await GM.getValue('gcalEmailList')
  const emailListFilteredString = await GM.getValue('contactEmailListFiltered')
  const emailList = JSON.parse(emailListString)
  const emailListFiltered = JSON.parse(emailListFilteredString)
  const emails = new Set(emailList.map(e => e.email))
  const mergedEmailList = [
    ...emailList,
    ...emailListFiltered.filter(e => !emails.has(e.email)),
  ]
  for (let i = 0; i < mergedEmailList.length; i++) {
    const newEmail = mergedEmailList[i].email
    const imgUrl = mergedEmailList[i].avatar
    const oldEmails = (await GM.getValue(imgUrl))?.split(' ') ?? []
    const oldEmailsFiltered = oldEmails.filter(e => e.includes('@')).join(' ')
    if (oldEmailsFiltered.includes(newEmail)) {
      GM.setValue(imgUrl, oldEmailsFiltered)
    } else {
      const emails = `${oldEmailsFiltered} ${newEmail}`.trim()
      GM.setValue(imgUrl, emails)
    }
    window.open(imgUrl)
  }
}

async function pasteEmailList() {
  const gcalToAcornCopyEmails = await GM.getValue('gcalToAcornCopyEmails')
  if (gcalToAcornCopyEmails) {
    GM.setValue('gcalToAcornCopyEmails', false)
    const emailList = await GM.getValue('contactEmailList')
    const googleContactsInput = document.getElementById('google-contacts-input')
    googleContactsInput?.focus()
    googleContactsInput?.select()
    document.execCommand('insertText', false, emailList)
  }
}

function clearEmailList() {
  const emails = emailRows()
  const removeButtons = []
  for (let email of emails) {
    const removeButton = removeEmailButton(email)
    removeButtons.unshift(removeButton)
  }
  removeButtons.forEach(b => b.click())
}

// Create a button with the profile's email that can be clicked to copy to clipboard
async function copyEmailClipboard() {
  let email = await GM.getValue(window.location.href)
  email = email.split(' ')
  for (let i = 0; i < email.length; i++) {
    const copyEmail = document.createElement('a')
    copyEmail.addEventListener(
        'click',
        () => {
          GM.setClipboard(email[i])
        },
        false
    )
    copyEmail.appendChild(document.createTextNode(email[i]))
    const emailPosition = document.getElementsByTagName('body')[0]
    emailPosition.parentNode.insertBefore(copyEmail, emailPosition)
    copyEmail.className = SEARCH_BUTTON_CSS_CLASS
  }
}

// Button for reverse image searching the avatar
function reverseImageSearchButton() {
  const imageSearch = document.createElement('a')
  imageSearch.addEventListener(
      'click',
      () => {
        window.open(`https://www.google.com/searchbyimage?&image_url=${location}`)
      },
      false
  )
  imageSearch.appendChild(document.createTextNode('Image Search'))
  const emailPosition = document.getElementsByTagName('body')[0]
  emailPosition.parentNode.insertBefore(imageSearch, emailPosition)
  imageSearch.className = 'searchButton reverseImageSearchButton'
}

async function autoEmailInput() {
  const emailTask = await GM.getValue('emailTask')
  const emails = await GM.getValue('emaiList')
  if (!emailTask || emails === '') {
    return
  }
  GM.setValue('emailTask', false)
  clearEmailList()
  await removeEmailsWithoutAvatarFromList()

  // Returns both location and guest input field and selects the field that is 320px wide as that is the email field
  let input = emailInputField()
  input?.focus()
  input?.select()
  document.execCommand('insertText', false, emails)
  const enter = new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })
  input.dispatchEvent(enter)
}

if (location.hostname === 'calendar.google.com') {
  // Wait until guest tab exists
  const waitUntilGuestTab = setInterval(() => {
    if (guestTab()) {
      clearInterval(waitUntilGuestTab)
      createButtons()
    }
  }, 10)
  GM.setValue('removeEmailsWithoutAvatarFromList', false)
  setInterval(autoEmailInput, 200)
  setInterval(upscaleAvatars, 200)
  setInterval(storeGcalEmails, 200)

  // Wait until user email exists
  const waitUntilUserEmailExists = setInterval(() => {
    const email = userEmail()
    if (email) {
      clearInterval(waitUntilUserEmailExists)
      GM.setValue('userEmail', email)
    }
  }, 100)
}

if (location.hostname.includes('contacts')) {
  setInterval(contactCreateButton, 200)
  setTimeout(() => {
    document.querySelector(
        '#yDmH0d > c-wiz > div.QkOsze > div:nth-child(6) > div:nth-child(2) > div > div > div > div.E6Tb7b.psZcEd > div.v2jl3d > svg.NSy2Hd.cdByRd.RTiFqe.IRJKEb'
    ).click
  }, 3000)
  setInterval(hoverCardAvatarButton, 200)
  if (!hoverCardInstance) {
    setInterval(storeSidebarContactsEmails, 200)
  }
}

if (location.hostname === 'lh3.googleusercontent.com') {
  addGlobalStyle(`
        .searchButton {
            text-transform: none;
            margin-left: 10px;
            margin-top: 10px;
            padding:4px 8px;
        }
    `)
  // Wait until body exists
  const waitUntilBody = setInterval(() => {
    if (document.getElementsByTagName('img').length) {
      clearInterval(waitUntilBody)
      void copyEmailClipboard()
      reverseImageSearchButton()
      setInterval(() => {
        if (document.title.includes(DEFAULT_USER_AVATAR_SIZE)) {
          window.close()
        }
      }, 200)
    }
  }, 10)
}

// Automatically open gcal avatars after clicking on "Copy Emails" in Acorn
let copyEmailsButton
function copyEmails() {
  // Add event handler to "Copy Emails" button
  copyEmailsButton =
      document.querySelector(
          '#react-root > div > div > div > div.flex.flex-col.min-w-0.flex-1.overflow-hidden > div > main > article > div.mx-auto.pb-24 > div > div.fixed.bg-white.py-4.px-8.z-10.border-b.border-b-eee > div > div.ml-6.mt-0\\.5 > div'
      ) ?? document.getElementById('copy-emails-button')
  if (!copyEmailsButton) {
    return
  }
  copyEmailsButton.removeEventListener('click', openCalendar)
  copyEmailsButton.addEventListener('click', openCalendar, false)
}

function openCalendar() {
  const emailList = gmailGuess(copyEmailsButton.children[2].value)
  setTimeout(() => {
    GM.setClipboard(emailList)
  }, 500)
  GM.setValue('emaiList', emailList)
  GM.setValue('emailTask', true)
}

function setLinkedinHandleValue() {
  if (!document.hasFocus()) {
    return
  }
  const linkedinButton = document.getElementsByClassName(
      'inline-block text-center rounded-sm align-text-top cursor-pointer ml-2'
  )[0]
  const extensionTask =
      document.getElementsByClassName(
          'text-lg leading-6 font-medium text-gray-900'
      )[0]?.innerText === 'LinkedIn Profile'
  if (!linkedinButton || !extensionTask) {
    GM.setValue('currentLinkedinHandle', '')
    return
  }
  const linkedinHandle = linkedinButton.nextElementSibling.innerText
  GM.setValue('currentLinkedinHandle', linkedinHandle)
}

async function closeLinkedInTab() {
  const linkedinHandle = await GM.getValue('currentLinkedinHandle')
  if (
      !window.location.href.includes(linkedinHandle) &&
      linkedinHandle &&
      !document.hasFocus()
  ) {
    GM.setClipboard('WRONG PROFILE, CHECK AGAIN')
    window.close()
  }
}

// Upscale avatars; Max size is 40x40, upscaled to 160x160 for sharpness
const upscaleRes = 's160'

function upscaleAvatars() {
  const avatars = emailAvatars()
  const defaultRes = 's24'
  for (let avatar of avatars) {
    if (
        !avatar.outerHTML.includes(defaultRes) ||
        avatar.outerHTML.includes(DEFAULT_USER_AVATAR)
    ) {
      continue
    }
    const imageUpscale = avatar.getAttribute('style').split(defaultRes)
    avatar.setAttribute(
        'style',
        `${imageUpscale[0]}${upscaleRes}${imageUpscale[1]}`
    )
    const imageParentUpscale = avatar.parentElement
        .getAttribute('style')
        .split('24px;')
    avatar.parentElement.setAttribute(
        'style',
        `${imageParentUpscale[0]}40px;${imageParentUpscale[1]}40px;`
    )
  }
}

if (
    location.hostname === 'acornapp.net' ||
    location.hostname.includes('acorntech.io') ||
    location.hostname.includes('acorntech.org') ||
    location.href.includes('localhost:8083')
) {
  GM.setValue('currentLinkedinHandle', '')
  setInterval(copyEmails, 100)
  setInterval(pasteEmailList, 200)
  setInterval(setLinkedinHandleValue, 200)
}

if (location.hostname === 'www.linkedin.com') {
  setInterval(closeLinkedInTab, 500)
  setTimeout(() => {
    GM.setValue('currentLinkedinHandle', '')
  }, 1000)
}

// Copy email button for admin portal
function copyEmailsAdmin() {
  // Add event handler to "Copy Emails" button
  copyEmailsButton = document.getElementsByClassName(
      'border-3 ml-3 pr-1 pl-2 py-2 focus:no-underline focus:text-gray-333 hover:text-gray-333 hover:shadow-lg hover:no-underline rounded-lg border-gray-333 font-semibold text-lg text-gray-333'
  )[0]
  if (!copyEmailsButton) {
    return
  }
  copyEmailsButton.removeEventListener('click', openCalendarAdmin)
  copyEmailsButton.addEventListener('click', openCalendarAdmin, false)
}

function openCalendarAdmin() {
  let emailList = ''
  const emailArray = document.getElementsByClassName('block text-center')
  for (let i = 0; i < emailArray.length; i++) {
    const email = emailArray[i].innerText
    if (email.includes('@')) {
      emailList = `${emailList}${email} `
    }
  }
  emailList = gmailGuess(emailList)
  setTimeout(() => {
    GM.setClipboard(emailList)
  }, 500)
  GM.setValue('emaiList', emailList)
  GM.setValue('emailTask', true)
}

if (
    location.href.includes('https://getcovey.com/covey/admin') ||
    location.href.includes('localhost:8080')
) {
  setInterval(copyEmailsAdmin, 100)
}

// Add Gmail guesses  to non-Gmail domains
function gmailGuess(emailList) {
  const gmailGuessFilter = [
    'me',
    'hello',
    'contact',
    'linkedin',
    'github',
    'ceo',
  ]
  const emailListArray = emailList.split(' ')
  for (let i = 0; i < emailListArray.length; i++) {
    if (emailListArray[i].includes('gmail')) {
      continue
    }
    let gmailGuess = emailListArray[i].split('@').shift().toLowerCase()
    if (gmailGuessFilter.includes(gmailGuess)) {
      continue
    }
    gmailGuess = gmailGuess.replaceAll('-', '.').replaceAll('_', '.')
    if (gmailGuess) gmailGuess = `${gmailGuess}@gmail.com`
    if (emailList.includes(gmailGuess)) {
      continue
    }
    emailList = `${emailList} ${gmailGuess}`
  }
  return emailList
}
