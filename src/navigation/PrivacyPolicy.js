import React, { Component } from "react";
import { View, I18nManager, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import NewHeader from "../containers/NewHeader";
import { NavigationEvents } from "react-navigation";

export class PrivacyPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    if (this.props.navigation.getParam("isPrivacy", false)) {
      this.setState({
        link: {
          uri: I18nManager.isRTL
            ? "https://autobeeb.com/ar/page/privacy-policy/1"
            : "https://autobeeb.com/page/privacy-policy/1",
        },
        loading: false,
      });
    } else {
      this.setState({
        link: {
          uri: I18nManager.isRTL
            ? "https://autobeeb.com/ar/page/terms-and-conditions/9"
            : "https://autobeeb.com/page/terms-and-conditions/9",
        },
        loading: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1 }}>
          <NewHeader
            navigation={this.props.navigation}
            back
            onCountryChange={(item) => {
              this.setState({ cca2: item.cca2 });
            }}
          />
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator size="large" color={'#F85502'}/>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        {this.props.navigation && (
          <NavigationEvents
            //  onWillFocus={payload => console.log('will focus', payload)}
            onWillBlur={() => {
              this.setState({ loading: true });
            }}
            //   onDidBlur={payload => console.log('did blur', payload)}
          />
        )}
        <NewHeader
          navigation={this.props.navigation}
          back
          onCountryChange={(item) => {
            this.setState({ cca2: item.cca2 });
          }}
        />
        {this.state.link && (
          <WebView
            style={{ flex: 1 }}
            source={this.state.link}
            androidHardwareAccelerationDisabled
          />
        )}
      </View>
    );
  }
}

export default PrivacyPolicy;
