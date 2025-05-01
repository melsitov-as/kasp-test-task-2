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
  DraftDecoratorComponentProps,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Button, Flex, Typography } from 'antd';
import './styles.css';
import { Callback, GenericStyle } from '../types/types';
import { HighlightDecoratorProps } from '../interfaces/interfaces';
import * as styles from './styles';

const { Title, Text } = Typography;

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

const HighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={styles.highlightStyle}>{props.children}</span>;
};

const BlueHighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return <span style={styles.blueHighlightStyle}>{props.children}</span>;
};

const PurpleHighlightDecorator: FC<HighlightDecoratorProps> = (
  props: HighlightDecoratorProps
) => {
  return (
    <>
      <span style={styles.purpleHighlightStyle}>{props.children}</span>
    </>
  );
};

function getHighlightDecorator(regexes: RegExp[]): CompositeDecorator {
  const decorators: DraftDecorator<any>[] = regexes.map(
    (regex, index): DraftDecorator => {
      // Явное указание типа для элементов массива
      const getComponent = (props: DraftDecoratorComponentProps) => {
        const BaseComponent =
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
            : BlueHighlightDecorator;
        return <BaseComponent {...props} />;
      };

      return {
        strategy: (
          contentBlock: ContentBlock,
          callback: (start: number, end: number) => void,
          contentState: ContentState
        ): void => {
          findWithRegex(regex, contentBlock, callback);
        },
        component: getComponent,
      };
    }
  );
  return new CompositeDecorator(decorators);
}

const HighlightedEditor: FC = () => {
  const editorRef = useRef<Editor>(null);
  const wordsToHighlight = [
    'ID',
    'TI',
    'AB',
    'URL',
    'DOM',
    'DP',
    'LANG',
    'REACH',
    'KW',
    'AU',
    'CNTR',
    'CNTR_CODE',
    'SENT',
    'TRAFFIC',
    'FAV',
    'HIGHLIGHTS',
  ];
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
    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(anchorKey);
    const offset = selectionState.getAnchorOffset();
    const textBefore = currentBlock.getText().slice(0, offset);
    const textAfter = currentBlock.getText().slice(offset);

    const handleQuote = (quote: string) => {
      if (chars === quote) {
        const insideQuotes =
          textBefore.lastIndexOf(quote) >
            textBefore.lastIndexOf(`\\${quote}`) &&
          (textAfter.indexOf(quote) > textAfter.indexOf(`\\${quote}`) ||
            textAfter.includes(quote));

        if (insideQuotes) {
          const newContentState = Modifier.insertText(
            currentContent,
            selectionState,
            `\\${quote}`,
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

    const handledDoubleQuote = handleQuote('"');
    if (handledDoubleQuote === 'handled') {
      return 'handled';
    }

    const handledSmartQuote = handleQuote('“');
    if (handledSmartQuote === 'handled') {
      return 'handled';
    }

    return 'not-handled';
  };

  const wrapperStyle = {
    ...styles.editorWrapperStyle,
    border: isFocused
      ? '3px solid #0075e6'
      : isHovered
      ? '3px solid rgba(255, 255, 255, 0.5)'
      : '3px solid black',
  };

  return (
    <Flex vertical={true} style={{ paddingTop: '13px' }}>
      <Title level={2} style={styles.titleStyle}>
        Enter your search query:
      </Title>

      <div
        className='wrapperActions'
        style={{ ...wrapperStyle, marginBottom: '30px' }}
      >
        {showPlaceholder && (
          <span style={styles.placeholderStyle}>Enter some text...</span>
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
          ...styles.buttonStyle,
          display: 'flex',
          alignItems: 'center',
          padding: '24px 0',
        }}
      >
        <Text
          style={{ ...styles.colorGrey, fontSize: '18px' }}
          className='textActions'
        >
          Send
        </Text>
      </Button>
    </Flex>
  );
};

export default HighlightedEditor;
