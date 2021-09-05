import React, { useState } from 'react'
import useSWR from 'swr'

import { NEAR, loader, TARAS } from '../components/Helpers'
import { FormField, Input, Button } from '../components/kit'
import { useNear } from '../features/near-connect/useNear'

function SendPage () {
  const near = useNear()
  const profileId = near.auth.signedAccountId

  const [token, setToken] = useState('NEAR')

  function radioClick (e, token) {
    setToken(token)
  }

  async function createStreamClick (e) {
    e.preventDefault()
    const ownerId = document.getElementById('ownerInput').value
    const receiverId = document.getElementById('receiverInput').value
    // TODO
    const deposit =
      token === 'NEAR'
        ? String(
          parseInt(
            (parseFloat(document.getElementById('depositInput').value) +
                1e-1) *
                1e9
          )
        ) + '000000000000000'
        : '100000000000000000000000'
    const speed =
      token === 'NEAR'
        ? String(
          parseInt(
            (parseFloat(document.getElementById('speedInput').value) + 0) *
                1e9
          )
        ) + '000000'
        : String(
          parseInt(
            (parseFloat(document.getElementById('speedInput').value) + 0) *
                1e9
          )
        )
    const res = await near.near.contract.create_stream(
      {
        description: 'blabla',
        owner_id: ownerId,
        receiver_id: receiverId,
        token_name: token,
        tokens_per_tick: speed,
        auto_deposit_enabled: false
      },
      '200000000000000',
      deposit
    )
    console.log('create res', res)
  }

  const fetchAccount = async (...args) => {
    try {
      if (!profileId) {
        return []
      }
      return await near.near.contract.get_account({ account_id: profileId })
    } catch (e) {
      console.log('near error', e)
    }
    return []
  }

  const { data: account } = useSWR(['account', profileId], fetchAccount, {
    errorRetryInterval: 250
  })
  const outputs = account && account.outputs ? account.outputs : []
  let depositList = outputs

  if (near.inited && account) {
    depositList = outputs.map((output, id) => {
      return (
        <option key={id} value={id}>
          {output.stream_id}
        </option>
      )
    })
  }

  console.log('!!', depositList)

  return (
    <div className='twind-container twind-m-auto twind-px-5 twind-py-12'>
      <div className='twind-text-center'>
        <h1 className='twind-text-5xl twind-mb-4 twind-text-center'>
          Create a stream
        </h1>
        <p className='twind-text-gray'>
          Stream your tokens to the receiver directly
        </p>
      </div>

      <form
        className='twind-max-w-lg twind-mx-auto twind-w-full'
        onSubmit={(e) => createStreamClick(e)}
      >
        <FormField label='Owner:' className='twind-mb-4'>
          <Input>
            <input
              required
              placeholder='owner.near'
              id='ownerInput'
              value={near.near.accountId}
            />
          </Input>
        </FormField>

        <FormField label='Receiver:' className='twind-mb-4'>
          <Input>
            <input required id='receiverInput' placeholder='root.near' />
          </Input>
        </FormField>

        <FormField label='Token' className='twind-mb-4'>
          <div className='form-check mb-2'>
            <input
              className='form-check-input'
              type='radio'
              name='flexToken'
              id='flexToken1'
              onClick={(e) => radioClick(e, 'NEAR')}
              checked={token === 'NEAR'}
            />
            <label className='form-check-label' htmlFor='flexToken1'>
              NEAR tokens
            </label>
          </div>
          <div className='form-check mb-2'>
            <input
              className='form-check-input'
              type='radio'
              name='flexToken'
              id='flexToken2'
              onClick={(e) => radioClick(e, 'TARAS')}
              checked={token === 'TARAS'}
            />
            <label className='form-check-label' htmlFor='flexToken2'>
              TARAS Supremacy Tokens
            </label>
          </div>
        </FormField>

        {token === 'NEAR' ? (
          <FormField label='Initial deposit:' className='twind-mb-4'>
            <Input>
              <input requried placeholder='0.00' id='depositInput' />
            </Input>
          </FormField>
        ) : null}

        <FormField label='Streaming speed, tokens per second'>
          <Input>
            <input
              required
              id='speedInput'
              placeholder='0.03'
              describedby='basic-addon2'
            />
          </Input>
        </FormField>

        <div className='twind-flex'>
          <Button variant='main' className='twind-mt-12 twind-mx-auto'>
            Create Stream
          </Button>
        </div>
        <p className='twind-text-center twind-text-gray twind-my-6'>
          You will be charged 0.006 ETH fee for that stream
        </p>
      </form>
    </div>
  )
}

export default SendPage
