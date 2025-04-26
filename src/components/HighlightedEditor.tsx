import React, { FC, useState, useRef } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  CompositeDecorator,
  ContentBlock,
  CharacterMetadata,
  DraftDecorator,
  Modifier,
  EditorChangeType,
} from 'draft-js';
import 'draft-js/dist/Draft.css';

interface HighlightStyle {
  color: string;
}

const highlightStyle: HighlightStyle = {
  color: 'red',
};

const defaultHighlightStyle: HighlightStyle = {
  color: 'white', // Фиолетовый цвет выделения
};

const blueHighlightStyle: HighlightStyle = {
  color: 'lightblue', // Голубой цвет выделения
};

const purpleHighlightStyle: HighlightStyle = {
  color: '#cf1d97', // Фиолетовый цвет выделения
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
  // background: 'transparent',
  background: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '15px',
  position: 'relative',
};

type Callback = (start: number, end: number) => void;

// const findWithRegex = (
//   regex: RegExp,
//   contentBlock: ContentBlock,
//   callback: Callback
// ): void => {
//   const text = contentBlock.getText();
//   let matchArr: RegExpExecArray | null, start: number;
//   while ((matchArr = regex.exec(text)) !== null) {
//     start = matchArr.index + matchArr[0].indexOf('"') + 1; // Начинаем после первой кавычки
//     const end = start + matchArr[1].length;
//     // callback(start, start + matchArr[0].length);
//     callback(start, end);
//   }
// };

// const findWithRegex = (
//   regex: RegExp,
//   contentBlock: ContentBlock,
//   callback: Callback
// ): void => {
//   const text = contentBlock.getText();
//   let matchArr: RegExpExecArray | null, start: number;
//   while ((matchArr = regex.exec(text)) !== null) {
//     // Для корректного выделения только содержимого кавычек
//     const match = matchArr[0];
//     const innerStart = match.startsWith('\\"')
//       ? match.indexOf('"') + 1
//       : match.indexOf('"') + 1;
//     const innerEnd = match.endsWith('\\"')
//       ? match.lastIndexOf('"')
//       : match.lastIndexOf('"');

//     if (innerStart < innerEnd) {
//       callback(matchArr.index + innerStart, matchArr.index + innerEnd);
//     }
//   }
// };

const findWithRegex = (
  // Новая функция для выделения слов
  regex: RegExp,
  contentBlock: ContentBlock,
  callback: Callback
): void => {
  const text = contentBlock.getText();
  let matchArr: RegExpExecArray | null;
  while ((matchArr = regex.exec(text)) !== null) {
    callback(matchArr.index, matchArr.index + matchArr[0].length);
  }
};

// const findWithRegex = (
//   // Новая функция для выделения слов
//   regex: RegExp,
//   contentBlock: ContentBlock,
//   callback: Callback
// ): void => {
//   const text = contentBlock.getText();
//   let matchArr: RegExpExecArray | null;
//   while ((matchArr = regex.exec(text)) !== null) {
//     const match = matchArr[0];
//     const innerStart = match.startsWith('\\"')
//       ? match.indexOf('"') + 1
//       : match.indexOf('"') + 1;
//     const innerEnd = match.endsWith('\\"')
//       ? match.lastIndexOf('"')
//       : match.lastIndexOf('"');

//     if (innerStart < innerEnd) {
//       callback(matchArr.index + innerStart, matchArr.index + innerEnd);
//     }
//   }
// };

interface HighlightDecoratorProps {
  children?: React.ReactNode;
}

const HighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={highlightStyle}>{props.children}</span>;
};

const DefaultHightlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={defaultHighlightStyle}>{props.children}</span>;
};

const BlueHighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={blueHighlightStyle}>{props.children}</span>;
};

const PurpleHighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={purpleHighlightStyle}>{props.children}</span>;
};

function getHighlightDecorator(regexes: RegExp[]): CompositeDecorator {
  const decorators: DraftDecorator<any>[] = regexes.map((regex, index) => ({
    strategy: (
      contentBlock: ContentBlock,
      callback: Callback,
      contentState: ContentState
    ): void => {
      findWithRegex(regex, contentBlock, callback);
    },
    component:
      index === 0
        ? PurpleHighlightDecorator
        : index === 1
        ? PurpleHighlightDecorator
        : index === 2
        ? HighlightDecorator
        : BlueHighlightDecorator,
  }));
  return new CompositeDecorator(decorators);
}

const HighlightedEditor: FC = () => {
  const editorRef = useRef<Editor>(null);
  const wordsToHighlight = ['TI', 'AB', 'DP', 'URL'];
  const wordsRegex = new RegExp(`\\b(${wordsToHighlight.join('|')})\\b`, 'gi');
  // const escapedQuotesRegex = /\\"((?:\\\\\"|[^\\"])*)\\"/g;
  const escapedQuoteInsideDoubleQuotesRegex =
    /"(?:[^"\\]|\\.)*?\\"(?:[^"\\]|\\.)*?"/g;
  const regularQuotesRegex = /"([^"]*)"/g;

  const combinedRegexes = [
    escapedQuoteInsideDoubleQuotesRegex, // Сначала ищем экранированные кавычки
    regularQuotesRegex, // Затем ищем обычные кавычки
    /\b(OR|AND|NOT)\b/gi, // Затем ищем ключевые слова (красный)
    wordsRegex, // Затем ищем обычные слова (голубой)
  ];

  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty(getHighlightDecorator(combinedRegexes))
  );
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const onChange = (newEditorState: EditorState): void => {
    setEditorState(newEditorState);
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

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
  };

  const handleBeforeInput = (
    chars: string,
    editorState: EditorState
  ): 'handled' | 'not-handled' => {
    if (chars === '"') {
      const selectionState = editorState.getSelection();
      const anchorKey = selectionState.getAnchorKey();
      const currentContent = editorState.getCurrentContent();
      const currentBlock = currentContent.getBlockForKey(anchorKey);
      const offset = selectionState.getAnchorOffset();
      const textBefore = currentBlock.getText().slice(0, offset); // Исправлено: используем getText().slice()
      const textAfter = currentBlock.getText().slice(offset); // Исправлено: используем getText().slice()
      // Проверяем, находимся ли мы внутри кавычек (простое приближение)
      const insideQuotes =
        textBefore.lastIndexOf('"') > textBefore.lastIndexOf('\\"') &&
        (textAfter.indexOf('"') > textAfter.indexOf('\\"') ||
          textAfter.includes('"'));

      if (insideQuotes) {
        const newContentState = Modifier.insertText(
          // Use Modifier.insertText
          currentContent,
          selectionState,
          '\\"',
          editorState.getCurrentInlineStyle()
        );
        setEditorState(
          EditorState.push(
            editorState,
            newContentState,
            'insert-text' as EditorChangeType
          )
        );
        return 'handled'; // Сообщаем, что событие обработано
      }
    }
    return 'not-handled';
  };

  const wrapperStyle = {
    ...editorWrapperStyle,
    border: isFocused ? '2px solid #ffffff' : '2px solid #0075e6', // Динамический стиль границы
  };

  return (
    // <div style={editorWrapperStyle}>
    <div style={wrapperStyle}>
      {showPlaceholder && (
        <span style={placeholderStyle}>Enter some text...</span>
      )}
      <Editor
        editorState={editorState}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        handleBeforeInput={handleBeforeInput} // Добавляем обработчик beforeInput
      />
    </div>
  );
};

export default HighlightedEditor;
