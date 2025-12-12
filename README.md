# 💱 Currency Transfer App

A modern currency transfer application with domestic and international transfer capabilities, featuring hand gesture authentication and biometric verification.

## ✨ Features

### 🌍 **Transfer Modes**
- **International Transfer**: Multi-currency conversion with real-time exchange rates
- **Domestic Transfer**: IDR transfers across Indonesian provinces with regional user selection

### 🔐 **Authentication & Security**
- Hand gesture authentication using MediaPipe
- Biometric verification with face and palm detection
- ATM card registration and verification
- Secure user session management with Supabase authentication
- Gmail and phone number login

### 👥 **User Management**
- Comprehensive user profiles with bank account integration
- Regional user distribution across 34 Indonesian provinces
- Online/offline status tracking
- Transfer history and statistics

### 💳 **Banking Integration**
- Support for major Indonesian banks (BCA, Mandiri, BNI, BRI, etc.)
- Bank account verification
- Preferred bank selection
- Account holder validation

## 🚀 **Technology Stack**

- **Frontend**: SvelteKit with TypeScript/JavaScript
- **Styling**: TailwindCSS with custom gradients
- **Authentication**: MediaPipe Hands for gesture detection
- **Build Tool**: Vite
- **Deployment**: Netlify (SSR-ready)

## 📦 **Installation**

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd currency-transfer-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ **Build for Production**

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 🌐 **Deployment to Netlify**

### **Method 1: Direct Git Integration (Recommended)**

1. **Push to Git Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub, GitLab, etc.)
   - Select your repository

3. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: 18 (automatically detected from `netlify.toml`)

4. **Deploy**: Netlify will automatically build and deploy your site

### **Method 2: Manual Deployment**

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `build` folder to the deployment area

### **Configuration Files**

The project includes the following configuration files for optimal Netlify deployment:

- **`netlify.toml`**: Build configuration, headers, and caching rules
- **`static/_redirects`**: SPA routing configuration
- **`.gitignore`**: Proper version control exclusions

## 🌏 **Internationalization**

The app supports multiple languages:
- **English** (`en`)
- **Indonesian** (`id`)

Language files are located in `src/lib/translations/`.

## 🎯 **Key Components**

### **Domestic Transfer Features**
- 4-step transfer process (Amount → Region → User → Confirm)
- All 34 Indonesian provinces supported
- Regional user filtering with city information
- IDR-only transfers with low admin fees (Rp 2,500)

### **International Transfer Features**  
- Multi-currency support with real-time exchange rates
- Automatic currency conversion
- Exchange rate display and calculation
- Support for major world currencies

### **Hand Gesture Authentication**
- MediaPipe integration for palm detection
- 2-second hold verification
- Visual feedback and progress indicators
- Secure biometric-style authentication

## 📱 **Browser Compatibility**

- Modern browsers with camera access
- Chrome/Edge 88+ (recommended)
- Firefox 85+
- Safari 14+

## 📝 **API Integration**

The app currently uses mock data. To integrate with real APIs:

1. **Exchange Rates**: Update `src/lib/currency.ts`
2. **User Management**: Update `src/lib/users.ts`
3. **Banking**: Update `src/lib/banks.ts`
4. **Transfer History**: Update `src/lib/transferHistory.ts`

## 🛠️ **Development**

### **Project Structure**
```
src/
├── lib/
│   ├── components/          # Svelte components
│   ├── translations/        # i18n files
│   ├── auth.ts             # Authentication logic
│   ├── banks.ts            # Banking data
│   ├── currency.ts         # Currency conversion
│   ├── users.ts            # User management
│   └── transferHistory.ts  # Transfer records
├── routes/                 # SvelteKit routes
└── app.html               # App template
```

### **Key Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type checking

## 🚨 **Important Notes**

1. **Camera Access**: Required for hand gesture authentication
2. **HTTPS**: Recommended for production (camera access requirement)
3. **Build Warnings**: A11y warnings are informational and don't affect functionality
4. **TypeScript**: Components use JavaScript for compatibility

## 📧 **Support**

For deployment issues or questions:
1. Check the build logs in Netlify dashboard
2. Verify all dependencies are correctly installed
3. Ensure camera permissions are granted in browser
4. Check console for any runtime errors

## 🎉 **Success!**

Your Currency Transfer App is now ready for deployment on Netlify! The app includes:

✅ Domestic transfer functionality
✅ International currency conversion  
✅ Hand gesture authentication
✅ User management system
✅ Banking integration
✅ Multi-language support
✅ Netlify-optimized build configuration

Visit your deployed site and test both domestic and international transfer features!