const generateMessage = (username, messageText) => {
    return {
        username: username,
        text: messageText,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (username, locationURL) => {
    return {
        username: username,
        url: locationURL,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage:generateMessage,
    generateLocationMessage:generateLocationMessage
}