import React, { useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [matchResult, setMatchResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut } = useAuthenticator();

  const retrieveUserApiUrl =
    'https://v8c6qwk16b.execute-api.us-east-1.amazonaws.com/default/RetrieveUserByFace';
  const faceDataCaptureApiUrl =
    'https://v8c6qwk16b.execute-api.us-east-1.amazonaws.com/default/FaceDataCapture';

  const loginId = user?.signInDetails?.loginId || ''; // Default to empty string if undefined
  const userEmail = loginId.split('@')[0]; // Split by "@" and take the first part

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      setErrorMessage(null); // Clear any previous error
    } else {
      setErrorMessage('Please upload a valid image file (PNG, JPEG).');
    }
  };

  const handleRetrieveUserSubmit = async () => {
    if (!uploadedImage) {
      setErrorMessage('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMatchResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedImage);

      const response = await fetch(retrieveUserApiUrl, {
        method: 'POST',
        body: uploadedImage,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      setMatchResult(`User ID: ${result.user_id}, Similarity: ${result.similarity}%`);
    } catch (error: any) {
      console.error('Error retrieving user:', error);
      setErrorMessage(
        error.message || 'An error occurred while retrieving the user. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceDataCaptureSubmit = async () => {
    if (!uploadedImage) {
      setErrorMessage('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMatchResult(null);

    try {
      const response = await fetch(faceDataCaptureApiUrl, {
        method: 'POST',
        headers: {
          'x-user-email': userEmail, // Pass the email in a custom header
        },
        body: uploadedImage, // Send the binary image data in the body
      });

      const result = await response.json();
      if (result.success) {
        setMatchResult(`Face associated successfully. User ID: ${result.user_id}`);
      } else {
        setErrorMessage(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error capturing face data:', error);
      setErrorMessage('An error occurred while capturing face data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Welcome {userEmail} - Image Upload for Rekognition</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: '10px' }}
      />

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleRetrieveUserSubmit}
          disabled={isLoading}
          style={{ marginRight: '10px' }}
        >
          {isLoading ? 'Submitting...' : 'Retrieve User by Face'}
        </button>
        <button onClick={handleFaceDataCaptureSubmit} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Capture Face Data'}
        </button>
      </div>

      {matchResult && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          <h2>Match Result</h2>
          <p>{matchResult}</p>
        </div>
      )}

      {errorMessage && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <h2>Error</h2>
          <p>{errorMessage}</p>
        </div>
      )}

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
