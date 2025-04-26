import React, { FC, useState, useRef, ReactNode } from 'react';
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
import { Button, Flex, Typography } from 'antd';
import './styles.css';

interface HighlightStyle {
  color: string;
}

const highlightStyle: HighlightStyle = {
  color: 'red',
};

const blueHighlightStyle: HighlightStyle = {
  color: '#0075e6',
};

const purpleHighlightStyle: HighlightStyle = {
  color: '#8517b8',
};

interface PlaceholderStyle {
  color: string;
  position: 'absolute';
  top: string;
  left: string;
  pointerEvents: 'none';
}

interface EditorWrapperStyle {
  border: string;
  padding: string;
  width: string;
  background: string;
  borderRadius: string;
  position: string;
}

export type GenericStyle = Record<string, string | number>;

export const titleStyle: GenericStyle = {
  margin: 0,
  padding: 0,
  color: '#0075e6',
  textAlign: 'left',
  marginBottom: '30px',
};

const { Title, Text } = Typography;

const editorWrapperStyle: any = {
  margin: '0 auto',
  border: '2px solid #0075e6',
  padding: '10px',
  minHeight: '100px',
  color: 'black',
  width: '1330px',
  // background: 'transparent',
  background: 'rgba(255, 255, 255, 1)',
  borderRadius: '15px',
  position: 'relative',
};

const placeholderStyle: PlaceholderStyle = {
  color: 'grey',
  position: 'absolute',
  top: '10px',
  left: '10px',
  pointerEvents: 'none', // Чтобы клики проходили сквозь плейсхолдер
};

export const colorGrey: GenericStyle = {
  color: 'rgba(255, 255, 255, 0.7)',
};

export const buttonStyle: GenericStyle = {
  width: '1330px',
  display: 'flex',
  boxSizing: 'border-box',
  border: '2px solid rgba(255, 255, 255, 0.7)',
};

type Callback = (start: number, end: number) => void;

const findWithRegex = (
  // Новая функция для выделения слов
  regex: RegExp,
  contentBlock: ContentBlock,
  callback: Callback
): void => {
  const text = contentBlock.getText();
  let matchArr: RegExpExecArray | null;
  while ((matchArr = regex.exec(text)) !== null) {
    if (
      (matchArr[0][0] === '"' && matchArr[0][matchArr[0].length - 1] === '"') ||
      (matchArr[0][0] === '“' && matchArr[0][matchArr[0].length - 1] === '”')
    ) {
      callback(matchArr.index + 1, matchArr.index + matchArr[0].length - 1);
    } else {
      callback(matchArr.index, matchArr.index + matchArr[0].length);
    }
  }
};

interface HighlightDecoratorProps {
  children?: React.ReactNode;
}

const HighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={highlightStyle}>{props.children}</span>;
};

const BlueHighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={blueHighlightStyle}>{props.children}</span>;
};

const PurpleHighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return (
    <>
      <span style={purpleHighlightStyle}>{props.children}</span>
    </>
  );
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
        ? PurpleHighlightDecorator
        : index === 3
        ? PurpleHighlightDecorator
        : index === 4
        ? HighlightDecorator
        : BlueHighlightDecorator,
  }));
  return new CompositeDecorator(decorators);
}

const HighlightedEditor: FC = () => {
  const editorRef = useRef<Editor>(null);
  const wordsToHighlight = ['TI', 'AB', 'DP', 'URL'];
  const wordsRegex = new RegExp(`\\b(${wordsToHighlight.join('|')})\\b`, 'gi');
  const escapedQuoteInsideDoubleQuotesRegex =
    /"(?:[^"\\]|\\.)*?\\"(?:[^"\\]|\\.)*?"/g;
  const regularQuotesRegex = /"([^"]*)"/g;

  const escapedQuoteInsideTypographicQuotesRegex =
    /“(?:[^“\\]|\\.)*?\\“(?:[^“\\]|\\.)*?“/g;

  const typographicQuotesRegex = /“([^”]*)”/g;

  const regexBetweenQuotes = /"([^"]*)"(.*?)"([^"]*)"/;

  const combinedRegexes = [
    escapedQuoteInsideDoubleQuotesRegex,
    regularQuotesRegex,
    escapedQuoteInsideTypographicQuotesRegex,
    typographicQuotesRegex,
    /\b(OR|AND|NOT)\b/g,
    wordsRegex,
  ];

  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty(getHighlightDecorator(combinedRegexes))
  );
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

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

  const handleHover = (): void => {
    setIsHovered(!isHovered);
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
      const textBefore = currentBlock.getText().slice(0, offset);
      const textAfter = currentBlock.getText().slice(offset);

      const insideQuotes =
        textBefore.lastIndexOf('"') > textBefore.lastIndexOf('\\"') &&
        (textAfter.indexOf('"') > textAfter.indexOf('\\"') ||
          textAfter.includes('"'));

      if (insideQuotes) {
        const newContentState = Modifier.insertText(
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
        return 'handled';
      }
    }
    return 'not-handled';
  };

  const wrapperStyle = {
    ...editorWrapperStyle,
    border: isFocused
      ? '3px solid #0075e6'
      : isHovered
      ? '3px solid rgba(255, 255, 255, 0.5)'
      : '3px solid black',
  };

  return (
    <Flex vertical={true} style={{ paddingTop: '13px' }}>
      <Title level={2} style={titleStyle}>
        Enter your search query:
      </Title>

      <div
        className='wrapperActions'
        style={{ ...wrapperStyle, marginBottom: '30px' }}
      >
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

      <Button
        className='buttonActions'
        type='text'
        style={{
          ...buttonStyle,
          display: 'flex',
          alignItems: 'center',
          padding: '24px 0',
        }}
      >
        <Text
          style={{ ...colorGrey, fontSize: '18px' }}
          className='textActions'
        >
          Send
        </Text>
      </Button>
    </Flex>
  );
};

export default HighlightedEditor;
