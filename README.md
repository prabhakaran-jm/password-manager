# Secure Password Manager

A secure, web-based password management application built with Node.js, Fastify, and SQLite. This application allows users to safely store, retrieve, and manage their passwords with encryption.

## Features

- 🔐 Secure user authentication
- 🔒 AES-256-GCM encryption for stored passwords
- 👤 Multi-user support
- 🔍 Search functionality
- 📋 Copy passwords to clipboard
- 👁️ Toggle password visibility
- ❌ Secure password deletion
- 🚀 Fast and lightweight

## Tech Stack

- Backend: Node.js with Fastify
- Database: SQLite with better-sqlite3
- Encryption: AES-256-GCM
- Authentication: JWT (JSON Web Tokens)
- Frontend: HTML5, CSS3, JavaScript
- UI Framework: Bootstrap 5
- Icons: Font Awesome

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/password-manager.git
    cd password-manager
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following content:
   JWT_SECRET=<your_secure_jwt_secret_here> 

   You can generate a secure JWT secret:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

4. Start the application:
    ```bash
    node app.js
    ```

5. Access the application at `http://localhost:3000`.   

## Security Features

- Password encryption using AES-256-GCM
- Secure password hashing with bcrypt
- JWT-based authentication
- SQL injection prevention
- XSS protection
- Automatic password masking
- Session management

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login

### Password Management
- `GET /passwords` - Retrieve all passwords
- `POST /passwords` - Add new password
- `GET /passwords/:id/reveal` - Reveal specific password
- `DELETE /passwords/:id` - Delete password

## Project Structure

```bash
password-manager/
├── app.js # Main application file
├── public/ # Static files
│ ├── index.html # Main HTML file
│ └── script.js # Client-side JavaScript
├── passwords.db # SQLite database
├── .env # Environment variables
└── package.json # Project dependencies
```

## Features Usage

### User Management
- Register a new account with username and password
- Login with existing credentials
- Automatic session management

### Password Management
- Add new passwords with website, username, and password
- View all stored passwords in a list
- Search passwords by website or username
- Copy username/password to clipboard
- Toggle password visibility
- Delete passwords with confirmation

## Development

To run the application in development mode:
    ```bash
    npm install nodemon -g
    nodemon app.js 
    ```
## Security Best Practices

1. Master Password
   - Use a strong master password
   - Never share your master password
   - Enable two-factor authentication when possible

2. Password Storage
   - All passwords are encrypted before storage
   - Use unique passwords for each account
   - Regularly update important passwords

3. Application Security
   - Use HTTPS in production
   - Regular security updates
   - Session timeout
   - Rate limiting
   - Input validation

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token generation (required)
- `PORT`: Server port (default: 3000)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Fastify](https://www.fastify.io/) - Web framework
- [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3) - SQLite client
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JWT implementation
- [Bootstrap](https://getbootstrap.com/) - UI framework
- [Font Awesome](https://fontawesome.com/) - Icons

## Support

For support, please open an issue in the GitHub repository.