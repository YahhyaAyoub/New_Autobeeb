import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  Image,
  TextInput,
  ImageBackground,
  BackHandler,
  Platform,
  TouchableOpacity,
  NativeModules,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from "prop-types";
import Awesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { connect } from "react-redux";
import { Icons, Color, Languages, Styles, Images, Constants } from "@common";
import { I18nManager } from "react-native";
import { NewHeader } from "@containers";
import ks from "@services/KSAPI";
import Toast, { DURATION } from "react-native-easy-toast";
import Modal from "react-native-modalbox";
import PhoneInput from "react-native-phone-input-kensoftware";
import CountryPicker, {
  getAllCountries,
} from "react-native-country-picker-modal-kensoftware";
import * as Animatable from "react-native-animatable";
import IconMC from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationActions, StackActions } from "react-navigation";
//
import IconEn from "react-native-vector-icons/Entypo";
import { toast } from "@app/Omni";
var ImagePicker = NativeModules.ImageCropPicker;

const WIDTH = Dimensions.get("screen").width;
const { height, width } = Dimensions.get("screen");
var delayCounter2;

class EditProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.user ? this.props.user?.name : "",
      phone: this.props.user ? this.props.user?.phone : "",
      loading: false,
      date: new Date(),
      isUploadClicked: true,
      hasImage: true,
      profilePic:
        "http://autobeeb.com" +
        "/content/users/" +
        props.user?.ID +
        "/" +
        props.user?.ID +
        "_400x400.jpg",
      imageRefreshCount: 0,
      resendResetCodeCounter: Languages.Resend,
      disabledResetCode: false,
      passwordHidden: true,
      PaymentPending: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user != this.props.user) {
      this.setState({ date: new Date() });
    }
  }

  componentDidMount() {
    if (this.props.user?.IsActive == false) {
      toast(Languages.AccountBlocked, 3500);

      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: "App" })],
        })
      );
    } else {
      AsyncStorage.getItem("cca2", (error, data) => {
        if (data) {
          this.setState({ cca2: data });
        }
      });

      ks.CountriesGet({ langid: Languages.langID }).then((CountriesData) => {
        if (CountriesData && CountriesData.Success == "1") {
          this.setState({ CountriesData: CountriesData.Countries });
        }
      });

      ks.UserGet({
        userID: this.props.user.ID,
        langid: Languages.langID,
      }).then((data) => {
        //   alert(JSON.stringify(data));
        if (data && data.Success == 1) {
          this.props.storeUserData(data.User);
        }
      });

      if (this.props.navigation.getParam("ChangePhone", false)) {
        this.refs.ChangePhoneModal.open();
      }
      if (this.props.navigation.getParam("ChangeEmail", false)) {
        this.refs.ChangeEmailModal.open();
      }

      if (this.props.navigation.getParam("VerifyPhone", false)) {
        this.refs.VerifyPhoneModal.open();
      }
      if (this.props.navigation.getParam("VerifyEmail", false)) {
        this.refs.VerifyEmailModal.open();
      }

      if (
        this.props.user &&
        ((this.props.user?.EmailRegister && this.props.user.EmailConfirmed) ||
          (!this.props.user?.EmailRegister && this.props.user.OTPConfirmed))
      ) {
        ks.PlansGet({
          langid: Languages.langID,
          isocode: this.props.user?.ISOCode,
        }).then((data) => {
          if (data?.Plans?.length > 0) {
            this.setState({ PaymentPending: true, Plans: data.Plans });
          }
        });
      }
    }
  }

  selectCountry(country) {
    if (this.phone) {
      this.phone.selectCountry(country.cca2.toLowerCase());
    } else if (this.phone2) {
      this.phone2.selectCountry(country.cca2.toLowerCase());
    }
    this.setState({ cca2: country.cca2 });
  }

  onPressFlag() {
    this.countryPicker.openModal();
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  convertToNumber(number) {
    if (number) {
      number = number + "";
      return number
        .replace(/٠/g, "0")
        .replace(/،/g, ".")
        .replace(/٫/g, ".")
        .replace(/,/g, ".")
        .replace(/١/g, "1")
        .replace(/٢/g, "2")
        .replace(/٣/g, "3")
        .replace(/٤/g, "4")
        .replace(/٥/g, "5")
        .replace(/٦/g, "6")
        .replace(/٧/g, "7")
        .replace(/٨/g, "8")
        .replace(/٩/g, "9");
    } else return "";
  }

  pickSingleBase64(mode) {
    if (mode === "camera") {
      ImagePicker.openCamera({
        mediaType: "photo",
        multiple: false,
        waitAnimationEnd: false,
        cropping: true,
        includeExif: true,
        includeBase64: true,
        width: 300,
        height: 300,
      })
        .then((image) => {
          this.setState(
            {
              isUploadClicked: true,
              Base64Img: image.data,
              imgMime: image.mime.split("/")[1],
              profilePic: `data:${image.mime};base64,` + image.data,
              hasImage: false,
            },
            () => {
              ks.UploadImage({
                userid: this.props.user ? this.props.user?.ID : "",
                fileextension: image.mime.split("/")[1],

                base64: image.data,
              }).then((data) => {
                if (data && data.Success) {
                  this.props.storeUserData(data.User);
                } else {
                  alert(Languages.SomethingWentWrong);
                }
              });
            }
          );
        })
        .catch((e) => {
          if (e.code === "E_PERMISSION_MISSING") {
            alert(e);
          }
        });
    } else {
      ImagePicker.openPicker({
        mediaType: "photo",
        width: 300,
        height: 300,
        cropping: true,
        includeBase64: true,
        includeExif: true,
      })
        .then((image) => {
          this.setState(
            {
              isUploadClicked: true,
              Base64Img: image.data,
              imgMime: image.mime.split("/")[1],
              //imgMime: `${this.props.user?.id}.${image.mime.split("/")[1]}`,
              profilePic: `data:${image.mime};base64,` + image.data,
              hasImage: false,
            },
            () => {
              ks.UploadImage({
                userid: this.props.user ? this.props.user?.ID : "",
                fileextension: image.mime.split("/")[1],

                base64: image.data,
              }).then((data) => {
                if (data && data.Success) {
                  this.props.storeUserData(data.User);
                } else {
                  alert(Languages.SomethingWentWrong);
                }
              });
            }
          );
        })
        .catch((e) => {
          if (e.code === "E_PERMISSION_MISSING") {
            alert(e);
          }
        });
    }
  }

  resendInitCounter = () => {
    let delay = 60000;
    let counter = 0;
    this.setState({
      disabledResetCode: true,
    });
    clearInterval(delayCounter2);

    delayCounter2 = setInterval(() => {
      this.setState(
        {
          resendResetCodeCounter:
            Languages.ResendAfter + (delay - counter * 1000) / 1000,
        },
        () => {
          if (delay - counter * 1000 <= 0) {
            counter = 0;

            clearInterval(delayCounter2);
            this.setState({
              resendResetCodeCounter: Languages.Resend,
            });
            this.setState({
              disabledResetCode: false,
            });
          }
          counter++;
        }
      );
    }, 1000);
  };

  onAddPhone(ignoreOTP = false) {
    const _this = this;
    if (this.phone.isValidNumber()) {
      ks.UpdateInfo({
        userid: this.props.user && this.props.user?.ID,
        langid: Languages.langID,
        phone: this.phone && this.phone.getValue(),
        isocode: this.phone && this.phone.getISOCode(),
      }).then((data) => {
        if (data.Success == 1) {
          if (data.Error) {
            if (data.Error == -1)
              this.refs.toast.show(Languages.NumberAlreadyTaken);
            else {
              this.refs.toast.show(Languages.EmailAlreadyTaken);
            }
          } else {
            _this.props.storeUserData(data.User, () => {
              this.refs.AddPhoneModal.close();
              if (data.Code) {
                this.resendInitCounter();

                if (!ignoreOTP) {
                  this.refs.VerifyPhoneModal.open();
                }
              }
            });
          }
        } else {
          this.refs.toast.show(Languages.SomethingWentWrong, 2500);
        }
      });
    } else {
      this.refs.toast.show(Languages.InvalidNumber, 2500);
    }
  }

  onChangePhone(ignoreOTP = false) {
    const _this = this;
    let country = this.state.CountriesData.find(
      (cntry) => cntry?.ISOCode?.toLowerCase() == this.phone2.getISOCode()
    );

    if (this.state.isPhone2Valid) {
      if (country && country.EmailRegister && !this.props.user.Email) {
        this.refs.ChangePhoneModal.close();
        this.refs.AddEmailModal.open();
      } else {
        ks.UpdateInfo({
          userid: this.props.user && this.props.user?.ID,
          langid: Languages.langID,
          phone: this.phone2 && this.phone2.getValue(),
          isocode:
            this.props.user && this.props.user?.OTPConfirmed
              ? this.props.user?.ISOCode
              : this.phone2 && this.phone2.getISOCode(),
        }).then((data) => {
          if (data.Success == 1) {
            if (data.Error) {
              if (data.Error == -1)
                this.refs.toast.show(Languages.NumberAlreadyTaken);
              else {
                this.refs.toast.show(Languages.EmailAlreadyTaken);
              }
            } else {
              _this.props.storeUserData(data.User, () => {
                this.refs.ChangePhoneModal.close();
                if (data.Code) {
                  this.resendInitCounter();
                  if (!ignoreOTP) {
                    this.refs.VerifyPhoneModal.open();
                  }
                }
              });
            }
          } else {
            this.refs.toast.show(Languages.SomethingWentWrong, 2500);
          }
        });
      }
    } else {
      this.refs.toast.show(Languages.InvalidNumber, 2500);
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const isEmailPendingApproval =
      this.props.user &&
      ((this.props.user.EmailRegister &&
        (this.props.user.EmailConfirmed == false ||
          this.props.user.EmailApproved == false)) ||
        (!this.props.user.OTPConfirmed &&
          this.props.user.EmailRegister == false)) &&
      this.props.user.Country != null;
    let country = this.state.CountriesData
      ? this.state.CountriesData.find(
          (cntry) => cntry?.ID == this.props.user?.Country
        )
      : null;
    return (
      <View style={styles.container}>
        <NewHeader navigation={this.props.navigation} back />

        <ScrollView
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flex: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "height", android: "" })}
            contentContainerStyle={{ flex: 1 }}
            //  keyboardVerticalOffset={200}
            style={{ flex: 1 }}
          >
            <Toast
              textStyle={{ fontFamily: "Cairo-Regular", color: "white" }}
              position="top"
              ref="toast"
              style={{ backgroundColor: Color.primary }}
            />

            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"NameModal"}
              swipeToClose={true}
              backButtonClose
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{Languages.ChangeName}</Text>
                <TextInput
                  placeholder={Languages.newName}
                  style={styles.modalTextinput}
                  onChangeText={(newName) => this.setState({ newName })}
                  value={this.state.newName}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        newName: "",
                      });
                      this.refs.NameModal.close();
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {Languages.Cancel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      const _this = this;
                      if (this.state.newName.length >= 3) {
                        ks.UpdateInfo({
                          userid: this.props.user && this.props.user?.ID,
                          langid: Languages.langID,
                          profileName: this.state.newName,
                        }).then((data) => {
                          if (data.Success == 1) {
                            _this.props.storeUserData(data.User);
                            this.refs.NameModal.close();
                          } else {
                            this.refs.toast.show(
                              Languages.SomethingWentWrong,
                              2500
                            );
                          }
                        });
                      } else {
                        this.refs.toast.show(Languages.invalidInfo, 2500);
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.Change}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"PasswordModal"}
              swipeToClose={true}
              backButtonClose
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {Languages.ChangePassword}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <TextInput
                    placeholder={Languages.newPassword}
                    secureTextEntry={this.state.passwordHidden}
                    style={[styles.modalTextinput, { flex: 1 }]}
                    onChangeText={(newPassword) =>
                      this.setState({ newPassword })
                    }
                    value={this.state.newPassword}
                  />
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      this.setState({
                        passwordHidden: !this.state.passwordHidden,
                      });
                    }}
                  >
                    <IconMC
                      name={this.state.passwordHidden ? "eye" : "eye-off"}
                      //  style={{ marginRight: 10 }}
                      size={20}
                      color={"#000"}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        newPassword: "",
                      });
                      this.refs.PasswordModal.close();
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {Languages.Cancel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      const _this = this;
                      if (this.state.newPassword.length >= 6) {
                        ks.ChangePassword({
                          userid: this.props.user && this.props.user?.ID,
                          langid: Languages.langID,

                          password: this.state.newPassword,
                        }).then((data) => {
                          if (data.Success == 1) {
                            _this.props.storeUserData(data.User);
                            this.refs.PasswordModal.close();
                          } else {
                            this.refs.toast.show(
                              Languages.SomethingWentWrong,
                              2500
                            );
                          }
                        });
                      } else {
                        this.refs.toast.show(Languages.invalidInfo, 2500);
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.Change}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"AddEmailModal"}
              swipeToClose={true}
              backButtonClose
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{Languages.AddEmail}</Text>
                <TextInput
                  placeholder={Languages.EnterYourEmail}
                  style={[
                    styles.modalTextinput,
                    this.validateEmail(this.state.newEmail) && {
                      borderColor: "green",
                      borderBottomWidth: 2,
                      ///    backgroundColor: "rgba(0,255,0,0.2)"
                    },
                  ]}
                  onChangeText={(newEmail) =>
                    this.setState({ newEmail: newEmail.trim() })
                  }
                  value={this.state.newEmail}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        newEmail: "",
                      });
                      this.refs.AddEmailModal.close();
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {Languages.Cancel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      const _this = this;
                      if (_this.validateEmail(this.state.newEmail)) {
                        ks.UpdateInfo({
                          userid: this.props.user && this.props.user?.ID,
                          langid: Languages.langID,
                          email: this.state.newEmail,
                        }).then((data) => {
                          //alert(JSON.stringify(data));
                          if (data.Success == 1) {
                            if (data.Error) {
                              if (data.Error == -1)
                                this.refs.toast.show(
                                  Languages.NumberAlreadyTaken
                                );
                              else {
                                this.refs.toast.show(
                                  Languages.EmailAlreadyTaken
                                );
                              }
                            } else {
                              _this.props.storeUserData(data.User, () => {
                                this.refs.AddEmailModal.close();
                                if (data.Code) {
                                  this.resendInitCounter();

                                  this.refs.VerifyEmailModal.open();
                                }
                              });
                            }
                          } else {
                            this.refs.toast.show(
                              Languages.SomethingWentWrong,
                              2500
                            );
                          }
                        });
                      } else {
                        this.refs.toast.show(Languages.invalidInfo, 2500);
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.EditAdd}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"AddPhoneModal"}
              swipeToClose={true}
              backButtonClose
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{Languages.AddYourPhone}</Text>

                <View
                  style={{
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor:
                      this.phone && this.phone.isValidNumber()
                        ? "green"
                        : "#eee",
                    backgroundColor:
                      this.phone && this.phone.isValidNumber()
                        ? "rgba(0,255,0,0.2)"
                        : "#fff",
                    paddingHorizontal: 5,
                    borderRadius: 5,
                    paddingVertical: 12,
                  }}
                >
                  {this.state.cca2 && (
                    <PhoneInput
                      ref={(ref) => {
                        this.phone = ref;
                      }}
                      offset={15}
                      autoFocus
                      style={{
                        flexDirection: I18nManager.isRTL
                          ? "row-reverse"
                          : "row",
                      }}
                      allowZeroAfterCountryCode={false}
                      initialCountry={this.state.cca2.toLowerCase()}
                      value={this.state.newPhone}
                      onChangePhoneNumber={(newPhone) => {
                        // alert(this.state.cca2.toLowerCase ())
                        if (
                          this.state.cca2 &&
                          this.phone.getISOCode() !=
                            this.state.cca2.toLowerCase()
                        ) {
                          setTimeout(() => {
                            this.phone.selectCountry(
                              this.state.cca2.toLowerCase()
                            );
                          }, 100);

                          if (Platform.OS == "ios") {
                            Keyboard.dismiss();

                            setTimeout(() => {
                              this.phone.focus();
                            }, 200);
                          }
                        } else if (newPhone.length == 0) {
                          this.setState({ initialCountry: "+" });
                        }
                        this.setState({ newPhone });
                      }}
                      onPressFlag={this.onPressFlag.bind(this)}
                      textProps={{
                        placeholder: Languages.EnterMobileOrEmail,
                        // keyboardType: "default",
                        maxLength: 16,
                      }}
                      flagStyle={{
                        resizeMode: "contain",
                        borderRadius: 25,
                        backgroundColor: "transparent",
                        borderWidth: 0,
                      }}
                    />
                  )}
                  {this.state.cca2 && (
                    <CountryPicker
                      filterPlaceholder={Languages.Search}
                      hideAlphabetFilter
                      ref={(ref) => {
                        this.countryPicker = ref;
                      }}
                      onChange={(value) => this.selectCountry(value)}
                      translation={Languages.translation}
                      filterable
                      autoFocusFilter
                      closeable
                      transparent
                      cca2={this.state.cca2}
                    >
                      <View />
                    </CountryPicker>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        newEmail: "",
                      });
                      this.refs.AddPhoneModal.close();
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {Languages.Cancel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      if (this.state.CountriesData) {
                        let country = this.state.CountriesData.find(
                          (cntry) =>
                            cntry?.ISOCode?.toLowerCase() ==
                            this.phone.getISOCode()
                        );
                        if (country && country.EmailRegister) {
                          Alert.alert(
                            "",
                            Languages.EmailApprovalAlert,
                            [
                              {
                                text: Languages.Cancel,
                                onPress: () => {},
                                style: "cancel",
                              },
                              {
                                text: Languages.Ok,
                                onPress: () => {
                                  this.onAddPhone(true);
                                },
                              },
                            ],
                            { cancelable: false }
                          );
                        } else {
                          this.onAddPhone();
                        }
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.EditAdd}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"ChangePhoneModal"}
              swipeToClose={true}
              backButtonClose
              onClosed={(data) => {
                this.setState({ isPhone2Valid: false });
              }}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {Languages.ChangeYourMobile}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 5,
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{}}>{Languages.CurrentPhone}</Text>
                  <Text style={{}}>
                    {this.props.user && this.props.user?.Phone}
                  </Text>
                </View>

                <Text style={{ marginTop: 10, textAlign: "left" }}>
                  {Languages.EnterNewPhone + ":"}
                </Text>
                {
                  <View
                    style={[
                      {
                        backgroundColor: "#fff",
                        borderWidth: 1,

                        paddingHorizontal: 5,
                        borderRadius: 5,
                        paddingVertical: 12,
                      },
                      {
                        borderColor: this.state.isPhone2Valid
                          ? "green"
                          : "#eee",
                        backgroundColor: this.state.isPhone2Valid
                          ? "rgba(0,255,0,0.2)"
                          : "#fff",
                      },
                    ]}
                  >
                    {this.state.cca2 && (
                      <PhoneInput
                        ref={(ref) => {
                          this.phone2 = ref;
                        }}
                        offset={15}
                        style={{
                          flexDirection: I18nManager.isRTL
                            ? "row-reverse"
                            : "row",
                        }}
                        allowZeroAfterCountryCode={false}
                        initialCountry={
                          this.props.user?.ISOCode?.toLowerCase() ||
                          this.state.cca2?.toLowerCase()
                        }
                        value={this.state.newPhone}
                        onChangePhoneNumber={(newPhone) => {
                          this.setState({
                            isPhone2Valid: this.phone2.isValidNumber(),
                          });
                          if (newPhone.length == 0) {
                            this.setState({ initialCountry: "+" });
                          }
                          if (
                            (this.props.user &&
                              this.props.user?.EmailRegister &&
                              this.props.user?.EmailApproved &&
                              this.phone2.getISOCode() !=
                                this.props.user?.ISOCode.toLowerCase()) ||
                            (this.props.user &&
                              this.props.user?.OTPConfirmed &&
                              this.phone2.getISOCode() !=
                                this.props.user?.ISOCode.toLowerCase())
                          ) {
                            //    console.log(this.phone2.getISOCode());
                            //   console.log(this.props.user?.ISOCode);
                            setTimeout(() => {
                              this.phone2.selectCountry(
                                this.props.user?.ISOCode.toLowerCase()
                              );
                            }, 100);
                            if (Platform.OS == "ios") {
                              Keyboard.dismiss();
                              setTimeout(() => {
                                this.phone2.focus();
                              }, 200);
                            }
                            //  this.setState ({selection: {start: 4, end: 4}});
                            //   alert ('hs');
                          } else {
                            this.setState({
                              newPhone,
                            });
                          }
                        }}
                        onPressFlag={this.onPressFlag.bind(this)}
                        textProps={{
                          placeholder: Languages.EnterMobileOrEmail,
                          // keyboardType: "default",
                          maxLength: 16,
                          selection: this.state.selection || undefined,
                        }}
                        flagStyle={{
                          resizeMode: "contain",
                          borderRadius: 25,
                          backgroundColor: "transparent",
                          borderWidth: 0,
                        }}
                      />
                    )}
                    {this.state.cca2 && (
                      <CountryPicker
                        filterPlaceholder={Languages.Search}
                        hideAlphabetFilter
                        ref={(ref) => {
                          this.countryPicker = ref;
                        }}
                        onChange={(value) => this.selectCountry(value)}
                        translation={Languages.translation}
                        filterable
                        autoFocusFilter
                        closeable
                        transparent
                        cca2={
                          this.props.user?.ISOCode?.toLowerCase() ||
                          this.state.cca2
                        }
                      >
                        <View />
                      </CountryPicker>
                    )}
                  </View>
                }

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        newPhone: "",
                      });
                      this.refs.ChangePhoneModal.close();
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {Languages.Cancel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      if (this.state.CountriesData) {
                        let country = this.state.CountriesData.find(
                          (cntry) =>
                            cntry?.ISOCode?.toLowerCase() ==
                            this.phone2.getISOCode()
                        );
                        if (country && country.EmailRegister) {
                          this.onChangePhone(true);
                        } else {
                          this.onChangePhone();
                        }
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.Change}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"ChangeEmailModal"}
              swipeToClose={true}
              backButtonClose
            >
              <View style={styles.modalContent}>
                <Text style={[styles.modalTitle]}>{Languages.ChangeEmail}</Text>
                <Text style={{}}>{Languages.CurrentEmail}</Text>
                <Text style={{}}>
                  {this.props.user && this.props.user?.Email}
                </Text>
                <TextInput
                  placeholder={Languages.EnterNewEmail}
                  style={[
                    styles.modalTextinput,
                    this.validateEmail(this.state.newEmail) && {
                      borderColor: "green",
                      borderBottomWidth: 2,
                      ///    backgroundColor: "rgba(0,255,0,0.2)"
                    },
                  ]}
                  onChangeText={(newEmail) =>
                    this.setState({ newEmail: newEmail.trim() })
                  }
                  value={this.state.newEmail}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        newEmail: "",
                      });
                      this.refs.ChangeEmailModal.close();
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {Languages.Cancel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      const _this = this;
                      if (_this.validateEmail(this.state.newEmail)) {
                        ks.UpdateInfo({
                          userid: this.props.user && this.props.user?.ID,
                          langid: Languages.langID,
                          email: this.state.newEmail,
                        }).then((data) => {
                          if (data.Success == 1) {
                            if (data.Error) {
                              if (data.Error == -1)
                                this.refs.toast.show(
                                  Languages.NumberAlreadyTaken
                                );
                              else {
                                this.refs.toast.show(
                                  Languages.EmailAlreadyTaken
                                );
                              }
                            } else {
                              _this.props.storeUserData(data.User, () => {
                                this.refs.ChangeEmailModal.close();
                                if (data.Code) {
                                  this.resendInitCounter();

                                  this.refs.VerifyEmailModal.open();
                                }
                              });
                            }
                          } else {
                            this.refs.toast.show(
                              Languages.SomethingWentWrong,
                              2500
                            );
                          }
                        });
                      } else {
                        this.refs.toast.show(Languages.invalidInfo, 2500);
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.Change}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"VerifyEmailModal"}
              // onOpened={() => {
              //   this.resendInitCounter();
              // }}
              onClosed={() => {
                this.setState({
                  emailVerificationCode: "",
                });
              }}
              swipeToClose={true}
              backButtonClose
            >
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={{ position: "absolute", top: 10, right: 10 }}
                  onPress={() => {
                    this.refs.VerifyEmailModal.close();
                  }}
                >
                  <Awesome name="close" size={20} color="red" style={{}} />
                </TouchableOpacity>

                <Text style={[styles.modalTitle, { textAlign: "center" }]}>
                  {Languages.VerifyAccount}
                </Text>
                <Text style={{ textAlign: "center" }}>
                  {Languages.WeHaveSentACode}
                </Text>

                <Text style={{ textAlign: "center" }}>
                  {this.state.newEmail ||
                    (this.props.user && this.props.user?.Email)}
                </Text>
                <Text style={{ textAlign: "center" }}>
                  {Languages.ToVerifyAccount}
                </Text>
                <TextInput
                  //   placeholder={Languages.EnterYourEmail}
                  keyboardType="number-pad"
                  style={styles.modalTextinput}
                  onChangeText={(emailVerificationCode) => {
                    this.setState({
                      emailVerificationCode: this.convertToNumber(
                        emailVerificationCode
                      ),
                    });
                  }}
                  value={this.state.emailVerificationCode}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    disabled={this.state.disabledResetCode}
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        emailVerificationCode: "",
                      });
                      ks.ResendOTP({
                        userID: this.props.user && this.props.user?.ID,
                        otpType: 2, //email
                      }).then((data) => {
                        //  alert(JSON.stringify(data));
                        if (data.Success == 1) {
                          this.resendInitCounter();
                        } else {
                          alert("something went wrong");
                        }
                        //
                      });
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {this.state.resendResetCodeCounter}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      const _this = this;
                      if (
                        this.state.emailVerificationCode &&
                        this.state.emailVerificationCode.length > 0
                      ) {
                        ks.ConfirmOTPAndUpdate({
                          userid: this.props.user && this.props.user?.ID,
                          langid: Languages.langID,
                          isocode: this.props.user && this.props.user?.ISOCode,
                          username:
                            this.state.newEmail ||
                            (this.props.user && this.props.user?.Email),
                          otpCode: this.state.emailVerificationCode,
                        }).then((data) => {
                          //     alert(JSON.stringify(data));
                          if (data.Success == 1) {
                            if (data.OTPVerify) {
                              _this.props.storeUserData(data.User);
                              this.refs.VerifyEmailModal.close();
                              if (
                                data.User.MemberOf.filter(
                                  (x) =>
                                    x.ID ==
                                    "33333333-3333-3333-3333-333333333333"
                                ).length > 0 &&
                                data.User.PaidPlans
                              ) {
                                this.props.navigation.navigate(
                                  "SubscriptionsScreen",
                                  {
                                    ISOCode: this.props.user.ISOCode,
                                    User: this.props.user,
                                    Plans: this.state.Plans,
                                  }
                                );
                              }
                            } else {
                              this.refs.toast.show(Languages.WrongOTP, 1500);
                            }
                          } else {
                            this.refs.toast.show(
                              Languages.SomethingWentWrong,
                              2500
                            );
                          }
                        });
                      } else {
                        this.refs.toast.show(Languages.invalidInfo, 2500);
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.Confirm}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              //coverScreen
              style={[styles.modalbox]}
              ref={"VerifyPhoneModal"}
              onOpened={() => {
                setTimeout(() => {
                  this.refs.verifyPhoneText &&
                    this.refs.verifyPhoneText.focus();
                }, 500);
              }}
              onClosed={() => {
                this.setState({
                  phoneVerificationCode: "",
                });
              }}
              swipeToClose={true}
              backButtonClose
            >
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={{ position: "absolute", top: 10, right: 10 }}
                  onPress={() => {
                    this.refs.VerifyPhoneModal.close();
                  }}
                >
                  <Awesome name="close" size={20} color="red" style={{}} />
                </TouchableOpacity>

                <Text style={[styles.modalTitle, { textAlign: "center" }]}>
                  {Languages.VerifyAccount}
                </Text>
                <Text style={{ textAlign: "center" }}>
                  {Languages.WeHaveSentACode}
                </Text>
                <Text style={{ textAlign: "center" }}>
                  {this.state.newPhone
                    ? this.state.newPhone
                    : this.props.user && this.props.user?.Phone}
                </Text>
                <Text style={{ textAlign: "center" }}>
                  {Languages.ToVerifyAccount}
                </Text>
                <TextInput
                  placeholder={Languages.VerificationCode}
                  ref="verifyPhoneText"
                  keyboardType="number-pad"
                  style={styles.modalTextinput}
                  onChangeText={(phoneVerificationCode) => {
                    this.setState({
                      phoneVerificationCode: this.convertToNumber(
                        phoneVerificationCode
                      ),
                    });
                  }}
                  value={this.state.phoneVerificationCode}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "space-between",
                    alignSelf: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    disabled={this.state.disabledResetCode}
                    style={styles.CancelButton}
                    onPress={() => {
                      this.setState({
                        phoneVerificationCode: "",
                      });
                      ks.ResendOTP({
                        userID: this.props.user && this.props.user?.ID,
                        otpType: 1, //phone
                        username: this.state.newPhone
                          ? this.state.newPhone
                          : this.props.user && this.props.user?.Phone,
                      }).then((data) => {
                        //     alert(JSON.stringify(data));
                        if (data.Success == 1) {
                          this.resendInitCounter();
                        } else {
                          alert("something went wrong");
                        }
                        //
                      });
                    }}
                  >
                    <Text style={{ color: "grey", textAlign: "center" }}>
                      {this.state.resendResetCodeCounter}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ChangeButton]}
                    onPress={() => {
                      const _this = this;
                      if (
                        this.state.phoneVerificationCode &&
                        this.state.phoneVerificationCode.length > 0
                      ) {
                        ks.ConfirmOTPAndUpdate({
                          userid: this.props.user && this.props.user?.ID,
                          langid: Languages.langID,
                          isocode: this.props.user && this.props.user?.ISOCode,
                          username: this.state.newPhone
                            ? this.state.newPhone
                            : this.props.user && this.props.user?.Phone,
                          otpCode: this.state.phoneVerificationCode,
                        }).then((data) => {
                          //     alert(JSON.stringify(data));
                          if (data.Success == 1) {
                            if (data.OTPVerify) {
                              _this.props.storeUserData(data.User);
                              this.refs.VerifyPhoneModal.close();
                              if (
                                data.User.MemberOf.filter(
                                  (x) =>
                                    x.ID ==
                                    "33333333-3333-3333-3333-333333333333"
                                ).length > 0 &&
                                data.User.PaidPlans
                              ) {
                                this.props.navigation.navigate(
                                  "SubscriptionsScreen",
                                  {
                                    ISOCode: this.props.user.ISOCode,
                                    User: this.props.user,
                                    Plans: this.state.Plans,
                                  }
                                );
                              }
                            } else {
                              this.refs.toast.show(Languages.WrongOTP, 1500);
                            }
                          } else {
                            this.refs.toast.show(
                              Languages.SomethingWentWrong,
                              2500
                            );
                          }
                        });
                      } else {
                        this.refs.toast.show(Languages.invalidInfo, 2500);
                      }
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {Languages.Confirm}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              ref="photoModal"
              position="top"
              //      //coverScreen
              style={{
                backgroundColor: "transparent",
                //flex: 1,
                justifyContent: "center",
              }}
              backButtonClose={true}
              backdropPressToClose={true}
              swipeToClose={true}
            >
              <View
                style={{
                  alignSelf: "center",
                  backgroundColor: "#FFF",
                  padding: 0,
                  borderRadius: 5,
                  width: WIDTH * 0.5,
                }}
              >
                <TouchableOpacity
                  style={{ position: "absolute", top: 5, right: 5, zIndex: 15 }}
                  onPress={() => {
                    this.refs.photoModal.close();
                  }}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    margin: 10,
                  }}
                  onPress={() => {
                    this.pickSingleBase64("camera");
                    this.refs.photoModal.close();
                  }}
                >
                  <Text style={styles.modalTextStyle}>{Languages.camera}</Text>
                </TouchableOpacity>
                <View
                  style={{
                    borderBottomColor: "rgba(0,0,0,0.2)",
                    borderBottomWidth: 1,
                  }}
                />
                <TouchableOpacity
                  style={{ margin: 10 }}
                  onPress={() => {
                    this.pickSingleBase64("gallery");
                    this.refs.photoModal.close();
                  }}
                >
                  <Text style={styles.modalTextStyle}>{Languages.Gallery}</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <View
              style={{
                justifyContent: "center",
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.refs.photoModal.open();
                }}
              >
                {!this.state.isUploadClicked && (
                  <Image
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      resizeMode: "contain",
                      width: 26,
                      height: 26,
                      zIndex: 50,
                    }}
                    source={require("@images/icons/profileCamera.png")}
                  />
                )}
                <View
                  style={{
                    backgroundColor: "#D6D6D6",
                    width: 90,
                    height: 90,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 60,
                  }}
                >
                  {this.state.isUploadClicked ? (
                    <Image
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 60,
                      }}
                      source={{
                        uri:
                          this.state.profilePic +
                          (this.state.hasImage
                            ? "?time=" + this.state.date
                            : ""),
                        cache: "force-cache",
                        priority: "low",
                      }}
                      onError={(e) => {
                        this.setState({
                          isUploadClicked: false,
                          hasImage: false,
                        });
                      }}
                    />
                  ) : (
                    <Icon style={{}} size={70} name="user" color="white" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.subView}>
              <View style={styles.inputWrap}>
                <Awesome
                  name={"user"}
                  size={Styles.IconSize.TextInput}
                  color={Color.blackTextSecondary}
                />
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.refs.NameModal.open();
                  }}
                >
                  <Text style={styles.textStyle} numberOfLines={1}>
                    {this.props.user && this.props.user?.Name}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[styles.inputWrap, { justifyContent: "space-between" }]}
              >
                <View
                  style={{
                    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
                    alignItems: "center",
                    flex: 7,
                  }}
                >
                  <Entypo
                    name={"email"}
                    size={20}
                    color={
                      this.props.user && this.props.user?.Email == ""
                        ? "#bbb"
                        : this.props.user && this.props.user?.EmailConfirmed
                        ? "green"
                        : "red"
                    }
                  />
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      if (this.props.user && this.props.user?.Email) {
                        this.refs.ChangeEmailModal.open();
                      } else {
                        this.refs.AddEmailModal.open();
                      }
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.textStyle,
                        {
                          color:
                            this.props.user && this.props.user?.Email == ""
                              ? "#bbb"
                              : this.props.user &&
                                this.props.user?.EmailConfirmed
                              ? "green"
                              : "red",
                        },
                      ]}
                    >
                      {this.props.user && this.props.user?.Email
                        ? this.props.user?.Email
                        : Languages.AddEmail}
                    </Text>
                  </TouchableOpacity>
                </View>

                {this.props.user && this.props.user?.Email != "" && (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 3,
                    }}
                  >
                    <Awesome
                      name={
                        this.props.user && this.props.user?.EmailConfirmed
                          ? "check"
                          : "close"
                      }
                      //  style={{ alignSelf: "flex-end" }}
                      size={20}
                      color={
                        this.props.user && this.props.user?.EmailConfirmed
                          ? "green"
                          : "red"
                      }
                    />
                    <TouchableOpacity
                      disabled={
                        this.props.user && this.props.user?.EmailConfirmed
                      }
                      style={{}}
                      onPress={() => {
                        this.resendInitCounter();

                        this.refs.VerifyEmailModal.open();
                      }}
                    >
                      <Text
                        style={{
                          color:
                            this.props.user && this.props.user?.EmailConfirmed
                              ? "green"
                              : "blue",
                        }}
                      >
                        {this.props.user && this.props.user?.EmailConfirmed
                          ? Languages.Verified
                          : Languages.VerifyNow}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View
                style={[styles.inputWrap, { justifyContent: "space-between" }]}
              >
                <View
                  style={{
                    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
                    alignItems: "center",
                    flex: 7,
                  }}
                >
                  <Awesome
                    name={"phone"}
                    size={Styles.IconSize.TextInput}
                    color={
                      this.props.user && this.props.user?.EmailRegister
                        ? this.props.user?.Phone
                          ? "green"
                          : "#bbb"
                        : this.props.user && this.props.user?.Phone == ""
                        ? "#bbb"
                        : this.props.user && this.props.user?.OTPConfirmed
                        ? "green"
                        : "red"
                    }
                  />
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      if (this.props.user && this.props.user?.Phone) {
                        this.refs.ChangePhoneModal.open();
                      } else {
                        this.refs.AddPhoneModal.open();
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.textStyle,
                        this.props.user && this.props.user?.EmailRegister
                          ? this.props.user?.Phone
                            ? { color: "green" }
                            : { color: "#bbb" }
                          : this.props.user && this.props.user?.Phone == ""
                          ? { color: "#bbb" }
                          : this.props.user && this.props.user?.OTPConfirmed
                          ? { color: "green" }
                          : { color: "red" },
                      ]}
                    >
                      {this.props.user && this.props.user?.Phone
                        ? this.props.user?.Phone
                        : Languages.AddYourPhone}
                    </Text>
                  </TouchableOpacity>
                </View>
                {this.props.user &&
                  this.props.user?.Phone != "" &&
                  !this.props.user?.EmailRegister && (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",

                        flex: 3,
                      }}
                    >
                      {this.props.user && this.props.user?.Phone && (
                        <Awesome
                          name={
                            this.props.user && this.props.user?.OTPConfirmed
                              ? "check"
                              : "close"
                          }
                          //  style={{ alignSelf: "flex-end" }}
                          size={20}
                          color={
                            this.props.user && this.props.user?.OTPConfirmed
                              ? "green"
                              : "red"
                          }
                        />
                      )}
                      {this.props.user && this.props.user?.Phone && (
                        <TouchableOpacity
                          disabled={
                            this.props.user && this.props.user?.OTPConfirmed
                          }
                          style={{}}
                          onPress={() => {
                            this.resendInitCounter();
                            this.refs.VerifyPhoneModal.open();
                          }}
                        >
                          <Text
                            style={{
                              color:
                                this.props.user && this.props.user?.OTPConfirmed
                                  ? "green"
                                  : "blue",
                            }}
                          >
                            {this.props.user && this.props.user?.OTPConfirmed
                              ? Languages.Verified
                              : Languages.VerifyNow}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
              </View>

              <View style={styles.inputWrap}>
                <Awesome
                  name={"lock"}
                  size={Styles.IconSize.TextInput}
                  color={Color.blackTextSecondary}
                />
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.refs.PasswordModal.open();
                  }}
                >
                  <Text style={styles.textStyle}>
                    {Languages.ChangePassword}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {this.props.user &&
              !this.props.user?.IsDealer &&
              this.props.user?.MemberOf &&
              this.props.user?.MemberOf.filter(
                (x) => x.ID == "33333333-3333-3333-3333-333333333333"
              ).length > 0 &&
              !isEmailPendingApproval && (
                <View style={{ flex: 1 }}>
                  {!!this.state.PaymentPending && (
                    <TouchableOpacity
                      style={{
                        width: Dimensions.get("screen").width * 0.96,
                        marginVertical: 5,
                        alignSelf: "center",
                        flexDirection: "row",
                        borderRadius: 5,
                        marginBottom: 10,
                        backgroundColor: "red",
                        minHeight: 60,
                      }}
                      onPress={() => {
                        this.props.navigation.navigate("SubscriptionsScreen", {
                          ISOCode: this.props.user.ISOCode,
                          User: this.props.user,
                          Plans: this.state.Plans,
                        });
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            textAlign: "center",
                            padding: 5,
                            fontFamily: "Cairo-Regular",
                            fontSize: 19,
                            lineHeight: 28.5,
                          }}
                        >
                          {Languages.AccountIsPaymentPending}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {!this.state.PaymentPending && (
                    <Animatable.Text
                      useNativeDriver
                      iterationCount="infinite"
                      animation="flash"
                      iterationDelay={5000}
                      iterationDelay={1000}
                      duration={3000}
                      //  delay={1000}
                      style={{
                        textAlign: "center",
                        flex: 1,
                        fontSize: 18,
                        color: Color.primary,
                        fontFamily: "Cairo-Bold",
                      }}
                    >
                      {Languages.DealerPendingApproval}
                    </Animatable.Text>
                  )}
                </View>
              )}

            {isEmailPendingApproval && (
              <View style={{ flex: 1 }}>
                {country && country.EmailRegister && (
                  <Animatable.Text
                    useNativeDriver
                    iterationCount="infinite"
                    animation="flash"
                    iterationDelay={5000}
                    iterationDelay={1000}
                    duration={3000}
                    //  delay={1000}
                    style={{
                      textAlign: "center",
                      fontSize: 18,
                      color: Color.primary,
                      fontFamily: "Cairo-Bold",
                      paddingHorizontal: 10,
                    }}
                  >
                    {this.props.user.EmailApproved
                      ? Languages.MustVerifyToUse
                      : Languages.EmailPendingApproval}
                  </Animatable.Text>
                )}
                {!this.props.user.OTPConfirmed &&
                  country &&
                  !country.EmailRegister && (
                    <Animatable.Text
                      useNativeDriver
                      iterationCount="infinite"
                      animation="flash"
                      iterationDelay={5000}
                      iterationDelay={1000}
                      duration={3000}
                      //  delay={1000}
                      style={{
                        textAlign: "center",
                        fontSize: 18,
                        color: Color.primary,
                        fontFamily: "Cairo-Bold",
                        paddingHorizontal: 10,
                      }}
                    >
                      {Languages.MustVerifyToUse}
                    </Animatable.Text>
                  )}
                {!this.props.user.EmailConfirmed &&
                  country &&
                  country.EmailRegister && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        width: Dimensions.get("screen").width,
                        justifyContent: "space-around",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor: "green",
                          paddingVertical: 5,
                          borderRadius: 5,
                          flexGrow: 0,
                          marginTop: 15,
                          paddingHorizontal: 20,
                        }}
                        onPress={() => {
                          this.resendInitCounter();

                          this.refs.VerifyEmailModal.open();
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 20 }}>
                          {Languages.VerifyNow}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                {!this.props.user.OTPConfirmed &&
                  country &&
                  !country.EmailRegister && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        width: Dimensions.get("screen").width,
                        justifyContent: "space-around",
                      }}
                    >
                      <TouchableOpacity
                        disabled={
                          this.props.user && this.props.user?.OTPConfirmed
                        }
                        style={{
                          backgroundColor: "green",
                          paddingVertical: 5,
                          borderRadius: 5,
                          flexGrow: 0,
                          marginTop: 15,
                          paddingHorizontal: 20,
                        }}
                        onPress={() => {
                          this.resendInitCounter();
                          this.refs.VerifyPhoneModal.open();
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 20 }}>
                          {Languages.VerifyNow}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            )}
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}
function showToast(text, time = 3500) {
  let toast = Toast.show(text, {
    duration: time,
    backgroundColor: Color.primary,
    position: Toast.positions.BOTTOM,
    shadow: true,
    shadowColor: "#adb1b2",
    animation: true,
    hideOnPress: true,
    delay: 0,
    onShow: () => {
      // calls on toast\`s appear animation start
    },
    onShown: () => {
      // calls on toast\`s appear animation end.
    },
    onHide: () => {
      // calls on toast\`s hide animation start.
    },
    onHidden: () => {
      // calls on toast\`s hide animation end.
    },
  });

  // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
  setTimeout(function() {
    Toast.hide(toast);
  }, time);
}

