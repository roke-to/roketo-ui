import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import App from './App';
import './styles/index.scss';

const rootEl = document.getElementById('root')!;

Modal.setAppElement(rootEl);
ReactDOM.render(<App />, rootEl);
