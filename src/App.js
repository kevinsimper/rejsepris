import React, { Component } from 'react';
import './App.css';
import jsonp from 'jsonp'
import Select from 'react-select'
import 'react-select/dist/react-select.css';

const REJSEKORT_PREFIX = '308430'

class App extends Component {
  constructor() {
    super()
    this.state = {
      from: '',
      to: '',
      rejsekort: REJSEKORT_PREFIX,
      rejsekortData: {},
      price: ''
    }
  }
  componentDidMount() {
    // this.getCard()
  }
  onChangeTo(e) {
    this.setState({
      to: e.target.value
    })
  }
  onChangeRejsekort(e) {
    let rejsekort = e.target.value
    this.setState({
      rejsekort
    })
    console.log(rejsekort, rejsekort.length)
    if(rejsekort.length === 16) {
      this.getCard(rejsekort)
    }
  }
  fetchStartStops(input, callback) {
    console.log('fetch start stops', input)
    let callbackFn = 'getStopAPI'
    jsonp('http://www.rejseplanen.dk/bin/ajax-getstop.exe/mny?start=1&nojs&tpl=suggest2json&getstop=1&noSession=yes&REQ0JourneyStopsB=12&REQ0JourneyStopsS0A=255&REQ0JourneyStopsS0G=' + input + '%3F' + '&suggestCB=' + callbackFn, {
      name: callbackFn
    }, (err, data) => {
      console.log('done', data)
      callback(null, {
        options: data.suggestions.map(s => {
          return {
            label: s.value,
            value: s.value,
            data: s
          }
        })
      })
    })
  }
  fetchEndStops(input, callback) {
    console.log('fetch end stops', input)
    let callbackFn = 'getEndStopAPI'
    jsonp('http://www.rejseplanen.dk/bin/ajax-getstop.exe/mny?start=1&nojs&tpl=suggest2json&getstop=1&noSession=yes&REQ0JourneyStopsB=12&REQ0JourneyStopsS0A=255&REQ0JourneyStopsS0G=' + input + '%3F' + '&suggestCB=' + callbackFn, {
      name: callbackFn
    }, (err, data) => {
      console.log('done', data)
      callback(null, {
        options: data.suggestions.map(s => {
          return {
            label: s.value,
            value: s.value,
            data: s
          }
        })
      })
    })
  }
  calculatePrice() {
    let rejseplanenAPI = [
      'http://www.rejseplanen.dk/bin/query.exe/mny',
      '?ld=hicp2e&',
      'getTariff=yes&',
      'dkTariffType=2&',
      'tpl=rejsekort_connection&',
      'REQ0JourneyStopsS0A=255&',
      'REQ0JourneyStopsS0G=' + encodeURIComponent(this.state.from.data.value) + '&',
      'REQ0JourneyStopsS0ID=' + encodeURIComponent(this.state.from.data.id) + '&',
      'REQ0JourneyStopsZ0A=255&',
      'REQ0JourneyStopsZ0G=' + encodeURIComponent(this.state.to.data.value) + '&',
      'REQ0JourneyStopsZ0ID=' + encodeURIComponent(this.state.to.data.id) + '&',
      'REQ0JourneyTime=17:00&',
      'REQ0JourneyDate=20.08.16&',
      'start=yes&',
      'rejsekortTravellerProfile={"PT":[5,1,2,2,13,14],"PN":[1,0,0,0,0,0],"BC":false,"DL": ' + JSON.stringify(this.state.rejsekortData.DL) + ',"CC":true}&',
      'journeyProducts=2047'
    ].join('')
    jsonp('https://jsonp.afeld.me/?url=' + encodeURIComponent(rejseplanenAPI), (err, data) => {
      console.log(err, data)
      this.parsePricingOutput(data)
    })
  }
  getCard(rejsekort) {
    rejsekort = rejsekort.replace(REJSEKORT_PREFIX, '')
    rejsekort = parseInt(rejsekort) + ''
    rejsekort = rejsekort.slice(0, -1)
    let getCardAPI = 'http://www.rejseplanen.dk/bin/help.exe/mny?tpl=rkfc_getcard&cardNo=' + rejsekort
    jsonp('https://jsonp.afeld.me/?url=' + encodeURIComponent(getCardAPI), (err, data) => {
      console.log(err, data)
      this.setState({
        rejsekortData: data.data
      })
    })
  }
  parsePricingOutput(data) {
    let tickets = data.out.connections[0].pricingSet[0].pricing[0].ticket
    let price = tickets[tickets.length - 1].price[0]
    this.setState({
      price
    })
  }
  render() {
    return (
      <div className='App'>
        <div className='App_Form'>
          <div className='App_Section'>
            <div>Fra</div>
            <div>
              <Select.Async
                value={this.state.from.value}
                loadOptions={this.fetchStartStops}
                onChange={(val) => {
                  console.log(val)
                  this.setState({
                    from: val
                  })
                }}
              />
            </div>
          </div>
          <div className='App_Section'>
            <div>Til</div>
            <div>
              <Select.Async
                value={this.state.to.value}
                loadOptions={this.fetchEndStops}
                onChange={(val) => {
                  console.log(val)
                  this.setState({
                    to: val
                  })
                }}
              />
            </div>
          </div>
          <div className='App_Section'>
            <div>Rejsekort Nummer</div>
            <div>
              <input type='text' className='App_Input' value={this.state.rejsekort} onChange={this.onChangeRejsekort.bind(this)}/>
            </div>
          </div>
          <button onClick={this.calculatePrice.bind(this)}>Calculate</button>
        </div>
        <div className='App_Result'>
          {this.state.price}
        </div>
      </div>
    );
  }
}

export default App;
