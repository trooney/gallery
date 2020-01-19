import React from 'react'
import ReactDOM from 'react-dom'
import App from './Components/App'
import * as serviceWorker from './serviceWorker'
import './app.scss'
import '@fortawesome/fontawesome-free//css/all.css'

ReactDOM.render(<App />, document.getElementById('root'))

if (module.hot) {
  module.hot.accept('./Components/App', () => {
    const NextApp = require('./Components/App').default
    ReactDOM.render(
      <NextApp />,
      document.getElementById('root')
    )
  })
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
