import React, { useState } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  CompositeDecorator,
  ContentBlock,
  CharacterMetadata,
} from 'draft-js';
import 'draft-js/dist/Draft.css';

interface HighlightStyle {
  color: string;
}

const highlightStyle: HighlightStyle = {
  color: 'red',
};

interface PlaceholderStyle {
  color: string;
  position: 'absolute';
  top: string;
  left: string;
  pointerEvents: 'none';
}

const placeholderStyle: PlaceholderStyle = {
  color: 'grey',
  position: 'absolute',
  top: '10px',
  left: '10px',
  pointerEvents: 'none', // Чтобы клики проходили сквозь плейсхолдер
};

interface EditorWrapperStyle {
  border: string;
  padding: string;
  width: string;
  background: string;
  borderRadius: string;
  position: string;
}

// const editorWrapperStyle: EditorWrapperStyle = {
//   border: '1px solid #ccc',
//   padding: '10px',
//   minHeight: '100px',
//   color: 'white',
//   position: 'relative', // Необходимо для абсолютного позиционирования плейсхолдера
// };

const editorWrapperStyle: any = {
  margin: '0 auto',
  border: '2px solid #0075e6',
  padding: '10px',
  minHeight: '100px',
  color: 'white',
  width: '1330px',
  background: 'transparent',
  borderRadius: '15px',
  position: 'relative',
};

type Callback = (start: number, end: number) => void;

const findWithRegex = (
  regex: RegExp,
  contentBlock: ContentBlock,
  callback: Callback
): void => {
  const text = contentBlock.getText();
  let matchArr: RegExpExecArray | null, start: number;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
};

interface HighlightDecoratorProps {
  children?: React.ReactNode;
}

const HighlightDecorator: React.FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={highlightStyle}>{props.children}</span>;
};

function getHighlightDecorator(regex: RegExp): CompositeDecorator {
  return new CompositeDecorator([
    {
      strategy: (
        contentBlock: ContentBlock,
        callback: Callback,
        contentState: ContentState
      ): void => {
        findWithRegex(regex, contentBlock, callback);
      },
      component: HighlightDecorator,
    },
  ]);
}

const HighlightedEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty(getHighlightDecorator(/\b(OR|AND|NOT)\b/g)) // Пример регулярного выражения
  );
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true);

  const onChange = (newEditorState: EditorState): void => {
    setEditorState(newEditorState);
    // Проверяем, стал ли редактор непустым
    if (
      newEditorState.getCurrentContent().getPlainText().length > 0 &&
      showPlaceholder
    ) {
      setShowPlaceholder(false);
    } else if (
      newEditorState.getCurrentContent().getPlainText().length === 0 &&
      !showPlaceholder
    ) {
      setShowPlaceholder(true);
    }
  };

  return (
    <div style={editorWrapperStyle}>
      {showPlaceholder && (
        <span style={placeholderStyle}>Enter some text...</span>
      )}
      <Editor editorState={editorState} onChange={onChange} />
    </div>
  );
};

export default HighlightedEditor;
