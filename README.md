# Mentorship Matching Platform

The **Mentorship Matching Platform** is a web application designed to connect mentors and mentees based on their skills and interests. This platform allows users to register, set up their profiles, and find mentorship opportunities. Check out deployed application on 
https://mentor-matching-platform-delta.vercel.app

## Features

### User Interface (UI)
- **Clean Design**: Built using vanilla JavaScript, HTML, and CSS for a minimalistic and intuitive experience.
- **Pages Included**:
  - **User Registration and Login**: Secure sign-up, log-in, and log-out functionality.
  - **Profile Setup**: Create and edit profiles with details like role (mentor or mentee), skills, interests, and a brief bio.
  - **User Discovery**: Browse other users' profiles with filters for role, skills, and interests.

### Functionality
- **User Authentication**:
  - Secure user registration and login with input validation.
  - Secure logout functionality.
- **Profile Management**:
  - Create, edit, and delete user profiles.
  - Accurate display and updating of profile information.
- **Connection Requests**:
  - Send and receive mentorship requests.
  - Accept or decline requests.
  - Manage ongoing mentorship connections.

## Technology Stack

### Frontend
- **HTML, CSS, JavaScript and Docker**: No external libraries or frameworks were used for the frontend.

### Backend
- **Node.js**: Server-side runtime environment.
- **Express.js**: Web application framework.
- **PostgreSQL**: Database for storing user profiles, connections, and other data.
- **Docker**: Docker for easy deployment.

## Installation

### Prerequisites
- Node.js and npm installed.
- Docker.
- PostgresSQL locally or you can use deployed instance.

### Setup
- Clone the repository:
   ```bash
   git clone https://github.com/your-username/mentorship-matching-platform.git
   cd mentorship-matching-platform
   cd client
   //change API_URL in index.html to http://localhost:5000/
   cd ..
   //set up environment variable in docker-compose.yml file
   docker-compose up --build
    ```
### Future Improvements
- Add pagination for user discovery.
- Implement real-time notifications for connection requests.
- Create industry level UI


