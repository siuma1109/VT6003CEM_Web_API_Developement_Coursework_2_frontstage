# Frontstage - React Frontend Application

This is a React-based frontend application built with TypeScript, designed to provide a modern and responsive user interface.

## 🚀 Features

- Built with React 19 and TypeScript
- Modern UI components and responsive design
- React Router for navigation
- Axios for API communication
- Image gallery functionality
- Testing setup with Jest and React Testing Library

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)
- Docker and Docker Compose (for containerized deployment)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 6003CEM_Coursework_2_frontstage
```

2. Install dependencies:
```bash
cd code
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode

1. Start the application using npm:
```bash
npm start
```
The application will be available at `http://localhost:3000`

### Using Docker

1. Start the application using Docker Compose:
```bash
docker-compose up
```
The application will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
code/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/       # React context providers
│   ├── features/      # Feature-specific components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🛠️ Build

Create a production build:
```bash
npm run build
```

## 🔧 Configuration

The application can be configured using environment variables:
- `NODE_ENV`: Development/Production environment
- `PORT`: Application port (default: 8080)
- `TZ`: Timezone setting
- `CHOKIDAR_USEPOLLING`: File watching configuration
- `WATCHPACK_POLLING`: Webpack polling configuration

## 📦 Dependencies

Major dependencies include:
- React 19
- TypeScript
- React Router DOM
- Axios
- React Image Gallery
- Testing libraries (Jest, React Testing Library)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. 