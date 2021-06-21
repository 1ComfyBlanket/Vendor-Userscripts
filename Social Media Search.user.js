// ==UserScript==
// @name         Social Media Search
// @namespace    http://tampermonkey.net/
// @version      1.2.2
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
        margin-left: 5px;
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
    let email = this.nextSibling.value;
    let emailHandle = this.nextSibling.value.split("@", 1)[0]
    // Some websites do not accept usernames with periods
    let emailHandlePeriod = false
    if (emailHandle.includes('.')) { emailHandlePeriod = true }
    window.open(`https://www.google.com/search?q="${email}"`)
    window.open(`https://www.google.com/search?q="${emailHandle}"`)
    window.open(`https://www.instagram.com/${emailHandle}`)
    window.open(`https://www.pinterest.com/${emailHandle}`)
    window.open(`https://www.twitter.com/${emailHandle}`)
    if (emailHandlePeriod === false) { window.open(`https://www.github.com/${emailHandle}`) }
    window.open(`https://www.tiktok.com/${emailHandle}`)
    window.open(`https://www.facebook.com/${emailHandle}`)
    window.open(`https://www.youtube.com/user/${emailHandle}`)
    window.open(`https://www.soundcloud.com/${emailHandle}`)
    window.open(`https://www.etsy.com/people/${emailHandle}`)
    window.open(`https://www.poshmark.com/closet/${emailHandle}`)
    window.open(`https://www.tripadvisor.com/Profile/${emailHandle}`)
    window.open(`https://www.medium.com/@${emailHandle}`)
}

// Element and string to search for to determine if a profile is missing
function missingProfileElement(elementClass, stringReturn, type = 0) {
    const intervalCheck = setInterval(() => {
        if (type === 0 && document.getElementsByClassName(elementClass).length) {
            for (let i = 0; i < document.getElementsByClassName(elementClass).length; i++) {
                if (document.getElementsByClassName(elementClass)[i].innerText.includes(stringReturn)) {
                    close()
                    clearInterval(intervalCheck)
                }
            }
        }
        if (type === 1 && document.title.includes(stringReturn)) {
            close()
            clearInterval(intervalCheck)
        }
        if (type === 2 && location.href.includes(stringReturn)) {
            close()
            clearInterval(intervalCheck)
        }
    }, 200)
}

// Social media sites run this function to determine if it is a missing profile
function missingProfile() {
    switch (location.hostname) {
        case 'www.instagram.com':
            missingProfileElement('', `Content Unavailable • Instagram`, 1)
            missingProfileElement('', `Page Not Found • Instagram`, 1)
            break
        case 'www.pinterest.com':
            missingProfileElement('', `show_error=true`, 2)
            break
        case 'twitter.com':
            missingProfileElement('css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0', `Hmm...this page doesn’t exist. Try searching for something else.`)
            missingProfileElement('css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0', `This account doesn’t exist`)
            break
        case 'github.com':
            missingProfileElement('blue-button text-button', `Reload`)
            missingProfileElement('d-block text-normal color-text-secondary mb-1 f4', `Find code, projects, and people on GitHub:`)
            break
        case 'www.tiktok.com':
            missingProfileElement('jsx-1517828681 recommend-desc', `Check out more trending videos on TikTok`)
            break
        case 'www.facebook.com':
            missingProfileElement('d2edcug0', `This Page Isn't Available`)
            break
        case 'www.youtube.com':
            missingProfileElement('', `404 Not Found`, 1)
            break
        case 'soundcloud.com':
            missingProfileElement('', `Something went wrong on SoundCloud`, 1)
            break
        case 'www.etsy.com':
            missingProfileElement('wt-text-heading-01 wt-pb-xs-2', `Uh oh!`)
            break
        case 'poshmark.com':
            missingProfileElement('', `Page Not Found - Poshmark`, 1)
            break
        case 'www.tripadvisor.com':
            missingProfileElement('', `404 Not Found - Tripadvisor`, 1)
            break       
        case 'medium.com':
            missingProfileElement('dc dd de df dg dh di dj dk dl dm dn da b do dp dq', `404`)
            break
            
    }
}
if (location.hostname !== 'acornapp.net') {
    missingProfile()
    return
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

            // Do no create a button if the email has 0% match confidence && is an abbreviation
            if (matchConfidence == 0 && abbreviatedNameArray.includes(emailHandle)) { continue }
        }

        // Create and place the Search button
        let socialMediaButton = document.createElement('a')
        socialMediaButton.addEventListener('click', searchEmail, false)
        socialMediaButton.appendChild(document.createTextNode('Search'))
        emailButton.parentNode.insertBefore(socialMediaButton, emailButton.nextSibling.nextSibling)
        // Add to  button array for deletion when profile changes
        emailButtonArray.push(socialMediaButton)
        //Set className for CSS
        socialMediaButton.className = 'searchButton'
    };
    // Reset emailHandle to the first index as this is being compared to determine if the profile changed
    emailHandle = emailSection()
}


if (location.hostname === 'acornapp.net') { setInterval(() => { emaiLtask() }, 100) }
