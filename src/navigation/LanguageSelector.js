import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Platform,
  I18nManager,
  FlatList,
} from "react-native";
import { Color, Languages, Styles, Constants } from "@common";
import RNRestart from "react-native-restart";
import { connect } from "react-redux";
import { NavigationActions } from "react-navigation";
import CountryPicker, {
  getAllCountries,
} from "react-native-country-picker-modal-kensoftware";
import DeviceInfo from "react-native-device-info";
import CarrierInfo from "react-native-carrier-info";
import AsyncStorage from "@react-native-async-storage/async-storage";

import KS from "@services/KSAPI";
import { toast } from "@app/Omni";

const navigateAction = NavigationActions.navigate({
  routeName: "LoginScreen",

  params: {},

  action: NavigationActions.navigate({ routeName: "LoginScreen" }),
});

let ArabicLanguageList = [
  "IL",
  "JO",
  "PS",
  "SY",
  "LB",
  "IQ",
  "SA",
  "QA",
  "OM",
  "BH",
  "KW",
  "AE",
  "SD",
  "SO",
  "DZ",
  "MA",
  "TN",
  "KM",
  "LY",
  "EG",
  "YE",
  "MR",
  "DJ",
];

let LangaugesList = [
  {
    flag: "https://autobeeb.com/wsImages/flags/gb.png",
    ID: "1",
    Name: "English",
    Direction: "ltr",
    InverseDirection: false,
    Prefix: "en",
  },
  {
    flag: "https://autobeeb.com/wsImages/flags/sa.png",
    ID: "2",
    Name: "العربية",
    Direction: "rtl",
    InverseDirection: true,
    Prefix: "ar",
  },
  {
    ID: "3",
    Name: "Deutsche",
    flag: "https://autobeeb.com/wsImages/flags/de.png",
    Encoding: "windwos-1256",
    Direction: "ltr",
    InverseDirection: false,
    Culture: "de-DE",
    Prefix: "de",
  },
  {
    ID: "4",
    Name: "Español",
    flag: "https://autobeeb.com/wsImages/flags/es.png",
    Encoding: "windows-1256",
    Direction: "ltr",
    InverseDirection: false,
    Culture: "es-ES",
    Prefix: "es",
  },
  {
    ID: "5",
    Name: "Türkçe",
    flag: "https://autobeeb.com/wsImages/flags/tr.png",
    Encoding: "windows-1256",
    Direction: "ltr",
    InverseDirection: false,
    Culture: "tr-TR",
    Prefix: "tr",
  },
  {
    ID: "6",
    Name: "français",
    flag: "https://autobeeb.com/wsImages/flags/fr.png",
    Encoding: "windows-1256",
    Direction: "ltr",
    InverseDirection: false,
    Culture: "fr-FR",
    Prefix: "fr",
  },
  {
    ID: "7",
    Name: "Polskie",
    flag: "https://autobeeb.com/wsImages/flags/pl.png",
    Encoding: "windows-1256",
    Direction: "ltr",
    InverseDirection: false,
    Culture: "pl-PL",
    Prefix: "pl",
  },
  {
    ID: "8",
    Name: "中文",
    flag: "https://autobeeb.com/wsImages/flags/cn.png",
    Encoding: "windows-1256",
    Direction: "ltr",
    InverseDirection: false,
    Culture: "zh-CN",
    Prefix: "zh",
  },
];

class LanguageSelector extends Component {
  constructor(props) {
    super(props);
    let userLocaleCountryCode = DeviceInfo.getDeviceCountry();
    //   alert(JSON.stringify(DeviceInfo.getTimezone()));
    //alert (JSON.stringify (userLocaleCountryCode));

    this.state = {
      cca2: userLocaleCountryCode || "US",
      countryName:
        getAllCountries().filter(
          (country) => country.cca2 == userLocaleCountryCode
        ).length > 0
          ? getAllCountries().filter(
              (country) => country.cca2 == userLocaleCountryCode
            )[0].name.common
          : "United States",
      country: getAllCountries().filter(
        (country) => country.cca2 == userLocaleCountryCode
      )[0],
      //  country:
      countries: {},
      selectedLanguage: {
        flag:
          "https://eu4.paradoxwikis.com/images/thumb/2/2b/Great_Britain.png/495px-Great_Britain.png",
        ID: "1",
        Name: "English",
        Direction: "ltr",
        InverseDirection: false,
        Prefix: "en",
      },
      Langauges: LangaugesList,
      countryPickerShown: true,
    };
  }

