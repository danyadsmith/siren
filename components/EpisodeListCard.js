import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, AsyncStorage, Platform} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import Swipeable from 'react-native-swipeable';
import { actionCreators as mainActions } from '../actions';
import { actionCreators as swipeActions } from '../actions/Swipe';
import {hmsToSecondsOnly} from '../helpers';
import moment from 'moment';

let _ = require('lodash');

const mapStateToProps = (state) => ({
  currentEpisode: state.player.currentEpisode,
  inbox: state.main.inbox,
  token: state.main.token,
  leftActionActivated: state.swipe.isLeftActionActivated,
  leftToggle: state.swipe.isLeftToggled,
  rightActionActivated: state.swipe.isRightActionActivated
});

class EpisodeListCard extends Component {

  renderClock = (duration) => {
    if (duration.length < 5) {
      duration = '00:' + duration;
    }
    duration = hmsToSecondsOnly(duration);
    if (duration <= 300) {
      return <Image source={require('../assets/clockIcons/clock5.png')} style={styles.clock} />
    }
    if (duration <= 900) {
      return <Image source={require('../assets/clockIcons/clock15.png')} style={styles.clock} />
    }
    if (duration <= 1800) {
      return <Image source={require('../assets/clockIcons/clock30.png')} style={styles.clock} />
    }
    if (duration <= 2700) {
      return <Image source={require('../assets/clockIcons/clock45.png')} style={styles.clock} />
    }
    if (duration > 2700) {
      return <Image source={require('../assets/clockIcons/clock60.png')} style={styles.clock} />
    }
  };

  toggleLike = (id) => {
    id = parseInt(id);
    var inbox = _.cloneDeep(this.props.inbox);
    inbox[id].liked = !inbox[id].liked;
    this.props.dispatch(mainActions.toggleLike(inbox));
    fetch("http://siren-server.herokuapp.com/api/users/likeEpisode", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.props.token
      },
      body: JSON.stringify({id: id, liked: !this.props.inbox[id].liked})
    })
  };

  toggleBookmark = (id) => {
    id = parseInt(id);
    var inbox = _.cloneDeep(this.props.inbox);
    inbox[id].bookmark = !inbox[id].bookmark;
    this.props.dispatch(mainActions.toggleBookmark(inbox));
    fetch("http://siren-server.herokuapp.com/api/users/bookmarkEpisode", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.props.token
      },
      body: JSON.stringify({id: id, bookmark: !this.props.inbox[id].bookmark})
    })
      .then(response => console.warn('RESPONSE: ', response));
  };

  render() {
    const {leftActionActivated, leftToggle, rightActionActivated, rightToggle} = this.props;
    return (
      <Swipeable
        leftActionActivationDistance={200}
        leftContent={(
          <View style={[styles.leftSwipeItem, {backgroundColor: leftActionActivated ? 'rgb(221, 95, 95)' : '#42f4c5'}]}>
            {leftActionActivated ?
              <Text>(( release ))</Text> :
              <Text>Add to Playlist</Text>}
          </View>
        )}
        rightActionActivationDistance={200}
        rightContent={(
          <View style={[styles.rightSwipeItem, {backgroundColor: rightActionActivated ? '#42f4c5' : 'rgb(221, 95, 95)'}]}>
            {rightActionActivated ?
              <Text>(( release ))</Text> :
              <Text>Remove Episode</Text>}
          </View>
        )}
        onLeftActionActivate={() => this.props.dispatch(swipeActions.updateLeftActivation(true))}
        onLeftActionDeactivate={() => this.props.dispatch(swipeActions.updateLeftActivation(false))}
        onLeftActionComplete={() => {
          this.props.dispatch(swipeActions.toggleAddToPlaylistModal());
        }}

        onRightActionActivate={() => this.props.dispatch(swipeActions.updateRightActivation(true))}
        onRightActionDeactivate={() => this.props.dispatch(swipeActions.updateRightActivation(false))}
        onRightActionComplete={() => {
            this.props.dispatch(mainActions.removeEpisodeFromInbox(this.props.id));
            if (this.props.currentEpisode && this.props.currentEpisode.feed.enclosure.url === this.props.episode.feed.enclosure.url) {
              this.props.handleRemovePlayingEpisode();
            }
        }}
      >
      <View style={styles.mainView}>
        <View style={styles.topView}>
          <View style={styles.leftView}>
            <TouchableOpacity onPress={this.props.handlePlay.bind(this, this.props.episode)}>
              <Image source={{uri: this.props.episode.image}} style={styles.image}/>
            </TouchableOpacity>
          </View>
          <View style={styles.rightView}>
            <Text style={styles.date}>{moment(this.props.episode.feed.pubDate.substring(0,16)).format('ddd, DD MMM YYYY')}</Text>
            <Text style={styles.episode} numberOfLines={1}>{this.props.episode['feed']['title']}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{this.props.episode.feed.subtitle}</Text>
          </View>
        </View>
        <View style={styles.bottomView}>
          <Text style={styles.tag} numberOfLines={1} ellipsizeMode='tail'> {this.props.episode.tag} </Text>
          <View style={styles.timeView}>
            {this.renderClock(this.props.episode.feed.duration)}
            <Text style={styles.time}>{this.props.episode.feed.duration}</Text>
          </View>
          {this.props.episode.bookmark === true ?
          <Ionicons style={styles.favorite} size={25} color='grey' name="ios-bookmark" onPress={()=>(this.toggleBookmark(this.props.id))}/> :
          <Ionicons style={styles.favorite} size={25} color='grey' name="ios-bookmark-outline" onPress={() =>(this.toggleBookmark(this.props.id))}/>
          }
          {this.props.episode.liked === true ?
          <Ionicons style={styles.favorite} size={25} color='grey' name="ios-heart" onPress={() =>(this.toggleLike(this.props.id))}/> :
          <Ionicons style={styles.favorite} size={25} color='grey' name="ios-heart-outline" onPress={() =>(this.toggleLike(this.props.id))}/>
          }
        </View>
      </View>
    </Swipeable>
    );
  }

}

