import { relogin } from '../../support/relogin';
import { createstream } from '../../support/createstream';
import { changestatus } from '../../support/changestatus';

it('login', ()=>{
    relogin();
})
it('create stream', ()=>{
    createstream();
})
it('change status - start', ()=>{
    changestatus("start");
})
it('change status - pause', ()=>{
    changestatus("pause");
})
it('change status - stop', ()=>{
    changestatus("stop");
})