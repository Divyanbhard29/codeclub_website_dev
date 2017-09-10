import React from 'react';
import ReactDOM from 'react-dom';
import './meetup.css';

// for master:
var consumerKey = 'ovcnv9ha9jar32damrf4nflcot';
var redirectURI = 'http://www.codeclub.social/index';

// for dev:
// var consumerKey = '54ruujnlagioqjb2vnnevgvja9';
// var redirectURI = 'http://codeclubsocial.herokuapp.com/index';


async function getRSVP(eventID) {
  try {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/codeclub/events/' + eventID + '/rsvps?key=674441542572b783949516b100104c&sign=true&photo-host=public&page=20');
    let data = await response.json();
    return data;
   } catch(error) {
    console.error(error);
  }
}
async function getMeetup() {
  try {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/codeclub/events?key=674441542572b783949516b100104c&sign=true&photo-host=public&page=20');
    let data = await response.json();
    return data;
   } catch(error) {
    console.error(error);
  }
}

async function postRSVP(eventID, access_token) {
  try {
    let response = await fetch('https://cors-anywhere.herokuapp.com/https://api.meetup.com/codeclub/events/' + eventID + '/rsvps?key=674441542572b783949516b100104c&sign=true&response=yes&photo-host=public&access_token='+access_token, {
      method: "POST"
    });
    let data = await response.json();
    return data;
   } catch(error) {
    console.error(error);
  }
}

function makeState() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++)
  text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

class Meetup extends React.Component {
  constructor() {
    super();
    this.state = {
      meetupJson: {},
      meetupRSVP: {},
      getMeetupRSVP: {},
      urlState: makeState()
    }
    this.handleRSVPClick = this.handleRSVPClick.bind(this);
    this.onLogIn = this.onLogIn.bind(this);
  }

  componentDidMount() {
    getMeetup().then((list) => {
      this.setState({meetupJson:list});
      if (window.location.hash.length > 1) {
        this.handleRSVPClick();
      }
    });
  }

  handleRSVPClick() {
    var eventID = this.state.meetupJson["0"]["id"];
    var fragments = window.location.hash.split(/&|=/)
    var access_token = fragments[1];
    var cookieState = document.cookie.split(/(urlStateCookie=)|;/);
    if (fragments[9] == cookieState[2]) {
      postRSVP(eventID, access_token).then((list) => {
        this.setState({meetupRSVP:list});
      });
    }
    getRSVP(eventID).then((list) => {
      this.setState({getMeetupRSVP:list});
    });
  }

// Stores randomly generated state in cookie to be checked when user comes back from meetup auth site
  onLogIn() {
    var d = new Date();
    // number of days until cookie expires
    var ndays = 1;
    d.setTime(d.getTime() + (ndays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    var newCookie = "urlStateCookie=" + this.state.urlState + ";" + expires + ";path=/";
    document.cookie = newCookie;
  }

  render() {
    if (Object.keys(this.state.meetupJson).length !== 0) {
      var date = new Date(this.state.meetupJson["0"]["time"]);
      var year = 1900 + date.getYear();
      var month = date.getMonth();
      var monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var day = date.getDate();
      var dayXX = ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "st"];
      var hours = date.getHours();
      var amPm = "AM";
      if (hours > 12) {
        hours = hours - 12;
        amPm = "PM";
      }
      var minutes = date.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      var name = this.state.meetupJson["0"]["venue"]["name"];
      var hrefAuth = "https://secure.meetup.com/oauth2/authorize?response_type=token&scope=rsvp&client_id=" + consumerKey + "&redirect_uri=" + redirectURI + "&state=" + this.state.urlState;
      var finalJSX = [
        <h3>Next Meetup</h3>,
        <p>The next scheduled meetup will be at {hours}:{minutes} {amPm} on {monthList[month]} {day}{dayXX[day-1]}, {year} at {name}.</p>,
        <a href={hrefAuth} onClick={this.onLogIn} className="button">RSVP</a>
      ];
      if (Object.keys(this.state.meetupRSVP).length !== 0 && Object.keys(this.state.getMeetupRSVP).length !== 0) {
        var rsvpList = [];
        for (var k in this.state.getMeetupRSVP) {
          rsvpList.push(this.state.getMeetupRSVP[k]["member"]["id"]);
        }
        if (rsvpList.includes(this.state.meetupRSVP["member"]["id"])) {
          finalJSX.push(<p></p>);
          finalJSX.push(<p>You RSVP'd!</p>);
        }
      }
      return (
        <div className="meetup-info">{finalJSX}</div>
      );
    }
    return <p></p>;
  }
}

// ====================================

ReactDOM.render(
  <Meetup />,
  document.getElementById('root')
);