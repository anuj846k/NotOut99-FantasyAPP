# NotOut99 - Fantasy Cricket Game 🏏

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://example.com) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-darkgreen)](https://www.mongodb.com/)
[![Twilio](https://img.shields.io/badge/Twilio-OTP-red)](https://www.twilio.com/)

Welcome to **NotOut99**, a dynamic fantasy cricket platform where cricket enthusiasts can create their dream teams, compete in exciting contests based on real-world matches, and win fantastic rewards!

This repository contains the source code for both the mobile application and the backend server.

---

## ✨ Overview

NotOut99 allows users to engage deeply with cricket matches by leveraging their knowledge to build winning fantasy teams. The platform consists of two main components:

1.  **`notout99` (Mobile App):** A cross-platform application built with React Native and Expo for a seamless user experience on iOS and Android.
2.  **`NotOut99-Server` (Backend):** A robust Node.js server using Express.js, MongoDB for data storage, Twilio for secure OTP verification, and the Entity Sports API for real-time cricket data.

---

## 📸 Screenshots

<p align="center">
  <img src="https://i.imgur.com/19GRcoP.png" alt="Login Screen" width="18%" hspace="1%"/>
  <img src="https://i.imgur.com/z7tglZ8.png" alt="Home Screen" width="18%" hspace="1%"/>
  <img src="https://i.imgur.com/Hq2MfZf.png" alt="All Matches Screen" width="18%" hspace="1%"/>
  <img src="https://i.imgur.com/dWp77du.png" alt="My Coins Screen" width="18%" hspace="1%"/>
  <img src="https://i.imgur.com/wexvxJJ.png" alt="Profile Screen" width="18%" hspace="1%"/>
  <br/><br/>
  <img src="https://i.imgur.com/z5Ev9x4.png" alt="Contests Screen" width="18%" hspace="1%"/>
  <img src="https://i.imgur.com/8YdEX6I.png" alt="Scorecard Screen" width="18%" hspace="1%"/>
  <img src="https://i.imgur.com/Zl9eScV.png" alt="Confirm Entry Screen" width="18%" hspace="1%"/>
  <img src="https://i.imgur.com/bss3c8K.png" alt="Refer & Win Screen" width="18%" hspace="1%"/>
  </p>

---

## 🚀 Features

### 📱 Mobile App (`notout99`)

* 🔐 **User Authentication:** Secure login and signup using phone number with OTP verification (powered by Twilio).
* 🏏 **Team Creation:** Intuitive interface to build and manage fantasy cricket teams based on player credits and roles.
* 🏆 **Contest Participation:** Browse and join various public and private contests for upcoming real cricket matches.
* 📊 **Live Tracking:** Monitor live match scores and track your team's player performance in real-time.
* 💰 **In-App Wallet:** Manage your virtual currency/balance for contest entries and winnings.
* 👤 **Profile Management:** Update user details, view transaction history, and manage rewards.
* 🤝 **Referral System:** Invite friends and earn rewards through the "Refer & Win" program.

### ⚙️ Backend Server (`NotOut99-Server`)

* 🔑 **Authentication & Authorization:** Secure API endpoints using JWT (JSON Web Tokens) for access and refresh tokens.
* 📅 **Match & Player Data Management:** Integrates with Entity Sports API to fetch and store real-time match schedules, player lists, scores, and stats.
* 🎮 **Contest Engine:** Logic for creating, managing, and joining contests, including different contest types and entry fees.
* 📈 **Scoring Engine:** Calculates fantasy points based on predefined rules and live player performance during matches.
* 💳 **Wallet & Transactions:** Securely manages user wallet balances and records all transactions (deposits, withdrawals, contest entries, winnings).
* leaderboard calculation and management.
* 🛠️ **Admin Functionality:** (Potential) Endpoints or a separate interface for administrative tasks like managing users, contests, and platform settings.

---

## 🛠️ Tech Stack

* **Frontend (Mobile App):** React Native, Expo
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose ODM potentially)
* **Real-time Data:** Entity Sports API
* **SMS/OTP:** Twilio API
* **State Management (Mobile):** Redux 
* **Authentication:** JWT (Access/Refresh Tokens)
* **Package Managers:** npm / yarn

---

## 🏁 Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [MongoDB](https://www.mongodb.com/try/download/community) (Ensure a MongoDB server instance is running locally or accessible)
* [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install --global expo-cli`
* [Git](https://git-scm.com/)
* A Twilio Account (for SID, Auth Token, Phone Number/Service SID)
* An Entity Sports API Key

### ⚙️ Server Setup (`NotOut99-Server`)

1.  **Navigate to the server directory:**
    ```bash
    # From the project root directory
    cd NotOut99-Server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create `.env` file:**
    Create a file named `.env` in the `NotOut99-Server` root directory. Copy the contents of `.env.example` (if available) or add the following variables, replacing placeholders with your actual credentials:
    ```dotenv
    # .env configuration for Backend Server

    PORT=8000
    MONGODB_URI=<your-mongodb-connection-string> # e.g., mongodb://localhost:27017/notout99
    
    # JWT Secrets (use strong, random strings)
    ACCESS_TOKEN_SECRET=<your-strong-jwt-access-secret>
    REFRESH_TOKEN_SECRET=<your-strong-jwt-refresh-secret>
    
    # Twilio Credentials
    TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
    TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
    TWILIO_PHONE_NUMBER=<your-twilio-phone-number-or-messaging-service-sid> 

    # Entity Sports API Key
    ENTITY_SPORTS_API_KEY=<your-entity-sports-api-key> 
    ```
    *Note: Ensure your MongoDB instance is running and accessible via the `MONGODB_URI`.*

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The server should now be running, typically on `http://localhost:8000`. Check the console output for the exact address.

### 📱 Mobile App Setup (`notout99`)

1.  **Navigate to the mobile app directory:**
    ```bash
    # From the project root directory
    cd notout99 
    # If you are already in NotOut99-Server: cd ../notout99
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create `.env` file:**
    Create a file named `.env` in the `notout99` root directory and add the base URL of your running backend server:
    ```dotenv
    # .env configuration for Mobile App
    API_BASE_URL=http://<your-local-ip-address>:8000/api 
    # Replace <your-local-ip-address> with your machine's IP on the network 
    # Or http://localhost:8000/api if testing only on simulator/emulator on the same machine
    # Or your deployed backend URL if applicable
    ```
    *Important: If running the app on a physical device, use your computer's local network IP address, not `localhost`.*

4.  **Start the Expo development server:**
    ```bash
    npx expo start
    ```
    Follow the instructions in the terminal to open the app:
    * Scan the QR code with the Expo Go app on your physical iOS or Android device.
    * Press `a` to open in an Android emulator/device.
    * Press `i` to open in an iOS simulator.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeatureName`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeatureName`).
6.  Open a Pull Request.

Please ensure your code follows the project's coding standards (if defined).

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. (You should add a `LICENSE` file with the MIT License text).

---

## 📧 Contact

[Anuj] - [anuj846k@gmail.com]

Project Link: [https://github.com/anuj846k/NotOut99-FantasyAPP](https://github.com/anuj846k/NotOut99-FantasyAPP)
