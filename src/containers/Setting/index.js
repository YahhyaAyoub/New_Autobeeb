"use strict";

import React, { Component } from "react";
import {
  Alert,
  View,
  StyleSheet,
  Text,
  Linking,
  TouchableOpacity,
  Modal,
  Share,
  Image,
  I18nManager,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { NewHeader } from "@containers";
import { connect } from "react-redux";
import LanguagePicker from "./LanguagePicker";
import { Color, Languages, Styles, Constants, Icons } from "@common";
import { PickerSelectModal } from "@components";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CountryPicker, {
  getAllCountries,
} from "react-native-country-picker-modal-kensoftware";

import { NavigationActions, StackActions } from "react-navigation";

import Entypo from "react-native-vector-icons/Entypo";

import ks from "@services/KSAPI";
import RNRestart from "react-native-restart";
import { ScrollView } from "react-native-gesture-handler";

class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      currency: this.props.ViewingCountry && this.props.ViewingCountry.currency,
      loadSignout: false,
    };
  }
  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
  componentDidMount() {
    ks.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: this.props.ViewingCurrency
        ? this.props.ViewingCurrency.ID
        : "2",
    })
      .then((result) => {
        if (result && result.Success) {
          //   alert(JSON.stringify(result));

          result.Currencies &&
            result.Currencies.forEach((cur) => {
              if (cur.ID == this.props.ViewingCurrency?.ID) {
                this.props.setViewingCurrency(cur);
              }
            });
        }
      })
      .catch((err) => {});
    ks.CurrenciesGet({
      langid: Languages.langID,
    }).then((data) => {
      if (data && data.Currencies) {
        this.setState({ Currencies: data.Currencies });
      }
    });
    AsyncStorage.getItem("cca2", (error, data) => {
      if (data) {
        this.setState({ cca2: data });
      }
    });
  }
  Logout() {
    this.props.editChat({type:'EDIT_CHAT', payload:false})
    setTimeout(() => {
      this.setPushNotification(this.props.user.ID, () => {
        AsyncStorage.setItem("user", "", () => {
          this.props.ReduxLogout();
          this.props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: "App" })],
            })
          );
        });
      });
    }, 200);
  }

  setPushNotification(ID, callback) {
    const _this = this;
    ks.SetUserToken({
      userid: ID,
      token: "",
    });
    if (callback) {
      callback();
    }
  }
  selectCountry(country) {
    this.props.setViewingCountry(country);

    this.setState({ cca2: country.cca2, currency: country.currency });
    AsyncStorage.multiSet(
      [
        ["cca2", country.cca2],
        ["country", JSON.stringify(country)],
        ["countryName", country.name],
      ],
      () => {
        setTimeout(() => {
          RNRestart.Restart();
        }, 500);
      }
    );
  }

  share() {
    Share.share({
      message:
        Languages.DownloadAutobeeb +
        "\n \n" +
        `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`,
    });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <NewHeader navigation={this.props.navigation} back />
        {this.state.Currencies && (
          <PickerSelectModal
            ref={"PickerSelectModal"}
            data={this.state.Currencies}
            onSelectOption={(data) => {
              if (data) {
                //    alert(JSON.stringify(data));

                Alert.alert(
                  Languages.ConfirmLanguage,
                  Languages.SwitchCurrencyConfirm,
                  [
                    {
                      text: Languages.CancelLanguage,
                      onPress: () => undefined,
                    },
                    {
                      text: Languages.okLanguage,
                      onPress: async () => {
                        this.props.setViewingCurrency(data);
                        setTimeout(() => {
                          RNRestart.Restart();
                        }, 2000);
                      },
                    },
                  ]
                );
              }
            }}
            ModalStyle={{
              width: Dimensions.get("screen").width * 0.7,
            }}
            SelectedOptions={[this.props.ViewingCurrency]}
          ></PickerSelectModal>
        )}
        <ScrollView style={[{ backgroundColor: "#FFF" }]}>
          {/* <RtlSwitch onTintColor={Color.headerTintColor}/>
        <LanguagePicker/> */}
          {this.state.cca2 && (
            <CountryPicker
              filterPlaceholder={Languages.Search}
              hideAlphabetFilter
              ref={(ref) => {
                this.countryPicker = ref;
              }}
              onChange={(value) => this.selectCountry(value)}
              filterable
              autoFocusFilter={false}
              closeable
              transparent
              cca2={this.state.cca2}
              translation={Languages.translation}
            >
              <View />
            </CountryPicker>
          )}
          <View style={styles.inputWrap}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  "mailto:info@autobeeb.com?subject=Autobeeb: Customer Service "
                  // +
                  //   '&body=' +
                  //   'From: ' +
                  //   (this.props.user && this.props.user.name
                  //     ? this.props.user.name
                  //     : '') +
                  //   '\n'
                );
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.text}>{Languages.contactus}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {
            <View style={styles.inputWrap}>
              <TouchableOpacity
                //hide
                onPress={() => {
                  this.props.navigation.navigate("PrivacyPolicy");
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.text}>{Languages.TermsAndCondition}</Text>
                </View>
              </TouchableOpacity>
            </View>
          }
          {
            <View style={styles.inputWrap}>
              <TouchableOpacity
                //hide
                onPress={() => {
                  this.props.navigation.navigate("PrivacyPolicy", {
                    isPrivacy: true,
                  });
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.text}>{Languages.PrivacyPolicy}</Text>
                </View>
              </TouchableOpacity>
            </View>
          }
          <View style={styles.inputWrap}>
            <TouchableOpacity
              onPress={() => {
                this.countryPicker.openModal();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                //    flex: 1,
                justifyContent: "space-between",
                // paddingVertical: 5,
              }}
            >
              <Text style={styles.text}>{Languages.Country}</Text>
              <Image
                style={{ width: 50, height: 30, marginHorizontal: 10 }}
                resizeMode={"contain"}
                source={{
                  uri:
                    "https://autobeeb.com/wsImages/flags/" +
                    this.state.cca2 +
                    ".png",
                }}
              />
            </TouchableOpacity>
          </View>
          {
            <View
              style={styles.inputWrap}
              //hide
            >
              <TouchableOpacity
                onPress={() => {
                  if (this.refs.PickerSelectModal) {
                    this.refs.PickerSelectModal.open();
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",

                  justifyContent: "space-between",
                  //      paddingVertical: 10,
                }}
              >
                <Text style={[styles.text]}>{Languages.Currency}</Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",

                    justifyContent: "space-between",
                    paddingVertical: 10,
                  }}
                >
                  {this.props.ViewingCurrency && (
                    <Text style={{}}>{this.props.ViewingCurrency.Name}</Text>
                  )}
                  <Entypo
                    name="triangle-down"
                    size={15}
                    color={"#000"}
                    style={{ marginHorizontal: 10 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          }
          <View style={styles.inputWrap}>
            <Text style={styles.text}>{Languages.AvailableLanguages}</Text>

            <LanguagePicker />
          </View>
          {this.props.user && (
            <View style={styles.inputWrap}>
              {this.state.loadSignout ? (
                <ActivityIndicator size="large" color={Color.primary} />
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ loadSignout: true }, () => this.Logout());
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.text}>{Languages.Logout}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
          <Text
            style={{
              // position: "absolute",
              margin: 10,
              marginTop: 40,
              color: "#000",
            }}
          >
            {Languages.Version + " 1.5.2_22"}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputWrap: {
    //flexDirection: "row",
    //  alignItems: "center",
    borderColor: Color.blackDivide,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  text: {
    fontFamily: "Cairo-Regular",
    textAlign: "left",
    fontSize: 17,
    padding: 5,
    paddingHorizontal: 10,
    color: Color.primary,
  },
});

const mapStateToProps = ({ listings, home, user, menu }) => {
  return {
    user: user.user,
    ViewingCountry: menu.ViewingCountry,
    ViewingCurrency: menu.ViewingCurrency,
  };
};

const mapDispatchToProps = (dispatch) => {
  const MenuRedux = require("@redux/MenuRedux");
  const UserRedux = require("@redux/UserRedux");

  return {
    setViewingCountry: (country, callback) =>
      MenuRedux.actions.setViewingCountry(dispatch, country, callback),

    setViewingCurrency: (currency, callback) =>
      MenuRedux.actions.setViewingCurrency(dispatch, currency, callback),

    ReduxLogout: () => dispatch(UserRedux.actions.logout()),

    editChat:(data)=> dispatch(data)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Setting);
