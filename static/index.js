$(document).ready(function () {
    $("#initial-message").hide();
    $("#chat").append("<div class='message box' id='typing-blob'><div class='typing typing-1'></div><div class='typing typing-2'></div><div class='typing typing-3'></div></div>").animate({scrollTop: $('#chat').prop("scrollHeight")}, 500)
    setTimeout(function () {
        $("#typing-blob").remove();
        $("#initial-message").show();
    }, 5000);
});

let datetime;
let sound = new Audio();
sound.src = 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-35448/zapsplat_cartoon_bubble_pop_003_40275.mp3';

let running = false;
let responseMessage = {};
const botResponseContainer = $('#botResponse');
const audioPlayer = document.getElementById('audioPlayer');
// console.log(loc);


function openChatBox() {
    $("#chatBox").removeClass("closed")
    $("#closeButton").show();
    //chatbot online-status
    $("#online-status").attr("class", "online-status");
}

function closeChatBox() {
    $("#chatBox").addClass("closed")
    $("#closeButton").hide();
}

function timing() {
    let currentdate = new Date();
    let hrs = currentdate.getHours();
    // console.log(hrs);
    // console.log(typeof (hrs));
    let day;
    if (hrs > 12) {
        hrs = hrs - 12;
        // console.log(hrs);
        day = "PM";

    } else {
        day = "AM";
    }

    datetime = +hrs + ":"
        + currentdate.getMinutes() + " " + day;
    // console.log(datetime);
}

async function sendMessage(userResponse) {
    if (userResponse !== "") {
        responseMessage["text"] = userResponse
        responseMessage = {};
        $("#chat").append("<div class='message parker'>" + userResponse + "</div>").animate({scrollTop: $('#chat').prop("scrollHeight")}, 500)
        timing();
        $("#chat").append(`<div class='timer' id='time'>Today at ${datetime} </div>`).animate({scrollTop: $('#chat').prop("scrollHeight")}, 500)
        sound.play();
        $("#chat").append("<div class='message box' id='typing-blob'>" +
            "<div class='typing typing-1'></div><div class='typing typing-2'></div>" +
            "<div class='typing typing-3'></div>" +
            "</div>").animate({scrollTop: $('#chat').prop("scrollHeight")}, 500)
        timing();
        $("#Query").val("");
        setTimeout(function () {
            $("#typing-blob").remove()
        }, 5000);

        await transcribeText(userResponse);
    }
}


function sendFromTextBox() {
    let userResponse = $("#Query").val();
    // console.log(userResponse);
    sendMessage(userResponse);
    userResponse = "";
    document.getElementById('micIcon').className = "fas fa-microphone";

}

function myFun(btn) {
    console.log(btn.dataset.value);
    userResponse = btn.dataset.value;
    sendMessage(userResponse);
}

$(document).ready(function () {
    $("#closeButton").hide();
    setTimeout(function () {
        $("#chatBox").removeClass("closed");
        $("#closeButton").show();
    }, 5000);
    document.getElementById('micIcon').className = "fas fa-microphone";

});


function record() {
    $(document).ready(function () {
        $('input[name="msg-txt"]').attr('placeholder', 'Listening.....');
    })
    setTimeout(() => {
        $(document).ready(function () {
            $('input[name="msg-txt"]').attr('placeholder', 'Type your message here!');
        })
    }, 4000);
    let recognition = new webkitSpeechRecognition();
    recognition.lang = "en-GB";
    recognition.onresult = function (event) {
        console.log(event);
        document.getElementById('Query').value = event.results[0][0].transcript;
        setTimeout(async () => {
            let userResponse = $("#Query").val();
            // console.log(userResponse);
            sendMessage(userResponse);
            userResponse = "";
        }, 2000);
        $(document).ready(function () {
            $('input[name="msg-txt"]').attr('placeholder', 'Type your message here!');
        })
    }
    recognition.start();
}


// Function to transcribe the text
async function transcribeText(userMessage) {
    try {
        const response = await fetch('/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message: userMessage})
        });
        const data = await response.json();
        // console.log(data.bot_response);
        botResponseContainer.text(data.bot_response);
        addResponseMsg(data.bot_response);
        let audioUrl = `/audio/${data.audio_file_path}`;
        audioPlayer.src = audioUrl;
        audioPlayer.play();

        appendToChatLog(userMessage); // Adding the user's message to the chat log
        appendToChatLog(data.bot_response);
    } catch (error) {
        console.error('Error:', error);
    }
}

function addResponseMsg(responseMsg) {
    let div = document.createElement("div");
    div.innerHTML = "<div class='chat-message-received'>" + responseMsg + "</div>";
    div.className = "message box";
    document.getElementById("chat").appendChild(div);
    running = false;
}


function updateTranscribedText(text) {
    console.log('Transcribed text:', text);
    let div = document.createElement("div");
    div.innerHTML = "<div style='text-align: left; margin-top: 6px;' class='chat-message-received'>" + text + "</div>";
    div.className = "message parker";
    document.getElementById("chat").appendChild(div);
}


function iconFunction() {
    if (document.getElementById('micIcon').className === "fas fa-microphone") {
        record();
    }
    if (document.getElementById('micIcon').className === "fas fa-paper-plane") {
        sendFromTextBox();
    }


}

function changeIcon(f1) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (document.getElementById(f1).className == "fas fa-microphone") {

        if (keycode != 32 && keycode != 8 && keycode != 13) {
            document.getElementById(f1).className = "fas fa-paper-plane";

        }
    } else {
        if (keycode == 13) {
            sendFromTextBox();

        } else if (keycode == 8) {
            //console.log(keycode);
            var content = document.getElementById('Query').value;
            if (content == "") {
                document.getElementById(f1).className = "fas fa-microphone";
            }

        } else {
            document.getElementById(f1).className = "fas fa-paper-plane";
        }
    }

}

function previewImage() {
    var file = document.getElementById("real-file").files;
    if (file.length > 0) {
        var fileReader = new FileReader();

        fileReader.onload = function (event) {
            document.getElementById("preview").setAttribute("src", event.target.result);
        };

        fileReader.readAsDataURL(file[0]);
    }
}
