/*global $*/
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Dashboard } from './components';
import configureStore from './redux/store/configureStore';
import { Provider } from 'react-redux';
import processQueryParams from './utils/processQueryParams';
//Root sass file for webpack to compile
import './sass/main.scss';
//Initial Default settings 
const store = configureStore();
// Temporary implementation
// If a source is available get it, if not show the default data source
var dataSource = processQueryParams().source;

class App extends Component {

  render() {
    return (
      <Provider store={store} >
        <Dashboard source={dataSource} />
      </Provider>)
  }
}

ReactDOM.render(<App />, document.getElementById('haplotype-map'));


