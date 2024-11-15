import { useState, useEffect} from 'react';
import uitoolkit from '@zoom/videosdk-ui-toolkit'
import '@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css'
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateJWT } from './jwtGenerator'; // Assuming you created this file for JWT generation

function App() {
  const { signOut } = useAuthenticator();
  const [sessionContainer, setSessionContainer] = useState<HTMLDivElement | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Configuration object
  const config = {
    videoSDKJWT: '', // Will be updated dynamically
    sessionName: 'SessionA',
    userName: 'UserA',
    sessionPasscode: 'abc123',
    features: ['preview', 'video', 'audio', 'share', 'chat', 'users', 'settings'],
    options: {
      init: {},
      audio: {},
      video: {},
      share: {},
    },
    virtualBackground: {
      allowVirtualBackground: true,
      allowVirtualBackgroundUpload: true,
      virtualBackgrounds: [
        'https://images.unsplash.com/photo-1715490187538-30a365fa05bd?q=80&w=1945&auto=format&fit=crop',
      ],
    },
  };

  // Initialize UI Toolkit
  useEffect(() => {
    // Create and set session container
    const container = document.createElement('div');
    container.id = 'sessionContainer';
    document.body.appendChild(container);
    setSessionContainer(container);

    // Clean up session container on unmount
    return () => {
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Function to start a session
  const startSession = async () => {
    try {
      const jwt = generateJWT(config.sessionName, 1, 'session123', config.userName);

      config.videoSDKJWT = jwt; // Set the JWT in the config object

      // Join the session using the UI Toolkit
      if (sessionContainer) {
        await uitoolkit.joinSession(sessionContainer, config);
        setIsSessionActive(true);
        console.log('Joined the session successfully.');
      }
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  // Function to leave/end a session
  const endSession = () => {
    if (sessionContainer) {
      uitoolkit.closeSession(sessionContainer);
      setIsSessionActive(false);
      console.log('Session ended successfully.');
    }
  };

  // Listener for session cleanup
  useEffect(() => {
    const sessionClosed = () => {
      if (sessionContainer) {
        uitoolkit.closeSession(sessionContainer);
        setIsSessionActive(false);
        console.log('Session closed and cleaned up.');
      }
    };

    uitoolkit.onSessionClosed(sessionClosed);

    return () => {
      uitoolkit.onSessionClosed(null); // Cleanup listener on unmount
    };
  }, [sessionContainer]);

  return (
    <main>
      <h1>Zoom Video SDK Demo</h1>
      {!isSessionActive ? (
        <button onClick={startSession}>Start Session</button>
      ) : (
        <button onClick={endSession}>End Session</button>
      )}
      <button onClick={signOut}>Sign Out</button>
    </main>
  );
}

export default App;
