import React, {useState} from 'react';
import useSWR from 'swr';
import {FormField, Input, Button} from '../components/kit';
import {useNear} from '../features/near-connect/useNear';
import {DropdownMenu, DropdownMenuItem} from '../components/kit/DropdownMenu';
import {DropdownOpener} from '../components/kit/DropdownOpener';
import {RadioButton} from '../components/kit/RadioButton';
import {tokens} from '../lib/formatting';
import {Tokens} from '../components/icons';
import {TokenFormatter} from '../lib/formatting.js';
import {Formik} from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import numbro from 'numbro';

function SendPage() {
  const INITIAL_TOKEN_NAME = 'NEAR'

  const near = useNear();
  const profileId = near.auth.signedAccountId;

  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(INITIAL_TOKEN_NAME);

  const tokensNames = Object.keys(tokens).filter((item) => item !== 'fallback');
  
  async function createStreamSubmit(deposit, comment, owner, receiver, token, speed, autoDeposit){
    const formatter = TokenFormatter(token);

    console.log(deposit, comment, owner, receiver, token, speed, autoDeposit)
    const res =
      token === 'NEAR'
        ? await near.contractApi.createStream({
            deposit: formatter.toInt(deposit),
            description: comment,
            ownerId: owner,
            receiverId: receiver,
            token: token,
            speed: formatter.tokenPerSecondToInt(speed),
            autoDepositEnabled: autoDeposit,
          })
        : await near.near.fts[token].contract.ft_transfer_call(
            {
              receiver_id: near.near.contractName,
              amount: deposit,
              memo: 'xyiming transfer',
              msg: JSON.stringify({
                Create: {
                  description: comment,
                  owner_id: owner,
                  receiver_id: receiver,
                  token_name: token,
                  balance: formatter.toInt(deposit),
                  tokens_per_tick: formatter.tokenPerSecondToInt(speed),
                  auto_deposit_enabled: autoDeposit,
                },
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


  const SendSchema = Yup.object().shape({
    days: Yup.number()
             .integer('days must be int')
             .typeError('days must be int'),
    hours: Yup.number()
             .integer('hours must be int')
             .typeError('hours must be int'),
    minutes: Yup.number()
             .integer('minutes must be int')
             .typeError('minutes must be int'),
    deposit: Yup.number()
              .positive('deposit must be positive number')
              .required('deposit cant be empty')
              .typeError('deposit must be float (with .)'),
    owner: Yup.string()
              .required(),
    receiver: Yup.string()
              .required(),
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
      <Formik
        initialValues={{owner:near.near.accountId, receiver:'', token: 'NEAR', deposit: 0, days:0, hours:0, minutes:0, comment:'',autoDeposit:false}}
        validationSchema={SendSchema}
        onSubmit={(values, {setSubmitting}) => {
          const res = createStreamSubmit(values.deposit, values.comment, values.owner, values.receiver, values.token, (values.deposit / (values.days * 3600 * 24 + values.hours * 3600 + values.minutes * 60)), values.autoDeposit)
          console.log(res)
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form
            className="twind-max-w-lg twind-mx-auto twind-w-full"
          >
            <FormField label="Owner:" className="twind-mb-4">
              <Input>
                <input
                  name="owner"
                  placeholder="owner.near"
                  value={values.owner}
                  onChange={handleChange}
                />
              </Input>
            </FormField>
            {errors.owner ? <div className={classNames("",errors.owner ? "twind-text-special-inactive" : "")}>{errors.owner && errors.owner}</div>: null}

            <FormField label="Receiver:" className="twind-mb-4">
              <Input>
                <input
                   name="receiver"
                   placeholder="root.near" 
                   value={values.receiver}
                   onChange={handleChange}
                />
              </Input>
            </FormField>
            {errors.receiver ? <div className={classNames("",errors.receiver ? "twind-text-special-inactive" : "")}>{errors.receiver && errors.receiver}</div>: null}

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
                            {<Tokens tokenName={option} />}{' '}
                            <span>{option}</span>
                          </div>
                        }
                        active={dropdownActive === option}
                        value={option}
                        onChange={(value) => {
                          setDropdownOpened(false);
                          setDropdownActive(value);
                          
                          const input = document.getElementsByName('token')[0];
                          var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                          nativeInputValueSetter.call(input, value);

                          var event = new Event('input', { bubbles: true });
                          input.dispatchEvent(event);
                        }}
                      />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
                {/* hidden input to pass dropdown value to formic by calling native setter and trigger onchange */}
                <input 
                  className="twind-hidden"
                  name="token"
                  value={values.token}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Amount to stream:" className="twind-w-2/3">
                <Input error={errors.deposit}>
                  <input
                    placeholder="0.00"
                    id="deposit"
                    value={values.deposit}
                    onChange={handleChange}
                  />
                </Input>
              </FormField>
            </div>
            {errors.deposit ? <div className={classNames("",errors.deposit ? "twind-text-special-inactive" : "")}>{errors.deposit && errors.deposit}</div>: null}
            <div className="twind-block twind-mb-4">
              <div className="twind-relative">
                <div>Stream duration:</div>
                <div className="twind-text-xs twind-text-gray twind-absolute twind-right-0 twind-top-1">
                  Streaming speed:{' '}
                  {isNaN(values.deposit / (values.days * 3600 * 24 + values.hours * 3600 + values.minutes * 60))
                    ? 0
                    : (
                      (values.deposit / (values.days * 3600 * 24 + values.hours * 3600 + values.minutes * 60))
                      ).toFixed(6)}{' '}
                  {values.token} / sec
                </div>
              </div>
              <div className="twind-flex" label="Stream duration">
                <div className={classNames("twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-l-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue", errors.days ? "twind-border-special-inactive":"")}>
                  <input
                    className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
                    id="days"
                    placeholder="0"
                    value={values.days}
                    onChange={handleChange}
                  />
                  <div className="twind-right-2 twind-opacity-100 twind-w-1/3">
                    days
                  </div>
                  
                </div>
                <div className={classNames("twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue", errors.hours ? "twind-border-special-inactive":"")}>
                  <input
                    className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
                    id="hours"
                    placeholder="0"
                    value={values.hours}
                    onChange={handleChange}
                  />
                  <div className="twind-right-2 twind-opacity-100 twind-w-1/3">
                    hours
                  </div>
                </div>
                <div className={classNames("twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-r-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue", errors.minutes ? "twind-border-special-inactive":"")}>
                  <input
                    className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
                    id="minutes"
                    placeholder="0"
                    value={values.minutes}
                    onChange={handleChange}
                  />
                  <div className="twind-right-2 twind-opacity-100 twind-w-1/3">
                    mins
                  </div>
                </div>
              </div>
              <div>
                <div className={classNames(errors.days ? "twind-text-special-inactive" : "")}>{errors.days && errors.days}</div>
                <div className={classNames(errors.hours ? "twind-text-special-inactive" : "")}>{errors.hours && errors.hours}</div>
                <div className={classNames(errors.minutes ? "twind-text-special-inactive" : "")}>{errors.minutes && errors.minutes}</div>
              </div>
            </div>

            <FormField>
              <label className="twind-block twind-mb-6 twind-relative">
                <div className="twind-text-xs twind-text-gray twind-absolute twind-right-0 twind-top-1">
                  {(values.comment && values.comment.length) || 0}/255
                </div>
                <div className="twind-mb-1">Comment:</div>
                <div>
                  <label className="twind-h-40 Input twind-font-semibold twind-flex twind-p-4 twind-pt-0 twind-rounded-lg twind-border  twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue twind-border-border">
                    <textarea
                      id="comment"
                      className=" twind-bg-input  twind-w-full twind-h-full twind-pt-2 focus:twind-outline-none twind-resize-none"
                      placeholder="Enter comment"
                      maxlength="255"
                      value={values.comment}
                      onChange={handleChange}
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
                    value={values.autoDeposit}
                    onChange={handleChange}
                  />
                  <label>Enable auto deposit?</label>
                </div>
                <p className="twind-text-left twind-text-gray twind-w-2/3 twind-text-sm">
                  You will be charged 0.1 NEAR fee for that stream
                </p>
              </div>
              <div className="twind-top-0">
                <Button variant="main" size="big" className="twind-rounded-lg"
                  onClick={handleSubmit}
                >
                  Create Stream
                </Button>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default SendPage;
