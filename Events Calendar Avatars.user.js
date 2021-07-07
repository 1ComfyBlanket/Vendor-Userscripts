// ==UserScript==
// @name         Events Calendar Avatars
// @namespace    http://tampermonkey.net/
// @version      1.5.0
// @update       https://github.com/1ComfyBlanket/Vendor-Userscripts/raw/main/Events%20Calendar%20Avatars.user.js
// @description  Retrieve Google events calendar avatars at a higher resolution with much fewer inputs.
// @author       Wilbert Siojo
// @match        https://calendar.google.com/calendar/*
// @match        https://lh3.googleusercontent.com/*
// @match        https://acornapp.net/*
// @match        https://getcovey.com/covey/admin*
// @icon         https://www.google.com/s2/favicons?domain=simply-how.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.setClipboard
// ==/UserScript==

// Inject CSS into the page
function addGlobalStyle(css) {
    let head, style;
    head = document.getElementsByTagName('head')[0]
    if (!head) { return }
    style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = css
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
`)

// "kx3Hed" is the guest tab
function guestTab() { return document.getElementsByClassName("kx3Hed") }

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

// "jPtXgd" is all of the listed email avatars
function emailAvatars() { return document.getElementsByClassName('jPtXgd') }

// Grabs all of the avatars currently in the email list and scale the image from 24px to 1000px
function openEmailAvatars() {
    // "jPtXgd" is all of the listed email avatars
    const imageArray = emailAvatars()
    for (let i = 0; i < imageArray.length; i++) {
        // Retrieve email
        const email = imageArray[i].parentElement.previousSibling.outerHTML.split(`data-email="`)[1].split(`" role=`)[0]
        // Retrieve avatar URL
        let imageLink = imageArray[i].outerHTML.split('"')[7].split('&quot;')[1].split(upscaleRes)
        imageLink = `${imageLink[0]}s1000${imageLink[1]}`
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

// Create a button with the profile's email that can be clicked to copy to cliboard
async function copyEmailClipboard() {
    const email = await GM.getValue(window.location.href)
    const copyEmail = document.createElement('a')
    copyEmail.addEventListener('click', () =>{ GM.setClipboard(email) }, false)
    copyEmail.appendChild(document.createTextNode(email))
    const emaiLPosition = document.getElementsByTagName("body")[0]
    emaiLPosition.parentNode.insertBefore(copyEmail, emaiLPosition)
    copyEmail.className = "searchButton"
}

async function autoEmailInput() {
    GM.setValue('emailTask', 'false')
    // Simulate a React change in order to change the value of an input field
    const input = document.querySelector("#tabGuests > div.YxiWic.mCosT > div > span > div > div.d1dlne.WvJxMd > div.rFrNMe.Ax4B8.ULpymb.zKHdkd.Tyc9J > div.aCsJod.oJeWuf > div > div.Xb9hP > input")
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
    GM.setValue('emaiList', copyEmailsButton.children[2].value)
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
}

if (location.hostname === 'acornapp.net') { setInterval(copyEmails, 100) }

// Copy email button for admin portal
function copyEmailsAdmin() {
    // Add event handler to "Copy Emails" button
    copyEmailsButton = document.querySelector("#covey-admin-page > div:nth-child(2) > div > div.w-6\\/7.bg-white.rounded-lg.shadow-xl.transform.transition-all.z-20 > div.flex.justify-between.mt-3.pb-6.text-center.sm\\:mt-0.sm\\:text-left.px-6.pt-8 > h3 > div > div:nth-child(1) > div > a")
    if (!copyEmailsButton) { return }
    copyEmailsButton.removeEventListener('click', openCalendarAdmin)
    copyEmailsButton.addEventListener('click', openCalendarAdmin, false)
}

function openCalendarAdmin() {
    const adminEmails = document.querySelector("#covey-admin-page > div:nth-child(2) > div > div.w-6\\/7.bg-white.rounded-lg.shadow-xl.transform.transition-all.z-20 > div.flex.justify-between.mt-3.pb-6.text-center.sm\\:mt-0.sm\\:text-left.px-6.pt-8 > h3 > div > div:nth-child(1) > div > input").value
    GM.setValue('emaiList', adminEmails)
    GM.setValue('emailTask', 'true')
}

if (location.href.includes('https://getcovey.com/covey/admin')) { setInterval(copyEmailsAdmin, 100) }
