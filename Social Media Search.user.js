// ==UserScript==
// @name         Social Media Search
// @namespace    http://tampermonkey.net/
// @version      1.5.1
// @description  For searching email handles on various social media sites in a single click.
// @author       Wilbert Siojo
// @icon         https://www.google.com/s2/favicons?domain=simply-how.com
// @grant        none
// @match        https://acornapp.net/portal/home*
// @match        https://acornapp.net/portal/review*
// @match        https://www.acorntech.io/portal/home*
// @match        https://www.acorntech.io/portal/review*
// @match        http://localhost:8083//portal/home*
// @match        http://localhost:8083//portal/review*
// @match        https://www.instagram.com/*
// @match        https://www.pinterest.com/*
// @match        https://twitter.com/*
// @match        https://github.com/*
// @match        https://www.tiktok.com/*
// @match        https://www.facebook.com/*
// @match        https://www.youtube.com/*
// @match        https://soundcloud.com/*
// @match        https://www.etsy.com/*
// @match        https://poshmark.com/*
// @match        https://www.tripadvisor.com/*
// @match        https://medium.com/*
// @match        https://dribbble.com/*
// @match        https://www.behance.net/*
// @match        https://keybase.io/*
// ==/UserScript==

const SEARCH_BUTTON_CSS_CLASS = 'searchButton'

// Inject CSS into the page
function addGlobalStyle(css) {
    let head, style
    head = document.getElementsByTagName('head')[0]
    if (!head) {
        return
    }
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
        padding:4px 12px;
        text-decoration:none;
        text-shadow:0px 1px 0px #154682;
        margin-left: 10px;
    }
    .searchButton:hover {
        background-color:#0061a7;
    }
    .searchButton:active {
        position:relative;
        top:1px;
    }
`)

function searchEmail() {
    const emailHandle = this.nextSibling.value.split('@', 1)[0]
    // Some websites do not accept usernames with periods or incorrectly parse them
    const cleanedEmailHandle = emailHandle.split('.').join('')

    window.open(`https://www.instagram.com/${emailHandle}`)
    window.open(`https://www.pinterest.com/${emailHandle}`)
    window.open(`https://www.twitter.com/${emailHandle}`)
    window.open(`https://www.tiktok.com/@${emailHandle}`)
    window.open(`https://www.facebook.com/${emailHandle}`)
    window.open(`https://www.youtube.com/user/${emailHandle}`)
    window.open(`https://www.soundcloud.com/${emailHandle}`)
    window.open(`https://www.etsy.com/people/${emailHandle}`)
    window.open(`https://www.poshmark.com/closet/${emailHandle}`)
    window.open(`https://www.tripadvisor.com/Profile/${emailHandle}`)
    window.open(`https://www.medium.com/@${emailHandle}/about`)
    window.open(`https://www.behance.net/${emailHandle}`)
    window.open(`https://www.github.com/${cleanedEmailHandle}`)
    window.open(`https://dribbble.com/${cleanedEmailHandle}`)
    window.open(`https://keybase.io/${cleanedEmailHandle}`)
}

function googleEmail() {
    const email = this.nextSibling.nextSibling.value
    const emailHandle = this.nextSibling.nextSibling.value.split('@')
    window.open(`https://www.google.com/search?q="${email}"`)
    window.open(`https://www.google.com/search?q="${emailHandle[0]}"`)
    // Guess search for handle as a Gmail
    if (!emailHandle[1].includes('gmail')) {
        window.open(`https://www.google.com/search?q="${emailHandle[0]}@gmail.com"`)
    }
}

// Element and string to search for to determine if a profile is missing
function missingProfileElement(elementClass, stringReturn, exactMatch = false) {
    function closeClear() {
        close()
        clearInterval(intervalCheck)
    }
    function elementArray() {
        return document.getElementsByClassName(elementClass)
    }
    const intervalCheck = setInterval(() => {
        // If exactMatch is enabled then make sure the string is exactly the same, otherwise just loosely search
        // for the string within the element
        if (!exactMatch) {
            const elements = elementArray()
            for (let element of elements) {
                if (element.innerText) {
                    if (element.innerText.includes(stringReturn)) {
                        closeClear()
                    }
                }
                if (element.currentSrc) {
                    if (element.currentSrc.includes(stringReturn)) {
                        closeClear()
                    }
                }
            }
            if (document.title.includes(stringReturn)) {
                closeClear()
            }
            if (location.href.includes(stringReturn)) {
                closeClear()
            }
        } else {
            // Check for an exact string match
            for (let element of elements) {
                if (element.innerText) {
                    if (element.innerText === stringReturn) {
                        closeClear()
                    }
                }
                if (element.currentSrc) {
                    if (element.currentSrc === stringReturn) {
                        closeClear()
                    }
                }
            }
            if (document.title === stringReturn) {
                closeClear()
            }
            if (location.href === stringReturn) {
                closeClear()
            }
        }
    }, 200)
}

