// ==UserScript==
// @name         Social Media Search
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @update       https://github.com/1ComfyBlanket/Vendor-Userscripts/raw/main/Social%20Media%20Search.user.js
// @description  For searching email handles on various social media sites in a single click.
// @author       Wilbert Siojo
// @icon         https://www.google.com/s2/favicons?domain=simply-how.com
// @grant        none
// @match        https://acornapp.net/*
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
// ==/UserScript==

'use strict';

// Inject CSS into the page
function addGlobalStyle(css) {
    let head, style
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
    const emailHandle = this.nextSibling.value.split("@", 1)[0]
    // Some websites do not accept usernames with periods
    let emailHandlePeriod = false
    if (emailHandle.includes('.')) { emailHandlePeriod = true }
    window.open(`https://www.instagram.com/${emailHandle}`)
    window.open(`https://www.pinterest.com/${emailHandle}`)
    window.open(`https://www.twitter.com/${emailHandle}`)
    if (emailHandlePeriod === false) { window.open(`https://www.github.com/${emailHandle}`) }
    window.open(`https://www.tiktok.com/@${emailHandle}`)
    window.open(`https://www.facebook.com/${emailHandle}`)
    window.open(`https://www.youtube.com/user/${emailHandle}`)
    window.open(`https://www.soundcloud.com/${emailHandle}`)
    window.open(`https://www.etsy.com/people/${emailHandle}`)
    window.open(`https://www.poshmark.com/closet/${emailHandle}`)
    window.open(`https://www.tripadvisor.com/Profile/${emailHandle}`)
    window.open(`https://www.medium.com/@${emailHandle}/about`)
    window.open(`https://dribbble.com/${emailHandle}`)
    window.open(`https://www.behance.net/${emailHandle}`)
}

function googleEmail() {
    const email = this.nextSibling.nextSibling.value;
    const emailHandle = this.nextSibling.nextSibling.value.split("@", 1)[0]
    window.open(`https://www.google.com/search?q="${email}"`)
    window.open(`https://www.google.com/search?q="${emailHandle}"`)
}

