import React, { useState, useRef, useEffect } from 'react';
import './ServerUpdate.css';
import { API_BASE_URL } from '../Config';

const ServerUpdate = () => {
  const [logs, setLogs] = useState('');
  const [running, setRunning] = useState(false);
  const logBoxRef = useRef(null);
  const eventSourceRef = useRef(null);

  const startDeployment = () => {
    setLogs('');
    setRunning(true);

    const es = new EventSource(`${API_BASE_URL}/server/update`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      setLogs((prev) => prev + event.data);
    };

    es.onerror = (err) => {
      setLogs((prev) => prev + '\n[Connection closed or error occurred]');
      es.close();
      setRunning(false);
    };
  };

  const stopDeployment = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setLogs((prev) => prev + '\n[Stream manually stopped]');
      setRunning(false);
    }
  };

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="deploy-container">
      <h2>Server Update</h2>
      <div className="button-group">
        <button onClick={startDeployment} disabled={running} className="btn btn-start">
          {running ? 'Deploying...' : 'Start Update'}
        </button>
        {running && (
          <button onClick={stopDeployment} className="btn btn-stop">
            Stop
          </button>
        )}
      </div>

      <pre className="log-box" ref={logBoxRef}>
        {logs || 'Click "Start Update" to begin...'}
      </pre>
    </div>
  );
};

export default ServerUpdate;