const styles = StyleSheet.create({
  topView: {
    justifyContent: 'space-between',
    height: 80,
    alignItems: 'center',
    flexDirection: 'row',
    flex: .75,
    marginBottom: 8,
    marginTop: 10,
    paddingRight: 5,
  },
  leftView: {
    flex: .25,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rightView: {
    paddingLeft: 3,
    flex: .75,
    justifyContent: 'space-around',
    alignItems: 'stretch',
    height: 80,
    paddingLeft: (Platform.OS === 'ios') ? 10 : 0,
  },
  bottomView: {
    flex: .25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingLeft: 5,
    paddingRight: 8,
  },
  mainView: {
    height: 140,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey',
    borderTopColor: 'lightgrey',
  },
  image: {
    height: 80,
    width: 80,
  },
  episode: {
    fontWeight: "500",
   ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 16,
      },
    }),
  },
  subtitle: {
  fontWeight: "400",
   ...Platform.select({
      ios: {
        fontSize: 12,
      },
      android: {
        fontSize: 14,
      },
    }),
  },
  podcast: {
    fontWeight: "600",
   ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 16,
      },
    }),
  },
  tag: {
    backgroundColor: '#42f4c5',
    alignSelf: 'center',
    padding: 2,
    width: 80,
    marginLeft: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  date: {
    fontWeight: "400",
    fontSize: 12,
  },
  time: {
    fontWeight: "400",
  ...Platform.select({
    ios: {
      fontSize: 13,
    },
    android: {
      fontSize: 14,
    },
  }),
    marginRight: 5,
    color: 'grey',
  },
  favorite: {
    alignSelf: 'center',
  },
  bookmark: {
    alignSelf: 'center',
  },
  clock: {
    marginRight: 7,
    height: 21,
    width: 21,
  },
  timeView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftSwipeItem: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20
  },
  rightSwipeItem: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20
  },
});

export default connect(mapStateToProps)(EpisodeListCard);
