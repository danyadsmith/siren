import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { actionCreators } from '../actions';
import { headerActions } from '../actions/Header';
import { MaterialIcons } from '@expo/vector-icons';
import ModalComponent from './Modal';
import Filter from './Filter';

const mapStateToProps = (state) => ({
  view: state.header.view
})

class Header extends Component {

  render() {
    return (
      <View>
        <Text style={styles.header}>{this.props.view}</Text>
        <View style={styles.navigation}>
          <MaterialIcons style={styles.navigationLink} onPress={() => this.props.dispatch(headerActions.changeView('Inbox'))} size={30} name='inbox'/>
          <MaterialIcons style={styles.navigationLink} onPress={() => this.props.dispatch(headerActions.changeView('Playlist'))} size={30} name='playlist-play'/>
          <MaterialIcons style={styles.navigationLink} onPress={() => this.props.dispatch(headerActions.changeView('Search'))} size={30} name='search'/>
          <ModalComponent>
            <Filter/>
          </ModalComponent>
          <MaterialIcons style={styles.navigationLink} onPress={() => this.props.dispatch(actionCreators.toggleModal())} size={30} name='filter-list' />
          <MaterialIcons style={styles.navigationLink} onPress={() => this.props.dispatch(headerActions.changeView('Settings'))} size={30} name='settings' />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    padding: 10,
    textAlign: 'center'
  },
  navigation: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#cccccc',
  },
  navigationLink: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 8
  }
});

export default connect(mapStateToProps)(Header);
