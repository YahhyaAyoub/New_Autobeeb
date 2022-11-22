'use strict';

import React, {Component} from 'react';
import ReactNative, {
  View,
  StyleSheet,
  Text,
  Linking,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  I18nManager,
  Dimensions,
  NativeModules,
  Alert,
  Platform,
  KeyboardAvoidingView,
  UIManager,
  Keyboard,
} from 'react-native';
import {connect} from 'react-redux';
import {Color, Languages} from '@common';
import {LogoSpinner, OTPModal, ImagePopUp, LocationSelect} from '@components';
import CountryPicker, {
  getAllCountries,
} from 'react-native-country-picker-modal-kensoftware';
import {NewHeader} from '@containers';
import KS from '@services/KSAPI';
import SectionedMultiSelect from 'react-native-sectioned-multi-select-kensoftware';
import PhoneInput from 'react-native-phone-input-kensoftware';
import DeviceInfo from 'react-native-device-info';
import {toast} from '@app/Omni';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {NavigationActions, StackActions} from 'react-navigation';
import Modal from 'react-native-modalbox';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
var ImagePicker = NativeModules.ImageCropPicker;

class DealerSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      currency: this.props.ViewingCountry && this.props.ViewingCountry.currency,
      ClassificationsLoading: true,
      CompetencesLoading: true,
      selectedCompetence: [],
      selectedCountry: null,
      hideMobile: false,
      passwordHidden: true,
      email: (this.props.user && this.props.user?.Email) || '',
      mobile: (this.props.user && this.props.user?.Phone) || '',
      cca2: (this.props.user && this.props.user?.ISOCode) || '',
      phoneNotEdited: true,
      CompanyName: (this.props.user && this.props.user?.Name) || '',
      PostalCode: (this.props.user && this.props.user?.PostCode) || '',
      StreetName: (this.props.user && this.props.user?.MailingAddress) || '',
      BillingFirstName:
        (this.props.user && this.props.user?.BillingFirstName) || '',
      BillingLastName:
        (this.props.user && this.props.user?.BillingLastName) || '',
      paidPlans: false,
      HasImage: true,
      HasBanner: true,
      addTime: true,
      profilePic:
        this.props.user && this.props.user?.ID
          ? 'http://autobeeb.com' +
            '/content/users/' +
            props.user.ID +
            '/' +
            props.user.ID +
            '_400x400.jpg'
          : undefined,

      imageRefreshCount: 5,
      date: new Date(),
      bannerPic:
        this.props.user && this.props.user?.ID
          ? 'http://autobeeb.com' +
            '/content/dealers/' +
            props.user.ID +
            '/' +
            props.user.ID +
            '_1024x653.jpg'
          : undefined,
    };
  }

  componentDidMount() {
    // setTimeout(() => {
    //   this.props.navigation.navigate("SubscriptionsScreen", {
    //     ISOCode: this.props.ViewingCountry.cca2,
    //     User: this.props.user,
    //   });
    // }, 500);

    KS.CountriesGet({langid: Languages.langID}).then((CountriesData) => {
      if (CountriesData && CountriesData.Success == '1') {
        this.setState({CountriesData: CountriesData.Countries}, () => {
          if (this.props.user && this.props.user?.ISOCode) {
            this.checkEmailCountry({cca2: this.props.user?.ISOCode});
          }
        });
      }
    });
    if (this.props.user && this.props.user?.IsDealer) {
      KS.DealerGet({
        userID: this.props.user?.ID,
        langid: Languages.langID,
      }).then((data) => {
        if (data && data.Success) {
          //  console.log(data);
          this.setState(
            {
              selectedClassification: [data.Dealer.ClassificationID],
              selectedCompetence: data.Dealer.Competence.split(',').map((val) =>
                parseInt(val)
              ),
              selectedMakes: data.Dealer.Makes
                ? data.Dealer.Makes.split(',').map((val) => parseInt(val))
                : undefined,
              selectedCity: this.props.user?.City.split(',').map((val) =>
                parseInt(val)
              ),
              vat: data.Dealer.Vat,
              Phone: data.Dealer.Phone,
              aboutCo: data.Dealer.About,
              Address: data.Dealer.Address,
              hideMobile: data.Dealer.HideMobile,
              userLocation:
                data.Dealer?.LatLng && data.Dealer?.LatLng != null
                  ? {
                      latitude:
                        data.Dealer?.LatLng && data.Dealer?.LatLng != null
                          ? parseFloat(data.Dealer.LatLng.split(',')[0])
                          : '',
                      longitude:
                        data.Dealer?.LatLng && data.Dealer?.LatLng != null
                          ? parseFloat(data.Dealer.LatLng.split(',')[1])
                          : '',
                      latitudeDelta: 0.015,
                      longitudeDelta: 0.0121,
                    }
                  : null,
            },
            () => {
              KS.MakesMulitpleTypesGet({
                langid: Languages.langID,
                sumIDs: this.state.selectedCompetence.reduce(
                  (a, b) => a + b,
                  0
                ),
              }).then((data) => {
                // alert(JSON.stringify(data));
                if (data && data.Success) {
                  this.setState({Makes: data.Makes});
                }
              });
              //    alert(JSON.stringify(this.state.selectedCompetence));
            }
          );
        }
      });
    }

    KS.BannersGet({
      isoCode: this.props.ViewingCountry.cca2,
      langID: Languages.langID,
      placementID: 6,
    }).then((data) => {
      if (data?.Banners && data?.Banners.length > 0) {
        this.setState(
          {BannerImage: data.Banners[data.Banners.length - 1]},
          () => {
            setTimeout(() => {
              this.refs?.ImagePopUp?.open();
            }, 1000);
          }
        );
      }
    });

    // console.log(this.props.user);
    if (this.props.user && this.props.user?.ISOCode) {
      //  this.checkEmailCountry({cca2:this.props.user?.ISOCode});

      let userCountry = getAllCountries().filter(
        (country) => country.cca2 == this.props.user?.ISOCode
      )[0];

      this.selectCountry(userCountry);
    }
    AsyncStorage.getItem('cca2', (error, data) => {
      if (data) {
        this.setState({cca2: data});
      }
    });
    KS.CompetencesGet({
      langid: Languages.langID,
    }).then((data) => {
      if (data && data.Success == 1) {
        let newArr = data.Competences.filter((x) => x.ID != 32 && x.ID <= 2048);
        this.setState({
          Competences: newArr,
          CompetencesLoading: false,
        });
      }
    });
    KS.ClassificationsGet({
      langid: Languages.langID,
    }).then((data) => {
      if (data && data.Success == 1) {
        // var newArr = data.Classifications.map(function(val, index) {
        //   return { label: val.Name, value: val.ID };
        // });

        this.setState({
          Classifications: data.Classifications,
          ClassificationsLoading: false,
        });
      }
    });
  }
  convertToNumber(number) {
    if (number) {
      number = number + '';
      return number
        .replace(/٠/g, '0')
        .replace(/،/g, '.')
        .replace(/٫/g, '.')
        .replace(/,/g, '.')
        .replace(/١/g, '1')
        .replace(/٢/g, '2')
        .replace(/٣/g, '3')
        .replace(/٤/g, '4')
        .replace(/٥/g, '5')
        .replace(/٦/g, '6')
        .replace(/٧/g, '7')
        .replace(/٨/g, '8')
        .replace(/٩/g, '9');
    } else return '';
  }
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }
  checkEmailCountry(country) {
    let countries = this.state.CountriesData;
    let iso2 = country.cca2;
    if (!countries) {
      return;
    }
    let selectedCountry =
      countries &&
      countries.find((x) => x.ISOCode.toLowerCase() == iso2.toLowerCase())
        ? countries.find((x) => x.ISOCode.toLowerCase() == iso2.toLowerCase())
        : null;
    if (selectedCountry?.EmailRegister) {
      this.setState({isEmailRegisterCountry: true});
    } else {
      this.setState({isEmailRegisterCountry: false});
    }
  }

  selectCountry(country) {
    this.setState({
      selectedCountry: country,
      selectedCity: undefined,
      paidPlans: this.state.CountriesData
        ? this.state.CountriesData.find(
            (x) => x.ISOCode.toLowerCase() == country.cca2.toLowerCase()
          ).PaidPlans
        : false,
    });
    if (!this.state.CountriesData) {
      setTimeout(() => {
        this.setState({
          paidPlans: this.state.CountriesData
            ? this.state.CountriesData.find(
                (x) => x.ISOCode.toLowerCase() == country.cca2.toLowerCase()
              ).PaidPlans
            : false,
        });
      }, 500);
    }
    if (this.refs.phone) {
      this.refs.phone.selectCountry(country.cca2.toLowerCase(), () => {
        this.forceUpdate();
      });
    }

    this.checkEmailCountry(country);

    KS.CitiesGet({
      langID: Languages.langID,
      isoCode: country.cca2,
    }).then((data) => {
      if (data) {
        this.setState({
          cities: data,
        });
      }
    });
  }

  checkOTP() {
    const _this = this;
    const otp = this.state.otp;
    if (this.state.dealerData.ConfirmAndUpdate) {
      KS.ConfirmOTPAndUpdate({
        otpcode: otp,
        isocode: this.refs.phone && this.refs.phone.getISOCode(),
        userid: this.props.user?.ID,
        username:
          (this.state.dealerData.NewPhone || !this.props.user?.OTPConfirmed) &&
          !this.props.user.EmailRegister
            ? (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone
            : (this.state.dealerData && this.state.dealerData.NewEmail) ||
              !this.props.user?.EmailConfirmed
            ? this.state.email
            : (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone,
      }).then((data) => {
        if (data.OTPVerify) {
          //    this.setPushNotification(this.props.navigation.getParam("id", 0));
          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              _this.props.navigation.goBack();
            });
          }

          //
        } else {
          toast(Languages.WrongOTP);

          setTimeout(() => {
            this.setState({otp: ''});
          }, 1800);
        }
      });
    } else {
      KS.UserVerifyOTP({
        otpcode: otp,
        userid: this.props.user?.ID,
        username:
          (this.state.dealerData.NewPhone || !this.props.user?.OTPConfirmed) &&
          !this.props.user.EmailRegister
            ? (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone
            : (this.state.dealerData && this.state.dealerData.NewEmail) ||
              !this.props.user?.EmailConfirmed
            ? this.state.email
            : (this.refs.phone && this.refs.phone.getValue()) ||
              this.props.user?.Phone,
      }).then((data) => {
        console.log(data);
        //   alert(JSON.stringify(data));
        if (data.OTPVerified == true || data.EmailConfirmed == true) {
          //    this.setPushNotification(this.props.navigation.getParam("id", 0));
          // if (data.User) {
          //   _this.props.storeUserData(data.User, () => {
          //     _this.props.navigation.goBack();
          //   });
          // }

          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              KS.PlansGet({
                langid: Languages.langID,
                isocode: this.state.selectedCountry.cca2,
              }).then((PlansData) => {
                if (PlansData?.Plans?.length > 0) {
                  _this.props.navigation.replace('SubscriptionsScreen', {
                    ISOCode: data.User.ISOCode,
                    User: data.User,
                    Plans: PlansData.Plans,
                  });
                } else {
                  _this.props.navigation.goBack();
                }
              });
            });

            //
          }
        } else {
          toast(Languages.WrongOTP);

          setTimeout(() => {
            this.setState({otp: ''});
          }, 1800);
        }
      });
    }
  }
  resendCode() {
    this.setState({otp: ''});
    KS.ResendOTP({
      userID: this.props.user?.ID,
      username:
        (this.state.dealerData.NewPhone || !this.props.user?.OTPConfirmed) &&
        !this.props.user.EmailRegister
          ? (this.refs.phone && this.refs.phone.getValue()) ||
            this.props.user?.Phone
          : (this.state.dealerData && this.state.dealerData.NewEmail) ||
            !this.props.user?.EmailConfirmed
          ? this.state.email
          : (this.refs.phone && this.refs.phone.getValue()) ||
            this.props.user?.Phone,
    }).then((data) => {
      if (data.Success == 1) {
        //     alert(JSON.stringify(data));
      } else {
        alert('something went wrong');
      }
      //
    });
  }

  checkEmailOTP() {
    const _this = this;
    const otp = this.state.otp;
    {
      KS.UserVerifyOTP({
        otpcode: otp,
        userid: this.props.user?.ID,
        username: this.state.email,
      }).then((data) => {
        if (data.EmailConfirmed == true) {
          //    this.setPushNotification(this.props.navigation.getParam("id", 0));
          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              this.refs.EmailVerifyModal && this.refs.EmailVerifyModal.close();
              this.setState({otp: ''});
            });
          }
          //
        } else {
          toast(Languages.WrongOTP);

          setTimeout(() => {
            this.setState({otp: ''});
          }, 1800);
        }
      });
    }
  }
  resendEmailCode() {
    this.setState({otp: ''});
    KS.ResendOTP({
      otpType: 2, //email

      userID: this.props.user?.ID,
      username: this.state.email,
    }).then((data) => {
      if (data.Success == 1) {
        //     alert(JSON.stringify(data));
      } else {
        alert('something went wrong');
      }
      //
    });
  }

  pickSingleBase64(mode, banner) {
    // console.log("pickingimageyz " + banner);
    if (mode === 'camera') {
      ImagePicker.openCamera({
        mediaType: 'photo',
        multiple: false,
        waitAnimationEnd: false,
        cropping: !banner,
        includeExif: true,
        includeBase64: true,
        width: 300,
        height: 300,
      })
        .then((image) => {
          this.setState(
            {
              HasImage: banner ? this.state.HasImage : true,
              HasBanner: banner ? true : this.state.HasBanner,
              profilePic: !banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.profilePic,
              bannerPic: banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.bannerPic,
              addTime: false,
            },
            () => {
              KS.UploadImage({
                userid: this.props.user?.ID,
                fileextension: image.mime.split('/')[1],
                banner: banner,
                base64: image.data,
              }).then((data) => {
                if (data && data.Success) {
                  this.setState({date: new Date()});
                  this.props.storeUserData(data.User);
                } else {
                  alert(Languages.SomethingWentWrong);
                }
              });
            }
          );
        })
        .catch((e) => {
          if (e.code === 'E_PERMISSION_MISSING') {
            alert(e);
          }
        });
    } else {
      ImagePicker.openPicker({
        mediaType: 'photo',
        width: 300,
        height: 300,
        cropping: !banner,
        includeBase64: true,
        includeExif: true,
      })
        .then((image) => {
          this.setState(
            {
              HasImage: banner ? this.state.HasImage : true,
              HasBanner: banner ? true : this.state.HasBanner,
              profilePic: !banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.profilePic,
              bannerPic: banner
                ? `data:${image.mime};base64,` + image.data
                : this.state.bannerPic,
              addTime: false,
            },
            () => {
              KS.UploadImage({
                userid: this.props.user?.ID,
                fileextension: image.mime.split('/')[1],
                banner: banner,
                base64: image.data,
              }).then((data) => {
                if (data && data.Success) {
                  this.setState({date: new Date()});

                  this.props.storeUserData(data.User);
                } else {
                  alert(Languages.SomethingWentWrong);
                }
              });
            }
          );
        })
        .catch((e) => {
          if (e.code === 'E_PERMISSION_MISSING') {
            alert(e);
          }
        });
    }
  }

  render() {
    const _this = this;
    if (this.state.ClassificationsLoading || this.state.CompetencesLoading) {
      return (
        <View style={{flex: 1}}>
          <LogoSpinner fullStretch={true} />
        </View>
      );
    }
    return (
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', android: ''})}
        contentContainerStyle={{flex: 1}}
        style={{flex: 1}}
      >
        <ImagePopUp
          Banner={this.state.BannerImage}
          ref="ImagePopUp"
          navigation={this.props.navigation}
        />

        <NewHeader navigation={this.props.navigation} back />
        <Modal
          ref="locationModal"
          //  isOpen
          backButtonClose
          coverScreen={Platform.OS == 'android'}
          swipeToClose={false}
          style={{
            backgroundColor: 'transparent',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: Dimensions.get('screen').height * 0.8,
              width: Dimensions.get('screen').width * 0.95,
              // height: Dimensions.get('screen').height,
              // width: Dimensions.get('screen').width,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <LocationSelect
              onLocationConfirm={(data) => {
                this.setState({
                  userLocation: data,
                  Latitude: data.latitude,
                  Longitude: data.longitude,
                });
              }}
              onClose={(data) => {
                this.refs.locationModal.close();
              }}
              initialRegion={{
                latitude: 40.697,
                longitude: -74.259,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            />
          </View>
        </Modal>
        <Modal
          style={[styles.modalbox]}
          ref={'PasswordModal'}
          swipeToClose={true}
          backButtonClose
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{Languages.ChangePassword}</Text>
            <TextInput
              placeholder={Languages.newPassword}
              style={styles.modalTextinput}
              onChangeText={(newPassword) => this.setState({newPassword})}
              value={this.state.newPassword}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
                justifyContent: 'space-between',
                alignSelf: 'flex-end',
              }}
            >
              <TouchableOpacity
                style={styles.CancelButton}
                onPress={() => {
                  this.setState({
                    newPassword: '',
                  });
                  this.refs.PasswordModal.close();
                }}
              >
                <Text style={{color: 'grey', textAlign: 'center'}}>
                  {Languages.Cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ChangeButton]}
                onPress={() => {
                  const _this = this;
                  if (this.state.newPassword.length >= 6) {
                    KS.ChangePassword({
                      userid: this.props.user?.ID,
                      langid: Languages.langID,

                      password: this.state.newPassword,
                    }).then((data) => {
                      if (data.Success == 1) {
                        this.refs.PasswordModal.close();
                      } else {
                        toast(Languages.SomethingWentWrong, 2500);
                      }
                    });
                  } else {
                    toast(Languages.invalidInfo, 2500);
                  }
                }}
              >
                <Text style={{color: 'white', textAlign: 'center'}}>
                  {Languages.Change}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <OTPModal
          ref="OTPModal"
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterToVerifyAccount}
          Username={
            (this.state.dealerData &&
              this.state.dealerData.NewPhone &&
              !this.props.user?.EmailRegister) ||
            (this.props.user &&
              !this.props.user?.OTPConfirmed &&
              !this.props.user?.EmailRegister)
              ? (this.refs.phone && this.refs.phone.getValue()) ||
                this.props.user?.Phone
              : (this.state.dealerData && this.state.dealerData.NewEmail) ||
                (this.props.user && !this.props.user?.EmailConfirmed)
              ? this.state.email
              : (this.refs.phone && this.refs.phone.getValue()) ||
                (this.props.user && this.props.user?.Phone)
          }
          otp={this.state.otp}
          onChange={(otp) => {
            this.setState({otp});
          }}
          checkOTP={() => {
            this.checkOTP();
          }}
          toast={(msg) => {
            toast(msg);
          }}
          onClosed={() => {
            this.props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({routeName: 'App'})],
              })
            );
            //     this.props.navigation.replace("HomeScreen");
          }}
          resendCode={() => {
            this.resendCode();
          }}
        />

        <OTPModal
          ref="EmailVerifyModal"
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterToVerifyAccount}
          Username={this.state.email}
          ignoreResend
          otp={this.state.otp}
          onChange={(otp) => {
            this.setState({otp});
          }}
          checkOTP={() => {
            this.checkEmailOTP();
          }}
          toast={(msg) => {
            toast(msg);
          }}
          resendCode={() => {
            this.resendEmailCode();
          }}
        />

        <Modal
          ref="photoModal"
          position="top"
          //   coverScreen
          style={{
            backgroundColor: 'transparent',
            //flex: 1,
            justifyContent: 'center',
          }}
          backButtonClose={true}
          backdropPressToClose={true}
          swipeToClose={true}
        >
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: '#FFF',
              padding: 0,
              borderRadius: 5,
              width: Dimensions.get('screen').width * 0.5,
            }}
          >
            <TouchableOpacity
              style={{position: 'absolute', top: 5, right: 5, zIndex: 15}}
              onPress={() => {
                this.refs.photoModal.close();
              }}
            >
              <IconMC name="close" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                margin: 10,
              }}
              onPress={() => {
                this.pickSingleBase64('camera', this.state.bannerUploading);
                this.refs.photoModal.close();
              }}
            >
              <Text style={styles.modalTextStyle}>{Languages.camera}</Text>
            </TouchableOpacity>
            <View
              style={{
                borderBottomColor: 'rgba(0,0,0,0.2)',
                borderBottomWidth: 1,
              }}
            />
            <TouchableOpacity
              style={{margin: 10}}
              onPress={() => {
                this.pickSingleBase64('gallery', this.state.bannerUploading);
                this.refs.photoModal.close();
              }}
            >
              <Text style={styles.modalTextStyle}>{Languages.Gallery}</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <ScrollView
          ref="scrollView"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={[{flex: 1, backgroundColor: '#F3F3F3'}]}
          contentContainerStyle={{paddingBottom: 40}}
        >
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
              translation={Languages.translation}
              cca2={this.state.cca2}
            >
              <View />
            </CountryPicker>
          )}
          {!!this.props.navigation.getParam('Edit', 0) && (
            <TouchableOpacity
              onPress={() => {
                this.setState({bannerUploading: true});
                this.refs.photoModal.open();
              }}
              style={{
                //   width: Dimensions.get("screen").width,
                backgroundColor: 'white',
                justifyContent: 'flex-end',
                marginBottom: 20,
                // height: Dimensions.get("screen").width / 1.77
                //       justifyContent: "center",
                // paddingVertical: 15
                //      alignItems: "center"
              }}
            >
              <View style={{}}>
                {!this.state.HasBanner && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      position: 'absolute',
                      top: 10,
                      right: 5,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Text style={{zIndex: 50, textAlign: 'left'}}>
                      {Languages.facilityPhoto}
                    </Text>
                    <Image
                      style={{
                        resizeMode: 'contain',
                        width: 26,
                        height: 26,
                        zIndex: 50,
                      }}
                      source={require('@images/icons/profileCamera.png')}
                    />
                  </View>
                )}

                {this.state.HasBanner ? (
                  <Image
                    style={{
                      width: Dimensions.get('screen').width,
                      height: Dimensions.get('screen').width / 1.77,
                      resizeMode: 'cover',
                    }}
                    source={{
                      uri:
                        this.state.bannerPic +
                        (this.state.addTime ? '?time=' + this.state.date : ''),
                      cache: 'force-cache',
                      priority: 'low',
                    }}
                    onError={(e) => {
                      this.setState({
                        HasBanner: false,
                        addTime: false,
                      });
                    }}
                  />
                ) : (
                  <Image
                    style={{
                      height: Dimensions.get('screen').width / 1.77,
                      alignSelf: 'center',
                    }}
                    resizeMode="contain"
                    source={require('@images/Oldplaceholder.png')}
                  />
                )}
              </View>

              <View
                style={{
                  alignSelf: 'flex-start',
                  position: 'absolute',
                  bottom: 0,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.setState({bannerUploading: false});
                    this.refs.photoModal.open();
                  }}
                  style={{
                    position: 'relative',
                    top: 15,
                    left: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {!this.state.HasImage && (
                    <Image
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        resizeMode: 'contain',
                        width: 26,
                        height: 26,
                        zIndex: 50,
                      }}
                      source={require('@images/icons/profileCamera.png')}
                    />
                  )}
                  <View
                    style={{
                      backgroundColor: '#D6D6D6',
                      width: 90,
                      height: 90,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 60,
                    }}
                  >
                    {this.state.HasImage ? (
                      <Image
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 60,
                        }}
                        source={{
                          uri:
                            this.state.profilePic +
                            (this.state.addTime
                              ? '?time=' + this.state.date
                              : ''),
                          cache: 'force-cache',
                          priority: 'low',
                        }}
                        onError={(e) => {
                          this.setState({
                            HasImage: false,
                            addTime: false,
                          });
                        }}
                      />
                    ) : (
                      <Icon style={{}} size={70} name="user" color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.inputWrap}>
            {this.props.navigation.getParam('Edit', 0) == 0 && (
              <Text
                style={{
                  fontFamily: 'Cairo-Regular',
                  color: '#f00',
                  textAlign: 'center',
                }}
              >
                {Languages.EnterDealerInfo}
              </Text>
            )}

            <Text style={styles.header}>{Languages.CompanyName}</Text>
            <TextInput
              placeholderTextColor="#C7C7CD"
              placeholder={Languages.EnterCompanyName}
              style={[
                styles.Textinput,
                this.state.CompanyName && this.state.CompanyName.length >= 3
                  ? {
                      borderBottomColor: 'green',
                      borderBottomWidth: 1,
                    }
                  : {
                      borderBottomColor: 'red',
                      borderBottomWidth: 1,
                    },
              ]}
              onChangeText={(CompanyName) => this.setState({CompanyName})}
              value={this.state.CompanyName}
            />
          </View>

          {this.state.Classifications && this.state.Classifications.length > 0 && (
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.Classification}</Text>
              <SectionedMultiSelect
                ref="ClassificationMultiSelect"
                items={this.state.Classifications}
                single
                selectedText={Languages.Selected}
                uniqueKey="ID"
                colors={{
                  primary: Color.primary,
                }}
                displayKey="Name"
                searchPlaceholderText={Languages.Search}
                styles={{
                  selectToggle: {
                    borderBottomWidth: 1,
                    marginBottom: 5,
                    borderBottomColor:
                      this.state.selectedClassification &&
                      this.state.selectedClassification.length > 0
                        ? 'green'
                        : 'red',
                  },
                  selectToggleText: {
                    color:
                      this.state.selectedClassification &&
                      this.state.selectedClassification.length > 0
                        ? '#000'
                        : '#C7C7CD',
                    textAlign: 'left',

                    paddingVertical: 5,
                  },
                  item: {
                    height: 60,
                    borderBottomWidth: 1,
                    //   backgroundColor: "red",
                    borderBottomColor: '#eee',
                  },
                  searchTextInput: {
                    fontFamily: 'Cairo-Regular',
                  },
                }}
                itemFontFamily="Cairo-Regular"
                confirmFontFamily="Cairo-Regular"
                //   showRemoveAll={true}
                selectText={Languages.SelectWorkClassifications}
                //  showDropDowns={true}
                //   readOnlyHeadings={true}
                onSelectedItemsChange={(selectedClassification) => {
                  //    let arrSum = arr => arr.reduce((a, b) => a + b, 0);

                  this.setState({selectedClassification});
                }}
                modalWithSafeAreaView
                // cancelIconComponent={
                //   <Text style={{ color: "white" }}>Cancel</Text>
                // }

                confirmText={Languages.Confirm}
                selectedItems={this.state.selectedClassification}
                hideConfirm
              />
            </View>
          )}

          {this.state.Competences && (
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.CompetenceOfCompany}</Text>
              <View>
                <SectionedMultiSelect
                  ref="CompetenceMultiSelect"
                  selectedText={Languages.Selected}
                  items={this.state.Competences}
                  uniqueKey="ID"
                  colors={{
                    primary: Color.primary,
                  }}
                  displayKey="Name"
                  // alwaysShowSelectText={true}
                  //   showCancelButton
                  styles={{
                    selectToggle: {
                      borderBottomWidth: 1,
                      marginBottom: 5,
                      borderBottomColor:
                        this.state.selectedCompetence &&
                        this.state.selectedCompetence.length > 0
                          ? 'green'
                          : 'red',
                    },
                    selectToggleText: {
                      paddingVertical: 5,
                      textAlign: 'left',
                    },
                    item: {
                      borderBottomWidth: 1,
                      //   backgroundColor: "red",
                      borderBottomColor: '#eee',
                    },
                  }}
                  hideSearch
                  itemFontFamily="Cairo-Regular"
                  confirmFontFamily="Cairo-Regular"
                  //   showRemoveAll={true}
                  selectText={Languages.PleaseSelectWorkType}
                  //  showDropDowns={true}
                  //   readOnlyHeadings={true}
                  onSelectedItemsChange={(selectedCompetence) => {
                    //    let arrSum = arr => arr.reduce((a, b) => a + b, 0);
                    if (selectedCompetence.length <= 2) {
                      KS.MakesMulitpleTypesGet({
                        langid: Languages.langID,
                        sumIDs: selectedCompetence.reduce((a, b) => a + b, 0),
                      }).then((data) => {
                        if (data && data.Success) {
                          this.setState({Makes: data.Makes});
                        }
                      });
                      this.setState({selectedCompetence, selectedMakes: ''});
                    } else {
                      Alert.alert('', Languages.max2Selections);
                    }
                  }}
                  modalWithSafeAreaView
                  confirmText={Languages.Confirm}
                  selectedItems={this.state.selectedCompetence}
                  hideConfirm
                  stickyFooterComponent={() => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignSelf: 'flex-end',
                          alignItems: 'center',
                          borderTopColor: '#ccc',
                          borderTopWidth: 1,
                          borderBottomLeftRadius: 5,
                          borderBottomRightRadius: 5,

                          justifyContent: 'center',
                          backgroundColor: '#fff',
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: Color.secondary,
                          }}
                          onPress={() => {
                            this.refs.CompetenceMultiSelect._submitSelection();
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              paddingVertical: 10,
                              fontSize: 15,
                            }}
                          >
                            {Languages.Confirm}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              </View>
            </View>
          )}
          {this.state.selectedCompetence &&
            this.state.selectedCompetence.length > 0 && (
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.Makes}</Text>
                <SectionedMultiSelect
                  ref="MakesMultiSelect"
                  selectedText={Languages.Selected}
                  items={this.state.Makes}
                  uniqueKey="ID"
                  colors={{
                    primary: Color.primary,
                  }}
                  displayKey="Name"
                  searchPlaceholderText={Languages.SearchMakes}
                  styles={{
                    selectToggle: {
                      borderBottomWidth: 1,
                      marginBottom: 5,
                      borderBottomColor:
                        this.state.selectedMakes &&
                        this.state.selectedMakes.length > 0
                          ? 'green'
                          : 'red',
                    },
                    selectToggleText: {
                      paddingVertical: 5,
                      textAlign: 'left',
                    },
                    item: {
                      borderBottomWidth: 1,
                      //   backgroundColor: "red",
                      borderBottomColor: '#eee',
                    },
                    searchTextInput: {
                      fontFamily: 'Cairo-Regular',
                    },
                  }}
                  itemFontFamily="Cairo-Regular"
                  confirmFontFamily="Cairo-Regular"
                  selectText={Languages.SelectMakesYoureWorkingWith}
                  onSelectedItemsChange={(selectedMakes) => {
                    if (selectedMakes.length <= 20) {
                      this.setState({selectedMakes});
                    } else {
                      Alert.alert('', Languages.max20Selection);
                    }
                  }}
                  modalWithSafeAreaView
                  confirmText={Languages.Confirm}
                  selectedItems={this.state.selectedMakes}
                  hideConfirm
                  stickyFooterComponent={() => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignSelf: 'flex-end',
                          alignItems: 'center',
                          borderTopColor: '#ccc',
                          borderTopWidth: 1,
                          //      padding: 8,
                          borderBottomLeftRadius: 5,
                          borderBottomRightRadius: 5,

                          justifyContent: 'center',
                          backgroundColor: '#fff',
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: Color.secondary,
                            // borderRadius: 5
                          }}
                          onPress={() => {
                            this.refs.MakesMultiSelect._submitSelection();
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              paddingVertical: 10,
                              fontSize: 15,
                            }}
                          >
                            {Languages.Confirm}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              </View>
            )}

          <View style={styles.inputWrap}>
            <Text style={styles.header}>{Languages.Vat}</Text>
            <TextInput
              placeholderTextColor="#C7C7CD"
              placeholder={Languages.EnterVat}
              style={[styles.Textinput]}
              onChangeText={(vat) =>
                this.setState({vat: this.convertToNumber(vat)})
              }
              value={this.state.vat}
            />
          </View>

          <View style={styles.inputWrap} ref="descriptionParent">
            <Text style={styles.header}>{Languages.AboutCompany}</Text>
            <TextInput
              placeholderTextColor="#C7C7CD"
              placeholder={Languages.EnterCompanyDescription}
              numberOfLines={5}
              multiline
              style={[styles.Textinput]}
              onChangeText={(aboutCo) => this.setState({aboutCo})}
              value={this.state.aboutCo}
              onFocus={() => {
                const handle = ReactNative.findNodeHandle(
                  this.refs.descriptionParent
                );
                UIManager.measureLayoutRelativeToParent(
                  handle,
                  (e) => {
                    console.error(e);
                  },
                  (x, y, w, h) => {
                    _this.refs.scrollView.scrollTo({
                      x: 0,
                      y: y,
                      animated: true,
                    });
                  }
                );
              }}
            />
          </View>

          {
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.Country}</Text>

              <TouchableOpacity
                disabled={
                  (this.props.user && this.props.user?.OTPConfirmed) ||
                  (this.state.isEmailRegisterCountry &&
                    this.props.user?.Phone &&
                    this.props.user?.EmailConfirmed)
                }
                onPress={() => {
                  this.countryPicker.openModal();
                }}
              >
                {this.state.selectedCountry ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: this.state.selectedCountry
                        ? 'green'
                        : 'red',
                    }}
                  >
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          color: 'black',
                          paddingBottom: 5,
                        },
                      ]}
                    >
                      {this.state.selectedCountry.name[Languages.translation]
                        ? this.state.selectedCountry.name[Languages.translation]
                        : this.state.selectedCountry.name}
                    </Text>
                    <Image
                      style={{width: 50, height: 30, marginHorizontal: 10}}
                      resizeMode={'contain'}
                      source={{
                        uri:
                          'https://autobeeb.com/wsImages/flags/' +
                          this.state.selectedCountry.cca2 +
                          '.png',
                      }}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: this.state.selectedCountry
                        ? 'green'
                        : 'red',
                    }}
                  >
                    <Text
                      style={[
                        styles.text,
                        {
                          paddingBottom: 5,
                          borderBottomWidth: Platform.OS==='android'?0:1,
                          borderBottomColor: this.state.selectedCountry
                            ? 'green'
                            : 'red',
                        },
                      ]}
                    >
                      {Languages.SelectYourCountry}
                    </Text>
                  </View>
                )}
                {false && (
                  <Image
                    style={{width: 50, height: 30, marginHorizontal: 10}}
                    resizeMode={'contain'}
                    source={{
                      uri:
                        'https://autobeeb.com/wsImages/flags/' +
                        this.state.cca2 +
                        '.png',
                    }}
                  />
                )}
              </TouchableOpacity>
            </View>
          }

          {
            <View style={styles.inputWrap}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',

                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.header}>{Languages.Email}</Text>

                {!!(this.props.user && this.props.user?.Email) && (
                  <View style={{}}>
                    <Text
                      style={{
                        marginBottom: 2,
                        color:
                          this.props.user?.EmailConfirmed ||
                          !this.props.user?.Email
                            ? 'green'
                            : 'red',
                      }}
                    >
                      {this.props.user?.EmailConfirmed
                        ? Languages.Verified
                        : Languages.Unverified}
                    </Text>
                    {this.props.user?.EmailConfirmed == false && (
                      <TouchableOpacity
                        style={{}}
                        onPress={() => {
                          this.refs.EmailVerifyModal.open();
                        }}
                      >
                        <Text style={{}}>{Languages.VerifyNow}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
              <TextInput
                placeholderTextColor="#C7C7CD"
                placeholder={Languages.EnterYourEmailOptional}
                style={[
                  styles.Textinput,
                  this.state.isEmailRegisterCountry && {
                    borderBottomWidth: 1,
                    borderBottomColor: 'red',
                  },
                  this.validateEmail(this.state.email) && {
                    borderBottomColor: 'green',
                    borderBottomWidth: 1,
                  },
                ]}
                onChangeText={(email) => this.setState({email: email.trim()})}
                value={this.state.email}
              />
            </View>
          }

          {
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.Phone2}</Text>
              <TextInput
                placeholderTextColor="#C7C7CD"
                placeholder={Languages.EnterYourPhoneOptional}
                style={[styles.Textinput]}
                onChangeText={(Phone) =>
                  this.setState({Phone: this.convertToNumber(Phone)})
                }
                keyboardType="numeric"
                value={this.state.Phone}
              />
            </View>
          }

          {this.state.selectedCountry && (
            <View style={styles.inputWrap}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.header}>{Languages.Mobile}</Text>
                {this.props.user && !this.state.isEmailRegisterCountry && (
                  <Text
                    style={{
                      marginBottom: 5,
                      color: this.props.user?.OTPConfirmed ? 'green' : 'red',
                    }}
                  >
                    {this.props.user?.OTPConfirmed
                      ? Languages.Verified
                      : Languages.Unverified}
                  </Text>
                )}
              </View>
              <PhoneInput
                ref="phone"
                initialCountry={this.state.selectedCountry.cca2.toLowerCase()}
                onPressFlag={() => {
                  //  this.countryPicker.openModal();
                }}
                allowZeroAfterCountryCode={false}
                textProps={{maxLength: 16}}
                style={{
                  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                  paddingBottom: 5,
                  borderBottomWidth: 1,
                  borderBottomColor:
                    (this.refs.phone && this.refs.phone.isValidNumber()) ||
                    (this.props.navigation.getParam('BecomeADealer', 0) &&
                      this.state.mobile &&
                      this.state.mobile.length > 0 &&
                      this.state.phoneNotEdited)
                      ? 'green'
                      : 'red',
                }}
                hitSlop={{top: 40, left: 40, bottom: 40, right: 40}}
                flagStyle={{
                  resizeMode: 'contain',
                  borderRadius: 25,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                }}
                value={this.state.mobile}
                onChangePhoneNumber={(mobile) => {
                  this.setState({mobile, phoneNotEdited: false});

                  if (
                    this.refs.phone.getISOCode() !=
                    this.state.selectedCountry.cca2.toLowerCase()
                  ) {
                    this.setState({mobile: ''});
                    this.refs.phone.selectCountry(
                      this.state.selectedCountry.cca2.toLowerCase()
                    );
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  this.setState({hideMobile: !this.state.hideMobile});
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}
              >
                <IconMC
                  name={
                    this.state.hideMobile
                      ? 'checkbox-marked'
                      : 'checkbox-blank-outline'
                  }
                  style={{marginRight: 10}}
                  size={20}
                  color={'#000'}
                />
                <Text style={{}}>{Languages.HideMobile}</Text>
              </TouchableOpacity>
            </View>
          )}

          {this.state.cities && this.state.cities.length > 0 && (
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.City}</Text>
              <SectionedMultiSelect
                ref="CityMultiSelect"
                selectedText={Languages.Selected}
                items={this.state.cities}
                single
                uniqueKey="ID"
                colors={{
                  primary: Color.primary,
                }}
                displayKey="Name"
                searchPlaceholderText={Languages.Search}
                styles={{
                  selectToggle: {
                    borderBottomWidth: 1,
                    marginBottom: 5,
                    borderBottomColor:
                      this.state.selectedCity &&
                      this.state.selectedCity.length > 0
                        ? 'green'
                        : 'red',
                  },
                  selectToggleText: {
                    color:
                      this.state.selectedCity &&
                      this.state.selectedCity.length > 0
                        ? '#000'
                        : '#C7C7CD',
                    textAlign: 'left',
                    paddingVertical: 5,
                  },
                  item: {
                    height: 60,
                    borderBottomWidth: 1,
                    //   backgroundColor: "red",
                    borderBottomColor: '#eee',
                  },
                  searchTextInput: {
                    fontFamily: 'Cairo-Regular',
                  },
                }}
                itemFontFamily="Cairo-Regular"
                confirmFontFamily="Cairo-Regular"
                //   showRemoveAll={true}
                selectText={Languages.SelectCity}
                //  showDropDowns={true}
                //   readOnlyHeadings={true}
                onSelectedItemsChange={(selectedCity) => {
                  //    let arrSum = arr => arr.reduce((a, b) => a + b, 0);

                  this.setState({selectedCity});
                }}
                modalWithSafeAreaView
                // cancelIconComponent={
                //   <Text style={{ color: "white" }}>Cancel</Text>
                // }

                confirmText={Languages.Confirm}
                selectedItems={this.state.selectedCity}
                hideConfirm
              />
            </View>
          )}

          {
            <View style={styles.inputWrap}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                <Text style={styles.header}>{Languages.Address}</Text>
                {this.state.userLocation && (
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      this.setState({userLocation: undefined});
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{color: 'crimson'}}>{Languages.Delete}</Text>
                      <IconMC
                        name="close-circle"
                        color={'crimson'}
                        size={20}
                        style={{
                          marginHorizontal: 3,
                        }}
                      ></IconMC>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              {this.state.userLocation ? (
                <MapView
                  ref={(instance) => (this.map = instance)}
                  liteMode
                  region={this.state.userLocation}
                  provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                  style={{
                    width: '95%',
                    height: 80,
                    marginLeft: 10,
                    backgroundColor: '#fff',
                  }}
                  onPress={(region) => {
                    this.refs.locationModal.open();
                    Keyboard.dismiss();
                  }}
                >
                  {this.state.userLocation && (
                    <MapView.Marker coordinate={this.state.userLocation} />
                  )}
                </MapView>
              ) : (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => {
                    this.refs.locationModal.open();
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={[styles.Textinput, {paddingHorizontal: 0}]}>
                    {Languages.EnterAddress}
                  </Text>
                  <IconMC name="map-marker-circle" size={30}></IconMC>
                </TouchableOpacity>
              )}
            </View>
          }

          {false && (
            <View style={styles.inputWrap}>
              <Text style={styles.header}>{Languages.Address}</Text>
              <TextInput
                placeholderTextColor="#C7C7CD"
                placeholder={Languages.EnterAddress}
                style={[styles.Textinput]}
                onChangeText={(Address) => this.setState({Address})}
                value={this.state.Address}
              />
            </View>
          )}
          {this.state.paidPlans && (
            <>
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.BillingFirstName}</Text>
                <TextInput
                  placeholderTextColor="#C7C7CD"
                  placeholder={Languages.EnterBillingFirstName}
                  style={[
                    styles.Textinput,
                    this.state.BillingFirstName &&
                    this.state.BillingFirstName.length >= 3
                      ? {
                          borderBottomColor: 'green',
                          borderBottomWidth: 1,
                        }
                      : {
                          borderBottomColor: 'red',
                          borderBottomWidth: 1,
                        },
                  ]}
                  onChangeText={(BillingFirstName) =>
                    this.setState({BillingFirstName})
                  }
                  value={this.state.BillingFirstName}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.BillingLastName}</Text>
                <TextInput
                  placeholderTextColor="#C7C7CD"
                  placeholder={Languages.EnterBillingLastName}
                  style={[
                    styles.Textinput,
                    this.state.BillingLastName &&
                    this.state.BillingLastName.length >= 3
                      ? {
                          borderBottomColor: 'green',
                          borderBottomWidth: 1,
                        }
                      : {
                          borderBottomColor: 'red',
                          borderBottomWidth: 1,
                        },
                  ]}
                  onChangeText={(BillingLastName) =>
                    this.setState({BillingLastName})
                  }
                  value={this.state.BillingLastName}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.PostalCode}</Text>
                <TextInput
                  placeholderTextColor="#C7C7CD"
                  placeholder={Languages.EnterPostalCode}
                  style={[
                    styles.Textinput,
                    this.state.PostalCode && this.state.PostalCode.length >= 3
                      ? {
                          borderBottomColor: 'green',
                          borderBottomWidth: 1,
                        }
                      : {
                          borderBottomColor: 'red',
                          borderBottomWidth: 1,
                        },
                  ]}
                  onChangeText={(PostalCode) => this.setState({PostalCode})}
                  value={this.state.PostalCode}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.StreetName}</Text>
                <TextInput
                  placeholderTextColor="#C7C7CD"
                  placeholder={Languages.EnterStreetName}
                  style={[
                    styles.Textinput,
                    this.state.StreetName && this.state.StreetName.length >= 3
                      ? {
                          borderBottomColor: 'green',
                          borderBottomWidth: 1,
                        }
                      : {
                          borderBottomColor: 'red',
                          borderBottomWidth: 1,
                        },
                  ]}
                  onChangeText={(StreetName) => this.setState({StreetName})}
                  value={this.state.StreetName}
                />
              </View>
            </>
          )}

          {!this.props.navigation.getParam('BecomeADealer', false) &&
            !this.props.navigation.getParam('Edit', false) && (
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.Password}</Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <TextInput
                    placeholderTextColor="#C7C7CD"
                    placeholder={Languages.EnterPassword}
                    onFocus={(data) => {
                      setTimeout((data) => {
                        this.refs.scrollView.scrollToEnd();
                      }, 500);
                    }}
                    style={[
                      styles.Textinput,
                      {
                        flex: 1,
                        textAlign: I18nManager.isRTL ? 'right' : 'left',
                        borderBottomWidth: 1,
                        borderBottomColor:
                          this.state.password && this.state.password.length >= 6
                            ? 'green'
                            : 'red',
                      },
                    ]}
                    secureTextEntry={this.state.passwordHidden}
                    onChangeText={(password) => this.setState({password})}
                    value={this.state.password}
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
                      name={this.state.passwordHidden ? 'eye' : 'eye-off'}
                      //  style={{ marginRight: 10 }}
                      size={20}
                      color={'#000'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

          {this.props.navigation.getParam('Edit', false) && (
            <TouchableOpacity
              style={{}}
              onPress={() => {
                this.refs.PasswordModal.open();
              }}
            >
              <View style={styles.inputWrap}>
                <Text style={styles.header}>{Languages.ChangePassword}</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{}}
            onPress={() => {
              this.props.navigation.navigate('PrivacyPolicy');
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: Dimensions.get('screen').width,
                alignItems: 'center',
                padding: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Cairo-Regular',
                  fontSize: 16,

                  textAlign: 'justify',
                }}
              >
                {Languages.dealerTerms}
                <Text
                  style={{
                    color: 'blue',
                    fontSize: 16,
                    fontFamily: 'Cairo-Regular',
                  }}
                >
                  {Languages.TermsAndCondition}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Cairo-Regular',
                    fontSize: 16,

                    textAlign: 'justify',
                  }}
                >
                  {Languages.ofAutobeeb}
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={this.state.disableSignUp}
            style={[
              {
                backgroundColor: Color.primary,
                borderRadius: 5,
                paddingVertical: 10,
                marginTop: 10,
                width: Dimensions.get('screen').width * 0.8,
                alignSelf: 'center',
              },
              (!this.state.paidPlans ||
                (this.state.BillingFirstName &&
                  this.state.BillingFirstName.length >= 3 &&
                  this.state.BillingLastName &&
                  this.state.BillingLastName.length >= 3 &&
                  this.state.StreetName &&
                  this.state.StreetName.length >= 3 &&
                  this.state.PostalCode &&
                  this.state.PostalCode.length >= 3)) &&
                this.state.CompanyName &&
                this.state.CompanyName.length >= 3 &&
                this.state.selectedClassification &&
                this.state.selectedClassification.length > 0 &&
                this.state.selectedCompetence &&
                this.state.selectedCompetence.length > 0 &&
                this.state.selectedMakes &&
                this.state.selectedMakes.length > 0 &&
                this.state.selectedCountry &&
                ((this.state.email && this.state.email.length > 0) ||
                this.state.isEmailRegisterCountry
                  ? this.validateEmail(this.state.email)
                  : true) &&
                this.refs.phone &&
                this.refs.phone.isValidNumber() &&
                this.state.selectedCity &&
                (!this.props.navigation.getParam('BecomeADealer', 0) &&
                !this.props.navigation.getParam('Edit', 0)
                  ? this.state.password && this.state.password.length >= 6
                  : true) && {
                  backgroundColor: 'green',
                },
              this.state.disableSignUp && {
                backgroundColor: 'gray',
              },
            ]}
            onPress={() => {
              if (
                (!this.state.paidPlans ||
                  (this.state.BillingFirstName &&
                    this.state.BillingFirstName.length >= 3 &&
                    this.state.BillingLastName &&
                    this.state.BillingLastName.length >= 3 &&
                    this.state.StreetName &&
                    this.state.StreetName.length >= 3 &&
                    this.state.PostalCode &&
                    this.state.PostalCode.length >= 3)) &&
                this.state.CompanyName &&
                this.state.CompanyName.length >= 3 &&
                this.state.selectedClassification &&
                this.state.selectedClassification.length > 0 &&
                this.state.selectedCompetence &&
                this.state.selectedCompetence.length > 0 &&
                this.state.selectedMakes &&
                this.state.selectedMakes.length > 0 &&
                this.state.selectedCountry &&
                ((this.state.email &&
                  this.state.email.length > 0 &&
                  !this.state.isEmailRegisterCountry) ||
                this.state.isEmailRegisterCountry
                  ? this.validateEmail(this.state.email)
                  : true) &&
                this.refs.phone &&
                this.refs.phone.isValidNumber() &&
                this.state.selectedCity &&
                (!this.props.navigation.getParam('BecomeADealer', 0) &&
                !this.props.navigation.getParam('Edit', 0)
                  ? this.state.password && this.state.password.length >= 6
                  : true)
              ) {
                this.setState({disableSignUp: true});
                KS.BecomeADealer({
                  phone2: this.state.Phone || '',
                  phone: this.refs.phone.getValue(),
                  name: this.state.CompanyName,
                  billingfirstname: this.state.BillingFirstName,
                  billinglastname: this.state.BillingLastName,
                  streetname: this.state.StreetName,
                  postalcode: this.state.PostalCode,
                  classification: this.state.selectedClassification[0],
                  competence: this.state.selectedCompetence.join(','),
                  makes: this.state.selectedMakes.join(','),
                  vat: this.state.vat || '',
                  description: this.state.aboutCo || '',
                  email: this.state.email || '',
                  city: this.state.selectedCity[0],
                  address: this.state.Address || '',
                  password: this.state.password || '',
                  country: this.state.selectedCountry.cca2,
                  doHide: this.state.hideMobile,
                  langid: Languages.langID,
                  userid: (this.props.user && this.props.user?.ID) || '',
                  dealerID: this.props.navigation.getParam('Edit', false)
                    ? this.props.user?.ID
                    : '',
                  deviceID: DeviceInfo.getUniqueID(),
                  latLng: this.state.userLocation
                    ? `${this.state.userLocation.latitude},${this.state.userLocation.longitude}`
                    : '',
                }).then((data) => {
                  this.setState({disableSignUp: false});
                  if (data && data.Success == 1) {
                    this.setState({dealerData: data});
                    if (data.EmailInUse) {
                      Alert.alert(
                        Languages.EmailAlreadyTaken,
                        Languages.EmailTakenDescription,
                        [
                          {
                            text: Languages.Cancel,
                            onPress: () => {},
                            style: 'cancel',
                          },
                          {
                            text: Languages.Login,
                            onPress: () => {
                              this.props.navigation.navigate('LoginScreen');
                            },
                          },
                        ],
                        {cancelable: true}
                      );
                    } else if (data.PhoneInUse) {
                      Alert.alert(
                        Languages.NumberAlreadyTakenAlert,
                        Languages.LoginToBecomeADealer,
                        [
                          {
                            text: Languages.Cancel,
                            onPress: () => {},
                            style: 'cancel',
                          },
                          {
                            text: Languages.Login,
                            onPress: () => {
                              this.props.navigation.navigate('LoginScreen');
                            },
                          },
                        ],
                        {cancelable: true}
                      );
                      //      toast(Languages.NumberAlreadyTaken);
                    } else if (data.IsDealer == 1) {
                      //    alert(JSON.stringify(data));
                      this.props.storeUserData(data.CurrentUser, () => {
                        if (data.Code == 1) this.refs.OTPModal.open();
                        else {
                          if (this.props.navigation.getParam('Edit', 0) == 0) {
                            KS.PlansGet({
                              langid: Languages.langID,
                              isocode: this.state.selectedCountry.cca2,
                            }).then((data) => {
                              if (data?.Plans?.length > 0) {
                                this.props.navigation.replace(
                                  'SubscriptionsScreen',
                                  {
                                    ISOCode: this.state.selectedCountry.cca2, //data.CurrentUser.ISOCode,
                                    User: this.props.user,
                                    Plans: data.Plans,
                                  }
                                );
                              } else {
                                toast(Languages.WaitingAdminAprroval, 6000);
                                this.props.navigation.goBack();
                              }
                            });
                          } else {
                            // is Edit
                            // this.props.navigation.goBack();

                            this.props.navigation.goBack();
                          }

                          //    setTimeout(() => {

                          // this.props.navigation.dispatch(
                          //   StackActions.reset({
                          //     index: 0,
                          //     key: null,
                          //     actions: [
                          //       NavigationActions.navigate({
                          //         routeName: "App",
                          //       }),
                          //     ],
                          //   })
                          // );

                          // this.props.navigation.navigate("HomeScreen");
                          //   }, 2000);
                        }
                      });
                    }
                  } else {
                    alert(data.Message);
                  }
                });
              } else {
                if (
                  (this.state.email &&
                    this.state.email.length > 0 &&
                    !this.state.isEmailRegisterCountry &&
                    !this.validateEmail(this.state.email)) ||
                  (this.state.isEmailRegisterCountry &&
                    !this.validateEmail(this.state.email))
                ) {
                  toast(Languages.InvalidEmail);
                } else if (
                  !(this.refs.phone && this.refs.phone.isValidNumber())
                ) {
                  toast(Languages.InvalidNumber);
                } else if (
                  this.state.password &&
                  this.state.password.length < 6
                ) {
                  toast(Languages.passwordTooShort);
                } else {
                  toast(Languages.FillRedBoxes);
                }
              }
            }}
            // onPress={() => {
            //   this.refs.OTPModal.open();
            // }}
          >
            <Text style={{color: '#fff', textAlign: 'center'}}>
              {this.props.navigation.getParam('BecomeADealer', 0)
                ? Languages.BecomeADealer
                : this.props.navigation.getParam('Edit', 0)
                ? Languages.Confirm
                : Languages.SignUp}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  modalTextinput: {
    height: 40,
    borderColor: Color.secondary,
    marginTop: 10,
    borderBottomWidth: 1,
    fontSize: 16,
  },
  CancelButton: {
    backgroundColor: '#EFEFF1',
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  ChangeButton: {
    backgroundColor: Color.secondary,
    flex: 1,
    textAlign: 'center',

    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  modalbox: {
    zIndex: 500,
    elevation: 10,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flex: 1,
  },
  modalContent: {
    width: Dimensions.get('screen').width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    // opacity:0.9,
    //  height: 200,
    minHeight: 200,
    elevation: 10,

    padding: 20,
    borderRadius: 1,
    justifyContent: 'center',
    //  alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: '#000',
  },
  Textinput: {
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    borderBottomColor: Color.blackDivide,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    borderBottomWidth: 1,
    paddingHorizontal: 5,
  },
  header: {
    textAlign: 'left',
    color: '#283B77',
    marginBottom: 5,
  },
  inputWrap: {
    //flexDirection: "row",
    //  alignItems: "center",
    //  borderColor: Color.blackDivide,
    //  borderBottomWidth: 1,
    backgroundColor: 'white',
    marginTop: 10,
    padding: 10,
  },
  text: {
    fontFamily: 'Cairo-Regular',
    textAlign: 'left',
    fontSize: 16,
    //   padding: 5,
    // paddingHorizontal: 10,
    color: '#C7C7CD',
  },
});

const mapStateToProps = ({home, user, menu}) => {
  return {
    homePageData: home.homePageData,
    user: user.user,
    ViewingCountry: menu.ViewingCountry,
  };
};

const mapDispatchToProps = (dispatch) => {
  const MenuRedux = require('@redux/MenuRedux');
  const UserRedux = require('@redux/UserRedux');

  return {
    setViewingCountry: (country, callback) =>
      MenuRedux.actions.setViewingCountry(dispatch, country, callback),
    ReduxLogout: () => dispatch(UserRedux.actions.logout()),
    storeUserData: (user, callback) =>
      UserRedux.actions.storeUserData(dispatch, user, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DealerSignUp);
