import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import Color from '../../common/Color';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';

class ChatIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatIconDot: 'false',
    };
  }

  componentDidMount() {
    this.setupNotification();
  }

  // componentDidUpdate(){
  //    this.props.focused&&this.props.editChat({type:'EDIT_CHAT', payload:false})
  // }

  setupNotification() {
    const _this = this;
    this.removeNotificationOpenedListener = messaging().onNotificationOpenedApp(
      async (remoteMessage) => {
        const notification = remoteMessage;
        if (notification && notification.data && notification.data.userID) {
          this.showRedDot();
        }
      }
    );

    //App closed in background
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          const notification = remoteMessage;

          if (notification && notification.data && notification.data.userID) {
            this.showRedDot();
          }
        }
      });
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      if (remoteMessage) {
        const notification = remoteMessage;
        if (notification && notification.data && notification.data.userID) {
          this.showRedDot();
        }
      }
    });

    messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage) {
        if (remoteMessage.data) {
          this.showRedDot();
        }
      }
    });
  }

  showRedDot = () => {
    this.props.editChat({type: 'EDIT_CHAT', payload: true});
  };

  render() {
    return (
      <View style={{}}>
        <IconIon
          name="md-chatbubbles"
          color={this.props.focused ? Color.secondary : Color.tabBarInactive}
          size={20}
        />
        {this.props?.chat ? (
          <View style={styles.whiteDot}>
            <View style={styles.redDot} />
          </View>
        ) : null}
      </View>
    );
  }
}

const mapStateToProps = ({chat}) => ({
  chat: chat.chat,
});

const mapDispatchToProps = (dispatch) => {
  return {
    editChat: (data) => dispatch(data),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatIcon);

const styles = StyleSheet.create({
  whiteDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -2,
    left: -4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },
  redDot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: Color.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
