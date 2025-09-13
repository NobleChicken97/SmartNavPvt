# Contributing to Smart Navigator

Thanks for your interest in contributing to Smart Navigator! This guide will help you get started.

## Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/SmartNavPvt.git
   cd SmartNavPvt
   ```
3. **Install dependencies**
   ```bash
   npm run install:all
   ```
4. **Start development servers**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes**
   - Follow the existing code style
   - Test your changes locally
   - Ensure no console errors

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add your descriptive commit message"
   ```

4. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

- **Frontend**: Use ESLint and TypeScript for type safety
- **Backend**: Follow Node.js best practices with ES modules
- **Comments**: Add JSDoc comments for functions and components
- **Naming**: Use descriptive variable and function names

## Testing

- **Frontend**: Run `npm test` in the frontend directory
- **Backend**: Run `npm test` in the backend directory
- **Manual Testing**: Always test your changes in the browser

## Need Help?

- 📖 Check the [Documentation](./docs/)
- 🐛 Report issues on [GitHub Issues](https://github.com/NobleChicken97/SmartNavPvt/issues)
- 💬 Ask questions in [Discussions](https://github.com/NobleChicken97/SmartNavPvt/discussions)

## Project Structure

- `frontend/` - React + TypeScript + Vite frontend
- `backend/` - Node.js + Express API server
- `docs/` - Project documentation
- `.github/` - GitHub workflows and templates

Thanks for contributing! 🎉