// ==UserScript==
// @name         Events Calendar Avatars
// @namespace    http://tampermonkey.net/
// @version      1.12
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

const SEARCH_BUTTON_CSS_CLASS = 'searchButton'
const DEFAULT_USER_AVATAR = 'default-user'
const DEFAULT_AVATAR_IMG_LEN = 97

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
        padding:0px 8px;
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
    return document.getElementsByClassName('kx3Hed')
}

// "Ax4B8 ZAGvjd" is the "Create contact" in Contacts
function contactSearchBar() {
    return document.getElementsByClassName('U26fgb iZrPLc')
}

// Create and place buttons
function createButtons() {
    // "Open Images" button
    const openAvatarsButton = document.createElement('a')
    openAvatarsButton.addEventListener('click', openImages, false)
    openAvatarsButton.appendChild(document.createTextNode('Open Images'))
    const openAvatar = guestTab()[0]
    openAvatar.parentNode.insertBefore(openAvatarsButton, openAvatar.nextSibling)
    openAvatarsButton.className = SEARCH_BUTTON_CSS_CLASS

    // "Clear All" button
    const clearEmailsButtons = document.createElement('a')
    clearEmailsButtons.addEventListener('click', clearEmailList, false)
    clearEmailsButtons.appendChild(document.createTextNode('Clear All'))
    openAvatar.parentNode.insertBefore(
        clearEmailsButtons,
        openAvatar.nextSibling.nextSibling
    )
    clearEmailsButtons.className = SEARCH_BUTTON_CSS_CLASS

    // "Copy All" button (disabled until new Gcal task is implemented)
    // const CopyEmailsButton = document.createElement('a')
    // CopyEmailsButton.addEventListener('click', CopyEmailList, false)
    // CopyEmailsButton.appendChild(document.createTextNode('Copy All'))
    // openAvatar.parentNode.insertBefore(
    //     CopyEmailsButton,
    //     openAvatar.nextSibling.nextSibling
    // )
    // CopyEmailsButton.className = SEARCH_BUTTON_CSS_CLASS
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
        imageLink = `${imageLink[0]}s1000${imageLink[1]}`
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
    let imagelink
    if (hoverCardInstance) {
        imageLink = this.outerHTML.split('"')[5].split('=')
    } else {
        imageLink = this.outerHTML.split('"')[3].split('=')
    }
    imageLink = `${imageLink[0]}=s1000-p-k-rw-no`
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

function storeSidebarContactsEmails() {
    const emailRows = document.getElementsByClassName('hRP3bd')
    let emailList = []
    let emailListFiltered = []
    for (let i = 0; i < emailRows.length; i++) {
        const emails = emailRows[i].parentElement.nextSibling.children
        let imageUrl = emailRows[i].src.split('=')[0]
        imageUrl = `${imageUrl}=s1000-p-k-rw-no`
        const defaultAvatar = imageUrl.length <= DEFAULT_AVATAR_IMG_LEN
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i].innerText
            emailList.push({ email: email, avatar: imageUrl })
            if (
                !defaultAvatar &&
                email.includes('@') &&
                !imageUrl.includes(DEFAULT_USER_AVATAR) &&
                !imageUrl.includes('/a/') &&
                !imageUrl.includes('gstatic.com')
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

function storeGcalEmails() {
    const emailRows = emailAvatars()
    let emailList = []
    for (let i = 0; i < emailRows.length; i++) {
        const email = emailRows[
            i
            ].parentElement.parentElement.parentElement.getAttribute('data-hovercard-id')
        let imageUrl = emailRows[i].getAttribute('style')
            .split('"')[1]
            .split('=')[0]
        imageUrl = `${imageUrl}=s1000-p-k-rw-no`
        if (!imageUrl.includes(DEFAULT_USER_AVATAR)) {
            emailList.push({ email: email, avatar: imageUrl })
        }
    }
    const emailListString = JSON.stringify(emailList)
    GM.setValue('gcalEmailList', emailListString)
}

/****
 *. End of implementation for persisting Gcal and Google Contacts sidebar emails in storage
 ********/

// "jPtXgd" is all of the listed email avatars
function emailAvatars() {
    return document.getElementsByClassName('jPtXgd')
}

async function openImages() {
    const userEmail = document.getElementsByClassName('gb_C gb_Ma gb_h')[0]
        .outerHTML
    const emailListString = await GM.getValue('gcalEmailList')
    const emailListFilteredString = await GM.getValue('contactEmailListFiltered')
    const emailList = JSON.parse(emailListString)
    const emailListFiltered = JSON.parse(emailListFilteredString)
    const emails = new Set(emailList.map(e => e.email))
    const mergedEmailList = [
        ...emailList,
        ...emailListFiltered.filter(e => !emails.has(e.email)),
    ]
    // Skip the first index as it's your own email
    for (let i = 1; i < mergedEmailList.length; i++) {
        const newEmail = mergedEmailList[i].email
        if (userEmail.includes(newEmail)) {
            continue
        }
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

async function CopyEmailList() {
    const emailListString = await GM.getValue('contactEmailList')
    const emailList = JSON.parse(emailListString)
    const emailListFilteredString = await GM.getValue('contactEmailListFiltered')
    const emailListFiltered = JSON.parse(emailListFilteredString)
    // console.log(emailList)
    // console.log(emailListFiltered)
}

function clearEmailList() {
    // This is the "Make Optional" and "Remove" array
    const closeButtonArray = document.getElementsByClassName(
        'U26fgb mUbCce fKz7Od rF3YF Vp20je vPJzRc M9Bg4d'
    )
    let a = closeButtonArray.length
    for (let i = 0; i < a; i++) {
        // Every second entry in the array is the remove button. Removing deletes from the array so cycling
        // the second index for the length of the array will remove all emails listed
        closeButtonArray[2].click()
    }
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
    GM.setValue('emailTask', 'false')
    // Simulate a React change in order to change the value of an input field

    // Returns both location and guest input field and selects the field that is 320px wide as that is the email field
    let input = document.getElementsByClassName('whsOnd zHQkBf')
    for (let i = 0; i < input.length; i++) {
        if (!input[i]) {
            continue
        }
        if (input[i].offsetWidth === 320) {
            input = input[i]
        }
    }

    const lastValue = input.value
    input.value = await GM.getValue('emaiList')

    // Gcal seems to accept inputs if its done while it's the active tab, more testing required
    // setTimeout(() => {
    //     const event = new Event('input', { bubbles: true })
    //     event.simulated = true
    //     const tracker = input._valueTracker
    //     if (tracker) {
    //         tracker.setValue(lastValue)
    //     }
    //     input.dispatchEvent(event)

    // Simulate enter key to input emails
    // const enterKey = new KeyboardEvent('keydown', {
    //     bubbles: true,
    //     cancelable: true,
    //     keyCode: 13,
    // })
    // input.dispatchEvent(enterKey)
    // }, 2000)
}

if (location.hostname === 'calendar.google.com') {
    // Wait until guest tab exists
    const waitUntilGuestTab = setInterval(() => {
        if (guestTab().length) {
            clearInterval(waitUntilGuestTab)
            createButtons()
        }
    }, 10)
    setInterval(checkEmails, 100)
    setInterval(upscaleAvatars, 200)
    setInterval(storeGcalEmails, 200)
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
            copyEmailClipboard()
            reverseImageSearchButton()
        }
    }, 10)
}

// Automatically open gcal avatars after clicking on "Copy Emails" in Acorn
let copyEmailsButton
let autoEmailProcess
function copyEmails() {
    // Add event handler to "Copy Emails" button
    copyEmailsButton = document.querySelector(
        '#react-root > div > div > div > div.flex.flex-col.min-w-0.flex-1.overflow-hidden > div > main > article > div.mx-auto.pb-24 > div > div.fixed.bg-white.py-4.px-8.z-10.border-b.border-b-eee > div > div.ml-6.mt-0\\.5 > div'
    )
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
    GM.setValue('emailTask', 'true')
}

async function checkEmails() {
    const emailTaskExists = await GM.getValue('emailTask')
    const emailList = await GM.getValue('emaiList')
    if (emailTaskExists !== 'true' || emailList === '') {
        return
    }
    autoEmailProcess = true
    autoEmailInput()
}

// Upscale avatars; Max size is 40x40, upscaled to 160x160 for sharpness
const upscaleRes = 's160'
function spanEmailArray() {
    return document.getElementsByClassName('cHB8o')
}

function upscaleAvatars() {
    const imageArray = emailAvatars()
    const defaultRes = 's24'
    for (let i = 1; i < imageArray.length; i++) {
        // First index is skipped since it's your own avatar
        if (
            !imageArray[i].outerHTML.includes(defaultRes) ||
            imageArray[i].outerHTML.includes(DEFAULT_USER_AVATAR)
        ) {
            continue
        }
        const imageUpscale = imageArray[i].outerHTML.split(defaultRes)
        imageArray[
            i
            ].outerHTML = `${imageUpscale[0]}${upscaleRes}${imageUpscale[1]}`
        const imageParentUpscale = imageArray[i].parentElement.outerHTML.split(
            '24px;'
        )
        imageArray[
            i
            ].parentElement.outerHTML = `${imageParentUpscale[0]}40px;${imageParentUpscale[1]}40px;${imageParentUpscale[2]}`
    }
    // Scan for hovercard mismatches
    for (let i = 1; i < spanEmailArray().length; i++) {
        let spanEmail = spanEmailArray()[i].innerText.replace(/\./g, '')
        let spanEmailElement = spanEmailArray()[i]
        let hoverCardEmail = spanEmailArray()[
            i
            ].parentElement.parentElement.parentElement.parentElement.parentElement.dataset.hovercardId.replace(
            /\./g,
            ''
        )
        if (
            spanEmail === hoverCardEmail ||
            !spanEmail.includes('@') ||
            spanEmailElement.className === 'exposedEmail'
        ) {
            continue
        }
        spanEmailElement.className = 'exposedEmail'
    }
}

if (
    location.hostname === 'acornapp.net' ||
    location.href.includes('localhost:8083')
) {
    setInterval(copyEmails, 100)
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
    GM.setValue('emailTask', 'true')
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
        let gmailGuess = emailListArray[i]
            .split('@')
            .shift()
            .toLowerCase()
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
