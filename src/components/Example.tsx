import React, { useState } from 'react';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import './example.css';

const Example = () => {
  // const [value, setValue] = useState(
  //   'This text has OR, AND, NOT, plus numbers 123 and special chars $#@.'
  // );

  const [value, setValue] = useState('');

  const onChange = (newValue: any) => {
    setValue(newValue);
  };

  const highlightConfig = [
    {
      highlight: new RegExp(`\\b(OR|AND|NOT)\\b`, 'g'),
      className: 'logical-operator',
    },
    {
      highlight: /\b\d+\b/g,
      className: 'number',
    },
    {
      highlight: /[^\w\s]/g,
      className: 'special-char',
    },
  ];

  return (
    <div className='textarea-container'>
      <HighlightWithinTextarea
        value={value}
        highlight={highlightConfig}
        onChange={onChange}
      />
    </div>
  );
};

export default Example;
