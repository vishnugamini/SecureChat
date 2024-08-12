# SecureChat

SecureChat is an ephemeral one-time chat application that ensures complete privacy by making messages disappear once the chat is closed. The application uses sockets to create secure rooms for real-time communication.

## Secure Design

SecureChat is a small-scale demonstration of a secure chat system using a public key architecture that prevents eavesdropping. It is designed to minimize the opportunity for third-party agencies (such as hackers or governmental agencies) from being able to obtain chat history or chat messages from a compromised server.

This is achieved through the following:

- **End-to-End Encryption:** All messages sent to the server are encrypted using a public key/private key architecture.
- **Message Deletion:** Messages are removed from the server as soon as they are read by a client.
- **Privacy First:** No personally identifying information is captured, either during account setup or with device registration.

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

## Getting Started

Try out SecureChat here: [SecureChat Website](https://www.securechat.world/).

## Screenshots

### Landing Page
![Landing Page](/img/img-1.png)

### Chat Page
![Chat Page](/img/img-2.png)

## Contributing

I welcome contributions! If you have suggestions or improvements, please send a pull request to my [GitHub repository](https://github.com/vishnugamini/SecureChat).

