/**
 * Created by Kensoftware on 19/02/2017.
 */
import React from 'react';
import {View, StatusBar, Text, TextInput, I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Color, Styles, Languages} from '@common';
import {MyToast, MyNetInfo} from '@containers';
import Navigation from '@navigation';
import {applyMiddleware, compose, createStore} from 'redux';
import {persistStore} from 'redux-persist';
import {Provider} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import {WebView} from 'react-native-webview';
import {setCustomTextInput, setCustomText} from 'react-native-global-props';
import thunk from 'redux-thunk';
const middleware = [thunk];
import reducers from '@redux';
import {NavigationActions, StackActions} from 'react-navigation';
import MenuSide from '@components/LeftMenu/MenuScale';
import {InAppNotificationProvider} from 'react-native-in-app-notification';
import setDefaultProps from 'react-native-simple-default-props'

let store = null;
console.disableYellowBox = true;
store = compose(applyMiddleware(...middleware))(createStore)(reducers);

persistStore(store);

const customTextInputProps = {
  style: {
    fontFamily: 'Cairo-Regular',
    fontSize: 17,
  },
};

const customTextProps = {
  style: {
    fontFamily: 'Cairo-Regular',
    fontSize: 17,
  },
};

export default class ReduxWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };

    AsyncStorage.getItem('language', (err, result) => {
      if (result !== null) {
        if (result == 'ar') {
          I18nManager.forceRTL(true);
        }
        Languages.setLanguage(result);
      }
    });

   // setCustomTextInput(customTextInputProps);
   // setCustomText(customTextProps);
   setDefaultProps(Text, customTextProps);
   setDefaultProps(TextInput, customTextInputProps);
    if (WebView.defaultProps == null) WebView.defaultProps = {};
    WebView.defaultProps.useWebKit = true;
    this.goToScreen = this.goToScreen.bind(this);
    this.setupNotification = this.setupNotification.bind(this);
    //this.navigator = React.createRef();
  }

  goToScreen = (
    routeName,
    params,
    isReset = false,
    subRouteName = undefined
  ) => {
    const navigator = this.navigator;
    if (subRouteName == undefined) {
      navigator &&
        navigator.dispatch({
          type: 'Navigation/NAVIGATE',
          routeName: routeName,
          params,
        });
    } else {
      if (isReset) {
        const resetAction = StackActions.reset({
          routeName: routeName,
          index: 0,
          actions: [NavigationActions.navigate({routeName: subRouteName})],
        });
        navigator.dispatch(resetAction);
      } else {
        const navigateAction = StackActions.navigate({
          routeName: routeName,

          params: params,

          action: NavigationActions.navigate({
            routeName: subRouteName ? subRouteName : routeName,
          }),
        });

        navigator.dispatch(navigateAction);
      }
    }
  };

  componentDidMount() {
    if (Text.defaultProps == null) Text.defaultProps = {};
    if (TextInput.defaultProps == null) TextInput.defaultProps = {};

    Text.defaultProps.allowFontScaling = false;
    Text.defaultProps.style = {fontFamily: 'Cairo-Regular'};

    TextInput.defaultProps.allowFontScaling = false;
    this.setupNotification();
  }

  setupNotification() {
    const _this = this;
    this.removeNotificationOpenedListener = messaging().onNotificationOpenedApp(
      async (remoteMessage) => {
        // Get the action triggered by the notification being opened
        //const action = notificationOpen.action;
        // Get information about the notification that was opened
        const notification = remoteMessage;
        if (notification && notification.data && notification.data.userID) {
          setTimeout(() => {
            _this.goToScreen('ChatScreen', {
              ownerName: notification.data.name,
              sessionID: notification.data.sessionID,
              targetID: notification.data.userID,
              entityID: notification.data.entityID,
            });
          }, 1000);
        }
      }
    );

    //App closed in background
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          //const action = notificationOpen.action;
          // Get information about the notification that was opened
          const notification = remoteMessage;
          if (notification && notification.data && notification.data.userID) {
            setTimeout(() => {
              // alert(JSON.stringify(notification.data));
              _this.goToScreen('ChatScreen', {
                targetID: notification.data.userID,
                ownerName: notification.data.name,
                sessionID: notification.data.sessionID,
                entityID: notification.data.entityID,
              });
            }, 1500);
          }
        }
      });
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      if (remoteMessage) {
        // App was opened by a notification
        // Get the action triggered by the notification being opened
        //const action = notificationOpen.action;
        // Get information about the notification that was opened
        const notification = remoteMessage;
        if (notification && notification.data && notification.data.userID) {
          setTimeout(() => {
            // alert(JSON.stringify(notification.data));
            _this.goToScreen('ChatScreen', {
              targetID: notification.data.userID,
              ownerName: notification.data.name,
              sessionID: notification.data.sessionID,
              entityID: notification.data.entityID,
            });
          }, 1500);
        }
      }
    });

    messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage) {
        if (remoteMessage.data) {
          setTimeout(() => {
            _this.refs.notification &&
              _this.refs.notification.showNotification({
                title: Languages.YouHaveANewMessage + remoteMessage.data.name,
                message: '',
                icon: {
                  uri: `https://autobeeb.com/content/users/${remoteMessage.data.userID}/${remoteMessage.data.userID}_400x400.jpg?time=${this.state.date}`,
                },
                onPress: () => {
                  _this.goToScreen('ChatScreen', {
                    targetID: remoteMessage.data.userID,
                    ownerName: remoteMessage.data.name,
                    sessionID: remoteMessage.data.sessionID,
                    entityID: remoteMessage.data.entityID,
                  });
                },
              });
          }, 500);
        }
      }
    });
  }

  render() {
    return (
      <Provider store={store}>
        <InAppNotificationProvider
          ref="notification"
          closeInterval={5000}
          iconApp={require('@images/Portrait_Placeholder.png')}
          //    backgroundColour={"rgba(255,255,255,0.9)"}
        >
          <View style={Styles.app}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Navigation
              ref={(nav) => {
                this.navigator = nav;
              }}
            />
            <MyToast />
            <MyNetInfo />
          </View>
        </InAppNotificationProvider>
      </Provider>
    );
  }
}
