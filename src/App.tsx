import React from 'react';
import logo from './logo.svg';
import './App.css';
import Example from './components/Example';
import HighlightedEditor from './components/HighlightedEditor';

function App() {
  return (
    <div style={{ width: '100%' }} className='App'>
      <HighlightedEditor />
    </div>
  );
}

export default App;
