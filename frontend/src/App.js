import React from 'react'
import 'error-polyfill'
import 'bootstrap/dist/js/bootstrap.bundle'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'
import * as nearAPI from 'near-api-js'
import Logo from './images/logo.png'
import { HashRouter as Router, Link, Route, Switch } from 'react-router-dom'
import SendPage from './pages/Send'
import ReceivePage from './pages/Receive'

const IsMainnet = window.location.hostname === '(xyiming)' // TODO
const TestNearConfig = {
  accountSuffix: 'testnet',
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  contractName: 'dev-1630685656410-62108694435619',
  walletUrl: 'https://wallet.testnet.near.org'
}
const MainNearConfig = {
  accountSuffix: 'near',
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  contractName: 'dev-1630411495814-97749356114440',
  walletUrl: 'https://wallet.near.org'
}

const NearConfig = IsMainnet ? MainNearConfig : TestNearConfig

class App extends React.Component {
  constructor (props) {
    super(props)

    this._near = {}

    this.state = {
      connected: false,
      account: null
    }

    this._near.config = NearConfig

    this._initNear().then(() => {
      this.setState({
        signedIn: !!this._near.accountId,
        signedAccountId: this._near.accountId,
        connected: true
      })
    })
  }

  async _initNear () {
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    const near = await nearAPI.connect(Object.assign({ deps: { keyStore } }, NearConfig))
    this._near.keyStore = keyStore
    this._near.near = near

    this._near.walletConnection = new nearAPI.WalletConnection(near, NearConfig.contractName)
    this._near.accountId = this._near.walletConnection.getAccountId()

    this._near.account = this._near.walletConnection.account()
    this._near.contract = new nearAPI.Contract(this._near.account, NearConfig.contractName, {
      viewMethods: [
        'get_account',
        'get_stream'
      ],
      changeMethods: [
        'create_stream',
        'deposit',
        'withdraw',
        'pause_stream',
        'restart_stream',
        'create_bridge',
        'delete_bridge',
        'push_flow',
        'stop_stream'
      ]
    })

    this._near.logOut = () => {
      this._near.walletConnection.signOut()
      this._near.accountId = null
      this.setState({
        signedIn: !!this._accountId,
        signedAccountId: this._accountId
      })
    }

    this._near.refreshAllowance = async () => {
      alert("You're out of access key allowance. Need sign in again to refresh it")
      await this.logOut()
      await this.requestSignIn()
    }
  }

  async requestSignIn (e) {
    e && e.preventDefault()
    const appTitle = 'Streaming Xyiming'
    await this._near.walletConnection.requestSignIn(
      NearConfig.contractName,
      appTitle
    )
    return false
  }

  render () {
    const passProps = {
      _near: this._near,
      refreshAllowance: () => this._near.refreshAllowance(),
      ...this.state
    }
    const header = !this.state.connected ? (
      <div>Connecting... <span className='spinner-grow spinner-grow-sm' role='status' aria-hidden='true' /></div>
    ) : (this.state.signedIn ? (
      <div>
        <button
          className='btn btn-outline-secondary'
          onClick={() => this._near.logOut()}
        >Sign out ({this.state.signedAccountId})
        </button>
      </div>
    ) : (
      <div>
        <button
          className='btn btn-primary'
          onClick={(e) => this.requestSignIn(e)}
        >Sign in with NEAR Wallet
        </button>
      </div>
    ))

    return (
      <div className='App text-white' style={{ backgroundColor: '#1E1E1E' }}>
        <Router basename={process.env.PUBLIC_URL}>
          <nav className='navbar navbar-expand-lg navbar-dark mb-3' style={{ backgroundColor: '#2F2F2F' }}>
            <div className='container-fluid'>
              <Link className='navbar-brand' to='/' title='Xyiming'>
                <img src={Logo} alt='Xyiming' className='d-inline-block align-middle mx-3' style={{ opacity: 0.65 }} />
                Streaming Xyiming
              </Link>
              <button
                className='navbar-toggler' type='button' data-bs-toggle='collapse'
                data-bs-target='#navbarSupportedContent' aria-controls='navbarSupportedContent'
                aria-expanded='false' aria-label='Toggle navigation'
              >
                <span className='navbar-toggler-icon' />
              </button>
              <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
                  <li className='nav-item'>
                    <Link className='nav-link' aria-current='page' to='/'>Send</Link>
                  </li>
                  <li className='nav-item'>
                    <Link className='nav-link' aria-current='page' to='/receive'>Receive</Link>
                  </li>
                </ul>
                <form className='d-flex'>
                  {header}
                </form>
              </div>
            </div>
          </nav>

          <Switch>
            <Route exact path='/'>
              <SendPage {...passProps} />
            </Route>
            <Route exact path='/receive'>
              <ReceivePage {...passProps} />
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
