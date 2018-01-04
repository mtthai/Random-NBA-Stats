import React, { Component } from 'react';
import axios from 'axios';

var paused = 0;

class App extends Component {
  constructor() {
    super();
    this.state = {results: '', control: 'pause'};
  }

  getData(){
    axios({
      url: '/api/nba',
      method: 'POST',
      //headers: {
      // 'Accept': 'text/html',
      // 'Content-Type': 'text/html',
      //}, 
    })
    .then(res => {
      this.setState({results: res.data})
      console.log(res.data);
    })
    .catch(function(err){
      console.log(err);
    });
  }

  componentDidMount() { 
    this.getData();

    this.timer = setInterval(function(){
      this.getData();
    }.bind(this), 8000);

    this.onTabTimer = setInterval(function(){
      if(document.hidden){
        clearInterval(this.timer);
        paused = 1;
        this.setState({control: 'resume'});
      } 
    }.bind(this), 9000);
  }

  pause(){
    if(paused === 0){
      clearInterval(this.timer);
      paused = 1;
      this.setState({control: 'resume'});
    } else if(paused === 1){
      this.timer = setInterval(function(){
        this.getData()
      }.bind(this), 8000);
      paused = 0;
      this.setState({control: 'pause'});
    }
  }

  //for oututting json:
  //<pre>{JSON.stringify(this.state.results, null, 2)}</pre>

  render() {
    return (
      <div className="App">
        <button onClick={this.pause.bind(this)}>{this.state.control}</button>
        <h1 dangerouslySetInnerHTML={{__html: this.state.results}} />
      </div>
    );
  }
}

export default App;