// Element and string to search for to determine if a profile is missing
function missingProfileElement(elementClass, stringReturn, exactMatch = 0) {
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
        if (exactMatch === 0) {
            for (let i = 0; i < elementArray().length; i++) {
                if (elementArray()[i].innerText) {
                    if (elementArray()[i].innerText.includes(stringReturn)) {
                        closeClear()
                    }
                }
                if (elementArray()[i].currentSrc) {
                    if (elementArray()[i].currentSrc.includes(stringReturn)) {
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
        // Check for an exact string match
        } else {
            for (let i = 0; i < elementArray().length; i++) {
                if (elementArray()[i].innerText) {
                    if (elementArray()[i].innerText === stringReturn) {
                        closeClear()
                    }
                }
                if (elementArray()[i].currentSrc) {
                    if (elementArray()[i].currentSrc === stringReturn) {
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
            missingProfileElement('', `Page Not Found • Instagram`)
            missingProfileElement('', `Content Unavailable • Instagram`)
            missingProfileElement('', `Página no encontrada • Instagram`)
            missingProfileElement('', `Contenido no disponible • Instagram`)
            break
        case 'www.pinterest.com':
            missingProfileElement('', `show_error=true`)
            missingProfileElement('', `Pinterest`, 1)
            break
        case 'twitter.com':
            missingProfileElement('css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0', `doesn’t exist`)
            missingProfileElement('css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0', `no existe`)
            break
        case 'github.com':
            missingProfileElement('blue-button text-button', `Reload`)
            missingProfileElement('d-block text-normal color-text-secondary mb-1 f4', `Find code, projects, and people on GitHub:`)
            break
        case 'www.tiktok.com':
            missingProfileElement('jsx-1517828681', `404_face_icon`)
            missingProfileElement('jsx-3565499374', `No encontramos esta cuenta`)
            missingProfileElement('jsx-3565499374', `Couldn't find this account`)
            break
        case 'www.facebook.com':
            missingProfileElement('hu5pjgll', `/404/404`)
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
            missingProfileElement('dc dd de df dg dh di dj dk dl dm dn da b do dp dq', `404`)
            break
        case 'dribbble.com':
            missingProfileElement('', `404`)
            break
        case 'www.behance.net':
            missingProfileElement('', `Behance :: Oops! We can’t find that page.`)
            missingProfileElement('', `¡Vaya! No ha sido`)
            break

    }
}
if (location.hostname !== 'acornapp.net') { missingProfile() }

// Global vars
let profileName
let profileNameArray
let emailButtonArray = []
let emailHandle
let emailSectionArray
let emailSectionArrayLength
let emailFinderTab
// Class names for elements
const emailFinderTabClassName = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-gray-800 text-gray-900 '
const profileNameClassName = 'text-xl font-normal text-gray-900 truncate -mb-1'
const emailSectionArrayClassName = 'text-sm text-gray-900 font-semibold'
function emailSection() {
    if (document.getElementsByClassName(emailSectionArrayClassName).length) { return emailSectionArray[0].innerText.split('@')[0] }
    else { return [] }
}

// Check if user is doing an email task
function emaiLtask() {
    profileNameArray = document.getElementsByClassName(profileNameClassName)
    emailSectionArray = document.getElementsByClassName(emailSectionArrayClassName)
    if (profileNameArray.length !== 0 || emailSectionArray.length !== 0) { createSocialMediaButton() }
}

// Destroy all search buttons when profile changes or if new emails are found in Github finder
function clearOldButtons() {
    if  ( emailSection().length === 'undefined' ) { return }
    emailFinderTab = document.getElementsByClassName('-mb-px flex space-x-8')[0].children[0].className
    if (emailHandle !== emailSection() || emailSectionArrayLength !== emailSectionArray.length) {
        for (let i = 0; i < emailButtonArray.length; i++) { emailButtonArray[i].remove() }
        for (let i = 0; i < emailSectionArray.length; i++) {  emailSectionArray[i].removeAttribute('id') }
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
    emailSectionArray = document.getElementsByClassName(emailSectionArrayClassName)
    // Give each button a unique ID number based on order of the array.
    for (let i = 0; i < emailSectionArray.length; i++) {
        const emailButton = emailSectionArray[i]
        const idString = `email-task-${i}`
        if (idString === emailButton.id) { continue }
        emailButton.setAttribute('id', idString)

        // Check if user is in the "Email finder" tab
        let matchConfidence = 0
        let abbreviatedNameArray = []
        if(emailFinderTab === emailFinderTabClassName) {
            // Filter out emails if they are abbreviated and 0% match confidence
            if (profileNameArray.length === 0) { continue }
            let profileNameSplit = profileName.split(' ')                                                        // [john, smith]
            // Generate abbreviated versions of this name
            abbreviatedNameArray.push(`${profileNameSplit[0].charAt(0)}${profileNameSplit[1]}`)                  // jsmith
            abbreviatedNameArray.push(`${profileNameSplit[0].charAt(0)}.${profileNameSplit[1]}`)                 // j.smith
            abbreviatedNameArray.push(`${profileNameSplit[1]}${profileNameSplit[0].charAt(0)}`)                  // smithj
            abbreviatedNameArray.push(`${profileNameSplit[1]}.${profileNameSplit[0].charAt(0)}`)                 // smith.j
            // Retrieve the match confidence value and email handle
            emailHandle = emailSectionArray[i].innerText.split('@')[0]
            let divEmailSections = emailSectionArray[i].parentElement.parentElement.nextSibling.children
            // If profile has an avatar search one child further
            let divEmailSectionsNum
            // Only retrieves first value of the string since 0 will always be lowest
            if (divEmailSections.length === 4) { divEmailSectionsNum = 3 }
            else { divEmailSectionsNum = 2 }
            matchConfidence = divEmailSections[divEmailSectionsNum].children[0].children[1].innerText[0]

            // Do not create a button if the email has 0% match confidence && is an abbreviation
            // === did not work for a matchConfidence comparison in this case
            if (matchConfidence == 0 && abbreviatedNameArray.includes(emailHandle)) { continue }
        }
        // Create and place the social media search button
        const socialMediaButton = document.createElement('a')
        socialMediaButton.addEventListener('click', searchEmail, false)
        socialMediaButton.appendChild(document.createTextNode('Social'))
        emailButton.parentNode.insertBefore(socialMediaButton, emailButton.nextSibling.nextSibling)
        // Create and place the Google search button
        const googleButton = document.createElement('a')
        googleButton.addEventListener('click', googleEmail, false)
        googleButton.appendChild(document.createTextNode('Google'))
        emailButton.parentNode.insertBefore(googleButton, emailButton.nextSibling.nextSibling)
        // Add to  button array for deletion when profile changes
        emailButtonArray.push(socialMediaButton)
        emailButtonArray.push(googleButton)
        //Set className for CSS
        socialMediaButton.className = 'searchButton'
        googleButton.className = 'searchButton'
    }
    // Reset emailHandle to the first index as this is being compared to determine if the profile changed
    emailHandle = emailSection()
}


if (location.hostname === 'acornapp.net') { setInterval(() => { emaiLtask() }, 100) }
