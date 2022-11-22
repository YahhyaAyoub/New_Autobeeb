import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Image,
  Share,
  TouchableOpacity,
  Alert,
  I18nManager,
} from 'react-native';
import KS from '@services/KSAPI';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Languages, Color} from '@common';
import {
  LogoSpinner,
  RowListingsComponent,
  BannerListingsComponent,
  OTPModal,
} from '@components';
import NewHeader from '../containers/NewHeader';
import Moment from 'moment';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {toast} from '@app/Omni';
import {NavigationEvents} from 'react-navigation';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {NavigationActions, StackActions} from 'react-navigation';
import AddButton from '@components/AddAdvButton';

var md5 = require('md5');

class ActiveOffers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      ListingsLoading: true,
      User: this.props.user,
      UserLoading: true,
      active: this.props.navigation
        .dangerouslyGetParent()
        .getParam('active', true),
    };
  }

  fetchUserListings() {
    try {
      KS.UserGet({
        userID: this.props.navigation
          .dangerouslyGetParent()
          .getParam('userid', this.props.user ? this.props.user.ID : null),
        langid: Languages.langID,
      }).then((data) => {
        console.log(
          JSON.stringify(
            this.props.navigation
              .dangerouslyGetParent()
              .getParam('userid', this.props.user ? this.props.user.ID : null)
          )
        );
        if (data && data.Success == 1) {
          if (data.User == null) {
            this.Logout();
          } else {
            this.setState({
              UserLoading: false,
              User: data.User,
              userLimit:
                data.User && data.User.IsDealer
                  ? data.User.DealerLimit
                  : data.User.UserLimit,
              ActiveListings: data.ActiveListings,
              InActiveListings: data.InActiveListings,
            });

            if (data.User.IsActive == false) {
              toast(Languages.AccountBlocked, 3500);

              this.props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [NavigationActions.navigate({routeName: 'App'})],
                })
              );
            }
          }
        } else {
          this.setState({
            UserLoading: false,
          });
        }
      });

      KS.UserListings({
        langid: Languages.langID,
        page: 1,
        pagesize: 5,
        offerStatus: this.props.navigation
          .dangerouslyGetParent()
          .getParam('status', 16),
        userid: this.props.navigation
          .dangerouslyGetParent()
          .getParam('userid', this.props.user ? this.props.user.ID : null),
      }).then((data) => {
        if (data && data.Success) {
          this.setState({
            Listings: data.Listings,
            page: 1,
            TotalPages: data.TotalPages,
          });
        }
        this.setState({ListingsLoading: false});
      });
    } catch (e) {
      //  alert(JSON.stringify(e));
      //    this.setState({ ListingsLoading: false, UserLoading: false });
    }
  }

  componentDidMount() {
    this.fetchUserListings();
  }

  Logout() {
    AsyncStorage.setItem('user', '', () => {
      this.props.ReduxLogout();
      //    this.props.navigation.navigate("HomeScreen");
    });
  }

  onShare = async (item) => {
    try {
      await Share.share({
        message:
          Languages.CheckOffer +
          '\n' +
          (I18nManager.isRTL
            ? 'https://autobeeb.com/ar/offer/'
            : 'https://autobeeb.com/offer/') +
          item.Name +
          '/' +
          item.ID +
          '/' +
          item.TypeID,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  getUserListings(status) {
    this.setState({refreshing: true});
    KS.UserListings({
      langid: Languages.langID,
      page: 1,
      pagesize: 5,
      offerStatus: status,
      userid: this.props.navigation
        .dangerouslyGetParent()
        .getParam('userid', this.props.user ? this.props.user.ID : null),
    }).then((data) => {
      //    alert(JSON.stringify(data));

      if (data && data.Success) {
        this.setState({
          Listings: data.Listings,
          page: 1,
          TotalPages: data.TotalPages,
        });
      }
      this.setState({refreshing: false});
    });
  }

  resendCode() {
    this.setState({otp: ''});
    KS.ResendOTP({
      userID: this.state.User.ID,
    }).then((data) => {
      if (data.Success == 1) {
        //   alert(JSON.stringify(data));
      } else {
        alert('something went wrong');
      }
      //
    });
  }
  checkOTP() {
    const _this = this;
    const otp = this.state.otp;
    {
      KS.UserVerifyOTP({
        otpcode: otp,
        userid: this.state.User.ID,
        username:
          this.props.user && this.props.user.EmailRegister
            ? this.props.user.Email
            : this.state.User && this.state.User.Phone,
      }).then((data) => {
        if (data.OTPVerified == true || data.EmailConfirmed == true) {
          //    this.setPushNotification(this.props.navigation .dangerouslyGetParent().getParam("id", 0));

          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              _this.refs.OTPModal.close();
              _this.props.navigation.navigate('HomeScreen');
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
    if (this.state.ListingsLoading || this.state.UserLoading) {
      return (
        <View style={{flex: 1}}>
          <NewHeader
            navigation={this.props.navigation}
            HomeScreen
            onCountryChange={(item) => {
              this.setState({cca2: item.cca2});
            }}
          />
          <LogoSpinner fullStretch />
        </View>
      );
    }
    return (
      <View style={{flex: 1}}>
        <NavigationEvents
          onDidFocus={() => {
            this.setState({
              active: this.props.navigation
                .dangerouslyGetParent()
                .getParam('active', true),
            });

            this.fetchUserListings();
          }}
        />
        {this.state.User && (
          <OTPModal
            ref="OTPModal"
            OTPMessage={Languages.WeHavePreviouslySentTheOTP}
            EnterMessage={Languages.ToPublishAndVerifyAccount}
            pendingDelete={this.state.pendingDelete}
            ignoreResend
            onOpened={() => {
              this.setState({footerShown: false});
            }}
            Username={
              this.props.user && this.props.user.EmailRegister
                ? this.props.user.Email
                : this.state.User && this.state.User.Phone
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
              this.setState({footerShown: true});
            }}
            resendCode={() => {
              this.resendCode();
            }}
          />
        )}
        {this.state.active && <AddButton navigation={this.props.navigation} />}
        <ScrollView
          contentContainerStyle={{flex: 1}}
          style={{backgroundColor: '#eee'}}
        >
          <StatusBar
            backgroundColor="#fff"
            barStyle="dark-content"
            translucent={false}
          />

          <NewHeader
            navigation={this.props.navigation}
            //   back
            onCountryChange={(item) => {
              this.setState({cca2: item.cca2});
            }}
          />
          {
            <View
              style={{
                flexDirection: 'row',
                borderTopWidth: 1,
                borderColor: '#ddd',
                elevation: 1,
                alignItems: 'center',
                backgroundColor: '#fff',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: this.state.active ? Color.primary : '#fff',
                  padding: 5,
                  paddingVertical: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightColor: '#ddd',
                  borderRightWidth: 1,
                }}
                onPress={() => {
                  this.getUserListings(16);
                  this.setState({active: true, page: 1});
                }}
              >
                <Text
                  style={{
                    color: this.state.active ? '#fff' : '#000',
                    textAlign: 'center',
                  }}
                >
                  {Languages.ActiveOffers}
                </Text>
                {
                  <Text
                    style={{
                      color: this.state.active ? '#fff' : '#000',
                      textAlign: 'center',
                    }}
                  >
                    {this.state.ActiveListings + '/' + this.state.userLimit}
                  </Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: !this.state.active ? Color.primary : '#fff',
                  padding: 5,
                  paddingVertical: 5,
                }}
                onPress={() => {
                  this.getUserListings(10);

                  this.setState({active: false, page: 1});
                }}
              >
                <Text
                  style={{
                    color: !this.state.active ? '#fff' : '#000',
                    textAlign: 'center',
                  }}
                >
                  {Languages.InActiveOffers}
                </Text>
                <Text
                  style={{
                    color: !this.state.active ? '#fff' : '#000',
                    textAlign: 'center',
                  }}
                >
                  {this.state.InActiveListings}
                </Text>
              </TouchableOpacity>
            </View>
          }

          {this.state.refreshing ? (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <ActivityIndicator size="large" color={'#F85502'} />
            </View>
          ) : (
            <FlatList
              extraData={this.state.Listings}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{
                alignItems: 'center',
                paddingVertical: 10,
                //  paddingVertical: 20
              }}
              refreshing={this.state.refreshing}
              data={this.state.Listings}
              renderItem={({item, index}) => {
                return (
                  <BannerListingsComponent
                    key={index}
                    user={this.state.User}
                    AppCountryCode={this.props.ViewingCountry?.cca2}
                    activeOffers
                    active={this.state.active}
                    onDelete={(item) => {
                      Alert.alert(
                        '',
                        Languages.DeleteConfirm,
                        [
                          {
                            text: Languages.Cancel,
                            onPress: () => {},
                            style: 'cancel',
                          },
                          {
                            text: Languages.Delete,
                            onPress: () => {
                              KS.DeleteOffer({
                                listingID: item.ID,
                                kensoftware: md5(
                                  item.ID + 'KhaledYazeedMohammad'
                                ),
                                userid: this.props.navigation
                                  .dangerouslyGetParent()
                                  .getParam(
                                    'userid',
                                    this.props.user ? this.props.user.ID : null
                                  ),
                              }).then((data) => {
                                //  alert(JSON.stringify(data));
                                if (data && data.Success) {
                                  //  alert(JSON.stringify(data));
                                  let formattedListings = this.state.Listings.filter(
                                    (x) => x.ID != item.ID
                                  );
                                  this.setState({
                                    Listings: formattedListings,
                                  });
                                  if (this.state.active) {
                                    this.setState({
                                      ActiveListings:
                                        this.state.ActiveListings - 1,
                                    });
                                  } else {
                                    this.setState({
                                      InActiveListings:
                                        this.state.InActiveListings - 1,
                                    });
                                  }
                                }
                              });
                            },
                          },
                        ],
                        {cancelable: true}
                      );
                    }}
                    onDeactivate={(item) => {
                      Alert.alert(
                        '',
                        Languages.DeactivateConfirm,
                        [
                          {
                            text: Languages.Cancel,
                            onPress: () => {},
                            style: 'cancel',
                          },
                          {
                            text: Languages.Deactivate,
                            onPress: () => {
                              KS.OfferUpdateStatus({
                                listingID: item.ID,
                                status: 8,
                                userid: this.props.navigation
                                  .dangerouslyGetParent()
                                  .getParam(
                                    'userid',
                                    this.props.user ? this.props.user.ID : null
                                  ),
                              }).then((OfferData) => {
                                if (OfferData && OfferData.Success) {
                                  //    alert(JSON.stringify(data));
                                  KS.UserListings({
                                    langid: Languages.langID,
                                    page: 1,
                                    pagesize: 5,
                                    offerStatus: 16,
                                    userid: this.props.navigation
                                      .dangerouslyGetParent()
                                      .getParam(
                                        'userid',
                                        this.props.user
                                          ? this.props.user.ID
                                          : null
                                      ),
                                  }).then((data) => {
                                    //    alert(JSON.stringify(data));
                                    if (data && data.Success) {
                                      this.setState({
                                        Listings: data.Listings,
                                        page: 1,
                                        InActiveListings:
                                          OfferData.DeactiveCount,
                                        ActiveListings: OfferData.ActiveCount,

                                        TotalPages: data.TotalPages,
                                      });
                                    }
                                    this.setState({ListingsLoading: false});
                                  });

                                  // let formattedListings = this.state.Listings.filter(
                                  //   x => x.ID != item.ID
                                  // );
                                  // this.setState({
                                  //   Listings: formattedListings,
                                  //   ActiveListings: this.state.ActiveListings - 1,
                                  //   InActiveListings: this.state.InActiveListings + 1
                                  // });
                                }
                              });
                            },
                            style: 'cancel',
                          },
                        ],
                        {cancelable: true}
                      );
                    }}
                    onActivate={(item) => {
                      KS.OfferUpdateStatus({
                        listingID: item.ID,
                        status: 16,
                        userid: this.props.navigation
                          .dangerouslyGetParent()
                          .getParam(
                            'userid',
                            this.props.user ? this.props.user.ID : null
                          ),
                      }).then((OfferData) => {
                        if (OfferData.Status == 1) {
                          //  alert(JSON.stringify(data));
                          KS.UserListings({
                            langid: Languages.langID,
                            page: 1,
                            pagesize: 5,
                            offerStatus: 10,
                            userid: this.props.navigation
                              .dangerouslyGetParent()
                              .getParam(
                                'userid',
                                this.props.user ? this.props.user.ID : null
                              ),
                          }).then((data) => {
                            //    alert(JSON.stringify(data));
                            if (data && data.Success) {
                              this.setState({
                                Listings: data.Listings,
                                page: 1,
                                InActiveListings: OfferData.DeactiveCount,
                                ActiveListings: OfferData.ActiveCount,

                                TotalPages: data.TotalPages,
                              });
                            }
                            this.setState({ListingsLoading: false});
                          });
                          // let formattedListings = this.state.Listings.filter(
                          //   x => x.ID != item.ID
                          // );
                        } else {
                          toast(Languages.ExhaustedActiveOffers, 7000);
                        }
                      });
                    }}
                    onShare={(item) => {
                      this.onShare(item);
                    }}
                    onEdit={(item) => {
                      KS.ListingEditGet({
                        langid: Languages.langID,
                        id: item.ID,
                        userid: this.props.navigation
                          .dangerouslyGetParent()
                          .getParam(
                            'userid',
                            this.props.user ? this.props.user.ID : null
                          ),
                      }).then((data) => {
                        this.props.navigation.navigate('PostOfferScreen', {
                          Edit: true, // this is for editing the steps so it only edits one by one
                          EditOffer: true, //while this is to load the data from this listing
                          Category: data.Category,
                          Section: data.Section,
                          ParentCategory: data.ParentCategory,
                          step: 18,
                          Listing: data.Listing,
                        });
                      });
                    }}
                    onVerify={() => {
                      this.refs.OTPModal.open();
                    }}
                    item={item}
                    navigation={this.props.navigation}
                  />
                );
              }}
              onEndReached={() => {
                this.setState({page: this.state.page + 1}, () => {
                  //  console.log(this.state.page);
                  if (this.state.page <= this.state.TotalPages) {
                    this.setState({footerLoading: true});

                    KS.UserListings({
                      langid: Languages.langID,
                      page: this.state.page,
                      pagesize: 5,
                      offerStatus: this.state.active ? 16 : 10,
                      userid: this.props.navigation
                        .dangerouslyGetParent()
                        .getParam(
                          'userid',
                          this.props.user ? this.props.user.ID : null
                        ),
                    }).then((data) => {
                      if (data && data.Success) {
                        let concattedListings = this.state.Listings.concat(
                          data.Listings
                        );
                        this.setState({
                          Listings: concattedListings,
                          TotalPages: data.TotalPages,

                          footerLoading: false,
                        });
                      }
                      this.setState({ListingsLoading: false});
                    });
                  }
                });
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                this.state.footerLoading && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 10,
                    }}
                  >
                    <ActivityIndicator size="large" color={'#F85502'}/>
                  </View>
                )
              }
            />
          )}
        </ScrollView>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  const UserRedux = require('@redux/UserRedux');
  return {
    ReduxLogout: () => dispatch(UserRedux.actions.logout()),
    storeUserData: (user, callback) =>
      UserRedux.actions.storeUserData(dispatch, user, callback),
  };
};
const mapStateToProps = ({user, menu}) => ({
  user: user.user,
  ViewingCountry: menu.ViewingCountry,
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveOffers);
