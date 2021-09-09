import React, {useEffect, useState} from 'react';
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
import {Tokens, Streams} from '../components/icons';
import {TokenFormatter} from '../lib/formatting.js';

function SendPage() {
  const near = useNear();
  const profileId = near.auth.signedAccountId;

  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [dropdownActive, setDropdownActive] = useState('NEAR');

  const [days, setDays] = useState(0.0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [deposit, setDeposit] = useState(0.0);
  const [comment, setComment] = useState();
  const [autoDeposit, setAutoDeposit] = useState(false);

  const [errors, setError] = useState({});

  const tokensNames = Object.keys(tokens).filter((item) => item !== 'fallback');
  const dropdownOnChange = (value) => {
    console.log(value);
    setDropdownActive(value);
  };

  function radioClick(e, token) {
    setDropdownActive(token);
  }

  async function createStreamClick(e) {
    e.preventDefault();
    const formatter = TokenFormatter(dropdownActive);

    const ownerId = document.getElementById('ownerInput').value;
    const receiverId = document.getElementById('receiverInput').value;
    const speed = deposit / (days * 3600 * 24 + minutes * 60 + hours * 3600);
    const tokenName = dropdownActive;

    console.log('creating', tokenName);
    console.log('token', near.near.fts[tokenName]);

    const res =
      tokenName === 'NEAR'
        ? await near.contractApi.createStream({
            deposit: formatter.toInt(deposit),
            description: comment,
            ownerId: ownerId,
            receiverId: receiverId,
            token: tokenName,
            speed: formatter.tokenPerSecondToInt(speed),
            autoDepositEnabled: autoDeposit,
          })
        : await near.near.fts[tokenName].contract.ft_transfer_call(
            {
              receiver_id: near.near.contractName,
              amount: deposit,
              memo: 'xyiming transfer',
              msg: JSON.stringify({
                description: comment,
                owner_id: ownerId,
                receiver_id: receiverId,
                token_name: tokenName,
                balance: formatter.toInt(deposit),
                tokens_per_tick: formatter.tokenPerSecondToInt(speed),
                auto_deposit_enabled: autoDeposit,
              }),
            },
            '200000000000000',
            1,
          );
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

  const [owner, setOwner] = useState(near.near.accountId);

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
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </Input>
        </FormField>

        <FormField label="Receiver:" className="twind-mb-4">
          <Input>
            <input required id="receiverInput" placeholder="root.near" />
          </Input>
        </FormField>

        <div className="twind-flex twind-mb-4">
          <FormField
            label="Token:"
            className="twind-w-1/3 twind-items-center twind-relative"
          >
            <DropdownOpener
              minimal
              className="twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue twind-text-xl twind-h-14 twind-px-4 twind-py-3 twind-border twind-border-border twind-w-36"
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpened(!dropdownOpened);
              }}
            >
              <div className="twind-inline-flex">
                {<Tokens tokenName={dropdownActive} />}{' '}
                <span>{dropdownActive}</span>
              </div>
            </DropdownOpener>

            <DropdownMenu opened={dropdownOpened} className="twind-z-10">
              {tokensNames.map((option) => (
                <DropdownMenuItem className="focus-within:twind-border-blue">
                  <RadioButton
                    label={
                      <div className="twind-inline-flex">
                        {<Tokens tokenName={option} />} <span>{option}</span>
                      </div>
                    }
                    active={dropdownActive === option}
                    value={option}
                    onChange={(value) => {
                      setDropdownOpened(false);
                      setDropdownActive(value);
                    }}
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          </FormField>

          <FormField label="Amount to stream:" className="twind-w-2/3">
            <Input>
              <input
                requried
                placeholder="0.00"
                id="depositInput"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
            </Input>
          </FormField>
        </div>

        <div className="twind-block twind-mb-4">
          <div className="twind-relative">
            <div>Stream duration:</div>
            <div className="twind-text-xs twind-text-gray twind-absolute twind-right-0 twind-top-1">
              Streaming speed:{' '}
              {days + minutes + hours === 0
                ? 0
                : (
                    deposit /
                    (days * 3600 * 24 + minutes * 60 + hours * 3600)
                  ).toFixed(6)}{' '}
              {dropdownActive} / sec
            </div>
          </div>
          <div className="twind-flex" label="Stream duration">
            <div className="twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-l-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue">
              <input
                className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
                required
                id="daysInput"
                placeholder="0"
                describedby="basic-addon2"
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                }}
              />
              <div className="twind-right-2 twind-opacity-100 twind-w-1/3">
                days
              </div>
            </div>
            <div className="twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue">
              <input
                className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
                required
                id="hoursInput"
                placeholder="0"
                describedby="basic-addon2"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              <div className="twind-right-2 twind-opacity-100 twind-w-1/3">
                hours
              </div>
            </div>
            <div className="twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-r-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue">
              <input
                className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
                required
                id="minutesInput"
                placeholder="0"
                describedby="basic-addon2"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
              <div className="twind-right-2 twind-opacity-100 twind-w-1/3">
                mins
              </div>
            </div>
          </div>
        </div>

        <FormField>
          <label className="twind-block twind-mb-6 twind-relative">
            <div className="twind-text-xs twind-text-gray twind-absolute twind-right-0 twind-top-1">
              {(comment && comment.length) || 0}/255
            </div>
            <div className="twind-mb-1">Comment:</div>
            <div>
              <label className="twind-h-40 Input twind-font-semibold twind-flex twind-p-4 twind-pt-0 twind-rounded-lg twind-border  twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue twind-border-border">
                <textarea
                  id="commentInput"
                  className=" twind-bg-input  twind-w-full twind-h-full twind-pt-2 focus:twind-outline-none twind-resize-none"
                  placeholder="Enter comment"
                  maxlength="255"
                  value={comment}
                  onChange={(e) => {
                    // e.target.value > 255 ? set
                    setComment(e.target.value);
                  }}
                />
              </label>
            </div>
          </label>
        </FormField>

        <div className="twind-flex twind-relaitive">
          <div>
            <div className="twind-flex">
              <input
                name="autoDeposit"
                className="twind-mr-1"
                type="checkbox"
                value={autoDeposit}
                onChange={(e) => {
                  setAutoDeposit(!autoDeposit);
                }}
              />
              <label>Enable auto deposit?</label>
            </div>
            <p className="twind-text-left twind-text-gray twind-w-2/3 twind-text-sm">
              You will be charged 0.1 NEAR fee for that stream
            </p>
          </div>
          <div className="twind-top-0">
            <Button variant="main" size="big" className="twind-rounded-lg">
              Create Stream
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SendPage;
