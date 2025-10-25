# DatingConnect - Adult Dating Platform

A modern, full-featured dating website where users can create profiles, discover matches, and chat in real-time.

## 🌐 Live Website
**Visit:** [https://avanderberg48-collab.github.io/dating-site/](https://avanderberg48-collab.github.io/dating-site/)

## ✨ Features

### User Authentication
- OAuth-based login and registration
- Secure session management
- User profile management

### Profile Management
- Create and edit detailed profiles
- Add bio, age, gender, location, and photo
- Set preferences (looking for)
- Add interests and hobbies

### Profile Discovery
- Browse profiles with gender filtering
- Swipe-style interface (Like/Pass)
- Matching algorithm

### Messaging
- Real-time chat with matched users
- Message history
- Read receipts

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, tRPC
- **Database:** MySQL with Drizzle ORM
- **Authentication:** OAuth
- **Deployment:** GitHub Pages + Backend Server

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

## 🚀 Deployment

This project is automatically deployed to GitHub Pages when you push to the main branch.

### Manual Deployment
```bash
git add .
git commit -m "Your message"
git push origin main
```

The GitHub Actions workflow will:
1. Install dependencies
2. Build the project
3. Deploy to GitHub Pages

## 📝 Database Setup

The project uses MySQL. Make sure to set up your database connection in the environment variables.

```bash
DATABASE_URL=mysql://user:password@localhost:3306/dating_site
```

## 🔐 Environment Variables

Create a `.env.local` file with:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
VITE_APP_TITLE=DatingConnect
VITE_APP_LOGO=your_logo_url
```

## 📄 License

MIT License - feel free to use this project for your own dating platform!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Created with ❤️ for connecting people**
