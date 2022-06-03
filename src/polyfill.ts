import {Buffer} from 'buffer';

if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}
(window as any).Buffer = Buffer;
(window as any).process = {env: {}};
