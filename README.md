# AGPB v4 Web Application

A modern web application for searching lexemes (words) and contributing audio recordings for language learning. Built with Next.js, TypeScript, and Zustand for state management.

## �� What it does

AGPB (Audio Guide for Pronunciation and Bilingual) is a collaborative platform that helps users:

- **Search for lexemes** across multiple languages with detailed translations and glosses
- **Contribute audio recordings** for words that don't have pronunciation audio
- **Review and manage** word lists and recordings
- **Support multiple languages** with a comprehensive language selection system

### Key Features

- 🔍 **Advanced Search**: Search lexemes by language with detailed results
- 🎤 **Audio Recording**: Record and contribute pronunciation audio for missing words
- �� **Label Management**: Add and manage labeled translations
- 🌍 **Multi-language Support**: Support for hundreds of languages
- 🔐 **OAuth Authentication**: Secure login with Wikimedia OAuth
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with Radix UI and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- Yarn package manager
- API server running (see backend setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agpb-v4-web
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
   ```

4. **Start the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build the application for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

### Project Structure

```
agpb-v4-web/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── contribute/        # Contribution workflow
│   ├── results/           # Search results pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix UI)
│   ├── contribution/     # Contribution-specific components
│   └── ...               # Other feature components
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities and API
│   ├── api.ts           # API client
│   ├── stores/          # Zustand stores
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── utils/               # Utility functions
```

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

##  Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://agpb-server-v1.toolforge.org/api` |

### API Configuration

The application connects to a backend API that provides:

- Language management
- Lexeme search and details
- Audio file management
- User authentication
- Translation contributions

## 📱 Usage

### Searching Lexemes

1. Select source and target languages
2. Enter search terms
3. Browse results with translations and audio
4. Click on lexemes for detailed information

### Contributing Audio

1. Navigate to the Contribute page
2. Select a language to work with
3. Choose words that need audio recordings
4. Record pronunciation audio
5. Review and submit recordings

### Authentication

- Uses Wikimedia OAuth for secure login
- Supports user profiles and contribution tracking
- Maintains session state across browser sessions

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `yarn lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Testing

- Test your changes thoroughly
- Ensure responsive design works on mobile
- Verify API integration works correctly

## 🚀 Deployment

### Production Build

```bash
yarn build
yarn start
```

### Docker Deployment

The application includes a custom server configuration for production deployment with optimized settings for:

- Memory management
- Bundle optimization
- Static file serving
- Error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Acknowledgments

- Built with support from Wikimedia Deutschland
- Uses Wikimedia Codex design system
- Integrates with Wikimedia OAuth for authentication
- Powered by the AGPB backend API

## 📞 Support

For questions or support:

1. Check the [API documentation](lib/INFO.md)
2. Review existing issues on GitHub
3. Create a new issue for bugs or feature requests

---

**AGPB v4 Web** - Making language learning accessible through collaborative audio contributions.
```

This README provides a comprehensive overview of the AGPB v4 web application, including what it does, how to set it up, how to run it, and how to contribute. It covers all the essential information a developer would need to understand and work with the project.
