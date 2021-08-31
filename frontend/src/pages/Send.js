import React, { useState } from 'react'
import useSWR from 'swr'

import { NEAR, fromNear, loader } from '../components/Helpers'

function SendPage (props) {
  const profileId = props.signedAccountId
  const [showButtons, setShowButtons] = useState(true)

  async function stopStreamClick (e, output) {
    e.preventDefault()
    setShowButtons(false)
    console.log('stopping', output)
    const res = await props._near.contract.stop_stream({ stream_id: output.stream_id }, '200000000000000', 1)
    console.log('stopping res', res)
  }

  async function createStreamClick (e) {
    e.preventDefault()
    setShowButtons(false)
    const ownerId = document.getElementById('ownerInput').value
    const receiverId = document.getElementById('receiverInput').value
    // TODO
    const deposit = String(parseInt((parseFloat(document.getElementById('depositInput').value) + 1e-1) * 1e9)) + '000000000000000'
    const speed = String(parseInt((parseFloat(document.getElementById('speedInput').value) + 0) * 1e9)) + '000000'
    const res = await props._near.contract.create_stream({ owner_id: ownerId, receiver_id: receiverId, token_name: 'NEAR', tokens_per_tick: speed }, '200000000000000', deposit)
    console.log('create res', res)
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
  let outputs = (account && account.outputs) ? account.outputs : []

  if (props.connected && account) {
    console.log('account', account)
    outputs = outputs.map((output, id) => {
      return (
        <div className='card' style={{ width: '90%', margin: '15px' }} key={id}>
          <div className='card-body'>
            <div className='d-flex flex-row justify-content-between w-100'>
              <div className='col-2 m-1'>
                {output.receiver_id}
              </div>
              <small className='col-1 m-1'>
                <small><samp className='text-secondary'>{output.stream_id.substr(0, 6)}...</samp></small>
              </small>
              <small className='col-1 m-1'>
                {fromNear(output.balance).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {output.token_name}
              </small>
              <small className='col-1 m-1'>
                {(fromNear(output.tokens_per_tick) * 1e9).toFixed(2)} {output.token_name}/s
              </small>
              <small className='col-1 m-1'>
                {fromNear(output.tokens_available).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {fromNear(output.tokens_transferred).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {output.status}
              </small>
              <div className='col-2 m-1'>
                {props.connected && showButtons && output.status === 'ACTIVE' ? (
                  <button disabled={!props.signedIn} className='btn btn-danger' onClick={(e) => stopStreamClick(e, output)}>Stop the stream</button>
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
      <div className='card' style={{ width: '90%', margin: '15px' }}>
        <div className='card-body'>
          <h5 className='card-title'>Create a stream</h5>
          <h6 className='card-subtitle mb-3 text-muted'>Stream your tokens to the receiver directly</h6>
          <form onSubmit={(e) => createStreamClick(e)}>
            <div className='form-group mb-2'>
              <label htmlFor='ownerInput' className='mb-2'>Owner</label>
              <input className='form-control' id='ownerInput' placeholder={props.signedAccountId} />
            </div>
            <div className='form-group mb-2'>
              <label htmlFor='receiverInput' className='mb-2'>Receiver</label>
              <input className='form-control' id='receiverInput' placeholder='root.near' />
            </div>
            <label htmlFor='depositInput' className='mb-2'>Initial deposit</label>
            <div className='input-group mb-2'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='basic-addon1'>{NEAR}</span>
              </div>
              <input className='form-control' id='depositInput' placeholder='15.70' describedby='basic-addon1' />
            </div>
            <label htmlFor='speedInput' className='mb-2'>Streaming speed, tokens per second</label>
            <div className='input-group mb-2'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='basic-addon2'>{NEAR}</span>
              </div>
              <input className='form-control' id='speedInput' placeholder='0.03' describedby='basic-addon2' />
            </div>

            {props.connected && showButtons ? (
              <button disabled={!props.signedIn} className='btn btn-primary mt-4'>Create a stream</button>
            ) : (
              <div className='mt-4'>{loader()}</div>)}
          </form>
        </div>
      </div>
      <h4>Streams owned by you</h4>
      <div className='card' style={{ width: '90%', margin: '15px' }}>
        <div className='card-body'>
          <div className='d-flex flex-row justify-content-between w-100'>
            <div className='col-2 m-1'>
            Receiver
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
      {outputs}
    </div>
  )
}

export default SendPage