// Social media sites run this function to determine if it is a missing profile
function missingProfile() {
    switch (location.hostname) {
        case 'www.instagram.com':
            missingProfileElement('', `Page not found`)
            missingProfileElement('', `Página no encontrada`)
            missingProfileElement('', `Contenido no disponible`)
            break
        case 'www.pinterest.com':
            missingProfileElement('', `ideas`)
            break
        case 'twitter.com':
            missingProfileElement(
                'css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0',
                `doesn’t exist`
            )
            missingProfileElement(
                'css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0',
                `no existe`
            )
            break
        case 'github.com':
            missingProfileElement(
                'd-block text-normal color-fg-muted mb-1 f4',
                `Find code, projects, and people on GitHub:`
            )
            break
        case 'www.tiktok.com':
            missingProfileElement(
                'tiktok-143utqi-PTitle emuynwa1',
                `No encontramos esta cuenta`
            )
            missingProfileElement(
                'tiktok-143utqi-PTitle emuynwa1',
                `Couldn't find this account`
            )
            break
        case 'www.facebook.com':
            missingProfileElement('hu5pjgll', `/404/404`)
            missingProfileElement('mvl img', `U4B06nLMGQt`)
            missingProfileElement('hu5pjgll', `MnQWcWb6SrY`)
            break
        case 'www.youtube.com':
            missingProfileElement('', `404`)
            break
        case 'soundcloud.com':
            missingProfileElement('', `Something went wrong on SoundCloud`)
            break
        case 'www.etsy.com':
            missingProfileElement('wt-text-heading-01 wt-pb-xs-2', `Uh oh!`)
            missingProfileElement('wt-text-heading-01 wt-pb-xs-2', `Vaya.`)
            break
        case 'poshmark.com':
            missingProfileElement('', `Page Not Found - Poshmark`)
            break
        case 'www.tripadvisor.com':
            missingProfileElement('', `404`)
            break
        case 'medium.com':
            missingProfileElement(
                'gt gu gv gw gx gy gz ha hb hc hd he gr b hf hg hh',
                `404`
            )
            missingProfileElement(
                'ck dw dx dy dz ea eb ec ed ee ef eg du b eh ei ej',
                `404`
            )
            break
        case 'dribbble.com':
            missingProfileElement('', `404`)
            break
        case 'www.behance.net':
            missingProfileElement('', `Behance :: Oops! We can’t find that page.`)
            missingProfileElement('', `¡Vaya! No ha sido`)
            break
        case 'keybase.io':
            missingProfileElement('container', `Oy!`)
            break
    }
}
if (
    location.hostname !== 'acornapp.net' &&
    !location.hostname.includes('acorntech.io') &&
    !location.href.includes('localhost:8083')
) {
    missingProfile()
}

// Global vars
let profileName
let profileNameArray
let emailButtonArray = []
let emailHandle
let emailSectionArray
let emailSectionArrayLength
let emailFinderTab
// Class names for elements
const emailFinderTabClassName =
    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-gray-800 text-gray-900 '
const profileNameClassName = 'text-xl font-normal text-gray-900 -mb-1'
const emailSectionArrayClassName = 'text-sm text-gray-900 font-semibold'
function emailSection() {
    if (document.getElementsByClassName(emailSectionArrayClassName).length) {
        return emailSectionArray[0].innerText.split('@')[0]
    } else {
        return []
    }
}

// Check if user is doing an email task
function emailTask() {
    profileNameArray = document.getElementsByClassName(profileNameClassName)
    emailSectionArray = document.getElementsByClassName(
        emailSectionArrayClassName
    )
    if (profileNameArray.length !== 0 || emailSectionArray.length !== 0) {
        createSocialMediaButton()
    }
}

// Array that contains the email finder tab
function emailFinderTabArray() {
    return document.getElementsByClassName('-mb-px flex space-x-8')
}

