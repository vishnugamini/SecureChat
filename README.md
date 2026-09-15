# SecureChat

SecureChat is an ephemeral one-time chat application that ensures complete privacy by making messages disappear once the chat is closed. The application uses sockets to create secure rooms for real-time communication.

Try out SecureChat here: [SecureChat Website](https://www.securechat.world/).

## Secure Design

SecureChat is a small-scale demonstration of a secure chat system that emphasizes a one-time chat functionality, ensuring that no chat messages are saved or stored anywhere. It is also designed to prevent eavesdropping and minimize the opportunity for third-party agencies (such as hackers\) to obtain chat histor or messages from a compromised server.

This is achieved through the following:

- **End-to-End Encryption:** All messages sent through the chat are encrypted using symmetric AES encryption, ensuring that only the participants in the chat can read the messages. The encryption key is securely exchanged between participants, so even the server cannot decrypt the messages.
- **Messages:** Messages are never stored and upon closing the chat window, the chat never existed in reality.
- **Privacy First:** No personally identifying information is captured during the usage of application.

## Features

- **Ephemeral Chats:** Messages vanish once the chat is closed, leaving no digital footprint.
- **No Limit on Users:** No limit on users in a single room unless explicitly stated.
- **Password Protection:** Rooms can be secured with passwords.
- **No Data Storage:** Messages are not stored anywhere.
- **Anonymous Chat:** Engage in private conversations without revealing your identity.
- **Location Sharing:** Optionally share your location during a chat.

## How It Works

- **Create a Room:** Choose a unique room ID and a display name. Optionally set a password and room size. Share the details with others to start chatting.
- **Join a Room:** Enter the room ID and your name. Provide the password if the room is protected.

## Screenshots

### Landing Page
![Landing Page](/img/img-1.png)

### Chat Page
![Chat Page](/img/img-2.png)

## Continuous integration

The [CI workflow](.github/workflows/ci.yml) runs on pull requests targeting
`main`, pushes to `main`, and manual runs from the Actions tab.

- Installs the locked dependencies with `npm ci` on Node.js 22 and 24.
- Checks JavaScript syntax and runs message unit tests.
- Starts an isolated MongoDB 7 service and tests HTTP routes, WebSocket room
  creation, password and capacity checks, message/location delivery, and disconnects.

The workflow does not publish images or deploy the app and needs no repository
secrets. Actions are pinned to commit hashes; Dependabot checks Actions updates
weekly. There is no frontend compilation step in this project.

### Run the checks locally

Use Node.js 24 (`nvm use` if you use nvm):

```sh
npm ci
npm run check
npm test
```

Integration tests start and stop the app automatically. Point them at a disposable
database, because the chat tests write statistics:

```sh
docker run --detach --rm --name securechat-test-mongo -p 127.0.0.1:27017:27017 mongo:7
MONGODB_URI=mongodb://127.0.0.1:27017/securechat_test npm run test:integration
docker stop securechat-test-mongo
```

Docker is used only to provide a disposable MongoDB test database; the app does
not need a Dockerfile.

Once this workflow is pushed, you can make `Test (Node 22)` and `Test (Node 24)`
required checks in the repository's branch protection settings.

## Contributing

I welcome contributions! If you have suggestions or improvements, please send a pull request.
