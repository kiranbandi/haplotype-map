/*global $*/
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Dashboard } from './components';
import configureStore from './redux/store/configureStore';
import { Provider } from 'react-redux';
//Root sass file for webpack to compile
import './sass/main.scss';
//Initial Default settings 
const store = configureStore();
// load toolkit and boostrap
import './utils/toolkit';

class App extends Component {

  render() {
    return (<Provider store={store}> <Dashboard /> </Provider>)
  }
}

ReactDOM.render(<App />, document.getElementById('#root'));


