import React from 'react';

const NEAR = '\u24C3\u202F';
const TARAS = '\uD83C\uDD43';

const fromNear = (s) => parseFloat(s) / 1e24 || 0;
const fromTaras = (s) => parseFloat(s) / 1e18 || 0;

function loader() {
  return (
    // key='1' is needed by InfiniteScroll
    <div className="d-flex justify-content-center" key="1">
      <div className="spinner-grow" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export {NEAR, TARAS, fromNear, fromTaras, loader};
