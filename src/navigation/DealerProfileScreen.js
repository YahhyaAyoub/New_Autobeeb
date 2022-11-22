import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageBackground,
  Share,
  Dimensions,
  StyleSheet,
  RefreshControl,
  I18nManager,
  Platform,
  Linking,
} from 'react-native';
import KS from '@services/KSAPI';
import {Languages, Color} from '@common';
import {
  LogoSpinner,
  RowListingsComponent,
  DealersBanner,
  BannerListingsComponent,
} from '@components';
import LinearGradient from 'react-native-linear-gradient';
import {HeaderBackButton} from 'react-navigation-stack';
import IconEV from 'react-native-vector-icons/EvilIcons';

import IconMa from 'react-native-vector-icons/MaterialIcons';

import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';

import Modal from 'react-native-modalbox';
import {connect} from 'react-redux';
import getDirections from 'react-native-google-maps-directions';
import {NavigationEvents} from 'react-navigation';
import admob, {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from '@react-native-firebase/admob';

class DealerProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      refreshing: false,
      date: new Date(),
      ListingsLoading: true,
      DealerLoading: true,
      active: true,
      currency: global.ViewingCurrency
        ? global.ViewingCurrency
        : {
            ID: 2,
            Ratio: 1.0,
            Standard: true,
            Name: 'USD',
            Format: '$ {0}',
            Rank: 0,
            NumberFormat: 'N0',
            ShortName: 'USD',
            Primary: true,
          },
    };
  }

  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  handleGetDirections = (destination) => {
    const data = {
      destination: destination,
      params: [
        {
          key: 'travelmode',
          value: 'driving', // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: 'dir_action',
          value: 'navigate', // this instantly initializes navigation using the given travel mode
        },
      ],
    };

    getDirections(data);
  };

  componentDidMount() {
    //  alert(JSON.stringify(this.state.currency));

    KS.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: this.props.ViewingCurrency
        ? this.props.ViewingCurrency.ID
        : '2',
    })
      .then((result) => {
        if (result && result.Success) {
          //   alert(JSON.stringify(result));

          this.setState({PrimaryCurrencies: result.Currencies});
          result.Currencies &&
            result.Currencies.forEach((cur) => {
              if (global?.ViewingCurrency) {
                if (cur.ID == global?.ViewingCurrency?.ID) {
                  this.setState({currency: cur});
                }
              } else {
                if (cur.ID == this.props.ViewingCurrency?.ID) {
                  global.ViewingCurrency = cur;
                  this.setState({currency: cur});
                }
              }
            });
        } else {
          //should never happen, in case something goes wrong ill have fallback currencies
          this.setState({
            PrimaryCurrencies: [
              {
                ID: 2,
                Ratio: 1.0,
                Standard: true,
                Name: 'USD',
                Format: '$ {0}',
                Rank: 0,
                NumberFormat: 'N0',
                ShortName: 'USD',
                Primary: true,
              },
              {
                ID: 29,
                Ratio: 0.92,
                Standard: false,
                Name: 'Euro',
                Format: '€ {0}',
                Rank: 0,
                NumberFormat: 'N0',
                ShortName: 'EUR',
                Primary: true,
              },
            ],
          });
        }
      })
      .catch((err) => {});

    try {
      KS.DealerGet({
        userID: this.props.navigation.getParam('userid', 0),
        langid: Languages.langID,
      }).then((data) => {
        if (data && data.Success) {
          this.setState({
            Dealer: data.Dealer,
            Competences: data.Competences,
            Makes: data.Makes,

            vat: data.Dealer.Vat,
            Phone: data.Dealer.Phone,
            aboutCo: data.Dealer.About,
            Address: data.Dealer.Address,
            hideMobile: data.Dealer.HideMobile,
            DealerLoading: false,
          });
        }
      });

      KS.UserListings({
        langid: Languages.langID,
        offerStatus: 16,

        page: 1,
        pagesize: 10,
        userid: this.props.navigation.getParam('userid', null),
      }).then((data) => {
        //    alert(JSON.stringify(data));
        if (data && data.Success) {
          this.setState({
            Listings: data.Listings,
            TotalPages: data.TotalPages,
          });
        }
        this.setState({ListingsLoading: false});
      });
    } catch (e) {
      alert(JSON.stringify(e));
      //    this.setState({ ListingsLoading: false, UserLoading: false });
    }

    KS.BannersGet({
      isoCode: this.props.ViewingCountry.cca2,
      langID: Languages.langID,
      placementID: 4,
    }).then((data) => {
      if (data && data.Success == '1' && data.Banners?.length > 0) {
        this.setState({
          Banners: data.Banners,
        });
      }
    });
  }

  _onRefresh = () => {
    this.setState({refreshing: true, ListingsLoading: true});
    KS.UserListings({
      langid: Languages.langID,
      page: 1,
      pagesize: 10,
      offerStatus: 16,

      userid: this.props.navigation.getParam('userid', null),
    }).then((data) => {
      //    alert(JSON.stringify(data));
      if (data && data.Success) {
        this.setState({
          Listings: data.Listings,
          refreshing: false,
          TotalPages: data.TotalPages,
          page: 1,
        });
      }
      this.setState({ListingsLoading: false});
    });
  };

  renderCurrencyRow(Currency) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          global.ViewingCurrency = Currency;
          this.setState({currency: Currency, page: 1});
          //   this.ResetFilters();
          this.refs.CurrencyModal.close();

          KS.UserListings({
            langid: Languages.langID,
            offerStatus: 16,

            page: 1,
            pagesize: 10,
            userid: this.props.navigation.getParam('userid', null),
          }).then((data) => {
            //    alert(JSON.stringify(data));
            if (data && data.Success) {
              this.setState({
                Listings: data.Listings,
                TotalPages: data.TotalPages,
              });
            }
            this.setState({ListingsLoading: false});
          });
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 6,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color:
                this.state.currency.ID == Currency.ID ? Color.primary : '#000',
              marginLeft: 20,
              fontSize: 23,
              flex: 5,
              textAlign: 'left',
            }}
          >
            {Currency.Name}
          </Text>
        </View>
        <IconMa
          name={
            this.state.currency.ID == Currency.ID
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={25}
          color={this.state.currency.ID == Currency.ID ? Color.primary : '#000'}
        />
      </TouchableOpacity>
    );
  }

  renderCompetence() {
    try {
      let competencesNames = '';

      competencesNames = this.state.Competences.map((comp, index) => {
        return index != this.state.Competences.length - 1
          ? comp.Name + ', '
          : comp.Name;
      });

      return competencesNames;
    } catch {
      return 'no competence';
    }
  }

  renderMakes() {
    try {
      let MakesNames = '';

      MakesNames = this.state.Makes.map((make, index) => {
        return index != this.state.Makes.length - 1
          ? make.Name + ', '
          : make.Name;
      });

      return MakesNames;
    } catch {
      return 'no Makes';
    }
  }
  renderHeaderComponent() {
    return (
      <View style={{marginBottom: 10}}>
        {this.state.Dealer && (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <DealersBanner
              item={this.state.Dealer}
              date={this.state.date}
              full
              dealerProfile
            />
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            //   borderTopWidth: 1,
            borderColor: '#ddd',
            elevation: 1,
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              borderBottomWidth: 2,
              borderBottomColor: this.state.active ? Color.primary : '#ddd',

              padding: 5,
              paddingVertical: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderRightColor: '#ddd',
              borderRightWidth: 1,
            }}
            onPress={() => {
              this.setState({active: true});
            }}
          >
            <Text
              style={{
                color: '#000',
                textAlign: 'center',
              }}
            >
              {Languages.Offers}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              borderBottomWidth: 2,
              borderBottomColor: !this.state.active ? Color.primary : '#ddd',
              padding: 5,
              paddingVertical: 5,
            }}
            onPress={() => {
              this.setState({active: false});
            }}
          >
            <Text
              style={{
                color: '#000',
                textAlign: 'center',
              }}
            >
              {Languages.Information}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  AppLink() {
    return `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`;
  }
  generateDealerLink() {
    if (I18nManager.isRTL) {
      return `https://autobeeb.com/ar/dealer/dealer/${this.props.navigation.getParam(
        'userid',
        0
      )}`;
    } else {
      return `https://autobeeb.com/dealer/dealer/${this.props.navigation.getParam(
        'userid',
        0
      )}`;
    }
  }
  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          Languages.CheckDealer +
          '\n' +
          this.generateDealerLink() +
          '\n' +
          '\n' +
          Languages.DownloadAutobeeb +
          '\n' +
          this.AppLink(),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  renderItem = ({item, index}) => {
    {
      if (item.AutoBeebBanner) {
        return (
          <TouchableOpacity
            disabled={!item.BannerDetails.Link}
            style={{}}
            onPress={() => {
              KS.BannerClick({
                bannerID: item.BannerDetails.ID,
              });
              let URL = item.BannerDetails.Link;

              if (URL.includes('details')) {
                this.props.navigation.push('CarDetails', {
                  item: {
                    ID: URL.split('/')[URL.split('/').length - 2],
                    TypeID: URL.split('/')[URL.split('/').length - 1],
                  },
                });
              } else if (URL.includes('postoffer')) {
                this.props.navigation.navigate('PostOfferScreen');
              } else if (URL.includes('dealers')) {
                this.props.navigation.navigate('DealersScreen', {
                  Classification: URL.split('/')[URL.split('/').length - 1],
                });
              } else if (URL.includes('dealer_info')) {
                this.props.navigation.push('DealerProfileScreen', {
                  userid: URL.split('/')[URL.split('/').length - 1],
                });
              } else if (URL.includes('blog')) {
                this.props.navigation.navigate('BlogDetails', {
                  Blog: {
                    ID: URL.split('/')[URL.split('/').length - 1],
                  },
                });
              } else if (URL.includes('freeSearch')) {
                this.props.navigation.navigate('Search', {
                  query: URL.split('/')[URL.split('/').length - 1],
                });
              } else {
                Linking.openURL(URL);
              }
            }}
          >
            <Image
              resizeMode="contain"
              source={{
                uri: `https://autobeeb.com/${item.BannerDetails.FullImagePath}.jpg`,
              }}
              style={{
                //  marginVertical: 10,
                alignSelf: 'center',
                width: Dimensions.get('window').width * 0.8,
                height: (Dimensions.get('window').width * 0.8) / 1.8,
                marginBottom: 8,
              }}
            />
          </TouchableOpacity>
        );
      }
      if (item.Banner) {
        return (
          <View
            style={{
              alignItems: 'center',
              minHeight: 10,
              //     paddingVertical: 5,
              //backgroundColor: "white",
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <BannerAd
              unitId={Platform.select({
                android: 'ca-app-pub-2004329455313921/8851160063',
                ios: 'ca-app-pub-2004329455313921/8383878907',
              })}
              size={BannerAdSize.MEDIUM_RECTANGLE}
            />
          </View>
        );
      } else
        return (
          <BannerListingsComponent
            key={index}
            profile
            item={item}
            navigation={this.props.navigation}
            AppCountryCode={this.props.ViewingCountry?.cca2}
          />
        );
    }
  };

  render() {
    if (this.state.ListingsLoading || this.state.DealerLoading) {
      return (
        <View style={{flex: 1}}>
          <LogoSpinner fullStretch />
        </View>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={{flex: 1}}
        style={{backgroundColor: '#eee'}}
      >
        {this.props.navigation && (
          <NavigationEvents
            onDidFocus={() => {
              // alert(JSON.stringify(payload))
              StatusBar.setBarStyle('light-content');
            }}
          />
        )}
        <Modal //currency modal
          ref="CurrencyModal"
          //  isOpen={true}
          style={[styles.sellTypeModal]}
          position="center"
          backButtonClose={true}
          entry="bottom"
          swipeToClose={true}
          // backdropPressToClose
          coverscreen={false}
          backdropOpacity={0.5}
        >
          <View
            style={{
              height: Dimensions.get('screen').height * 0.7,
              // justifyContent: 'center',
              // alignItems:"center",
              alignSelf: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width * 0.8,
            }}
          >
            <View
              style={{backgroundColor: 'white', padding: 5, borderRadius: 10}}
            >
              {this.state.PrimaryCurrencies &&
                this.state.PrimaryCurrencies.map((type) =>
                  this.renderCurrencyRow(type)
                )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.refs.CurrencyModal.close();
                }}
              >
                <Text
                  style={{
                    color: Color.secondary,
                    flex: 1,
                    fontSize: 26,
                    textAlign: 'center',
                  }}
                >
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {this.state.currency && this.state.active && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 10,
              zIndex: 100,
              right: 5,
              backgroundColor: Color.primary,
              padding: 15,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: '#fff',
              elevation: 5,
            }}
            onPress={(data) => {
              this.refs.CurrencyModal.open();
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: 'white',
                fontFamily: 'Cairo-Bold',
              }}
            >
              {this.state.currency?.ShortName}
            </Text>
          </TouchableOpacity>
        )}
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        ></StatusBar>
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.8)',
            'rgba(0,0,0,0.5)',
            'rgba(0,0,0,0.3)',
            'rgba(0,0,0,0.1)',
          ]}
          style={{
            position: 'absolute',
            top: 0,
            zIndex: 500,
            minHeight: 50,
            width: Dimensions.get('screen').width,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 30,
              justifyContent: 'space-between',
            }}
          >
            <HeaderBackButton
              labelVisible={false}
              tintColor="#fff"
              style={{}}
              onPress={() => {
                this.props.navigation.goBack();
              }}
            />
            <TouchableOpacity
              style={{marginRight: 15}}
              onPress={() => {
                this.onShare();
              }}
            >
              <IconEV name="share-google" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {this.state.active && (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              alignItems: 'center',
              //paddingBottom: 10
              //  paddingVertical: 20
            }}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
            ListHeaderComponent={() => {
              return this.renderHeaderComponent();
            }}
            data={this.state.Listings}
            renderItem={this.renderItem.bind(this)}
            onEndReached={() => {
              this.setState({page: this.state.page + 1}, () => {
                if (this.state.page <= this.state.TotalPages) {
                  this.setState({footerLoading: true});

                  KS.UserListings({
                    langid: Languages.langID,
                    offerStatus: 16,

                    userid: this.props.navigation.getParam('userid', null),
                    page: this.state.page,
                    pagesize: 10,
                  }).then((data) => {
                    if (data && data.Success) {
                      let concattedListings = this.state.Listings;
                      let tempBanners = this.state.Banners || [];

                      if (this.state.Banners?.length > 0) {
                        concattedListings.push({
                          AutoBeebBanner: true,
                          BannerDetails: tempBanners.shift(),
                        });
                        this.setState({Banners: tempBanners});
                      } else {
                        concattedListings.push({Banner: true});
                      }

                      concattedListings = concattedListings.concat(
                        data.Listings
                      );

                      this.setState(
                        {
                          Listings: concattedListings,
                        },
                        () => {
                          setTimeout(() => {
                            this.setState({footerLoading: false});
                          }, 1000);
                        }
                      );
                    }
                    this.setState({ListingsLoading: false});
                  });
                }
              });
            }}
            ListEmptyComponent={() => {
              return <Text style={{}}>{Languages.NoOffers}</Text>;
            }}
            onEndReachedThreshold={5}
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

        {!this.state.active && (
          <ScrollView
            style={{flex: 1, backgroundColor: '#fff'}}
            contentContainerStyle={{paddingBottom: 70}}
          >
            <View style={{}}>{this.renderHeaderComponent()}</View>
            {this.state.Dealer && (
              <View style={{}}>
                {this.state.Dealer.Classification && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Classification}
                    </Text>
                    <Text style={styles.InformationValue}>
                      {this.state.Dealer.Classification}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.Competence && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Competence}
                    </Text>
                    <Text
                      style={[
                        styles.InformationValue,
                        {
                          justifyContent: 'center',

                          textAlignVertical: 'center',
                        },
                      ]}
                    >
                      {this.renderCompetence()}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.Competence && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Makes}
                    </Text>
                    <Text
                      style={[
                        styles.InformationValue,
                        {
                          justifyContent: 'center',

                          textAlignVertical: 'center',
                        },
                      ]}
                    >
                      {this.renderMakes()}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.Phone && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Phone2}
                    </Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.Dealer.Phone}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.User && !this.state.Dealer.HideMobile && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.Mobile}
                    </Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.Dealer.User.Phone}
                    </Text>
                  </View>
                )}
                {this.state.Dealer.Vat && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>{Languages.Vat}</Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.Dealer.Vat}
                    </Text>
                  </View>
                )}

                {this.state.Dealer.About && (
                  <View style={styles.InformationRow}>
                    <Text style={styles.InformationTitle}>
                      {Languages.AboutCompany}
                    </Text>
                    <Text style={[styles.InformationValue]}>
                      {this.state.Dealer.About}
                    </Text>
                  </View>
                )}

                {this.state.Dealer?.LatLng && (
                  <View
                    style={[
                      styles.InformationRow,
                      {
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        paddingHorizontal: 5,
                      },
                    ]}
                  >
                    <Text style={{textAlign: 'left', marginBottom: 5}}>
                      {Languages.Address}
                    </Text>

                    <MapView
                      ref={(instance) => (this.map = instance)}
                      liteMode
                      region={{
                        latitude: parseFloat(
                          this.state.Dealer?.LatLng.split(',')[0]
                        ),
                        longitude: parseFloat(
                          this.state.Dealer?.LatLng.split(',')[1]
                        ),
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.002,
                      }}
                      onPress={() => {
                        this.handleGetDirections({
                          latitude: parseFloat(
                            this.state.Dealer?.LatLng.split(',')[0]
                          ),
                          longitude: parseFloat(
                            this.state.Dealer?.LatLng.split(',')[1]
                          ),
                        });
                      }}
                      provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                      style={{
                        width: '100%',
                        height: 180,

                        backgroundColor: '#fff',
                      }}
                    >
                      {
                        <MapView.Marker
                          onPress={() => {
                            this.handleGetDirections({
                              latitude: parseFloat(
                                this.state.Dealer?.LatLng.split(',')[0]
                              ),
                              longitude: parseFloat(
                                this.state.Dealer?.LatLng.split(',')[1]
                              ),
                            });
                          }}
                          coordinate={{
                            latitude: parseFloat(
                              this.state.Dealer?.LatLng.split(',')[0]
                            ),
                            longitude: parseFloat(
                              this.state.Dealer?.LatLng.split(',')[1]
                            ),
                          }}
                        />
                      }
                    </MapView>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  modelContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    alignSelf: 'center',

    //   height: Dimensions.get("screen").height * 0.7,

    width: Dimensions.get('screen').width * 0.8,
  },
  rangeTitle: {fontSize: 17, color: '#000'},
  rangeCancel: {
    color: Color.secondary,
  },
  rangeBox: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    borderColor: '#e6e6e6',
    width: Dimensions.get('screen').width * 0.45,
  },
  rangeBoxText: {
    textAlign: 'left',
    color: 'gray',
    fontSize: 16,
  },
  modalRowContainer: {
    marginVertical: 3,
    paddingBottom: 5,
    height: 50,
    justifyContent: 'center',
    //       borderWidth:1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  filterSectionContainer: {
    elevation: 2,
    borderWidth: 0,
    //borderColor:Color.secondary,
    overflow: 'hidden',
    marginHorizontal: 7,
    borderRadius: 5,
    backgroundColor: '#fff',
    //   borderWidth: 1,
    //  borderColor: "#f00",
    marginVertical: 5,
  },
  filterValueContainer: {
    flexDirection: 'row',
    width: Dimensions.get('screen').width,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    //  borderColor: Color.secondary,
    padding: 10,
    //  borderBottomWidth: 1,
    //   borderColor: "#e6e6e6"
  },
  FilterSectionHeader: {
    // marginBottom: 10,
    backgroundColor: '#fff',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e6e6e6',
    borderBottomColor: '#e6e6e6',
    paddingHorizontal: 10,
  },
  FilterSectionHeaderText: {
    //color: "#808080",
    color: Color.secondary,
    fontSize: 17,
    textAlign: 'left',
  },

  FilterButton: {
    borderColor: Color.secondary,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  filterContainer: {
    //   paddingVertical: 20
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    justifyContent: 'space-between',
    borderWidth: 0,
    elevation: 2,
    padding: 10,
  },
  sortContainerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: "#fff",
    justifyContent: 'center',
  },
  modal: {
    zIndex: 50,

    elevation: 10,
    zIndex: 20,

    height: Dimensions.get('screen').height * 0.8,

    width: Dimensions.get('screen').width,
  },
  modelModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    padding: 0,
    //  flex: 1,

    elevation: 10,
  },

  filterModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    height: '100%',
    justifyContent: 'flex-end',
    width: Dimensions.get('screen').width,
    padding: 0,
    //  flex: 1,

    elevation: 10,
  },
  sellTypeModal: {
    zIndex: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    // alignItems: "center",
    justifyContent: 'center',

    flex: 1,
  },
  sortContainerText: {
    textAlign: 'left',
    color: '#000',
    fontSize: 16,
  },
  whiteContainer: {
    //  marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    // marginHorizontal: 4,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
  InformationRow: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingVertical: 5,
    // flexDirection: "row",
    // alignItems: "center",
  },
  InformationTitle: {
    paddingHorizontal: 5,
    textAlign: 'left',

    color: '#000',
    fontSize: 18,
  },
  InformationValue: {
    textAlign: 'left',
    color: '#61667B',
    paddingHorizontal: 5,
  },
});

const mapStateToProps = ({menu, user}) => ({
  ViewingCurrency: menu.ViewingCurrency,
  ViewingCountry: menu.ViewingCountry,
});

export default connect(mapStateToProps, undefined)(DealerProfileScreen);
