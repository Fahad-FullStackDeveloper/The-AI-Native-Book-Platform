# Quickstart: Authentication Implementation

## Prerequisites

1. Node.js 18+ installed
2. Docusaurus project set up
3. Neon Serverless Postgres database created
4. Better Auth account/configured

## Setup Steps

### 1. Install Dependencies

```bash
npm install better-auth @better-auth/docusaurus
# If using TypeScript
npm install --save-dev @types/node
```

### 2. Configure Better Auth

Create `server/auth/better-auth-config.js`:

```javascript
const { betterAuth } = require("better-auth");

const auth = betterAuth({
  database: {
    provider: "neon",
    url: process.env.NEON_DATABASE_URL,
  },
  // Custom fields for user background
  user: {
    fields: {
      backgroundSoftware: "string",
      backgroundHardware: "string",
      backgroundDescription: "string"
    }
  },
  // Additional configuration options
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Optional: Add social login providers later
  }
});

module.exports = { auth };
```

### 3. Set Environment Variables

Add to your `.env` file:

```env
NEON_DATABASE_URL=your_neon_database_url
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_key_here
```

### 4. Create Auth Context

Create `src/contexts/AuthContext.tsx`:

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'better-auth/react';

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSession();

  return (
    <AuthContext.Provider value={{
      user: session?.user,
      isLoggedIn: !!session?.user,
      loading: isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. Create Auth Components

Create `src/components/Auth/LoginForm.tsx`:

```tsx
import React, { useState } from 'react';
import { useAuth } from 'better-auth/react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/dashboard"
      });
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
```

Create `src/components/Auth/SignUpForm.tsx`:

```tsx
import React, { useState } from 'react';
import { useAuth } from 'better-auth/react';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [backgroundSoftware, setBackgroundSoftware] = useState('beginner');
  const [backgroundHardware, setBackgroundHardware] = useState('beginner');
  const [backgroundDescription, setBackgroundDescription] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp.email({
        email,
        password,
        name,
        // Pass custom fields for background information
        userData: {
          backgroundSoftware,
          backgroundHardware,
          backgroundDescription
        },
        callbackURL: "/welcome"
      });
    } catch (err) {
      setError('Error creating account');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Software Background:</label>
        <select
          value={backgroundSoftware}
          onChange={(e) => setBackgroundSoftware(e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div>
        <label>Hardware Background:</label>
        <select
          value={backgroundHardware}
          onChange={(e) => setBackgroundHardware(e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div>
        <label>Additional Background Information:</label>
        <textarea
          value={backgroundDescription}
          onChange={(e) => setBackgroundDescription(e.target.value)}
        />
      </div>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUpForm;
```

### 6. Initialize Auth in Main App

Update your main application to include the AuthProvider:

```tsx
// In your main app or layout component
import { AuthProvider } from './contexts/AuthContext';
import { ClientProvider } from 'better-auth/react';

function App() {
  return (
    <ClientProvider>
      <AuthProvider>
        {/* Your app content */}
      </AuthProvider>
    </ClientProvider>
  );
}
```

### 7. Create Protected Routes

For pages that require authentication:

```tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom'; // or appropriate router

const ProtectedPage = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/login" />;

  return children;
};
```

## API Endpoints

The authentication API will be available at:
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

## Testing

Run the following to verify the setup:

```bash
# Start your Docusaurus development server
npm run start
```

Visit your login/signup pages to test the authentication flow.