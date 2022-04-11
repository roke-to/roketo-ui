import { login } from '../../support/login';
import { createstream } from '../../support/createstream';
import { changestatus } from '../../support/changestatus';

it('login', ()=>{
    login();
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