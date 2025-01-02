import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  const backendHost = process.env.REACT_APP_BACKEND_HOST || 'localhost';
  const backendPort = process.env.REACT_APP_BACKEND_PORT || '4000';
  const apiKey = process.env.REACT_APP_API_KEY || '';

  useEffect(() => {
    // Start session when the component mounts
    fetch(`http://${backendHost}:${backendPort}/start_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    }).catch(error => console.error('Error starting session:', error));

    // Measure page load time
    const pageLoadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${pageLoadTime}ms`);
    
    // Send page load time to the backend service
    fetch(`http://${backendHost}:${backendPort}/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify({
        metricType: 'page_load',
        loadTime: pageLoadTime
      })
    }).catch(error => console.error('Error sending page load time:', error));

    const start = performance.now();
    const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};

    console.log(`calling BE on: http://${backendHost}:${backendPort}/api`);
    fetch(`http://${backendHost}:${backendPort}/api`, { headers })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        const latency = performance.now() - start;
        console.log(`API call latency: ${latency}ms`);
        
        // Send API call latency to the backend service
        fetch(`http://${backendHost}:${backendPort}/metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
          },
          body: JSON.stringify({
            metricType: 'api_call',
            endpoint: '/api',
            latency: latency,
            error: false
          })
        }).catch(error => console.error('Error sending API call latency:', error));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        
        // Send error metric to the backend service
        fetch(`http://${backendHost}:${backendPort}/metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
          },
          body: JSON.stringify({
            metricType: 'api_call',
            endpoint: '/api',
            latency: performance.now() - start,
            error: true
          })
        }).catch(err => console.error('Error sending error metric:', err));
      });

    const handleBeforeUnload = () => {
      fetch(`http://${backendHost}:${backendPort}/end_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        }
      }).catch(error => console.error('Error ending session:', error));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // End session when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      fetch(`http://${backendHost}:${backendPort}/end_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        }
      }).catch(error => console.error('Error ending session:', error));
    };
  }, [backendHost, backendPort, apiKey]);

  const handleGenerateError = () => {
    try {
      throw new Error('Frontend exception generated');
    } catch (error) {
      console.error('Caught frontend exception:', error);
      // Send error count increment request to backend
      fetch(`http://${backendHost}:${backendPort}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
          metricType: 'fe_errors',
          error: error.message
        })
      }).catch(err => console.error('Error sending error count:', err));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {message || 'Loading...'}
        </p>
        <div
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'red',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            marginTop: '20px'
          }}
          onClick={handleGenerateError}
        >
          Generate FE Error
        </div>
      </header>
    </div>
  );
}

export default App;
