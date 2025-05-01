import React, { FC, useState } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  CompositeDecorator,
  ContentBlock,
  DraftDecorator,
  Modifier,
  EditorChangeType,
  DraftDecoratorComponentProps,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Button, Flex, Typography } from 'antd';
import './styles.scss';
import { Callback } from '../types/types';
import { HighlightDecoratorProps } from '../interfaces/interfaces';
import * as styles from './styles';
import { borderBlack, borderBlue, wordsToHighlight } from '../utils/const';
import {
  escapedQuoteInsideDoubleQuotesRegex,
  escapedQuoteInsideTypographicQuotesRegex,
  logicalOperatorsRegex,
  regularQuotesRegex,
  typographicQuotesRegex,
} from '../utils/regex';

const { Title, Text } = Typography;

const findWithRegex = (
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

const RedHighlightDecorator: FC<HighlightDecoratorProps> = (
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
  return <span style={styles.purpleHighlightStyle}>{props.children}</span>;
};

function getHighlightDecorator(regexes: RegExp[]): CompositeDecorator {
  const decorators: DraftDecorator<any>[] = regexes.map(
    (regex, index): DraftDecorator => {
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
            ? RedHighlightDecorator
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
  const wordsRegex = new RegExp(`\\b(${wordsToHighlight.join('|')})\\b`, 'g');

  const combinedRegexes = [
    escapedQuoteInsideDoubleQuotesRegex,
    regularQuotesRegex,
    escapedQuoteInsideTypographicQuotesRegex,
    typographicQuotesRegex,
    logicalOperatorsRegex,
    wordsRegex,
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
    border: isFocused ? borderBlue : borderBlack,
  };

  return (
    <Flex vertical={true} style={styles.padTop13}>
      <Title level={2} style={styles.titleStyle}>
        Enter your search query:
      </Title>

      <div
        className='wrapperActions'
        style={{ ...wrapperStyle, ...styles.margBot30 }}
      >
        {showPlaceholder && (
          <span style={styles.placeholderStyle}>Enter some text...</span>
        )}

        <Editor
          editorState={editorState}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          handleBeforeInput={handleBeforeInput}
        />
      </div>

      <Button
        className='buttonActions'
        type='text'
        style={{
          ...styles.buttonStyle,
        }}
      >
        <Text
          style={{ ...styles.colorGrey, ...styles.fontS18 }}
          className='textActions'
        >
          Send
        </Text>
      </Button>
    </Flex>
  );
};

export default HighlightedEditor;
