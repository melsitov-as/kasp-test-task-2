import React from 'react';
import logo from './logo.svg';
import './App.css';
import HighlightedEditor from './components/HighlightedEditor';

function App() {
  return (
    <div style={{ width: '1330px', margin: '0 auto' }} className='App'>
      <HighlightedEditor />
    </div>
  );
}

export default App;
