/* eslint-disable */
import React, { Component } from 'react'
import './App.css'
import jsonp from 'jsonp'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

const REJSEKORT_PREFIX = '308430'

class App extends Component {
  constructor() {
    super()
    let now = new Date()
    this.state = {
      from: '',
      to: '',
      rejsekort: localStorage.rejsekort || REJSEKORT_PREFIX,
      rejsekortData: {},
      price: '',
      time: now.getHours() + ':' + ('0' + now.getMinutes()).slice(-2),
      date: `${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${now.getDate()}`,
      remember: (localStorage.rejsekort && localStorage.rejsekort.length > 0) ? true : false
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
  }
  onChangeDate(e) {
    this.setState({
      date: e.target.value
    })
  }
  onChangeTime(e) {
    this.setState({
      time: e.target.value
    })
  }
  onChangeRemember() {
    let current = !this.state.remember
    this.setState({
      remember: current
    })
    if(current) {
      localStorage.rejsekort = this.state.rejsekort
    } else {
      localStorage.rejsekort = ''
    }
  }
  fetchStartStops(input, callback) {
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
    this.getCard(this.state.rejsekort, () => {
      let date = new Date(this.state.date)
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
        'REQ0JourneyTime=' + this.state.time + '&',
        'REQ0JourneyDate=' + date.getDate() + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + ('' + date.getFullYear()).slice(-2) + '&',
        'start=yes&',
        'rejsekortTravellerProfile={"PT":[5,1,2,2,13,14],"PN":[1,0,0,0,0,0],"BC":false,"DL": ' + JSON.stringify(this.state.rejsekortData.DL) + ',"CC":true}&',
        'journeyProducts=2047'
      ].join('')
      jsonp('https://jsonp.afeld.me/?url=' + encodeURIComponent(rejseplanenAPI), (err, data) => {
        this.parsePricingOutput(data)
      })
    })
  }
  getCard(rejsekort, callback) {
    rejsekort = rejsekort.replace(REJSEKORT_PREFIX, '')
    rejsekort = parseInt(rejsekort, 10) + ''
    rejsekort = rejsekort.slice(0, -1)
    let getCardAPI = 'http://www.rejseplanen.dk/bin/help.exe/mny?tpl=rkfc_getcard&cardNo=' + rejsekort
    jsonp('https://jsonp.afeld.me/?url=' + encodeURIComponent(getCardAPI), (err, data) => {
      this.setState({
        rejsekortData: data.data
      })
      callback()
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
        <h1>Beregn rejse</h1>
        <div className='App_Form'>
          <div className='App_Section'>
            <div className='App_Header'>Fra</div>
            <div className='App_Input_Container'>
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
            <div className='App_Header'>Til</div>
            <div className='App_Input_Container'>
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
          <div>
            <div className='App_Header'>Dato</div>
            <div className='App_Input_Container'>
              <input type='date' className='App_Input' value={this.state.date} onChange={this.onChangeDate.bind(this)}/>
            </div>
          </div>
          <div>
            <div className='App_Header'>Tid</div>
            <div className='App_Input_Container'>
              <input type='time' className='App_Input' value={this.state.time} onChange={this.onChangeTime.bind(this)}/>
            </div>
          </div>
          <div className='App_Section'>
            <div className='App_Header'>Rejsekort Nummer</div>
            <div className='App_Input_Container'>
              <input type='number' className='App_Input' value={this.state.rejsekort} onChange={this.onChangeRejsekort.bind(this)}/>
            </div>
            <div className='App_Input_Container'>
              <input type="checkbox" checked={this.state.remember} onChange={this.onChangeRemember.bind(this)}/> Husk mit rejsekort!
            </div>
          </div>
          <button onClick={this.calculatePrice.bind(this)} className='App_Calculate'>Beregn</button>
        </div>
        <div className='App_Result'>
          {this.state.price}
        </div>
      </div>
    );
  }
}

export default App;
