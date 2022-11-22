import {
  GiftedChat,
  Bubble,
  Avatar,
  Send,
  SendProps,
} from "react-native-gifted-chat";
//import liraries
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
  I18nManager,
  Platform,
  AppState,
  StatusBar,
  LayoutAnimation,
  UIManager,
} from "react-native";
import NewHeader from "../containers/NewHeader";
import { Color, Languages } from "@common";
import { connect } from "react-redux";
import LogoSpinner from "../components/LogoSpinner";
import messaging from "@react-native-firebase/messaging";
import ks from "@services/KSAPI";
import { isIphoneX } from "react-native-iphone-x-helper";
import IconEn from "react-native-vector-icons/Feather";
import IconMC from "react-native-vector-icons/MaterialCommunityIcons";
import { NavigationActions, StackActions } from "react-navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { toast } from "@app/Omni";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// create a component
class ChatScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
  });

  state = {
    messages: [],
    loading: true,
    text: "",
    canDelete: false,
    appState: AppState.currentState,
  };
  Logout() {
    AsyncStorage.setItem("user", "", () => {
      this.props.ReduxLogout();
      //    this.props.navigation.navigate("HomeScreen");
    });
  }
  componentDidMount = async () => {
    this.setupNotification();

    let userJson = await AsyncStorage.getItem("user");
    let user = JSON.parse(userJson);
    if (this.props.user) {
      this.setPushNotification(this.props.user && this.props.user.ID);
    }

    AppState.addEventListener("change", this._handleAppStateChange);

    let UserData = await ks.UserGet({
      userID: (this.props.user && this.props.user.ID) || user?.ID,
      langid: Languages.langID,
    });
    if (UserData.User != null) {
      //  alert(JSON.stringify(UserData.User));
      if (UserData?.User?.IsActive == false) {
        toast(Languages.AccountBlocked, 3500);

        this.props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: "App" })],
          })
        );
      } else {
        /*alert(
          UserData.User.ID +
            ' | ' +
            this.props.navigation.state.params.targetID +
            ' | ' +
            this.props.navigation.state.params.sessionID
        );*/
        this.props.getCommunication(
          UserData.User.ID,
          this.props.navigation.state.params.targetID,
          this.state.sessionID
            ? this.state.sessionID
            : this.props.navigation.state.params.sessionID,
          this.props.navigation.state.params.entityID,
          (data) => {
            // alert(JSON.stringify(data));
            this.setState({
              RelatedEntity: JSON.parse(data.RelatedEntity),
              messages: data.Messages,
              loading: false,
              sessionID: data.SessionID,
            });
          }
        );
      }
    } else {
      this.Logout();
      toast(Languages.AccountDeleted, 3500);
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: "App" })],
        })
      );
    }

    this.props.navigation.state.params &&
      this.props.navigation.state.params.description &&
      this.setState({
        description: this.props.navigation.getParam("description", "اعلانك"),
      });

    this.props.navigation.state.params &&
      this.props.user &&
      this.props.getCommunication(
        this.props.user && this.props.user.ID,
        this.props.navigation.state.params.targetID,
        this.state.sessionID
          ? this.state.sessionID
          : this.props.navigation.state.params.sessionID,
        this.props.navigation.state.params.entityID,
        (data) => {
          this.setState({
            RelatedEntity: JSON.parse(data.RelatedEntity),
            messages: data.Messages,
            loading: false,
            sessionID: data.SessionID,
          });
        }
      );
  };

  componentDidUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      if (this.props.user) {
        this.props.getCommunication(
          this.props.user && this.props.user.ID,
          this.state.notificationData && this.state.notificationData.userID
            ? this.state.notificationData.userID
            : this.props.navigation.getParam("targetID", 0),
          this.state.sessionID
            ? this.state.sessionID
            : this.props.navigation.state.params.sessionID,
          this.props.navigation.state.params.entityID,
          (data) => {
            this.setState({
              sessionID: data.SessionID,
              messages: data.Messages,
              loading: false,
            });
          }
        );
      }
    }
    this.setState({ appState: nextAppState });
  };

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

    //App in foreground
    _this.notificationListener = messaging().onMessage(
      async (remoteMessage) => {
        if (remoteMessage) {
          if (remoteMessage.data) {
            this.props.getCommunication(
              this.props.user && this.props.user.ID,
              remoteMessage.data.userID,
              remoteMessage.data.sessionID,
              remoteMessage.data.entityID,
              (data) => {
                this.setState({
                  sessionID: data.SessionID,
                  messages: data.Messages,
                  notificationData: remoteMessage.data,
                  secondPartyName: remoteMessage.data.name,

                  loading: false,
                });
              }
            );
          }
        }
      }
    );

    // firebase.notifications().onNotificationOpened((notificationOpen) => {
    messaging().onNotificationOpenedApp((notification) => {
      // Get the action triggered by the notification being opened
      //const action = notificationOpen.action;
      // Get information about the notification that was opened
      //const notification = remoteMessage.notification;
      if (notification && notification.data) {
        this.props.getCommunication(
          this.props.user && this.props.user.ID,
          notification.data.userID,
          notification.data.sessionID,
          notification.data.entityID,
          (data) => {
            this.setState({
              sessionID: data.SessionID,
              messages: data.Messages,
              notificationData: notification.data,
              secondPartyName: notification.data.name,
              loading: false,
            });
          }
        );
      }
    });
    //App closed in background
  }

  onSend(messages = []) {
    //  alert(JSON.stringify(messages[0]))

    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));

    ks.SendMessage({
      senderID: this.props.user && this.props.user.ID,
      receiverID: this.props.navigation.state.params.targetID,
      message: messages[0].text,
      sessionID: this.state.sessionID,
    });
  }
  renderSend(props) {
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <IconMC
            name={"send"}
            size={25}
            style={
              I18nManager.isRTL
                ? { transform: [{ rotate: "180deg" }], marginBottom: 5 }
                : {}
            }
            color={Color.secondary}
          />
        </View>
      </Send>
    );
  }

  render() {
    if (this.state.loading) {
      return <LogoSpinner fullStretch />;
    }
    return (
      <View
        style={[
          {
            flex: 1,
          },
        ]}
      >
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />

        <View
          style={{
            width: Dimensions.get("window").width,
            backgroundColor: "#fff",
            paddingVertical: 5,

            zIndex: 10,
            alignItems: "center",
            paddingTop: Platform.select({
              ios: isIphoneX() ? 50 : 40,
              android: 20,
            }),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: Dimensions.get("screen").width,
              //    justifyContent: "center",
              //    backgroundColor: "red"
            }}
          >
            <TouchableOpacity
              style={{ marginHorizontal: 10 }}
              onPress={() => {
                this.props.navigation.goBack();
              }}
            >
              <IconEn
                name={I18nManager.isRTL ? "arrow-right" : "arrow-left"}
                size={25}
                color={Color.secondary}
              />
            </TouchableOpacity>
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 100,
                marginHorizontal: 10,
                //   marginVertical: 5
              }}
              resizeMode="contain"
              onError={(data) => {
                this.setState({ noImage: true });
              }}
              source={
                this.state.noImage
                  ? {
                      uri:
                        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
                      width: 50,
                      height: 50,
                    }
                  : {
                      uri: `https://autobeeb.com/content/users/${this.props.navigation.getParam(
                        "targetID",
                        0
                      )}/${this.props.navigation.getParam(
                        "targetID",
                        0
                      )}_400x400.jpg`,
                    }
              }
            />
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={(data) => {
                ks.UserGet({
                  userID:
                    this.state.notificationData &&
                    this.state.notificationData.userID
                      ? this.state.notificationData.userID
                      : this.props.navigation.getParam("targetID", 0),
                  langid: Languages.langID,
                }).then((data) => {
                  //   alert(JSON.stringify(data));
                  if (data && data.Success == 1) {
                    if (data.User.IsDealer) {
                      this.props.navigation.navigate("DealerProfileScreen", {
                        userid:
                          this.state.notificationData &&
                          this.state.notificationData.userID
                            ? this.state.notificationData.userID
                            : this.props.navigation.getParam("targetID", 0),
                      });
                    } else {
                      this.props.navigation.navigate("UserProfileScreen", {
                        userid:
                          this.state.notificationData &&
                          this.state.notificationData.userID
                            ? this.state.notificationData.userID
                            : this.props.navigation.getParam("targetID", 0),
                      });
                    }
                  }
                });
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  textAlign: "left",
                  fontSize: 16,
                  lineHeight: 22,
                  flex: 1,
                  // fontFamily: "Cairo-Bold",
                  color: Color.primary,
                }}
              >
                {this.props.navigation.getParam(
                  "ownerName",
                  this.state.secondPartyName || "User"
                )}
              </Text>
              {this.state.RelatedEntity && (
                <Text numberOfLines={1} style={{ textAlign: "left" }}>
                  {this.state.RelatedEntity.Name}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <GiftedChat
          ref="Chat"
          messages={this.state.messages}
          isAnimated
          keyboardShouldPersistTaps="never"
          onSend={(messages) => this.onSend(messages)}
          //  renderAvatarOnTop
          placeholder={Languages.TypeHere}
          renderBubble={(props) => {
            return (
              <Bubble
                {...props}
                wrapperStyle={{
                  right: {
                    //    alignSelf: I18nManager.isRTL ? "flex-start" : "flex-end",

                    backgroundColor: Color.secondary,
                  },
                  left: {
                    //   alignSelf: I18nManager.isRTL ? "flex-end" : "flex-start"
                  },
                }}
                timeProps={{
                  textStyle: {
                    right: { color: "black" },
                  },
                }}
                textStyle={{
                  right: {
                    fontSize: 18,
                    lineHeight: 27,
                  },
                  left: {
                    fontSize: 18,
                    lineHeight: 27,
                  },
                }}
              />
            );
          }}
          user={{
            _id: this.props.user && this.props.user.ID,
          }}
          renderSend={this.renderSend}
          label={Languages.Send}
          text={this.state.text}
          textInputStyle={{
            fontSize: 18,
            lineHeight: 27,

            textAlign: I18nManager.isRTL ? "right" : "left",
            fontFamily: "Cairo-Regular",
          }}
          optionTitles={[Languages.CopyText, Languages.Cancel]}
          renderAvatar={null}
          //  textStyle={{ fontFamily: "Cairo-Regular", fontSize: 18 }}
          onInputTextChanged={(text) => {
            if (text != "") {
              this.setState({ text: text, canDelete: true });
            }
            if (text == "" && this.state.canDelete) {
              this.setState({ text: text });
            }
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3e50",
  },
});

const mapStateToProps = ({ user }) => {
  return {
    user: user.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  const HomeRedux = require("@redux/HomeRedux");
  const UserRedux = require("@redux/UserRedux");

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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);