const styles = StyleSheet.create({
  textField: {
    flex: 1,
    textAlign: I18nManager.isRTL ? "right" : "left",
    marginLeft: 10,
  },
  modalTitle: {
    textAlign: "left",
    fontSize: 18,
    color: "#000",
  },
  textStyle: {
    textAlign: "left",
    fontSize: 18,
    marginHorizontal: 10,
    color: "#000",
  },
  subView: {
    marginHorizontal: 15,
  },
  select: {
    height: 60,
  },
  outterView: {
    flexDirection: "row",
    margin: 5,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  inputStyle: {
    flex: 9,
  },
  iconStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  logoWrap: {
    ...Styles.Common.ColumnCenter,
    flexGrow: 1,
  },
  logo: {
    width: Styles.width * 0.8,
    height: 90,
    alignSelf: "center",
    marginTop: 80,
  },
  subContain: {
    paddingHorizontal: Styles.width * 0.1,
    paddingBottom: 50,
  },
  loginForm: {},
  inputWrap: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    // justifyContent: "center",
    borderColor: Color.blackDivide,
    borderBottomWidth: 1,
    marginBottom: 20,
    //  marginTop: Platform.OS == "ios" ? 20 : 0
  },
  input: {
    borderColor: "#9B9B9B",
    height: 40,
    marginTop: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 8,
    textAlign: "left",
    flex: 9,
  },
  buttonCointainer: {
    margin: 30,
  },
  myLogin: {
    marginTop: 90,
    backgroundColor: Color.primary,
    borderRadius: 5,
    elevation: 1,
  },
  separatorWrap: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    borderBottomWidth: 1,
    flexGrow: 1,
    borderColor: Color.blackTextDisable,
  },
  separatorText: {
    color: Color.blackTextDisable,
    paddingHorizontal: 10,
    fontFamily: Constants.fontFamily,
  },
  fbButton: {
    backgroundColor: Color.facebook,
    borderRadius: 5,
    elevation: 1,
  },
  // ggButton: {
  //     marginVertical: 10,
  //     backgroundColor: Color.google,
  //     borderRadius: 5,
  // },
  signUp: {
    color: Color.blackTextSecondary,
    marginTop: 20,
  },
  highlight: {
    fontWeight: "bold",
    color: Color.primary,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: Color.primary,
    borderRadius: 5,
    elevation: 1,
  },
  modalbox: {
    zIndex: 500,
    elevation: 10,
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "transparent",
    flex: 1,
  },
  modalContent: {
    width: Dimensions.get("screen").width * 0.9,
    alignSelf: "center",
    backgroundColor: "#f8f8f8",
    // opacity:0.9,
    //  height: 200,
    minHeight: 200,
    elevation: 10,

    padding: 20,
    borderRadius: 1,
    justifyContent: "center",
    //  alignItems: 'center',
  },
  modalTextinput: {
    height: 40,
    borderColor: Color.secondary,
    fontFamily: "Cairo-Regular",
    textAlign: I18nManager.isRTL ? "right" : "left",
    marginTop: 10,
    borderBottomWidth: 1,
    fontSize: 16,
  },
  CancelButton: {
    backgroundColor: "#EFEFF1",
    flex: 1,
    textAlign: "center",
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  ChangeButton: {
    backgroundColor: Color.secondary,
    flex: 1,
    textAlign: "center",

    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  modalTextStyle: {
    textAlign: "left",
  },
});
const commonInputProps = {
  style: styles.input,
  underlineColorAndroid: "transparent",
  placeholderTextColor: Color.blackTextSecondary,
  fontFamily: Constants.fontFamily,
};

const mapStateToProps = ({ user }) => ({
  user: user.user,
});

const mapDispatchToProps = (dispatch) => {
  const { actions } = require("@redux/UserRedux");
  return {
    login: (user) => dispatch(actions.login(user)),
    logout: () => dispatch(actions.logout()),
    EditUser: (name, phone) => {
      actions.EditUser(dispatch, name, phone);
    },
    storeUserData: (user, callback) =>
      actions.storeUserData(dispatch, user, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);