// Destroy all search buttons when profile changes or if new emails are found in Github finder
function clearOldButtons() {
    if (
        emailSection().length === 'undefined' ||
        emailFinderTabArray().length === 0
    ) {
        return
    }
    emailFinderTab = emailFinderTabArray()[0]?.children[0]?.className
    if (
        emailHandle !== emailSection() ||
        emailSectionArrayLength !== emailSectionArray.length
    ) {
        for (let i = 0; i < emailButtonArray.length; i++) {
            emailButtonArray[i].remove()
        }
        for (let i = 0; i < emailSectionArray.length; i++) {
            emailSectionArray[i].removeAttribute('id')
        }
        emailButtonArray = []
    }
}

function createSocialMediaButton() {
    clearOldButtons()
    // Vars for checking for changes on next loop
    profileName = profileNameArray[0].innerHTML.split('<')[0].toLowerCase()
    emailHandle = emailSection()
    emailSectionArrayLength = emailSectionArray.length

    // Individual email sections are put into an array
    emailSectionArray = document.getElementsByClassName(
        emailSectionArrayClassName
    )
    // Give each button a unique ID number based on order of the array.
    for (let i = 0; i < emailSectionArray.length; i++) {
        const emailButton = emailSectionArray[i]
        const idString = `email-task-${i}`
        if (idString === emailButton.id) {
            continue
        }
        emailButton.setAttribute('id', idString)

        // Check if user is in the "Email finder" tab
        let emailDeliver
        let abbreviatedNameArray = []
        if (emailFinderTab === emailFinderTabClassName) {
            // Filter out emails if they are abbreviated and 0% match confidence
            if (profileNameArray.length === 0) {
                continue
            }
            let profileNameSplit = profileName.split(' ') // [john, smith]
            // Generate abbreviated versions of this name
            abbreviatedNameArray.push(
                `${profileNameSplit[0].charAt(0)}${profileNameSplit[1]}`
            ) // jsmith
            abbreviatedNameArray.push(
                `${profileNameSplit[0].charAt(0)}.${profileNameSplit[1]}`
            ) // j.smith
            abbreviatedNameArray.push(
                `${profileNameSplit[1]}${profileNameSplit[0].charAt(0)}`
            ) // smithj
            abbreviatedNameArray.push(
                `${profileNameSplit[1]}.${profileNameSplit[0].charAt(0)}`
            ) // smith.j
            // Retrieve the match confidence value and email handle
            emailHandle = emailSectionArray[i].innerText.split('@')[0]
            let divEmailSections =
                emailSectionArray[i].parentElement.parentElement.nextSibling.children
            // If profile has an avatar search one child further
            let emailDeliverNum
            let possibleMatchNum
            // Search for "Email Deliverability" and "Possible match" status
            if (divEmailSections.length === 4) {
                emailDeliverNum = 2
                possibleMatchNum = 3
            } else {
                emailDeliverNum = 1
                possibleMatchNum = 2
            }
            // "Email Deliverability" SVG type
            emailDeliver =
                divEmailSections[emailDeliverNum].children[0].children[1].children[6]
                    .children[0].children[0].className.baseVal
            // Do not create a button if the email is not deliverable or if its an abbreviated name without a possible match
            if (
                emailDeliver === 'h-6 w-6 inline-block text-red-400' ||
                (abbreviatedNameArray.includes(emailHandle) &&
                    divEmailSections[possibleMatchNum].children.length < 2)
            ) {
                continue
            }
        }
        // Create and place the social media search button
        const socialMediaButton = document.createElement('a')
        socialMediaButton.addEventListener('click', searchEmail, false)
        socialMediaButton.appendChild(document.createTextNode('Social'))
        emailButton.parentNode.insertBefore(
            socialMediaButton,
            emailButton.nextSibling.nextSibling
        )
        // Create and place the Google search button
        const googleButton = document.createElement('a')
        googleButton.addEventListener('click', googleEmail, false)
        googleButton.appendChild(document.createTextNode('Google'))
        emailButton.parentNode.insertBefore(
            googleButton,
            emailButton.nextSibling.nextSibling
        )
        // Add to  button array for deletion when profile changes
        emailButtonArray.push(socialMediaButton)
        emailButtonArray.push(googleButton)
        //Set className for CSS
        socialMediaButton.className = SEARCH_BUTTON_CSS_CLASS
        googleButton.className = SEARCH_BUTTON_CSS_CLASS
    }
    // Reset emailHandle to the first index as this is being compared to determine if the profile changed
    emailHandle = emailSection()
}

if (
    location.hostname.includes('acornapp.net') ||
    location.hostname.includes('acorntech.io') ||
    location.href.includes('localhost:8083')
) {
    setInterval(() => {
        emailTask()
    }, 100)
}
