import React, {useState} from 'react';
import useSWR from 'swr';

import {NEAR, loader, TARAS} from '../components/Helpers';
import {FormField, Input, Button} from '../components/kit';
import {useNear} from '../features/near-connect/useNear';
import {DropdownMenu, DropdownMenuItem} from '../components/kit/DropdownMenu';
import {DropdownOpener} from '../components/kit/DropdownOpener';
import {RadioButton} from '../components/kit/RadioButton';
import {DropdownArrowDown} from '../components/icons/DropdownArrowDown';
import classNames from 'classnames';
import {tokens} from '../lib/formatting';
import {Tokens, Streams} from '../components/icons'
import {TokenFormatter} from '../lib/formatting.js'

function SendPage() {
  const near = useNear();
  const profileId = near.auth.signedAccountId;

  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [dropdownActive, setDropdownActive] = useState('NEAR');

  const [days, setDays] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [comment, setComment] = useState();

  const tokensNames = Object.keys(tokens).filter((item) => item !== 'fallback')
  const dropdownOnChange = (value) => {
    console.log(value);
    setDropdownActive(value);
  }

  const [totalSecond, setTotalSecond] = useState(days*3600+minutes*60+seconds)
  const [speed, setSpeed] = useState((deposit/totalSecond).toFixed(3))
  function radioClick(e, token) {
    setDropdownActive(token);
  }

  async function createStreamClick(e) {
    e.preventDefault();
    const ownerId = document.getElementById('ownerInput').value;
    const receiverId = document.getElementById('receiverInput').value;
    // TODO
    const formatter = TokenFormatter(dropdownActive);

    const newdeposit = formatter.amount(deposit)

    const old_deposit =
        dropdownActive === 'NEAR'
        ? String(
            parseInt(
              (parseFloat(document.getElementById('depositInput').value) +
                1e-1) *
                1e9,
            ),
          ) + '000000000000000'
        : '100000000000000000000000';


    console.log(dropdownActive,newdeposit, old_deposit)
    
    const speed =
    dropdownActive === 'NEAR'
        ? String(
            parseInt(
              (parseFloat(document.getElementById('speedInput').value) + 0) *
                1e9,
            ),
          ) + '000000'
        : String(
            parseInt(
              (parseFloat(document.getElementById('speedInput').value) + 0) *
                1e9,
            ),
          );

    const res = await near.contractApi.createStream({
      deposit: deposit,
      description: 'blabla',
      ownerId: ownerId,
      receiverId: receiverId,
      token: dropdownActive,
      speed: speed,
      autoDepositEnabled: false,
    });

    console.log('create res', res);
  }

  const fetchAccount = async (...args) => {
    try {
      if (!profileId) {
        return [];
      }
      return await near.near.contract.get_account({account_id: profileId});
    } catch (e) {
      console.log('near error', e);
    }
    return [];
  };

  const {data: account} = useSWR(['account', profileId], fetchAccount, {
    errorRetryInterval: 250,
  });

  return (
    <div className="twind-container twind-m-auto twind-px-5 twind-py-12">
      <div className="twind-text-center">
        <h1 className="twind-text-5xl twind-mb-4 twind-text-center">
          Create a stream
        </h1>
        <p className="twind-text-gray">
          Stream your tokens to the receiver directly
        </p>
      </div>

      <form
        className="twind-max-w-lg twind-mx-auto twind-w-full"
        onSubmit={(e) => createStreamClick(e)}
      >
        <FormField label="Owner:" className="twind-mb-4">
          <Input>
            <input
              required
              placeholder="owner.near"
              id="ownerInput"
              value={near.near.accountId}
            />
          </Input>
        </FormField>

        <FormField label="Receiver:" className="twind-mb-4">
          <Input>
            <input required id="receiverInput" placeholder="root.near" />
          </Input>
        </FormField>

        <div className="twind-flex twind-mb-4">
          <FormField label="Token:" className="twind-w-1/3 twind-items-center twind-relative">
              <DropdownOpener
                className="twind-bg-input focus-within:twind-border-blue hover:twind-border-blue twind-text-xl twind-h-14"
                onClick={() => setDropdownOpened(!dropdownOpened)}
              >
      
                <div className="twind-inline-flex">
                          {<Tokens tokenName={dropdownActive}/>}{" "}
                          <span>{dropdownActive}</span>
                </div>
              </DropdownOpener>
        
              <DropdownMenu opened={dropdownOpened} className="twind-z-10">
                {tokensNames.map((option) => (
                  <DropdownMenuItem className="twind-bg-input">
                    <RadioButton
                      label={
                        <div className="twind-inline-flex">
                          {<Tokens tokenName={option}/>}{" "}
                          <span>{option}</span>
                        </div>
                        }
                      active={dropdownActive === option}
                      value={option}
                      onChange={(value) => 
                        {
                          setDropdownOpened(false)
                          setDropdownActive(value)
                        }
                      }
                    />
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>
          </FormField>
  
          <FormField label="Amount to stream:" className="twind-w-2/3">
              <Input>
                <input requried placeholder="0.00" id="depositInput" 
                value={deposit}
                onChange={(e) => (setDeposit(e.target.value))}
                />
              </Input>
            </FormField>
         </div>



         <div className="twind-block twind-mb-4">
            <div className="twind-relative">
              <div>Stream duration:</div>
              <div className="twind-text-xs twind-text-gray twind-absolute twind-right-0 twind-top-1">Streaming speed: {(deposit/(days*3600+minutes*60+seconds)).toFixed(6)} {dropdownActive} / sec</div>
            </div>
            <div className="twind-flex" label="Stream duration">
                  <div
                      className='twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-l-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue'
                  >
                    <input
                      className='input twind-bg-input twind-w-1/3'
                      required
                      id="daysInput"
                      placeholder="0"
                      describedby="basic-addon2"
                      value={days}
                      onChange={(e) => {
                        setDays(e.target.value)
                      }}
                    />
                  <div className="twind-right-2 twind-opacity-100 twind-w-1/3">days</div>
                  </div>
                   <div
                      className='twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue'
                  >
                  <input
                      className='input twind-bg-input twind-w-1/3'
                      required
                    id="hourseInput"
                    placeholder="0"
                    describedby="basic-addon2"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                   <div className="twind-right-2 twind-opacity-100 twind-w-1/3">hourse</div>
                   </div>
                   <div
                      className='twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-r-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue'
                  >
                  <input
                      className='input twind-bg-input twind-w-1/3'
                      required
                    id="minutesInput"
                    placeholder="0"
                    describedby="basic-addon2"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                  />
                  <div className="twind-right-2 twind-opacity-100 twind-w-1/3">mins</div>
                  </div>
            </div>
        </div>

        <FormField>
          <label className="twind-block twind-mb-6 twind-relative">
            <div className="twind-text-xs twind-text-gray twind-absolute twind-right-0 twind-top-1">0/255</div>
            <div className="twind-mb-1">Comment:</div>
            <div>
              <label
                  className="twind-h-24 Input twind-font-semibold twind-flex twind-p-4 twind-pt-0 twind-rounded-lg twind-border  twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue twind-border-border"
              >
                <input
                  required
                  id="commentInput"
                  placeholder="Enter comment"
                  describedby="basic-addon2"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value)
                  }}
                />
            </label>
            </div>
          </label>
        </FormField> 

        <div className="twind-flex twind-relaitive">
          <div><p className="twind-text-left twind-text-gray twind-w-2/3 twind-text-sm">
            You will be charged 0.1 NEAR fee for that stream
          </p></div>
          <Button variant="main" className="twind-mx-auto twind-right-0">
            Create Stream
          </Button>
        </div>
        
      </form>
    </div>
  );
}

export default SendPage;
