import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import moment from './Moment'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {events: []}

  componentDidMount() {
    fetch('/events')
      .then(res => res.json())
      .then(events => this.setState({ events}))
      .catch(console.log('error'));
  }

  render() {
    return (
      <div>
      <BigCalendar
        events={this.state.events}
        views={['month', 'week', 'agenda']}
        defaultDate={new Date(2017, 12, 9)}
      />
      </div>
    );
  }
}

export default App;
