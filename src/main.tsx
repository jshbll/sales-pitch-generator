import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeContextProvider } from './contexts/ThemeContext'
import ClerkWithTheme from './components/ClerkWithTheme.tsx'

// Initialize console logger for bug reporting (must be imported early)
import './utils/consoleLogger';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('[main.tsx] Clerk configuration:', {
  publishableKey: PUBLISHABLE_KEY ? `${PUBLISHABLE_KEY.substring(0, 20)}...` : 'NOT SET',
  environment: import.meta.env.MODE,
  convexUrl: import.meta.env.VITE_CONVEX_URL
});

if (!PUBLISHABLE_KEY) {
  console.error('[main.tsx] VITE_CLERK_PUBLISHABLE_KEY is missing!');
  throw new Error("Missing Clerk Publishable Key");
}

console.log('[main.tsx] Starting React application with Clerk');

const rootElement = document.getElementById('root');
console.log('[main.tsx] Root element:', rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log('[main.tsx] React root created, attempting render');

  root.render(
    <StrictMode>
      <ThemeContextProvider>
        <ClerkWithTheme publishableKey={PUBLISHABLE_KEY}>
          <App />
        </ClerkWithTheme>
      </ThemeContextProvider>
    </StrictMode>
  );
  
  // Add Clerk event listeners for debugging
  setTimeout(() => {
    if (window.Clerk) {
      console.log('[main.tsx] Clerk loaded, adding event listeners');
      
      // Check for existing session on page load
      const existingSession = window.Clerk.session;
      if (existingSession) {
        console.log('[Clerk Session Persistence] Found existing session on page load:', {
          sessionId: existingSession.id,
          createdAt: new Date(existingSession.createdAt).toLocaleString(),
          lastActiveAt: existingSession.lastActiveAt ? new Date(existingSession.lastActiveAt).toLocaleString() : 'N/A',
          status: existingSession.status,
          expireAt: existingSession.expireAt ? new Date(existingSession.expireAt).toLocaleString() : 'N/A'
        });
      } else {
        console.log('[Clerk Session Persistence] No existing session found on page load');
      }
      
      // Check localStorage for session persistence
      const clerkSessionData = Object.keys(localStorage)
        .filter(key => key.includes('clerk'))
        .reduce((acc, key) => {
          acc[key] = localStorage.getItem(key)?.substring(0, 50) + '...';
          return acc;
        }, {});
      
      console.log('[Clerk Session Persistence] localStorage data:', clerkSessionData);
      
      window.Clerk.addListener(({ session, user, client, resources }) => {
        // Check for logout event
        const wasSignedIn = localStorage.getItem('clerk_was_signed_in') === 'true';
        const isNowSignedIn = !!session && !!user;
        
        if (wasSignedIn && !isNowSignedIn) {
          console.log('[Clerk Event] LOGOUT DETECTED - User signed out', {
            previousSession: localStorage.getItem('clerk_previous_session_id'),
            timestamp: new Date().toLocaleString()
          });
          localStorage.removeItem('clerk_was_signed_in');
          localStorage.removeItem('clerk_previous_session_id');
        } else if (!wasSignedIn && isNowSignedIn) {
          console.log('[Clerk Event] LOGIN DETECTED - User signed in', {
            sessionId: session?.id,
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
            timestamp: new Date().toLocaleString()
          });
          localStorage.setItem('clerk_was_signed_in', 'true');
          localStorage.setItem('clerk_previous_session_id', session?.id || '');
        }
        
        // Commented out to reduce console noise and potential re-renders
        // console.log('[Clerk Event] State changed:', {
        //   hasSession: !!session,
        //   sessionId: session?.id,
        //   hasUser: !!user,
        //   userId: user?.id,
        //   userEmail: user?.primaryEmailAddress?.emailAddress,
        //   isSignedIn: isNowSignedIn,
        //   sessionStatus: session?.status,
        //   sessionExpiry: session?.expireAt ? new Date(session.expireAt).toLocaleString() : 'N/A'
        // });
      });
    } else {
      console.warn('[main.tsx] Clerk not loaded after timeout');
    }
  }, 2000);
  
  console.log('[main.tsx] Render completed');
} else {
  console.error('[main.tsx] Root element not found!');
}
