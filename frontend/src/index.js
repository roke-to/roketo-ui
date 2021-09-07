import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.scss';
import Modal from 'react-modal';

const rootEl = document.getElementById('root');

Modal.setAppElement(rootEl);
ReactDOM.render(<App />, rootEl);
