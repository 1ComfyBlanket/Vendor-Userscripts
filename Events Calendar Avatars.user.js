// ==UserScript==
// @name         Events Calendar Avatars
// @namespace    http://tampermonkey.net/
// @version      1.7.1
// @description  Retrieve Google events calendar avatars at a higher resolution with much fewer inputs.
// @author       Wilbert Siojo
// @match        https://calendar.google.com/calendar/*
// @match        https://lh3.googleusercontent.com/*
// @match        https://acornapp.net/*
// @match        http://localhost:8083/*
// @match        https://getcovey.com/covey/admin*
// @match        http://localhost:8080/covey/admin*
// @match        https://contacts.google.com/*
// @icon         https://www.google.com/s2/favicons?domain=simply-how.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.setClipboard
// ==/UserScript==

// Disable TrustedHTML for Google Contacts
if (window.trustedTypes && window.trustedTypes.createPolicy) {
    window.trustedTypes.createPolicy('default', {
        createHTML: (string, sink) => string
    });
}

// Inject CSS into the page
function addGlobalStyle(cssTrustedScript) {
    let head, style;
    head = document.getElementsByTagName('head')[0]
    if (!head) { return }
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
        padding:0px 8px;
        text-decoration:none;
        text-shadow:0px 1px 0px #154682;
        margin-left: 5px;
        text-transform:capitalize;
    }
    .searchButton:hover {
        background-color:#0061a7
    }
    .searchButton:active {
        position:relative;
        top:1px;
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
function guestTab() { return document.getElementsByClassName("kx3Hed") }

// "Ax4B8 ZAGvjd" is the "Create contact" in Contacts
function contactSearchBar() { return document.getElementsByClassName("U26fgb iZrPLc") }

// Create and place buttons
function createButton() {
    // "Open Images" button
    const openAvatarsButton = document.createElement('a')
    openAvatarsButton.addEventListener('click', openEmailAvatars, false)
    openAvatarsButton.appendChild(document.createTextNode('Open Images'))
    const openAvatar = guestTab()[0]
    openAvatar.parentNode.insertBefore(openAvatarsButton, openAvatar.nextSibling)
    //Set className for CSS
    openAvatarsButton.className = "searchButton"

    // "Clear All" button
    const clearEmailsButtons = document.createElement('a')
    clearEmailsButtons.addEventListener('click', clearEmailList, false)
    clearEmailsButtons.appendChild(document.createTextNode('Clear All'))
    openAvatar.parentNode.insertBefore(clearEmailsButtons, openAvatar.nextSibling.nextSibling)
    //Set className for CSS
    clearEmailsButtons.className = "searchButton"
}

//Create and place buttons for Contacts
function contactCreateButton() {
    // Prevent multiple buttons from being made
    if (!contactSearchBar().length || contactSearchBar()[0].parentNode.children.length > 1) { return }
    // "Open Images" button
    const openAvatarsButton = document.createElement('a')
    openAvatarsButton.addEventListener('click', contactOpenEmailAvatars, false)
    openAvatarsButton.appendChild(document.createTextNode('Open Images'))
    const openAvatar = contactSearchBar()[0]
    openAvatar.parentNode.insertBefore(openAvatarsButton, openAvatar.nextSibling)
    //Set className for CSS
    openAvatarsButton.className = "searchButton"
}
function contactOpenEmailAvatars() {
    const imageArray = document.getElementsByClassName('i0Sdn')
    for (let i = 0; i < imageArray.length; i++) {
        // Retrieve email
        let email = imageArray[i].parentElement.nextSibling.children[0].innerText
        // Retrieve avatar URL
        let imageLink = imageArray[i].nextSibling.outerHTML.split('"')[5].split('s36')
        imageLink = `${imageLink[0]}s1000${imageLink[1]}`
        if (imageLink.includes('no/photo')) { continue }
        GM.setValue(imageLink, email)
        window.open(imageLink)
    }
}

// "jPtXgd" is all of the listed email avatars
function emailAvatars() { return document.getElementsByClassName('jPtXgd') }

// Grabs all of the avatars currently in the email list and scale the image from 24px to 1000px
function openEmailAvatars() {
    // "jPtXgd" is all of the listed email avatars
    const imageArray = emailAvatars()
    for (let i = 0; i < imageArray.length; i++) {
        // Retrieve email
        let email = imageArray[i].parentElement.previousSibling.outerHTML.split(`data-email="`)[1].split(`" role=`)[0]
        // Retrieve email for hovercard mismatch comparison
        const spanEmail = imageArray[i].parentElement.parentElement.nextSibling.children[0].children[0].children[0].children[0].innerText
        // Retrieve avatar URL
        let imageLink = imageArray[i].outerHTML.split('"')[7].split('&quot;')[1].split(upscaleRes)
        imageLink = `${imageLink[0]}s1000${imageLink[1]}`
        if (!email.replace(/\./g, '').includes(spanEmail.replace(/\./g, '')) && spanEmail.includes('@')) {
            email = `${email} ${spanEmail}`
        }
        GM.setValue(imageLink, email)
        window.open(imageLink)
    }
    if (autoEmailProcess) {
        autoEmailProcess = false
        clearEmailList()
    }
}

function clearEmailList() {
    // This is the "Make Optional" and "Remove" array
    const closeButtonArray = document.getElementsByClassName('U26fgb mUbCce fKz7Od rF3YF Vp20je vPJzRc M9Bg4d')
    let a = closeButtonArray.length
    for (let i = 0; i < a; i++) {
        // Every second entry in the array is the remove button. Removing deletes from the array so cycling
        // the second index for the length of the array will remove all emails listed
        closeButtonArray[1].click()

    }
}

// Create a button with the profile's email that can be clicked to copy to clipboard
async function copyEmailClipboard() {
    let email = await GM.getValue(window.location.href)
    GM.deleteValue(window.location.href)
    email = email.split(' ')
    for (let i = 0; i < email.length; i++) {
        const copyEmail = document.createElement('a')
        copyEmail.addEventListener('click', () => { GM.setClipboard(email[i]) }, false)
        copyEmail.appendChild(document.createTextNode(email[i]))
        const emailPosition = document.getElementsByTagName("body")[0]
        emailPosition.parentNode.insertBefore(copyEmail, emailPosition)
        copyEmail.className = "searchButton"
    }
}

async function autoEmailInput() {
    GM.setValue('emailTask', 'false')
    // Simulate a React change in order to change the value of an input field

    // Returns both location and guest input field and selects the field that is 320px wide as that is the email field
    let input = document.getElementsByClassName("whsOnd zHQkBf")
    for (let i = 0; i < input.length; i++) {
        if (!input[i]) { continue }
        if (input[i].offsetWidth === 320) { input = input[i] }
    }

    const lastValue = input.value
    input.value = await GM.getValue('emaiList')
    const event = new Event('input', { bubbles: true })
    event.simulated = true
    const tracker = input._valueTracker
    if (tracker) { tracker.setValue(lastValue) }
    input.dispatchEvent(event)

    // Simulate enter key to input emails
    const enterKey = new KeyboardEvent("keydown", {
        bubbles: true, cancelable: true, keyCode: 13
    });
    input.dispatchEvent(enterKey)
}

if (location.hostname === 'calendar.google.com') {
    // Wait until guest tab exists
    const waitUntilGuestTab = setInterval(() => {
        if (guestTab().length) {
            clearInterval(waitUntilGuestTab)
            createButton()
        }
    }, 10)
    setInterval(checkEmails, 100)
    setInterval(upscaleAvatars, 200)
}

if (location.hostname.includes("contacts")) {
    // Wait until Create contact exists
    // const waitUntilSearchBarExists = setInterval(() => {
    //     if (contactSearchBar().length) {
    //         clearInterval(waitUntilSearchBarExists)
    //         contactCreateButton()
    //     }
    // }, 10)
    setInterval(contactCreateButton, 200)
}

if (location.hostname === 'lh3.googleusercontent.com') {
    addGlobalStyle(`
        .searchButton {
            text-transform: none;
            margin-left: 10px;
            margin-top: 10px;
            padding:4px 8px;
        }
    `);
    // Wait until body exists
    const waitUntilBody = setInterval(() => {
        if (document.getElementsByTagName('img').length) {
            clearInterval(waitUntilBody)
            copyEmailClipboard()
        }
    }, 10)
}

// Automatically open gcal avatars after clicking on "Copy Emails" in Acorn
let copyEmailsButton
let autoEmailProcess
function copyEmails() {
    // Add event handler to "Copy Emails" button
    copyEmailsButton = document.querySelector("#react-root > div > div > div > div.flex.flex-col.min-w-0.flex-1.overflow-hidden > div > main > article > div.mx-auto.pb-24 > div > div.fixed.bg-white.py-4.px-8.z-10.border-b.border-b-eee > div > div.ml-6.mt-0\\.5 > div")
    if (!copyEmailsButton) { return }
    copyEmailsButton.removeEventListener('click', openCalendar)
    copyEmailsButton.addEventListener('click', openCalendar, false)
}

function openCalendar() {
    const emailList = gmailGuess(copyEmailsButton.children[2].value)
    setTimeout(() => {GM.setClipboard(emailList)}, 500)
    GM.setValue('emaiList', emailList)
    GM.setValue('emailTask', 'true')
}

async function checkEmails() {
    const emailTaskExists = await GM.getValue('emailTask')
    const emailList = await GM.getValue('emaiList')
    if (emailTaskExists !== 'true' || emailList === '') { return }
    autoEmailProcess = true
    autoEmailInput()
}

// Upscale avatars; Max size is 40x40, upscaled to 160x160 for sharpness
const upscaleRes = 's160'
function spanEmailArray() { return document.getElementsByClassName('cHB8o') }
function imageOuterHTML(image) { return image.outerHTML }
function upscaleAvatars() {
    const imageArray = emailAvatars()
    for (let i = 0; i < imageArray.length; i++) {
        if (!imageOuterHTML(imageArray[i]).includes('s24')) { continue }
        const imageUpscale = imageOuterHTML(imageArray[i]).split('s24')
        imageArray[i].outerHTML = `${imageUpscale[0]}${upscaleRes}${imageUpscale[1]}`
        const imageParentUpscale = imageArray[i].parentElement.outerHTML.split('24px;')
        imageArray[i].parentElement.outerHTML = `${imageParentUpscale[0]}40px;${imageParentUpscale[1]}40px;${imageParentUpscale[2]}`
    }
    // Scan for hovercard mismatches
    for (let i = 1; i < spanEmailArray().length; i++) {
        let spanEmail = spanEmailArray()[i].innerText.replace(/\./g, '')
        let spanEmailElement = spanEmailArray()[i]
        let hoverCardEmail = spanEmailArray()[i].parentElement.parentElement.parentElement.parentElement.parentElement.dataset.hovercardId.replace(/\./g, '')
        if (spanEmail === hoverCardEmail || !spanEmail.includes(('@')) || spanEmailElement.className === 'exposedEmail') { continue }
        spanEmailElement.className = 'exposedEmail'
    }
}

if (location.hostname === 'acornapp.net' || location.href.includes('localhost:8083')) { setInterval(copyEmails, 100) }

// Copy email button for admin portal
function copyEmailsAdmin() {
    // Add event handler to "Copy Emails" button
    copyEmailsButton = document.getElementsByClassName('border-3 ml-3 pr-1 pl-2 py-2 focus:no-underline focus:text-gray-333 hover:text-gray-333 hover:shadow-lg hover:no-underline rounded-lg border-gray-333 font-semibold text-lg text-gray-333')[0]
    if (!copyEmailsButton) { return }
    copyEmailsButton.removeEventListener('click', openCalendarAdmin)
    copyEmailsButton.addEventListener('click', openCalendarAdmin, false)
}

function openCalendarAdmin() {
    let emailList = ''
    const emailArray = document.getElementsByClassName('block text-center')
    for (let i = 0; i < emailArray.length; i++) {
        emailList = `${emailList}${emailArray[i].innerText} `
    }
    emailList = gmailGuess(emailList)
    setTimeout(() => {GM.setClipboard(emailList)}, 500)
    GM.setValue('emaiList', emailList)
    GM.setValue('emailTask', 'true')
}

if (location.href.includes('https://getcovey.com/covey/admin') || location.href.includes('localhost:8080')) { setInterval(copyEmailsAdmin, 100) }

// Add Gmail guesses  to non-Gmail domains
function gmailGuess(emailList) {
    const emailListArray = emailList.split(' ')
    for (let i = 0; i < emailListArray.length; i++) {
        if (emailListArray[i].includes('gmail')) { continue }
        let gmailGuess = emailListArray[i].split('@').shift()
        gmailGuess = `${gmailGuess}@gmail.com`
        if (emailList.includes(gmailGuess)) { continue }
        emailList = `${emailList} ${gmailGuess}`
    }
    return emailList
}
