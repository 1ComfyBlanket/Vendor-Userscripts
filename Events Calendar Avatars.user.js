// ==UserScript==
// @name         Events Calendar Avatars
// @namespace    http://tampermonkey.net/
// @version      1.1.6
// @update       https://github.com/1ComfyBlanket/Vendor-Userscripts/raw/main/Events%20Calendar%20Avatars.user.js
// @description  Retrieve Google events calendar avatars at a higher resolution with much fewer inputs.
// @author       Wilbert Siojo
// @match        https://calendar.google.com/calendar/*
// @match        https://lh3.googleusercontent.com/*
// @icon         https://www.google.com/s2/favicons?domain=simply-how.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.setClipboard
// ==/UserScript==

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
`);

if (location.hostname === 'calendar.google.com') {
    setTimeout(() => {
        // Create and place button for opening avatars
        let openAvatarsButton = document.createElement('a');
        openAvatarsButton.addEventListener('click', countEmails, false);
        openAvatarsButton.appendChild(document.createTextNode('Open Images'));

        // "kx3Hed" is the "Guests" tab
        let openAvatar = document.getElementsByClassName("kx3Hed")[0];
        openAvatar.parentNode.insertBefore(openAvatarsButton, openAvatar.nextSibling);

        //Set className for CSS
        openAvatarsButton.className = "searchButton";

        function countEmails() {
            // Grabs all of the avatars currently in the email list and scale the image from 24px to 1000px
            // "jPtXgd" is all of the listed email avatars
            let imageArray = document.getElementsByClassName('jPtXgd');
            for (let i = 0; i < imageArray.length; i++) {
                // Retrieve email
                let email = imageArray[i].parentElement.previousSibling.outerHTML.split(`data-email="`)[1].split(`" role=`)[0];
                // Retrieve avatar URL
                let imageLink = imageArray[i].outerHTML.split('"')[7].split('&quot;')[1].split('s24');
                imageLink = `${imageLink[0]}s1000${imageLink[1]}`;
                GM.setValue(imageLink, email);
                window.open(imageLink);
            };
        }
    }, 2000);

// Run on lh3.googleusercontent.com
} else {
    addGlobalStyle(`
        .searchButton {
            text-transform: none;
            margin-left: 10px;
            margin-top: 10px;
            padding:4px 8px;
        }
    `);
    let email = await GM.getValue(window.location.href);
    let copyEmail = document.createElement('a');
    copyEmail.addEventListener('click', () =>{ GM.setClipboard(email) }, false);
    copyEmail.appendChild(document.createTextNode(email));
    let emaiLPosition = document.getElementsByTagName("body")[0];
    emaiLPosition.parentNode.insertBefore(copyEmail, emaiLPosition);
    copyEmail.className = "searchButton";
}
