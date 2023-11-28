// Randomizer
function Randomizer(min, max) {
    return min + Math.random() * (max - min);
}

function TopOrBottom() {
    var topOrBottom = Math.random();
    if (topOrBottom < 0.5) {
        return -200;
    } else {
        return innerHeight + 200;
    }
}

// Check if string ends with number
function countvalues(str) {
    return str.match(/\s[0-9]+/g);
}

async function getTwitchAvatar(user, id=false){


    let url = "https://decapi.me/twitch/avatar/" + user;
    let avatar;

    if(id){
        url += "?id=true";
    }
    
    // Usage example
    try {
        avatar =  await makeRequest(url)
        .then(function(response) {
            // Handle the response here
            console.log(response);
            return response;
        })
        .catch(function(error) {
            // Handle any errors that occurred during the request
            console.error(error);
        });
    } catch (error) {
    // Handle any errors that occurred during the request
    console.error(error);
    }

    return avatar;
}


function makeRequest(url) {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 200) {
            resolve(xhttp.responseText); // Resolve the Promise with the response
            } else {
            reject('Error: ' + xhttp.status); // Reject the Promise with an error message
            }
        }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    });
}
  
  



// Get number at end of string
function getCommandValue(str, type) {

    let values = countvalues(str);

    if (values === null) {
        return null;
    }

    if (type == 'count') {

        if (values.length == 2) {
            return values[0].trim();
        } else if (values.length == 1) {
            return values[0].trim();
        } else {
            return null;
        }
    }

    if (type == 'interval') {

        if (values.length == 2) {
            return values[1].trim();
        } else {
            return null;
        }
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}


function removeelement(div) {
    document.getElementById(div).remove();
}

export default {
    delay,
    randomSign,
    removeelement,
    getCommandValue,
    Randomizer,
    TopOrBottom,
    getTwitchAvatar,
}