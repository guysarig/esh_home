import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  const backendHost = process.env.REACT_APP_BACKEND_HOST || 'localhost';
  const backendPort = process.env.REACT_APP_BACKEND_PORT || '4000';
  const apiKey = process.env.REACT_APP_API_KEY || '';

  useEffect(() => {
    // Call the backend service using environment variables
    const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};

    fetch(`http://${backendHost}:${backendPort}/api`, { headers })
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, [backendHost, backendPort, apiKey]);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {message || 'Loading...'}
        </p>
      </header>
    </div>
  );
}

export default App;
