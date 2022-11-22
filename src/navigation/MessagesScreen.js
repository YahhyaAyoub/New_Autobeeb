//import liraries
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  I18nManager,
  Dimensions,
  Image,
  AppState,
  StatusBar,
} from 'react-native';
import NewHeader from '../containers/NewHeader';
import ks from '@services/KSAPI';
import Languages from '../common/Languages';
import {Color} from '@common';
import {connect} from 'react-redux';
import {LogoSpinner} from '../components';
import Moment from 'moment';
import messaging from '@react-native-firebase/messaging';
import {isIphoneX} from 'react-native-iphone-x-helper';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import {NavigationEvents} from 'react-navigation';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

// create a component
class MyClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
      loading: true,
      appState: AppState.currentState,
      date: new Date(),
    };
  }

  componentDidMount = () => {
    AppState.addEventListener('change', this._handleAppStateChange);

    if (this.props.user && this.props.user.ID) {
      ks.getMessageSessions({
        userID: this.props.user.ID,
        langid: Languages.langID,
      }).then((data) => {
        this.setState({
          sessions: data.Sessions,
          loading: false,
        });
      });
    }
    this.setupNotification();
    this.setPushNotification(this.props.user && this.props.user.ID);
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (this.props.user) {
        ks.getMessageSessions({
          userID: this.props.user.ID,
          langid: Languages.langID,
        }).then((data) => {
          this.setState({
            sessions: data.Sessions,
            loading: false,
          });
        });
      }
    }
    this.setState({appState: nextAppState});
  };

  Logout() {
    AsyncStorage.setItem('user', '', () => {
      this.props.ReduxLogout();
      //    this.props.navigation.navigate("HomeScreen");
    });
  }

  setPushNotification(ID) {
    const _this = this;
    FCM = messaging();
    // check to make sure the user is authenticated

    // requests permissions from the user
    FCM.requestPermission();
    // gets the device's push token
    FCM.getToken().then((token) => {
      ks.SetUserToken({
        userid: ID,
        token: token,
      });
    });
  }
  setupNotification() {
    const _this = this;
    _this.notificationDisplayedListener = messaging().onMessage(
      async (remoteMessage) => {}
    );
    //App in foreground
    _this.notificationListener = messaging().onMessage(
      async (remoteMessage) => {
        {
          this.props.navigation.isFocused()
            ? this.props.editChat({type: 'EDIT_CHAT', payload: false})
            : null;
        } //to remove chat red dot when recieve message and user is on screen
        if (remoteMessage) {
          if (remoteMessage.data) {
            if (this.props.user) {
              ks.getMessageSessions({
                userID: this.props.user.ID,
                langid: Languages.langID,
              }).then((data) => {
                this.setState({
                  sessions: data.Sessions,
                  loading: false,
                });
              });
            } else {
              this.setState({
                loading: false,
              });
            }
          }
        }
      }
    );
  }

  render() {
    if (!this.props.user) {
      return (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
          <NewHeader navigation={this.props.navigation} />
          <View
            style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}
          >
            <IconMC
              name="login"
              size={40}
              //    color={Color.secondary}
              //    style={{ marginRight: 15 }}
            />
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Cairo-Bold',
                fontSize: 25,
              }}
            >
              {Languages.YouNeedToLoginFirst}
            </Text>

            <TouchableOpacity
              style={{
                marginTop: 20,
                backgroundColor: 'green',
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 5,
              }}
              onPress={() => {
                this.props.navigation.navigate('LoginScreen');
              }}
            >
              <Text style={{color: '#fff', fontSize: 18}}>
                {Languages.LoginNow}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (this.state.loading) {
      return (
        <View style={{flex: 1}}>
          <StatusBar backgroundColor="#fff" barStyle="dark-content" />

          <NewHeader navigation={this.props.navigation} />

          <LogoSpinner fullStretch />
          {
            <NavigationEvents
              onDidFocus={() => {
                this.props.editChat({type: 'EDIT_CHAT', payload: false});
                // alert(JSON.stringify(payload))
                ks.UserGet({
                  userID: this.props.user?.ID,

                  langid: Languages.langID,
                }).then((data) => {
                  if (data && data.Success == 1) {
                    if (data.User == null) {
                      this.Logout();
                    }
                  }
                });

                if (this.props.user) {
                  ks.getMessageSessions({
                    userID: this.props.user.ID,
                    langid: Languages.langID,
                  }).then((data) => {
                    this.setState({
                      sessions: data.Sessions,
                      loading: false,
                    });
                  });
                }
              }}
              //   onDidBlur={payload => console.log('did blur', payload)}
            />
          }
        </View>
      );
    }
    return this.state.sessions && this.state.sessions.length <= 0 ? (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <NewHeader navigation={this.props.navigation} />
        <NavigationEvents
          //  onWillFocus={payload => console.log('will focus', payload)}
          onDidFocus={() => {
            // alert(JSON.stringify(payload))
            this.props.editChat({type: 'EDIT_CHAT', payload: false});
            ks.UserGet({
              userID: this.props.user?.ID,

              langid: Languages.langID,
            }).then((data) => {
              if (data && data.Success == 1) {
                if (data.User == null) {
                  this.Logout();
                }
              }
            });

            if (this.props.user) {
              ks.getMessageSessions({
                userID: this.props.user.ID,
                langid: Languages.langID,
              }).then((data) => {
                this.setState({
                  sessions: data.Sessions,
                  loading: false,
                });
              });
            }
          }}
          //   onDidBlur={payload => console.log('did blur', payload)}
        />
        <View
          style={{
            paddingTop: 40,
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Text
            style={[
              styles.text,
              {textAlign: 'center', fontFamily: 'Cairo-Regular', fontSize: 25},
            ]}
          >
            {Languages.NoMessages}
          </Text>
        </View>
      </View>
    ) : (
      <View>
        <NewHeader navigation={this.props.navigation} />
        <NavigationEvents
          //  onWillFocus={payload => console.log('will focus', payload)}
          onDidFocus={() => {
            // alert(JSON.stringify(payload))
            this.props.editChat({type: 'EDIT_CHAT', payload: false});
            ks.UserGet({
              userID: this.props.user?.ID,

              langid: Languages.langID,
            }).then((data) => {
              if (data && data.Success == 1) {
                if (data.User == null) {
                  this.Logout();
                }
              }
            });

            if (this.props.user) {
              ks.getMessageSessions({
                userID: this.props.user.ID,
                langid: Languages.langID,
              }).then((data) => {
                this.setState({
                  sessions: data.Sessions,
                  loading: false,
                });
              });
            }
          }}
          //   onDidBlur={payload => console.log('did blur', payload)}
        />

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          style={[{}]}
          contentContainerStyle={{paddingBottom: 100}}
          data={this.state.sessions}
          extraData={this.state.sessions}
          renderItem={(item, index) => {
            return (
              <SwipeRow
                key={'Messages' + index}
                style={{marginBottom: 2}}
                disableLeftSwipe={I18nManager.isRTL ? false : true}
                disableRightSwipe={I18nManager.isRTL ? true : false}
                leftOpenValue={75}
                rightOpenValue={-75}
              >
                <TouchableOpacity
                  style={styles.hiddenRow}
                  onPress={() => {
                    // alert(JSON.stringify(item))
                    this.setState({
                      sessions: this.state.sessions.filter(
                        (x) => x.ID != item.item.ID
                      ),
                    });
                    // alert(JSON.stringify(this.state.sessions))
                    ks.hideCommunication({
                      FirstParty: item.item.FirstParty,
                      SecondParty: item.item.SecondParty,
                    });
                  }}
                >
                  <FontAwesome name="trash" size={30} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={1}
                  disableRightSwipe
                  onPress={() => {
                    this.props.navigation.navigate('ChatScreen', {
                      sessionID: item.item.ID,
                      targetID: item.item.SecondParty,
                      ownerName: item.item.SecondPartyName,
                      entityID: '',
                    });
                  }}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'white',
                    alignItems: 'center',
                    padding: 10,
                  }}
                >
                  <Image
                    style={{width: 50, height: 50, borderRadius: 100}}
                    resizeMode="contain"
                    onError={(data) => {
                      item.item.noImage = true;
                      this.setState({index: 1});
                    }}
                    source={
                      item.item.noImage
                        ? {
                            uri:
                              'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
                            width: 50,
                            height: 50,
                          }
                        : {
                            uri: `https://autobeeb.com/content/users/${item.item.SecondParty}/${item.item.SecondParty}_400x400.jpg?time=${this.state.date}`,
                          }
                    }
                  />

                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      paddingHorizontal: 10,
                      flex: 1,
                    }}
                  >
                    <View>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: 'Cairo-Bold',
                          maxWidth: Dimensions.get('screen').width * 0.6,
                          textAlign: 'left',
                        }}
                      >
                        {item.item.SecondPartyName}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          flexGrow: 1,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: 'Cairo-Regular',
                            textAlign: 'left',
                            width: Dimensions.get('screen').width * 0.55,
                          }}
                        >
                          {item.item.ExtraInfo}{' '}
                        </Text>
                        <Text
                          style={{
                            textAlign: 'right',
                            fontFamily: 'Cairo-Regular',
                            width: Dimensions.get('screen').width * 0.25,
                            fontSize: 15,
                          }}
                        >
                          {Moment(item.item.DateAdded).format('MM-DD')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </SwipeRow>
            );
          }}
        />
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    // justifyContent: 'center',
    //  alignItems: 'center',
    //backgroundColor: '#2c3e50',
  },
  hiddenRow: {
    flex: 1,
    width: 75,
    height: 50,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = ({user}) => {
  return {
    user: user.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  const HomeRedux = require('@redux/HomeRedux');
  const UserRedux = require('@redux/UserRedux');

  return {
    ReduxLogout: () => dispatch(UserRedux.actions.logout()),

    getCommunication: (userID, targetID, sessionID, entityID, callback) => {
      HomeRedux.actions.getCommunication(
        userID,
        targetID,
        sessionID,
        entityID,
        callback
      );
    },

    editChat: (data) => dispatch(data),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyClass);
