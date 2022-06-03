import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import '~/polyfill';

import {App} from './app';

const rootEl = document.getElementById('root')!;

Modal.setAppElement(rootEl);
ReactDOM.render(<App />, rootEl);
