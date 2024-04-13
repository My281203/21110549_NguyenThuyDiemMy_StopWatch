import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ScrollView,
} from 'react-native';

interface StopWatchProps {}

interface StopWatchState {
  timeElapsed: number | null;
  running: boolean;
  startTime: Date | null;
  laps: number[];
  interval?: NodeJS.Timeout; 
  lapIntervals: (NodeJS.Timeout | null)[];
}

export default class StopWatch extends Component<StopWatchProps, StopWatchState> {
  constructor(props: StopWatchProps) {
    super(props);
    this.state = {
      timeElapsed: null,
      running: false,
      startTime: null,
      laps: [],
      lapIntervals: [],
    };
    this.handleStartPress = this.handleStartPress.bind(this);
    this.startStopButton = this.startStopButton.bind(this);
    this.handleLapPress = this.handleLapPress.bind(this);
    this.formatTime = this.formatTime.bind(this);
  }

  formatTime(milliseconds: number): string {
    let minutes = Math.floor(milliseconds / 60000);
    milliseconds %= 60000;
    let seconds = Math.floor(milliseconds / 1000);
    milliseconds %= 1000;

    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${milliseconds < 100 ? '0' : ''}${milliseconds < 10 ? '0' : ''}${milliseconds}`;
  }

  laps() {
    return this.state.laps && this.state.laps.map((time: number, index: number) => (
      <View key={index} style={styles.lap}>
        <Text style={styles.lapText}>
          Lap #{index + 1}
        </Text>
        <Text style={styles.lapText}>
          {this.formatTime(time)}
        </Text>
      </View>
    ));
  }
  startLapTimer() {
    const interval = setInterval(() => {
      const lastLapInterval = this.state.lapIntervals[this.state.lapIntervals.length - 1];
      if (lastLapInterval) {
        const lastLapIndex = this.state.lapIntervals.length - 1;
        const lapsCopy = [...this.state.laps];
        lapsCopy[lastLapIndex] += 30; 
  
        this.setState(prevState => ({
          laps: lapsCopy,
        }));
      }
    }, 30);
  
    this.setState(prevState => ({
      lapIntervals: [...prevState.lapIntervals, interval],
    }));
  }
  stopLapTimer() {
    const lastLapInterval = this.state.lapIntervals.pop();
    if (lastLapInterval) {
      clearInterval(lastLapInterval);
    }
  }
  startStopButton() {
    var style = this.state.running ? styles.stopButton : styles.startButton;
    var action = this.state.running ? this.handleStopPress.bind(this) : this.handleStartPress.bind(this);
  
    return (
      <TouchableHighlight underlayColor="gray" onPress={action} style={[styles.button, style]}>
        <Text>
          {this.state.running ? 'Stop' : 'Start'}
        </Text>
      </TouchableHighlight>
    );
  }
  
  lapButton() {
    if (this.state.running) {
      return (
        <TouchableHighlight style={styles.button} underlayColor="gray" onPress={this.handleLapPress.bind(this)}>
          <Text>
            Lap
          </Text>
        </TouchableHighlight>
      );
    } else if (this.state.laps.length > 0) {
      return (
        <TouchableHighlight style={styles.button} underlayColor="gray" onPress={this.handleResetPress.bind(this)}>
          <Text>
            Reset
          </Text>
        </TouchableHighlight>
      );
    } else {
      return (
        <TouchableHighlight style={styles.button} underlayColor="gray" onPress={this.handleLapPress.bind(this)}>
          <Text>
            Lap
          </Text>
        </TouchableHighlight>
      );
    }
  }

  

  handleLapPress() {
    if (this.state.running && this.state.timeElapsed) {
      const lap = this.state.timeElapsed;
      this.setState(prevState => ({
        laps: [lap,...prevState.laps],
      }));
    } else if (!this.state.running && this.state.timeElapsed) {
      const lap = this.state.timeElapsed;
      this.setState(prevState => ({
        laps: [lap,...prevState.laps],
      }));
    }
  }
  

  handleStartPress() {
    if (this.state.running) {
      clearInterval(this.state.interval as NodeJS.Timeout);
      this.setState({
        running: false,
      });
      return;
    }
    this.setState({ startTime: new Date() });
  
    const interval = setInterval(() => {
      this.setState({
        timeElapsed: new Date().getTime() - (this.state.startTime as Date).getTime(),
        running: true,
      });
    }, 30);
    this.setState({ interval });
  }
  
  handleStopPress() {
    clearInterval(this.state.interval as NodeJS.Timeout);
    if (this.state.running && this.state.timeElapsed) {
      const lap = this.state.timeElapsed;
      this.setState(prevState => ({
        laps: [...prevState.laps, lap],
        running: false,
        timeElapsed: null, 
      }));
    }
  }
  
  handleResetPress() {
  this.state.lapIntervals.forEach(interval => {
    if (interval) {
      clearInterval(interval);
    }
  });

  this.setState({
    timeElapsed: null,
    laps: [],
    lapIntervals: [],
  });
  }

  getMaxTime(): number {
    return Math.max(...this.state.laps, 0);
  }
  
  getMinTime(): number {
    return Math.min(...this.state.laps, Infinity);
  }

  render() {
    const maxTime = this.getMaxTime();
    const minTime = this.getMinTime();
    const reversedLaps = [...this.state.laps].reverse(); 
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.timerWrapper}>
            <Text style={styles.timer}>
              {this.formatTime(this.state.timeElapsed || 0)}
            </Text>
          </View>
          <View style={styles.buttonWrapper}>
            {this.lapButton()}
            {this.startStopButton()}
          </View>
        </View>
        <ScrollView style={styles.footer}>
          {reversedLaps.map((lapTime, index) => {  
            const isMaxTime = lapTime === maxTime && maxTime !== 0;
            const isMinTime = lapTime === minTime;
  
            return (
              <View key={index} style={styles.lapContainer}>
                <Text style={[styles.lapText, isMaxTime && styles.maxTimeText, isMinTime && styles.minTimeText]}>
                  Lap {this.state.laps.length - index}  
                </Text>
                <Text style={[styles.lapText, isMaxTime && styles.maxTimeText, isMinTime && styles.minTimeText]}>
                  {this.formatTime(lapTime)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
  
  
  
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20
  },
  header: {
    flex: 1
  },
  footer: {
    flex: 1
  },
  timerWrapper: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonWrapper: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lap: {
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 10,
    marginTop: 10
  },
  button: {
    borderWidth: 2,
    height: 90,
    width: 90,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timer: {
    fontSize: 60
  },
  lapText: {
    fontSize: 20
  },
  startButton: {
    borderColor: 'green'
  },
  stopButton: {
    borderColor: 'red'
  },
  lapContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,    
  },
  lapTextContainer: {
    flex: 1,
  },
  timeTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  maxTime: {
    
  },
  maxTimeText: {
    color: 'red', 
  },
  minTime: {
    
  },
  minTimeText: {
    color: 'green', 
  },
});

AppRegistry.registerComponent('StopWatch', () => StopWatch);