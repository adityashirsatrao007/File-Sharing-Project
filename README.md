# File Sharing App

A modern, full-stack file sharing application built with Next.js and InsForge MCP backend. Features user authentication, file upload/download, shareable links, and a beautiful UI built with Shadcn UI.

## Features

- 🔐 **User Authentication** - Sign up, sign in, and user management
- 📁 **File Management** - Upload, download, and organize files
- 🔗 **Shareable Links** - Generate public links for file sharing
- 📊 **Dashboard** - View file statistics and manage uploads
- 🎨 **Modern UI** - Built with Shadcn UI components
- ⚡ **Real-time Updates** - Instant file operations
- 🚀 **Production Ready** - Optimized for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: Shadcn UI, Tailwind CSS
- **Backend**: InsForge MCP (Database, Storage, Authentication)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- InsForge MCP backend (already configured)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd file-sharing-app
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env.local`:
```
NEXT_PUBLIC_INSFORGE_URL=https://3929n3sz.us-east.insforge.app
INSFORGE_API_KEY=ik_88beee058e2960bcc62c828c851f7557
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Environment variables are already configured in `vercel.json`
4. Deploy!

The app is configured with:
- InsForge backend URL
- API key for authentication
- File storage bucket
- Database schema

### Environment Variables

The following environment variables are configured:

- `NEXT_PUBLIC_INSFORGE_URL`: InsForge backend URL
- `INSFORGE_API_KEY`: API key for backend authentication

## Database Schema

The app uses the following database tables:

### Users Table
- `id`: UUID primary key
- `email`: User email
- `role`: User role
- `nickname`: Display name
- `bio`: User bio
- `avatar_url`: Profile picture URL

### Files Table
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `name`: Stored filename
- `original_name`: Original filename
- `size`: File size in bytes
- `mime_type`: MIME type
- `storage_url`: InsForge storage URL
- `storage_key`: Storage key for downloads
- `share_token`: Unique token for sharing
- `is_public`: Public/private flag
- `download_count`: Download counter
- `created_at`: Upload timestamp
- `updated_at`: Last update timestamp

## Features Overview

### Authentication
- Email/password sign up and sign in
- User profile management
- Secure session handling

### File Management
- Drag & drop file upload
- File type detection and icons
- File size formatting
- Upload progress tracking

### Sharing
- Generate unique share tokens
- Public/private file visibility
- Share link copying
- Download tracking

### Dashboard
- File statistics
- Upload/download history
- File management actions
- Real-time updates

## API Endpoints

The app uses InsForge MCP for all backend operations:

- **Authentication**: User sign up, sign in, profile management
- **Database**: File CRUD operations
- **Storage**: File upload/download
- **Sharing**: Public file access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.