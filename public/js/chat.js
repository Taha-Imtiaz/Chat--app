// connect to the server using websockets and client can connect to server
const socket = io()

//server (emit) => client (recieve) --acknowledgement --> server
//client (emit) => server(recieve) --acknowledment--> client

//recieve an event from the server
// socket.on("countUpdated", (count) => {
//     console.log("The count has been updated!", count)
// })

//allow the client to send the data to the server
//allow client to click a button to increment count everytime

// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("Clicked")
    //emit(send) data from the client to the server.
    //do not send data because server knows the current count and adds 1 to it
    // socket.emit("increment")

// })
//Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationBtn = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const mapsURLTemplate = document.querySelector("#mapsURL-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
//parse the query strings of form data
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// auroscroll function
const autoscroll = () => {
// New message element (new message iss  the last child of message)
const $newMessage = $messages.lastElementChild

//get the styles and height of the new message
const newMessageStyles = getComputedStyle($newMessage)
const newMessageMargin = parseInt(newMessageStyles.marginBottom)
const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//Visible height
const visibleHeight = $messages.offsetHeight


//height of messages container
const containerHeight = $messages.scrollHeight


//How far have I scrolled
const scrollOffset = $messages.scrollTop + visibleHeight


if(containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
}
}

socket.on("message", (welcomeMsg) => {
    console.log(welcomeMsg)
    //render the template

    //store the final html rendering in the browser
    const html = Mustache.render(messageTemplate, {
        username:welcomeMsg.username,
        message: welcomeMsg.text,
        createdAt: moment(welcomeMsg.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
//listen for location msg
socket.on("locationMessage", (locationMessageObj) => {
    console.log(locationMessageObj)

    const html = Mustache.render(mapsURLTemplate, {
        username:locationMessageObj.username,
        mapsURL: locationMessageObj.url,
        createdAt: moment(locationMessageObj.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users:users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener("submit", (e) => {
e.preventDefault()
//disable the form(by disabling submit button)

$messageFormButton.setAttribute("disabled", "disabled")

//target form and in form target input name property whose value is message
const message = e.target.elements.message.value;
//emit the message
socket.emit("sendMessage", message, (error) => {
    //enable the form(by enabling send button)
    $messageFormButton.removeAttribute("disabled")
    //clear the input field and moves the focus back to input
    $messageFormInput.value = ''
    $messageFormInput.focus()

//if the language cantains profanity
    if(error) {
      return console.log(error)
    }
    console.log("Message delivered!")
    // console.log("The message was delivered",message)
})
})

$sendLocationBtn.addEventListener("click", () => {
    //geolocation accessed by navigator.location.check if location exists
    if(!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser")
    }
    //disabled the sendlocationBtn while the location is fetched
    $sendLocationBtn.setAttribute("disabled", "disabled")


//if location exists weused getCurrentPosition to find the current position for the user
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location shared!")
            //enable the send location button
            $sendLocationBtn.removeAttribute("disabled")
        })
    })
})

//send username and roomname to the server
socket.emit("join", {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
   
})
