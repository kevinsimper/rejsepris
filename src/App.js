import React, { Component } from 'react';
import './App.css';
import jsonp from 'jsonp'
import Select from 'react-select'
import 'react-select/dist/react-select.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      from: '',
      to: '',
      rejsekort: '',
    }
  }
  componentDidMount() {

  }
  onChangeTo(e) {
    this.setState({
      to: e.target.value
    })
  }
  onChangeRejsekort(e) {
    this.setState({
      rejsekort: e.target.value
    })
  }
  fetchStartStops(input, callback) {
    console.log('fetch', input)
    let callbackFn = 'getStopAPI'
    jsonp('http://www.rejseplanen.dk/bin/ajax-getstop.exe/mny?start=1&nojs&tpl=suggest2json&getstop=1&noSession=yes&REQ0JourneyStopsB=12&REQ0JourneyStopsS0A=255&REQ0JourneyStopsS0G=' + input + '&suggestCB=' + callbackFn, {
      name: callbackFn
    }, (err, data) => {
      console.log('done', data)
      callback(null, {
        options: data.suggestions.map(s => {
          return {
            label: s.value,
            value: s.value
          }
        })
      })
    })
  }
  render() {
    return (
      <div className='App'>
        <div>
          <div>Fra</div>
          <div>
            <Select.Async
              value={this.state.from}
              loadOptions={this.fetchStartStops}
              onChange={(val) => {
                console.log(val)
                this.setState({
                  from: val.value
                })
              }}
            />
          </div>
        </div>
        <div>
          <div>Til</div>
          <div>
            <input type='text' className='App_Input' value={this.state.to} onChange={this.onChangeTo.bind(this)}/>
          </div>
        </div>
        <div>
          <div>Rejsekort Nummer</div>
          <div>
            <input type='text' className='App_Input' value={this.state.rejsekort} onChange={this.onChangeRejsekort.bind(this)}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
