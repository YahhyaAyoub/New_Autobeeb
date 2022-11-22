import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  I18nManager,
  Platform,
  Linking,
} from 'react-native';
import {NewHeader} from '@containers';
import {
  MainListingsComponent,
  BannerListingsComponent,
  RowListingsComponent,
  Drawer,
  LogoSpinner,
} from '@components';
import AddButton from '@components/AddAdvButton';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconANT from 'react-native-vector-icons/Ionicons';

import IconFa from 'react-native-vector-icons/FontAwesome';
import IconFE from 'react-native-vector-icons/Feather';
import IconEn from 'react-native-vector-icons/Entypo';
import {Color} from '@common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

import IconIon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';
import Languages from '../common/Languages';
import KS from '@services/KSAPI';
import Constants from '../common/Constants';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import admob, {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from '@react-native-firebase/admob';

const BigFont = 22;
const MediumFont = 16;
const SmallFont = 14;

const pageSize = 16;
class SearchResult extends Component {
  constructor(props) {
    super(props);

    this.state = {
      renderType: 2,
      PageNum: 1,
      isLoading: true,
      currency: global.ViewingCurrency
        ? global.ViewingCurrency
        : this.props.ViewingCurrency || {
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
      footerLoading: false,
    };
  }
  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  componentDidMount() {
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

    KS.FreeSearch({
      searchFor: this.props.navigation.getParam('submitted', false)
        ? this.props.navigation.getParam('query', '')
        : '',
      makeID: this.props.navigation.getParam('MakeID', ''),
      modelID: this.props.navigation.getParam('ModelID', ''),
      langID: Languages.langID,
      isocode: this.props.ViewingCountry.cca2,
      pagenum: this.state.PageNum,
      userid: (this.props.user && this.props.user.ID) || '',
      cur: this.state.currency?.ID,
      pageSize,
    }).then((data) => {
      if (data && data.Success) {
        this.setState({
          Listings: data.Listings,
          ISOCode: data.ISOCode,

          isLoading: false,
          maximumPages: data.Pages,
        });
      }
    });

    KS.BannersGet({
      isoCode: this.props.ViewingCountry.cca2,
      langID: Languages.langID,
      placementID: 3,
    }).then((data) => {
      if (data && data.Success == '1' && data.Banners?.length > 0) {
        this.setState({
          Banners: data.Banners,
        });
      }
    });

    if (this.props.navigation.getParam('Make', false)) {
      this.setState({
        CanFilter: true,
        selectedMake: this.props.navigation.getParam('Make', 0),
        selectedModel: this.props.navigation.getParam('Model', undefined),
      });
    }

    let tempTypes = [...this.props.homePageData.MainTypes];
    let lastItem = tempTypes.splice(5, 1)[0]; // remove spare parts from last
    tempTypes.splice(1, 0, lastItem); //add spare parts to 2nd option per client request
    this.setState({MainTypes: tempTypes});
  }

  renderCatRow({item}) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          this.props.navigation.navigate('SearchResult', {
            Category: this.props.navigation.getParam('Category', 0),
            SubCategory: this.props.navigation.getParam('SubCategory', 0),
          });
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.img && (
            <FastImage
              style={{width: 30, height: 30}}
              resizeMode={FastImage.resizeMode.contain}
              source={require('@images/bmwLogo.png')}
            />
          )}
          <Text style={{color: '#333', marginLeft: 20, fontSize: 24}}>
            {item.make}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  renderItem({item, index}) {
    //  alert(JSON.stringify(item));
    if (item.skip && this.state.renderType != 1) {
      return <View></View>;
    }
    if (item.skipForAutoBeebBanner && this.state.renderType != 1) {
      return <View></View>;
    }

    if (item.Banner && this.state.renderType == 1) {
      return;
    }

    if (item.skip && this.state.renderType == 1) {
      return (
        <View
          style={{
            alignItems: 'center',
            //   minHeight: 10,
            minHeight: Dimensions.get('screen').height * 0.38,

            //   paddingVertical: 5,
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
    }

    if (item.AutoBeebBanner) {
      return (
        <TouchableOpacity
          disabled={!item.BannerDetails.Link}
          style={{
            width: Dimensions.get('window').width,
            justifyContent: 'center',
            alignItems: 'center',
          }}
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
              this.props.navigation.navigate('DealerProfileScreen', {
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
            // minHeight: 10,
            minHeight: Dimensions.get('screen').height * 0.38,

            //   paddingVertical: 5,
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
      switch (this.state.renderType) {
        case 1:
          return (
            <MainListingsComponent
              item={item}
              key={index}
              AllCountries={this.state.ISOCode == 'ALL'}
              AppCountryCode={this.state.ISOCode}
              navigation={this.props.navigation}
              imageStyle={{
                width: Dimensions.get('window').width * 0.485,
                height: Dimensions.get('window').height * 0.2,
              }}
              itemStyle={{
                borderRadius: 5,
                borderWidth: 0,
                overflow: 'hidden',
                marginHorizontal: 2,
                elevation: 3,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                justifyContent: 'space-between',
                shadowOffset: {
                  width: 1,
                  height: 2,
                },
                marginBottom: 4,
                backgroundColor: '#fff',
                width: Dimensions.get('window').width * 0.485,
              }}
            />
          );

        case 2:
          return (
            <BannerListingsComponent
              key={index}
              AllCountries={this.state.ISOCode == 'ALL'}
              AppCountryCode={this.state.ISOCode}
              item={item}
              navigation={this.props.navigation}
            />
          );
        case 3:
          return (
            <RowListingsComponent
              key={index}
              AllCountries={this.state.ISOCode == 'ALL'}
              AppCountryCode={this.state.ISOCode}
              item={item}
              navigation={this.props.navigation}
            />
          );
      }
  }

  renderSortBox = (text, icon, onPress) => {
    return (
      <TouchableOpacity
        style={[
          styles.sortContainerBox,
          icon != 'filter' && {
            borderRightColor: '#333',
            borderRightWidth: 1,
            paddingRight: 10,
          },
        ]}
        onPress={() => {
          onPress();
        }}
      >
        <IconFa name={icon} size={20} color={'#000'} style={{marginRight: 5}} />
        <Text style={styles.sortContainerText}>{text}</Text>
        <IconFa
          name={'caret-down'}
          size={15}
          color={'#000'}
          style={{position: 'relative', top: 10}}
          style={{marginLeft: 5}}
        />
      </TouchableOpacity>
    );
  };

  renderCurrencyRow(Currency) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          global.ViewingCurrency = Currency;
          this.setState({currency: Currency, PageNum: 1});
          //   this.ResetFilters();
          this.refs.CurrencyModal.close();

          KS.FreeSearch({
            searchFor: this.props.navigation.getParam('query', ''),
            makeID: this.props.navigation.getParam('MakeID', ''),
            modelID: this.props.navigation.getParam('ModelID', ''),
            langID: Languages.langID,
            isocode: this.props.ViewingCountry.cca2,
            pagenum: 1,

            selltype:
              this.state.sellType && this.state.sellType.ID
                ? this.state.sellType.ID
                : '',
            typeid:
              this.state.ListingType && this.state.ListingType.ID
                ? this.state.ListingType.ID
                : '',
            sortby:
              this.state.sortOption && this.state.sortOption.sortBy
                ? this.state.sortOption.sortBy
                : '',
            asc:
              this.state.sortOption && this.state.sortOption.asc
                ? this.state.sortOption.asc
                : '',
            cur: Currency.ID,
            pageSize,
          }).then((data) => {
            if (data && data.Success) {
              this.setState({
                Listings: data.Listings,
                isLoading: false,
                maximumPages: data.Pages,
              });
            }
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
  renderSellTypesRow(SellType) {
    if (
      this.state.ListingType &&
      this.state.ListingType.ID == 32 &&
      SellType.ID == 2
    ) {
      // hide "rent" from spare parts
      return;
    }
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          this.setState(
            {
              sellType: SellType,
              PageNum: 1,
              footerLoading: false,
              isLoading: true,
            },
            () => {
              this.refs.SellTypeModal.close();

              KS.FreeSearch({
                searchFor: this.props.navigation.getParam('query', ''),
                makeID: this.props.navigation.getParam('MakeID', ''),
                modelID: this.props.navigation.getParam('ModelID', ''),
                langID: Languages.langID,
                isocode: this.props.ViewingCountry.cca2,
                pagenum: this.state.PageNum,
                selltype: SellType.ID,
                typeID: this.state.ListingType.ID,
                cur: this.state.currency?.ID,
                pageSize,
              }).then((data) => {
                if (data && data.Success) {
                  this.setState({
                    Listings: data.Listings,
                    isLoading: false,
                    maximumPages: data.Pages,
                  });
                }
              });
            }
          );
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
          <FastImage
            style={{
              width: SellType.ID == 7 || SellType.ID == 4 ? 40 : 40,
              height: SellType.ID == 7 || SellType.ID == 4 ? 25 : 40,
              flex: 1,
            }}
            resizeMode={FastImage.resizeMode.contain}
            source={SellType.img}
          />
          <Text
            style={{
              color: '#000',
              marginLeft: 20,
              fontSize: 26,
              flex: 5,
              textAlign: 'left',
            }}
          >
            {SellType.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  renderMainTypesRow(MainType) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.row}
        onPress={() => {
          this.setState({ListingType: MainType}, () => {
            if (this.state.goToFilter) {
              this.refs.MainTypesModal.close();
              this.props.navigation.navigate('SellTypeScreen', {
                ListingType: MainType,
                cca2: this.props.ViewingCountry?.cca2 || 'us',
              });
            } else {
              this.refs.MainTypesModal.close();
              this.refs.SellTypeModal.open();
            }
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
          <FastImage
            style={{
              width: 40,
              height: 40,
              flex: 1,
            }}
            //  tintColor={Color.secondary}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri:
                'https://autobeeb.com/' +
                MainType.FullImagePath +
                '_115x115.png',
            }}
          />
          <Text
            style={{
              color: '#000',
              marginLeft: 20,
              fontSize: 22,
              flex: 5,
              textAlign: 'left',
            }}
          >
            {MainType.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  renderMainTypesBubble(MainType) {
    let IsActive = this.state.ListingType?.ID == MainType.ID;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          backgroundColor: IsActive ? Color.primary : 'white',
          elevation: 1,
          marginLeft: 10,
          borderRadius: 5,
          paddingHorizontal: 10,
          marginBottom: 10,
          paddingVertical: 5,
        }}
        onPress={() => {
          this.setState({ListingType: MainType}, () => {
            this.setState(
              {
                sellType: {
                  ID: 7,
                  Name: Languages.All,
                  img: require('@images/SellTypes/BlueAll.png'),

                  backgroundColor: '#D31018',
                },
                PageNum: 1,
                footerLoading: false,
                isLoading: true,
              },
              () => {
                KS.FreeSearch({
                  searchFor: this.props.navigation.getParam('query', ''),
                  makeID: this.props.navigation.getParam('MakeID', ''),
                  modelID: this.props.navigation.getParam('ModelID', ''),
                  langID: Languages.langID,
                  isocode: this.props.ViewingCountry.cca2,
                  pagenum: this.state.PageNum,
                  selltype: 7,
                  typeID: this.state.ListingType.ID,
                  cur: this.state.currency?.ID,
                  pageSize,
                }).then((data) => {
                  if (data && data.Success) {
                    this.setState({
                      Listings: data.Listings,
                      isLoading: false,
                      maximumPages: data.Pages,
                    });
                  }
                });
              }
            );
          });
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {
            <FastImage
              style={{
                width: 30,
                height: 30,
              }}
              tintColor={IsActive ? '#fff' : '#000'}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri:
                  'https://autobeeb.com/' +
                  MainType.FullImagePath +
                  '_115x115.png',
              }}
            />
          }
          <Text
            style={{
              color: IsActive ? '#fff' : '#000',
              marginLeft: 10,
              fontSize: 18,
              textAlign: 'left',
            }}
          >
            {MainType.Name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderSortOptionRow(SortOption) {
    return (
      <TouchableOpacity
        key={SortOption.ID}
        activeOpacity={0.5}
        style={styles.row}
        onPress={() => {
          this.setState(
            {sortOption: SortOption, PageNum: 1, isLoading: true},
            () => {
              KS.FreeSearch({
                searchFor: this.props.navigation.getParam('query', ''),
                makeID: this.props.navigation.getParam('MakeID', ''),
                modelID: this.props.navigation.getParam('ModelID', ''),
                langID: Languages.langID,
                isocode: this.props.ViewingCountry.cca2,
                pagenum: this.state.PageNum,
                sortby: SortOption.sortBy,
                asc: SortOption.asc,
                selltype:
                  this.state.sellType && this.state.sellType.ID
                    ? this.state.sellType.ID
                    : '',
                typeid:
                  this.state.ListingType && this.state.ListingType.ID
                    ? this.state.ListingType.ID
                    : '',
                cur: this.state.currency?.ID,
                pageSize,
              }).then((data) => {
                if (data && data.Success) {
                  this.setState({
                    Listings: data.Listings,
                    isLoading: false,
                    maximumPages: data.Pages,
                  });
                }
              });
            }
          );

          this.refs.SortModal.close();
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
              color: '#000',
              marginLeft: 20,
              fontSize: 20,
              flex: 5,
              textAlign: 'left',
            }}
          >
            {SortOption.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  openMainTypesModal(fromFilter) {
    this.setState({goToFilter: fromFilter});
    this.refs.MainTypesModal.open(); // to navigate to sell tpyes
  }

  render() {
    this.sellTypesFilter = [
      {
        ID: 7,
        Name: Languages.All,
        img: require('@images/SellTypes/BlueAll.png'),

        backgroundColor: '#D31018',
      },
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require('@images/SellTypes/BlueSale.png'),

        backgroundColor: '#0F93DD',
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require('@images/SellTypes/BlueRent.png'),

        backgroundColor: '#F68D00',
      },
      {
        ID: 4,
        Name: Languages.Wanted,
        img: require('@images/SellTypes/BlueWanted.png'),

        backgroundColor: '#D31018',
      },
    ];
    this.SortOptions = [
      {
        ID: 1,
        Name: Languages.DateNewest,
        sortBy: 'date',
        asc: 'false', //so i can compare it and not resolve to false always
      },
      {
        ID: 2,

        Name: Languages.DateOldest,
        sortBy: 'date',
        asc: 'true',
      },
      {
        ID: 3,

        Name: Languages.YearNewest,
        sortBy: 'year',
        asc: 'false',
      },
      {
        ID: 4,

        Name: Languages.YearOldest,
        sortBy: 'year',
        asc: 'true',
      },
      {
        ID: 5,

        Name: Languages.PriceHighest,
        sortBy: 'price',
        asc: 'false',
      },
      {
        ID: 6,

        Name: Languages.PriceLowest,
        sortBy: 'price',
        asc: 'true',
      },
    ];
    return (
      <View style={{flex: 1, backgroundColor: '#f0f0f0'}}>
        {false && (
          <StatusBar
            backgroundColor={Color.secondary}
            barStyle="light-content"
          />
        )}

        <NewHeader
          navigation={this.props.navigation}
          back
          blue
          make
          query={this.props.navigation.getParam('query', 0)}
          onCountryChange={(item) => {
            this.setState(
              {
                cca2: item.cca2,
                PageNum: 1,
                isLoading: true,
                ISOCode: item.cca2,
              },
              () => {
                KS.FreeSearch({
                  searchFor: this.props.navigation.getParam('query', ''),
                  makeID: this.props.navigation.getParam('MakeID', ''),
                  modelID: this.props.navigation.getParam('ModelID', ''),
                  langID: Languages.langID,
                  isocode: this.state.cca2,
                  pagenum: this.state.PageNum,
                  userid: (this.props.user && this.props.user.ID) || '',
                  cur: this.state.currency?.ID,
                  pageSize,
                }).then((data) => {
                  if (data && data.Success) {
                    this.setState({
                      Listings: data.Listings,
                      isLoading: false,
                      maximumPages: data.Pages,
                    });
                  }
                });
              }
            );
          }}
        />

        <AddButton navigation={this.props.navigation} />

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

        <Modal //sort modal
          ref="SortModal"
          //  isOpen={true}
          style={[styles.sellTypeModal]}
          position="center"
          backButtonClose={true}
          entry="top"
          swipeToClose={true}
          //   backdropPressToClose={true}
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
              {this.SortOptions.map((type) => this.renderSortOptionRow(type))}

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.refs.SortModal.close();
                }}
              >
                <Text
                  style={{
                    color: Color.secondary,
                    flex: 1,
                    fontSize: 23,
                    textAlign: 'center',
                  }}
                >
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal //selltype modal
          ref="SellTypeModal"
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
              {this.sellTypesFilter.map((type) =>
                this.renderSellTypesRow(type)
              )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.refs.SellTypeModal.close();
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

        <Modal //maintypes modal
          ref="MainTypesModal"
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
              <Text
                style={{
                  fontFamily: 'Cairo-Regular',
                  textAlign: 'center',
                  paddingVertical: 10,
                }}
              >
                {Languages.SelectDesiredSection}
              </Text>
              {this.props.homePageData.MainTypes.map((type) =>
                this.renderMainTypesRow(type)
              )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.row}
                onPress={() => {
                  this.refs.MainTypesModal.close();
                }}
              >
                <Text
                  style={{
                    color: Color.primary,
                    flex: 1,
                    fontSize: 22,
                    textAlign: 'center',
                  }}
                >
                  {Languages.Close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              paddingVertical: 10,
              borderBottomWidth: 2,
              borderColor: '#1C7DA2',
              backgroundColor: '#ffff',
            }}
          >
            {this.renderSortBox(Languages.SortBy, 'sort', () => {
              this.refs.SortModal.open();
            })}
            {this.renderSortBox(
              this.state.ListingType
                ? this.state.sellType && this.state.sellType.ID != 7
                  ? this.state.ListingType.Name + ' ' + this.state.sellType.Name
                  : this.state.ListingType.Name + ' '
                : Languages.AllSections,
              'list',
              () => {
                this.openMainTypesModal();
              }
            )}

            {this.renderSortBox(Languages.Filter, 'filter', () => {
              if (this.state.selectedMake && this.state.ListingType) {
                this.props.navigation.replace('ListingsScreen', {
                  ListingType: this.state.ListingType,
                  shouldOpenFilter: true,
                  SellType: this.state.sellType || {
                    ID: 7,
                    Name: Languages.All,
                    img: require('@images/SellTypes/BlueAll.png'),
                  },
                  selectedMake: this.state.selectedMake,
                  selectedModel: this.state.selectedModel,
                  query: this.props.navigation.getParam('query', 0),

                  // SectionID: this.props.navigation.getParam("navigationOption", 0)
                  //   .SectionID,
                  //  selectedSection: this.props.navigation.getParam(
                  //    "navigationOption",
                  //    0
                  //  ).selectedSection,

                  //  Makes: this.state.FullMakes,
                });
              } else {
                this.openMainTypesModal(true);
              }
            })}
          </View>
        }

        {this.state.isLoading ? (
          <LogoSpinner fullStretch={true} />
        ) : (
          <FlatList
            ref="ListingsFlatlist"
            keyExtractor={(item, index) => index.toString()}
            numColumns={this.state.renderType == 1 ? 2 : 1}
            key={this.state.renderType}
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 22,
                      fontFamily: 'Cairo-Bold',
                    }}
                  >
                    {Languages.NoOffers}
                  </Text>
                </View>
              );
            }}
            data={this.state.Listings}
            renderItem={this.renderItem.bind(this)}
            onEndReached={() => {
              if (!this.state.footerLoading) {
                this.setState({PageNum: this.state.PageNum + 1}, () => {
                  if (this.state.PageNum <= this.state.maximumPages) {
                    this.setState({footerLoading: true});
                    //khaled
                    KS.FreeSearch({
                      searchFor: this.props.navigation.getParam(
                        'submitted',
                        false
                      )
                        ? this.props.navigation.getParam('query', '')
                        : '',
                      makeID: this.props.navigation.getParam('MakeID', ''),
                      modelID: this.props.navigation.getParam('ModelID', ''),
                      langID: Languages.langID,
                      isocode: this.props.ViewingCountry.cca2,
                      pagenum: this.state.PageNum,
                      selltype:
                        this.state.sellType && this.state.sellType.ID
                          ? this.state.sellType.ID
                          : '',
                      typeid:
                        this.state.ListingType && this.state.ListingType.ID
                          ? this.state.ListingType.ID
                          : '',
                      sortby:
                        this.state.sortOption && this.state.sortOption.sortBy
                          ? this.state.sortOption.sortBy
                          : '',
                      asc:
                        this.state.sortOption && this.state.sortOption.asc
                          ? this.state.sortOption.asc
                          : '',
                      cur: this.state.currency?.ID,
                      pageSize,
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
                          concattedListings.push({
                            skipForAutoBeebBanner: true,
                          });
                        } else {
                          concattedListings.push({Banner: true});
                          concattedListings.push({skip: true});
                        }

                        concattedListings = concattedListings.concat(
                          data.Listings
                        );
                        this.setState(
                          {
                            Listings: concattedListings,
                            maximumPages: data.Pages,
                          },
                          () => {
                            setTimeout(() => {
                              this.setState({footerLoading: false});
                            }, 1000);
                          }
                        );
                      }
                    });
                  }
                });
              }
            }}
            onEndReachedThreshold={5} //was 0.5
            ListHeaderComponent={
              <View style={{marginBottom: 10}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    //     backgroundColor: "red",
                    width: Dimensions.get('screen').width,

                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity
                    style={{
                      marginHorizontal: 15,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => {
                      this.refs.CurrencyModal.open();
                    }}
                  >
                    <Text
                      style={{marginRight: 10}}
                    >{`${Languages.CurrencyView}`}</Text>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text
                        style={{
                          color: Color.primary,
                          fontFamily: 'Cairo-Bold',
                        }}
                      >
                        {this.state.currency?.Name}
                      </Text>
                      <IconEn
                        name="triangle-down"
                        size={15}
                        color={'#000'}
                        style={{marginTop: 2}}
                      />
                    </View>
                  </TouchableOpacity>

                  {
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 15,
                        //   paddingHorizontal: 15,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TouchableOpacity
                        style={{marginRight: 20}}
                        hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
                        onPress={() => {
                          this.setState({renderType: 1});
                        }}
                      >
                        <FastImage
                          style={{
                            width: 25,
                            height: 20,
                            marginRight: 5,
                          }}
                          tintColor={
                            this.state.renderType == 1
                              ? Color.primary
                              : Color.secondary
                          }
                          resizeMode={FastImage.resizeMode.contain}
                          source={require('@images/SellTypes/categories.png')}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{marginRight: 20}}
                        hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
                        onPress={() => {
                          this.setState({renderType: 2});
                        }}
                      >
                        <IconIon
                          name="md-browsers"
                          size={25}
                          color={
                            this.state.renderType == 2
                              ? Color.primary
                              : Color.secondary
                          }
                          style={{marginRight: 5}}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{marginRight: 20}}
                        hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
                        onPress={() => {
                          this.setState({renderType: 3});
                        }}
                      >
                        <IconFa
                          name="list-ul"
                          size={25}
                          color={
                            this.state.renderType == 3
                              ? Color.primary
                              : Color.secondary
                          }
                          style={{marginRight: 5}}
                        />
                      </TouchableOpacity>
                    </View>
                  }
                </View>

                <FlatList
                  style={{}}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{}}
                  horizontal
                  data={this.state.MainTypes}
                  renderItem={({item, index}) => {
                    return this.renderMainTypesBubble(item);
                  }}
                />

                {false && (
                  <View
                    style={{
                      alignItems: 'center',
                      minHeight: 10,
                      //    paddingVertical: 5,
                      //backgroundColor: "white",
                      justifyContent: 'center',
                    }}
                  >
                    <BannerAd
                      unitId={Platform.select({
                        android: 'ca-app-pub-2004329455313921/8851160063',
                        ios: 'ca-app-pub-2004329455313921/8383878907',
                      })}
                      size={BannerAdSize.BANNER}
                    />
                  </View>
                )}
              </View>
            }
            ListFooterComponent={
              this.state.footerLoading && (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                    marginBottom: 50,
                  }}
                >
                  <ActivityIndicator size="large" color={'#F85502'}/>
                </View>
              )
            }
          />
        )}
      </View>
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
    fontSize: MediumFont,
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
});
const mapStateToProps = ({home, menu, user}) => ({
  homePageData: home.homePageData,
  user: user.user,
  ViewingCountry: menu.ViewingCountry,
  ViewingCurrency: menu.ViewingCurrency,
});

const mapDispatchToProps = (dispatch) => {
  const {actions} = require('@redux/MenuRedux');

  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),

    //  fetchListings: (parentid) => Listingredux.actions.fetchListings(dispatch, parentid, 1)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResult);
