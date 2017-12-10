import React, { Component } from "react";
import BigCalendar from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./custom.css";
import moment from "./Moment";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  state = { events: [] };

  componentDidMount() {
    fetch("/events")
      .then(res => res.json())
      .then(events => this.setState({ events }))
      .catch(console.log("error"));
  }

  render() {
    //const EventComponent = (event) => { return ( <div><div> {event.title} </div> <div>{event.location}</div></div> ) };
    return (
      <div>
        <BigCalendar
          selectable
          events={this.state.events}
          views={["month", "agenda"]}
          defaultDate={new Date()}
          onSelectEvent={event => alert(event.location)}
          eventPropGetter={this.eventStyleGetter}
        />
      </div>
    );
  }
}

export default App;
