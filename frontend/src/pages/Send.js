import React, { useState } from 'react'
import useSWR from 'swr'

import { NEAR, fromNear, fromTaras, loader, TARAS } from '../components/Helpers'

function SendPage (props) {
  const profileId = props.signedAccountId
  const [showButtons, setShowButtons] = useState(true)
  const [token, setToken] = useState('NEAR')

  function radioClick (e, token) {
    setToken(token)
  }

  function selectClick (e) {
    var selectBox = document.getElementById('selectBox')
    if (selectBox.selectedIndex > 0) {
      setToken(outputs[selectBox.selectedIndex - 1].token_name)
    }
  }

  async function pauseStreamClick (e, output) {
    e.preventDefault()
    setShowButtons(false)
    console.log('pausing', output)
    const res = await props._near.contract.pause_stream({ stream_id: output.stream_id }, '200000000000000', 1)
    console.log('pausing res', res)
  }

  async function restartStreamClick (e, output) {
    e.preventDefault()
    setShowButtons(false)
    console.log('restarting', output)
    const res = await props._near.contract.restart_stream({ stream_id: output.stream_id }, '200000000000000', 1)
    console.log('restarting res', res)
  }

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
    const deposit = token === 'NEAR' ? String(parseInt((parseFloat(document.getElementById('depositInput').value) + 1e-1) * 1e9)) + '000000000000000' : '100000000000000000000000'
    const speed = token === 'NEAR' ? String(parseInt((parseFloat(document.getElementById('speedInput').value) + 0) * 1e9)) + '000000' : String(parseInt((parseFloat(document.getElementById('speedInput').value) + 0) * 1e9))
    const res = await props._near.contract.create_stream({ description: 'blabla', owner_id: ownerId, receiver_id: receiverId, token_name: token, tokens_per_tick: speed }, '200000000000000', deposit)
    console.log('create res', res)
  }

  async function depositClick (e) {
    e.preventDefault()
    setShowButtons(false)
    var selectBox = document.getElementById('selectBox')
    if (selectBox.selectedIndex > 0) {
      const stream = outputs[selectBox.selectedIndex - 1]
      if (token === 'NEAR') {
        const deposit = String(parseInt(parseFloat(document.getElementById('depositTokensInput').value) * 1e9)) + '000000000000000'
        const res = await props._near.contract.deposit({ stream_id: stream.stream_id }, '200000000000000', deposit)
        console.log('deposit NEAR res', res)
      } else {
        const deposit = String(parseInt(parseFloat(document.getElementById('depositTokensInput').value) * 1e9)) + '000000000' // get decimals per each ft contract
        const res = await props._near.ft.ft_transfer_call({ receiver_id: props._near.near.config.contractName, amount: deposit, memo: 'xyiming transfer', msg: stream.stream_id }, '200000000000000', 1)
        console.log('deposit TARAS res', res)
      }
    }
    setShowButtons(true)
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
  const outputs = (account && account.outputs) ? account.outputs : []
  let outputsTable = outputs
  let depositList = outputs

  if (props.connected && account) {
    console.log('account', account)
    depositList = outputs.map((output, id) => {
      return (
        <option key={id} value={id}>{output.stream_id}</option>
      )
    })
    outputsTable = outputs.map((output, id) => {
      return (
        <div className='card' style={{ width: '90%', margin: '15px', backgroundColor: '#141414' }} key={id}>
          <div className='card-body'>
            <div className='d-flex flex-row justify-content-between w-100'>
              <div className='col-2 m-1'>
                {output.receiver_id}
              </div>
              <small className='col-1 m-1'>
                <small><samp className='text-secondary'>{output.stream_id.substr(0, 6)}...</samp></small>
              </small>
              <small className='col-1 m-1'>
                {output.token_name === 'NEAR' ? fromNear(output.balance).toFixed(2) : fromTaras(output.balance).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {output.token_name}
              </small>
              <small className='col-1 m-1'>
                {output.token_name === 'NEAR' ? (fromNear(output.tokens_per_tick) * 1e9).toFixed(2) : (fromTaras(output.tokens_per_tick) * 1e9).toFixed(2)} {output.token_name}/s
              </small>
              <small className='col-1 m-1'>
                {output.token_name === 'NEAR' ? fromNear(output.tokens_available).toFixed(2) : fromTaras(output.tokens_available).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {output.token_name === 'NEAR' ? fromNear(output.tokens_transferred).toFixed(2) : fromTaras(output.tokens_transferred).toFixed(2)}
              </small>
              <small className='col-1 m-1'>
                {output.status}
              </small>
              <div className='col-2 m-1'>
                {props.connected && showButtons && (output.status === 'ACTIVE' || output.status === 'PAUSED') ? (
                  <div className='d-flex flex-row'>
                    <div>
                      {output.status === 'ACTIVE' ? (
                        <button disabled={!props.signedIn} className='btn btn-warning btn-sm m-1' onClick={(e) => pauseStreamClick(e, output)}>Pause</button>
                      ) : (
                        <button disabled={!props.signedIn} className='btn btn-warning btn-sm m-1' onClick={(e) => restartStreamClick(e, output)}>Restart</button>
                      )}
                    </div>
                    <button disabled={!props.signedIn} className='btn btn-danger btn-sm m-1' onClick={(e) => stopStreamClick(e, output)}>Stop</button>
                  </div>
                ) : (
                  <div />)}
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  console.log(props)
  console.log('!!', depositList)

  return (!props.connected) ? (<div className='container g-0 px-5'>Please connect your NEAR Account first</div>) : (
    <div className='container g-0 px-5'>
      <div className='card' style={{ width: '90%', margin: '15px', backgroundColor: '#141414' }}>
        <div className='card-body'>
          <h5 className='card-title'>Create a stream</h5>
          <h6 className='card-subtitle mb-3 text-muted'>Stream your tokens to the receiver directly</h6>
          <form onSubmit={(e) => createStreamClick(e)}>
            <div className='form-group mb-2'>
              <label htmlFor='ownerInput' className='mb-2'>Owner</label>
              <input className='form-control' id='ownerInput' placeholder={props.signedAccountId} style={{ backgroundColor: '#101010', color: '#e0e0e0' }} />
            </div>
            <div className='form-group mb-2'>
              <label htmlFor='receiverInput' className='mb-2'>Receiver</label>
              <input className='form-control' id='receiverInput' placeholder='root.near' style={{ backgroundColor: '#101010', color: '#e0e0e0' }} />
            </div>
            <div className='form-group mb-2'>
              <label htmlFor='receiverInput' className='mb-2'>Token</label>
              <div className='form-check mb-2'>
                <input className='form-check-input' type='radio' name='flexToken' id='flexToken1' onClick={(e) => radioClick(e, 'NEAR')} checked={token === 'NEAR'} />
                <label className='form-check-label' htmlFor='flexToken1'>
                  NEAR tokens
                </label>
              </div>
              <div className='form-check mb-2'>
                <input className='form-check-input' type='radio' name='flexToken' id='flexToken2' onClick={(e) => radioClick(e, 'TARAS')} checked={token === 'TARAS'} />
                <label className='form-check-label' htmlFor='flexToken2'>
                  TARAS Supremacy Tokens
                </label>
              </div>
            </div>
            {token === 'NEAR' ? (
              <div>
                <label htmlFor='depositInput' className='mb-2'>Initial deposit</label>
                <div className='input-group mb-2'>
                  <div className='input-group-prepend'>
                    <span className='input-group-text' id='basic-addon1' style={{ backgroundColor: '#303030', color: '#e0e0e0', fontSize: '150%' }}>{token === 'NEAR' ? NEAR : TARAS}</span>
                  </div>
                  <input className='form-control' id='depositInput' placeholder='15.70' describedby='basic-addon1' style={{ backgroundColor: '#101010', color: '#e0e0e0' }} />
                </div>
              </div>
            ) : (<div />)}
            <label htmlFor='speedInput' className='mb-2'>Streaming speed, tokens per second</label>
            <div className='input-group mb-2'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='basic-addon2' style={{ backgroundColor: '#303030', color: '#e0e0e0', fontSize: '150%' }}>{token === 'NEAR' ? NEAR : TARAS}</span>
              </div>
              <input className='form-control' id='speedInput' placeholder='0.03' describedby='basic-addon2' style={{ backgroundColor: '#101010', color: '#e0e0e0' }} />
            </div>

            {props.connected && showButtons ? (
              <button disabled={!props.signedIn} className='btn btn-primary mt-4'>Create a stream</button>
            ) : (
              <div className='mt-4'>{loader()}</div>)}
          </form>
        </div>
      </div>
      <div className='card' style={{ width: '90%', margin: '15px', backgroundColor: '#141414' }}>
        <div className='card-body'>
          <h5 className='card-title'>Deposit tokens</h5>
          <h6 className='card-subtitle mb-3 text-muted'>Extend your existing stream</h6>
          <form onSubmit={(e) => depositClick(e)}>
            <div className='form-group mb-2'>
              <label htmlFor='ownerInput' className='mb-2'>Stream</label>
              <select id='selectBox' className='form-control custom-select' onChange={(e) => selectClick(e)}>
                <option selected>Open this select menu</option>
                {depositList}
              </select>
            </div>
            <label htmlFor='depositTokensInput' className='mb-2'>Amount of tokens to deposit</label>
            <div className='input-group mb-2'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='basic-addon2' style={{ backgroundColor: '#303030', color: '#e0e0e0', fontSize: '150%' }}>{token === 'NEAR' ? NEAR : TARAS}</span>
              </div>
              <input className='form-control' id='depositTokensInput' placeholder='0.03' describedby='basic-addon2' style={{ backgroundColor: '#101010', color: '#e0e0e0' }} />
            </div>

            {props.connected && showButtons ? (
              <button disabled={!props.signedIn} className='btn btn-primary mt-4'>Deposit</button>
            ) : (
              <div className='mt-4'>{loader()}</div>)}
          </form>
        </div>
      </div>
      <h4>Streams owned by you</h4>
      <div className='card' style={{ width: '90%', margin: '15px', backgroundColor: '#181818' }}>
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
      {outputsTable}
    </div>
  )
}

export default SendPage
