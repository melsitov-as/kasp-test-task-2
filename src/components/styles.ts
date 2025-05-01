import { GenericStyle } from '../types/types';

export const titleStyle: GenericStyle = {
  margin: 0,
  padding: 0,
  color: '#0075e6',
  textAlign: 'left',
  marginBottom: '30px',
};

export const highlightStyle: GenericStyle = {
  color: 'red',
};

export const blueHighlightStyle: GenericStyle = {
  color: '#0075e6',
};

export const purpleHighlightStyle: GenericStyle = {
  color: '#8517b8',
};

export const editorWrapperStyle: GenericStyle = {
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

export const placeholderStyle: GenericStyle = {
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
