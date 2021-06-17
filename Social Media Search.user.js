// ==UserScript==
// @name         Social Media Search
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @update       https://github.com/1ComfyBlanket/Covey-Userscripts/raw/main/Social%20Media%20Search.user.js
// @description  For searching email handles on various social media sites in a single click.
// @author       Wilbert Siojo
// @match        https://acornapp.net/*
// @icon         https://www.google.com/s2/favicons?domain=simply-how.com
// @grant        none
// ==/UserScript==

'use strict';

// Inject CSS into the page
function addGlobalStyle(css) {
    let head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
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
`);

function searchEmail() {
    let email = this.nextSibling.value;
    let emailHandle = this.nextSibling.value.split("@", 1)[0];
    window.open(`https://www.google.com/search?q="${email}"`)
    window.open(`https://www.google.com/search?q="${emailHandle}"`);
    window.open(`https://www.instagram.com/${emailHandle}`);
    window.open(`https://www.pinterest.com/${emailHandle}`);
    window.open(`https://www.twitter.com/${emailHandle}`);
    window.open(`https://www.github.com/${emailHandle}`);
    window.open(`https://www.tiktok.com/${emailHandle}`);
    window.open(`https://www.facebook.com/${emailHandle}`);
    window.open(`https://${emailHandle}.tumblr.com/`);
    window.open(`https://www.youtube.com/user/${emailHandle}`);
    window.open(`https://www.soundcloud.com/${emailHandle}`);
    window.open(`https://www.etsy.com/people/${emailHandle}`);
    window.open(`https://www.poshmark.com/closet/${emailHandle}`);
    window.open(`https://www.tripadvisor.com/Profile/${emailHandle}`);
    window.open(`https://www.medium.com/@${emailHandle}`);
}

let profileName
let emailButtonArray = [];
let emailSectionArray = [];
function createSocialMediaButton() {
    // For checking against the currently selected profile
    let profileNameArray = document.getElementsByClassName('text-xl font-normal text-gray-900 truncate -mb-1');
    if (profileNameArray.length === 0) {
        setTimeout(() => { createSocialMediaButton() }, 200);
        return;
    };
    if (profileName !== profileNameArray[0].innerHTML.split('<')[0].toLowerCase()) {
        for (let i = 0; i < emailButtonArray.length; i++) {
            // Destroy all search buttons when profile changes
            emailButtonArray[i].remove();
        }
        for (let i = 0; i < emailSectionArray.length; i++) {
            emailSectionArray[i].removeAttribute('id')
        }
            emailButtonArray = [];
    };
    profileName = profileNameArray[0].innerHTML.split('<')[0].toLowerCase();

    // Individual email sections are put into an array
    emailSectionArray = document.getElementsByClassName('text-sm text-gray-900 font-semibold');
    // Give each button a unique ID number based on order of the array.
    for (let i = 0; i < emailSectionArray.length; i++) {
        const emailButton = emailSectionArray[i];
        const idString = `email-task-${i}`;
        if (idString === emailButton.id) { continue };
        emailButton.setAttribute('id', idString);

        // Check if user is in the "Email finder" tab
        let emailFinderTab = document.getElementsByClassName('-mb-px flex space-x-8')[0].children[0].className;
        if(emailFinderTab === 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-gray-800 text-gray-900 ') {
            // Filter out emails if they are abbreviated and 0% match confidence
            if (profileNameArray.length === 0) { continue };
            // profileName = profileNameArray[0].innerHTML.split('<')[0].toLowerCase();
            let profileNameSplit = profileName.split(' ');                                                        // [john, smith]
            // Generate abbreviated versions of this name
            let abbreviatedNameArray = [];
            abbreviatedNameArray.push(`${profileNameSplit[0].charAt(0)}${profileNameSplit[1]}`);                  // jsmith
            abbreviatedNameArray.push(`${profileNameSplit[0].charAt(0)}.${profileNameSplit[1]}`);                 // j.smith
            abbreviatedNameArray.push(`${profileNameSplit[1]}${profileNameSplit[0].charAt(0)}`);                  // smithj
            abbreviatedNameArray.push(`${profileNameSplit[1]}.${profileNameSplit[0].charAt(0)}`);                 // smith.j
            // Retrieve the match confidence value and email handle
            let matchConfidence = 0;
            let emailHandle = emailSectionArray[i].innerText.split('@')[0];
            let divEmailSections = emailSectionArray[i].parentElement.parentElement.nextSibling.children;
            // If profile has an avatar search one child further
            let divEmailSectionsNum;
            if (divEmailSections.length === 4) {
                // Only retrieves first value of the string since 0 will always be lowest
                divEmailSectionsNum = 3
            } else {
                divEmailSectionsNum = 2
            }
            matchConfidence = divEmailSections[divEmailSectionsNum].children[0].children[1].innerText[0];

            // Do no create a button if the email has 0% match confidence && is an abbreviation
            if (matchConfidence == 0 && abbreviatedNameArray.includes(emailHandle)) { continue }
        }

        // Create and place the Search button
        let socialMediaButton = document.createElement('a');
        socialMediaButton.addEventListener('click', searchEmail, false);
        socialMediaButton.appendChild(document.createTextNode('Search'));
        emailButton.parentNode.insertBefore(socialMediaButton, emailButton.nextSibling.nextSibling);
        //Set className for CSS
        socialMediaButton.className = 'searchButton';
        // Add to  button array for deletion when profile changes
        emailButtonArray.push(socialMediaButton);
    };
}


setInterval(() => { createSocialMediaButton() }, 200);