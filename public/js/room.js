import { encrypt, decrypt } from './encrypt.js';

const socket = io();
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room, roomSize, password, mode } = Qs.parse(location.search, { ignoreQueryPrefix: true });


const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageHeight = $newMessage.offsetHeight + parseInt(getComputedStyle($newMessage).marginBottom);
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset + 1) {
        $messages.scrollTop = containerHeight;
    }
};

socket.on('message', (message) => {
    const messageClass = message.username === username ? 'message--sender' : 'message--other';
    const decryptedMessage = decrypt(message.text);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: decryptedMessage,
        createdAt: moment(message.createdAt).format('h:mm a'),
        messageClass: messageClass
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
    const messageClass = message.username === username ? 'message--sender' : 'message--other';
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a'),
        messageClass: messageClass
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    });
    document.querySelector("#sidebar").innerHTML = html;
});

$messageFormInput.addEventListener('input', () => {
    if ($messageFormInput.value.trim().length > 0) {
        $messageFormButton.removeAttribute('disabled');
    } else {
        $messageFormButton.setAttribute('disabled', 'disabled');
    }
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value.trim();
    if (!message) {
        $messageFormButton.removeAttribute('disabled');
        return;
    }
    socket.emit("sendMessage", encrypt(message), (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            console.log(error);
        }
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log("Location shared");
        });
    });
});

if (mode === 'create') {
    socket.emit('create', { username, room, roomSize, password }, (error) => {
        if (error) {
            alert(error);
            location.href = '/';
        }
    });
} else {
    socket.emit('join', { username, room, password }, (error) => {
        if (error) {
            alert(error);
            location.href = '/';
        }
    });
}
