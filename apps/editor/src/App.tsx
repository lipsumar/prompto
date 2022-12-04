import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

function apiCall() {
  fetch(import.meta.env.VITE_API_URL, { credentials: 'include' });
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => apiCall()}>hey</button>
    </div>
  );
}

export default App;