  componentDidMount() {
    try {
      CarrierInfo.isoCountryCode().then((result) => {
        this.setState(
          {
            cca2: result == "il" ? "PS" : result.toUpperCase(),
            countryName: getAllCountries().filter(
              (country) => country.cca2 == result.toUpperCase()
            )[0].name.common,
            country: getAllCountries().filter(
              (country) => country.cca2 == result.toUpperCase()
            )[0],
          },
          () => {
            /*fetch("https://restcountries.eu/rest/v2/alpha/" + result)
              .then((response) => response.text())
              .then((response) => JSON.parse(response))
              .then((responseData) => {
                let tempCountry = {
                  cca2: this.state.cca2,
                  name: this.state.countryName,
                };

                this.setState({
                  selectedLanguage:
                    ArabicLanguageList.filter((x) => x == result.toUpperCase())
                      .length > 0
                      ? LangaugesList[1]
                      : LangaugesList.find(
                          (lang) =>
                            lang.Prefix == responseData.languages[0].iso639_1
                        ),
                  country: tempCountry,
                });
              });*/
              this.setState({
                selectedLanguage:
                  ArabicLanguageList.filter((x) => x == this.state.cca2.toUpperCase())
                    .length > 0
                    ? LangaugesList[1]
                    : LangaugesList[0],
              },()=>{
               // console.log(this.state.selectedLanguage.Prefix);
                Languages.setLanguage(this.state.selectedLanguage.Prefix);
                this.setState({reload:true}); //to force reload of the page
              });
          }
        );
      });
    } catch (err) {
      this.setState({
        selectedLanguage:
          ArabicLanguageList.filter((x) => x == this.state.cca2.toUpperCase())
            .length > 0
            ? LangaugesList[1]
            : LangaugesList[0],
      });
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Image
            source={require("@images/autobeeb.png")}
            style={{
              width: Styles.width * 0.7,
              height: (Styles.width * 0.7) / 2.5,
            }}
            resizeMode={"contain"}
          />
        </View>

        <View style={styles.LanguagesWrap}>
          <Text
            style={{
              fontSize: 25,
              //    fontWeight: "bold",
              textAlign: "center",
              color: "#000",
              marginBottom: 10,
            }}
          >
            {Languages.Country}
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-evenly",
              backgroundColor: "#f8f8f8",
              borderWidth: 1,
              alignSelf: "center",
              borderRadius: 5,
              borderColor: Color.secondary,

              width: Dimensions.get("screen").width * 0.7,
              paddingVertical: 15,
            }}
            onPress={() => {
              this.refs.countryPicker.openModal();
            }}
          >
            {this.state.countryPickerShown && (
              <CountryPicker
                filterPlaceholder={Languages.Search}
                hideAlphabetFilter
                ref="countryPicker"
                filterable
                autoFocusFilter={false}
                closeable
                transparent
                styles={pickerStyles}
                onChange={(value) => {
                  this.setState(
                    {
                      cca2: value.cca2,
                      countryName: value.name,
                      country: value,
                    },
                    () => {
                      this.props.setViewingCountry(value);
                    }
                  );
                }}
                cca2={this.state.cca2}
                translation={Languages.translation}
              />
            )}
            {this.state.countryName && (
              <Text
                style={{
                  color: "#111",
                  fontSize: Constants.mediumFont,
                  fontFamily: "Cairo-Bold",
                }}
              >
                {this.state.countryName}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.LanguagesWrap}>
          <Text
            style={{
              fontSize: 25,
              //    fontWeight: "bold",
              textAlign: "center",
              color: "#000",
              marginBottom: 10,
            }}
          >
            {Languages.Language}
          </Text>

          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={4}
            data={this.state.Langauges}
            style={{ marginLeft: 20, alignSelf: "center" }}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    width: 75,
                  }}
                  onPress={() => {
                    Languages.setLanguage(item.Prefix);

                    this.setState(
                      { selectedLanguage: item, countryPickerShown: false },
                      (data) => {
                        this.setState({ countryPickerShown: true });
                      }
                    );
                    KS.CountryGet({
                      langID: item.ID,
                      isocode: this.state.cca2,
                    }).then((data) => {
                      if (data && data.Success) {
                        this.setState({ countryName: data.Country.Name });
                        //   alert(JSON.stringify(data));
                      }
                    });
                  }}
                >
                  <Image
                    style={[
                      { width: 50, height: 50 },
                      this.state.selectedLanguage &&
                        this.state.selectedLanguage.ID == item.ID && {
                          borderWidth: 3,
                          borderColor: Color.primary,
                          width: 75,
                          height: 40,
                        },
                    ]}
                    resizeMode={"cover"}
                    source={{ uri: item.flag }}
                  />
                  <Text
                    style={[
                      this.state.selectedLanguage &&
                      this.state.selectedLanguage.ID === item.ID
                        ? {
                            color: Color.primary,
                            fontSize: 18,
                          }
                        : {
                            color: "#000",
                            fontSize: 18,
                          },
                    ]}
                  >
                    {item.Name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#1C7EA5",
            width: Dimensions.get("screen").width * 0.5,
            alignSelf: "center",
            borderRadius: 5,
          }}
          onPress={() => {
            if (this.state.selectedLanguage != null) {
              if (!this.state.country) {
                this.setState(
                  {
                    country: {
                      cca2: this.state.cca2,
                      name: this.state.countryName,
                    },
                  },
                  () => {
                    KS.CurrencyGetByISOCode({
                      langid: this.state.selectedLanguage.ID,
                      isoCode: this.state.cca2,
                    }).then((curr) => {
                      //  alert(JSON.stringify(curr));
                      global.ViewingCurrency = curr.currency;
                      this.props.setViewingCurrency(curr.currency);
                    });

                    AsyncStorage.multiSet(
                      [
                        ["language", this.state.selectedLanguage.Prefix],
                        ["cca2", this.state.cca2],
                        ["country", JSON.stringify(this.state.country)],

                        ["countryName", this.state.countryName],
                      ],
                      () => {
                        if (this.state.selectedLanguage.InverseDirection) {
                          I18nManager.forceRTL(true);
                        }
                        AsyncStorage.setItem(
                          "SkipLanguage",
                          JSON.stringify(true),
                          () => {
                            RNRestart.Restart();
                          }
                        );
                      }
                    );
                  }
                );
              } else {
                KS.CurrencyGetByISOCode({
                  langid: this.state.selectedLanguage.ID,
                  isoCode: this.state.cca2,
                }).then((curr) => {
                  //  alert(JSON.stringify(curr));
                  global.ViewingCurrency = curr.currency;
                  this.props.setViewingCurrency(curr.currency);
                });
                AsyncStorage.multiSet(
                  [
                    ["language", this.state.selectedLanguage.Prefix],
                    ["cca2", this.state.cca2],
                    ["country", JSON.stringify(this.state.country)],

                    ["countryName", this.state.countryName],
                  ],
                  () => {
                    if (this.state.selectedLanguage.InverseDirection) {
                      I18nManager.forceRTL(true);
                    }
                    AsyncStorage.setItem(
                      "SkipLanguage",
                      JSON.stringify(true),
                      () => {
                        RNRestart.Restart();
                      }
                    );
                  }
                );
              }
            } else {
              toast(Languages.SelectLanguageFirst);
            }

            //    this.props.navigation.navigate("LoginScreen");
          }}
          //    onPress={() => {
          //     if(!this.state.country){
          //     this.setState({country:{cca2:this.state.cca2,name:this.state.countryName}})

          //     }

          //  }}
        >
          <Text
            style={{
              paddingVertical: 15,
              paddingHorizontal: 30,
              color: "white",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            {Languages.Next}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const pickerStyles = StyleSheet.create({
  // modalContainer: {
  //   backgroundColor: "rgba(0,0,0,0.4)",
  //   alignItems: "center",
  //   width: Dimensions.get("screen").width
  // },
  // contentContainer: {
  //   width: Dimensions.get("screen").width * 0.85,
  //   height: Dimensions.get("screen").height,
  //   flex: 1,
  //   alignSelf: "center",
  // }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",

    backgroundColor: "#f6f6f6",
  },

  logoWrap: {
    ...Styles.Common.ColumnCenter,
    //   flexGrow: 1
    //   backgroundColor: "red",
    zIndex: 0,
    //  marginHorizontal: 110
  },
  logo: {
    width: Styles.width * 0.8,
    height: (Styles.width * 0.8) / 2,
  },
  subContain: {
    // borderWidth: 1,
    // borderColor: "#000",
    paddingHorizontal: 35,
    paddingBottom: 120,
  },
  loginForm: {},
  inputWrap: {
    flexDirection: "row",
    borderColor: "#F05152",
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 5,
    height: 45,
    width: Dimensions.get("screen").width * 0.8,
    alignSelf: "center",
  },
  input: {
    borderColor: "#9B9B9B",
    height: 40,
    marginLeft: 5,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    textAlign: I18nManager.isRTL ? "right" : "left",
    flex: 1,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: Color.background,
    borderColor: Color.primary,
    borderWidth: 1,
    width: 230,
    height: 30,
    alignSelf: "center",

    // borderRadius: 5,
    // elevation: 1,
  },
  separatorWrap: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  Skip: {
    alignContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: Platform.OS === "ios" ? 25 : 55,
    width: Styles.width,

    //left: Styles.width * 0.1
  },
  PrivacyController: {
    alignContent: "center",
    alignItems: "center",
    position: "absolute",
    width: Styles.width,
    bottom: Platform.OS === "ios" ? 0 : 30,
    //left: Styles.width * 0.1
  },
  SkipText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
  },
  Forgot: {
    textAlign: "center",
    color: Color.primary,
    fontSize: 12,
  },
  separator: {
    borderBottomWidth: 1,
    flexGrow: 1,
    borderColor: Color.blackTextDisable,
  },
  separatorText: {
    color: Color.blackTextDisable,
    paddingHorizontal: 10,
  },
  fbButton: {
    // backgroundColor: Color.facebook,
    borderRadius: 5,
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    // elevation: 1,
    // width: 230,
    // height: 30,
    //  height: 120,
    //    width: 20,
    // flex: 1,
    paddingVertical: 20,
    //    paddingHorizontal: 10,
    //  alignSelf: "center",
    //  marginHorizontal: 60,
    maxWidth: 300,
    overflow: "hidden",
    // marginBottom: 20
  },
  // ggButton: {
  //     marginVertical: 10,
  //     backgroundColor: Color.google,
  //     borderRadius: 5,
  // },
  signUp: {
    color: Color.blackTextSecondary,
    marginTop: 5,
    fontSize: 12,
  },
  highlight: {
    alignSelf: "flex-end",
    fontWeight: "bold",
    color: Color.primary,
    fontSize: 12,
  },
  ColumnCenter: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 45,
    marginBottom: 10,
  },
  privacyPolicy: {
    color: "#888",
    fontSize: 12,

    alignSelf: "center",
  },
});

const mapStateToProps = ({ menu }) => ({
  ViewingCountry: menu.ViewingCountry,
});

const mapDispatchToProps = (dispatch) => {
  const { actions } = require("@redux/MenuRedux");

  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),
    setViewingCurrency: (currency, callback) =>
      actions.setViewingCurrency(dispatch, currency, callback),

    //  fetchListings: (parentid) => Listingredux.actions.fetchListings(dispatch, parentid, 1)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);
