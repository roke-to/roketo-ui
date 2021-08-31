import React, { useState } from 'react'
import useSWR from 'swr'

import { fromNear, loader } from '../components/Helpers'

function ReceivePage (props) {
  const profileId = props.signedAccountId
  const [showButtons, setShowButtons] = useState(true)

  async function withdrawStreamClick (e, input) {
    e.preventDefault()
    setShowButtons(false)
    console.log('withdraw', input)
    const res = await props._near.contract.withdraw({ stream_id: input.stream_id }, '200000000000000', 0)
    console.log('withdraw res', res)
    // TODO update the page instantly
    setShowButtons(true)
  }

  async function stopStreamClick (e, input) {
    e.preventDefault()
    setShowButtons(false)
    console.log('stopping', input)
    const res = await props._near.contract.stop_stream({ stream_id: input.stream_id }, '200000000000000', 1)
    console.log('stopping res', res)
  }

  const fetchAccount = async (...args) => {
    try {
      if (!profileId) {
        return []
      }
      return await props._near.contract.get_account({ account_id: profileId })
    } catch (e) {
      console.log('near error', e)
    }
    return []
  }

  const { data: account } = useSWR(['account', profileId], fetchAccount, { errorRetryInterval: 250 })
  let inputs = (account && account.inputs) ? account.inputs : []

  if (props.connected && account) {
    console.log('account', account)
    inputs = inputs.map((input, id) => {
      return (
        <div className='card' style={{ width: '90%', margin: '15px', backgroundColor: '#141414' }} key={id}>
          <div className='card-body'>
            <div className='d-flex flex-row justify-content-between w-100'>
              <div className='col-2 m-1'>
                {input.owner_id}
              </div>
              <small className='col-1 m-1'>
                <small><samp className='text-secondary'>{input.stream_id.substr(0, 6)}...</samp></small>
              </small>
              <small className='col-1 m-1'>
                {fromNear(input.balance).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {input.token_name}
              </small>
              <small className='col-1 m-1'>
                {(fromNear(input.tokens_per_tick) * 1e9).toFixed(2)} {input.token_name}/s
              </small>
              <small className='col-1 m-1'>
                {fromNear(input.tokens_available).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {fromNear(input.tokens_transferred).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {input.status}
              </small>
              <div className='col-2 m-1'>
                {props.connected && showButtons && input.status === 'ACTIVE' ? (
                  <div className='d-flex flex-row'>
                    <button disabled={!props.signedIn} className='btn btn-success btn-sm m-1' onClick={(e) => withdrawStreamClick(e, input)}>Withdraw</button>
                    <button disabled={!props.signedIn} className='btn btn-danger btn-sm m-1' onClick={(e) => stopStreamClick(e, input)}>Stop</button>
                  </div>
                ) : (
                  <div className='mt-4'>{loader()}</div>)}
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  console.log(props)

  return (!props.connected) ? (<div className='container g-0 px-5'>Please connect your NEAR Account first</div>) : (
    <div className='container g-0 px-5'>
      <h4>Your receiving streams</h4>
      <div className='card' style={{ width: '90%', margin: '15px', backgroundColor: '#181818' }}>
        <div className='card-body'>
          <div className='d-flex flex-row justify-content-between w-100'>
            <div className='col-2 m-1'>
            From owner
            </div>
            <div className='col-1 m-1'>
            Stream ID
            </div>
            <div className='col-1 m-1'>
            Tokens left
            </div>
            <div className='col-1 m-1'>
            Token name
            </div>
            <div className='col-1 m-1'>
            Stream speed
            </div>
            <div className='col-1 m-1'>
            Tokens unlocked
            </div>
            <div className='col-1 m-1'>
            Tokens transferred
            </div>
            <div className='col-1 m-1'>
            Stream status
            </div>
            <div className='col-2 m-1' />
          </div>
        </div>
      </div>
      {inputs}
    </div>
  )
}

export default ReceivePage
