import { createstream } from '../../support/createstream';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';
import { relogin } from '../../support/relogin';

it('stop stream', () => {
    cy.wait(20000);
    relogin();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("stop");
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
    //Проверить, что кнопка работает.
    //Залогиниться за други пользователем, проверить, что есть что списать и проверить значения?.
    //как вообще значения -то проверить?

    //create short stream
    //wait stream time 
    //login github4
    //withdraw - checkwalue
    //checkwallet after withdraw

    //Нельзя проверить баланс кошелька, вроде?
    //либо чекаем wallet (хз как, если сессия разная а локльные переменные не сохраняются)
})



