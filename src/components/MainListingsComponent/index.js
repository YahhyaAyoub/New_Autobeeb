//import liraries
import React, {Component, PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  I18nManager,
  Platform,
} from 'react-native';
import {Color, Languages} from '@common';
import IconFa from 'react-native-vector-icons/FontAwesome';
import IconIon from 'react-native-vector-icons/Ionicons';
import Communications from 'react-native-communications';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import KS from '@services/KSAPI';
// create a component

class Cards extends PureComponent {
  shouldComponentUpdate() {
    return false;
  }

  renderCurrency(Listing) {
    switch (Listing.ISOCode) {
      case 'JO':
        return I18nManager.isRTL ? 'دينار' : 'JOD';
      case 'PS':
        return I18nManager.isRTL ? 'شيكل' : 'ILS';
      default:
        return '';
    }
  }

  findSellType(item) {
    let sellTypes = [
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require('@images/SellTypes/WhiteSale.png'),

        backgroundColor: '#0F93DD',
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require('@images/SellTypes/WhiteRent.png'),

        backgroundColor: '#F68D00',
      },
      {
        ID: 4,
        Name: Languages.Wanted,
        img: require('@images/SellTypes/WhiteWanted.png'),

        backgroundColor: '#D31018',
      },
    ];
    return sellTypes.find((ST) => ST.ID == item.SellType);
  }
  render() {
    const item = this.props.item?.Item2 || this.props.item;
    //  console.log(item)

    //const item = this.props.item;
    const DifferentCountry =
      (this.props.AppCountryCode != 'ALL' &&
        (this.props.AllCountries ||
          item.ISOCode != this.props.AppCountryCode)) ||
      (this.props.SelectedCities &&
        this.props.SelectedCities[0].ID != '' &&
        !this.props.SelectedCities.find((x) => x.ID == item.CityID));

    return (
      <View
        key={item.ID}
        style={[
          this.props.itemStyle || {
            marginHorizontal: 5,
            elevation: 2,

            borderWidth: 0,
            overflow: 'hidden',
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: {
              width: 1,
              height: 2,
            },
            marginTop: 5,
            marginBottom: 15,
            borderRadius: 5,
            overflow: 'hidden',
            marginRight: 5,
            backgroundColor: '#fff',
            width: Dimensions.get('window').width * 0.45,
          },
          this.props.isListingsScreen && {
            height: Dimensions.get('screen').height * 0.38,
          },

          DifferentCountry && {
            borderWidth: 2,
            borderColor: Color.primary,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.6}
          key={item.ID}
          style={[
            {
              // borderTopStartRadius: 10,
              // borderTopEndRadius: 10,
              flex: 1,
              overflow: 'hidden',
              //  borderWidth: 1,
              borderColor: '#eee',
            },
          ]}
          onPress={() =>
            this.props.navigation.navigate('CarDetails', {
              item: item,
            })
          }
        >
          <View style={{overflow: 'hidden'}}>
            {!!item.ThumbURL ? (
              <FastImage
                style={
                  this.props.imageStyle || {
                    width: Dimensions.get('window').width * 0.45,
                    height: Dimensions.get('window').height * 0.2,

                    //  borderColor: "#fff"
                  }
                }
                source={{
                  uri:
                    'https://autobeeb.com/' +
                    item.FullImagePath +
                    '_400x400.jpg',
                }}
                resizeMode="cover"
              />
            ) : (
              <View style={{}}>
                <View
                  style={{
                    width: Dimensions.get('window').width * 0.5,
                    height: Dimensions.get('window').height * 0.2,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 5,
                    backgroundColor: 'rgba(28,126,164,0.1)',
                  }}
                />
                <FastImage
                  style={{
                    width: Dimensions.get('window').width * 0.25,
                    height: Dimensions.get('window').height * 0.2,
                    alignSelf: 'center',
                  }}
                  source={require('@images/placeholder.png')}
                  resizeMode="contain"
                />
              </View>
            )}

            {!!(item.Condition == 1) && (
              <View
                style={{
                  backgroundColor: '#2B9531',
                  paddingHorizontal: 3,
                  position: 'absolute',
                  minWidth: 45,

                  left: 0,
                  zIndex: 10,
                  bottom: 24,
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    //  paddingVertical: 1,
                    textAlign: 'center',
                    alignSelf: 'center',

                    fontSize: 14,
                  }}
                >
                  {Languages.New}
                </Text>
              </View>
            )}

            {!!item.SellType && (
              <View
                style={[
                  {
                    backgroundColor: this.findSellType(item).backgroundColor,
                    padding: 3,
                    paddingVertical: 0,

                    position: 'absolute',
                    zIndex: 10,

                    top: 0,

                    minWidth: 45,
                  },
                  I18nManager.isRTL && {left: 0},
                  !I18nManager.isRTL && {right: 0},
                  Platform.select({
                    ios: {
                      borderBottomRightRadius: I18nManager.isRTL ? 5 : 0,
                      borderBottomLeftRadius: I18nManager.isRTL ? 0 : 5,
                    },
                    android: {
                      borderBottomRightRadius: I18nManager.isRTL ? 5 : 0,
                      borderBottomLeftRadius: I18nManager.isRTL ? 0 : 5,
                    },
                  }),
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  {item.ThumbURL
                    ? this.findSellType(item).Name
                    : item.TypeName + ' ' + this.findSellType(item).Name}
                </Text>
              </View>
            )}

            {
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  position: 'absolute',
                  zIndex: 10,

                  width: 45,
                  textAlign: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  bottom: 0,
                  paddingHorizontal: 3,
                }}
              >
                <IconFa
                  name="camera"
                  size={10}
                  color="white"
                  style={{marginRight: 5}}
                />

                <Text style={{color: '#fff', fontSize: 14}}>
                  {(item.Images && item.Images.length) || 0}
                </Text>
              </View>
            }

            {item.PaymentMethod && item.PaymentMethod == 2 && (
              <View
                style={{
                  backgroundColor: '#2B9531',
                  position: 'absolute',
                  zIndex: 10,

                  //   width: 45,
                  textAlign: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  bottom: 0,
                  right: 0,
                  paddingHorizontal: 3,
                  borderWidth: 1,
                  borderColor: '#2B9531',
                  borderTopLeftRadius: 5,
                  //   borderTopRightRadius: I18nManager.isRTL ? 5 : 0
                }}
              >
                <Text style={{color: '#fff', fontSize: 14}}>
                  {Languages.Installments}
                </Text>
              </View>
            )}

            {DifferentCountry && (
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  position: 'absolute',
                  zIndex: 999,
                  top: 0,
                  width: '100%',
                  height: Dimensions.get('window').height * 0.2,
                }}
              />
            )}
          </View>
          <View
            style={{
              padding: 5,
              backgroundColor: '#fff',
              //   minHeight: 68,
              borderTopWidth: 1,
              flex: 1,
              justifyContent: 'space-between',
              borderTopColor: '#f8f8f8',
            }}
          >
            {item.TypeID != 32 ? (
              <View>
                <View
                  style={{
                    //   flex: 6,
                    //    backgroundColor: "red",
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 7,

                    //    alignSelf: "stretch",
                    justifyContent: 'center',
                  }}
                >
                  <FastImage
                    style={{
                      width: 30,
                      height: 30,

                      //       flex: 1
                    }}
                    resizeMode="contain"
                    source={
                      item.TitleFullImagePath
                        ? {
                            uri:
                              'https://autobeeb.com/' +
                              item.TitleFullImagePath +
                              '_300x150.png',
                          }
                        : item.TypeID == 16
                        ? {
                            uri:
                              'https://autobeeb.com/content/newlistingcategories/' +
                              '16' +
                              item.CategoryID +
                              '/' +
                              +item.CategoryID +
                              '_300x150.png',
                          }
                        : {
                            uri:
                              'https://autobeeb.com/content/newlistingmakes/' +
                              item.MakeID +
                              '/' +
                              item.MakeID +
                              '_240x180.png',
                          }
                    }
                  />

                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#000',
                      fontSize: 15,
                      //   flex: 5,
                      textAlign: 'center',
                      paddingRight: 2,
                    }}
                  >
                    {item.NameFirstPart}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={{color: '#000', fontSize: 15, textAlign: 'center'}}
                >
                  {item.NameSecondPart}
                </Text>
              </View>
            ) : (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {item.TitleFullImagePath && false && (
                  <Image
                    style={{
                      width: 30,
                      height: 30,

                      //       flex: 1
                    }}
                    resizeMode="contain"
                    source={{
                      uri:
                        'https://autobeeb.com/' +
                        item.TitleFullImagePath +
                        '_300x150.png',
                    }}
                  />
                )}
                <Text
                  numberOfLines={2}
                  style={{
                    color: '#000',
                    fontSize: 15,
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  {item.Name}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                //  paddingHorizontal: 2

                //     justifyContent: "space-between"
              }}
            >
              {!this.props.AllCountries &&
              item.ISOCode == this.props.AppCountryCode ? (
                <View
                  style={{
                    flex: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  {item.CityName && (
                    <IconFa
                      name="map-marker"
                      size={12}
                      color={Color.secondary}
                      style={{marginRight: 2}}
                    />
                  )}
                  <Text numberOfLines={1} style={{fontSize: 12}}>
                    {item.CityName}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Image
                    style={{
                      resizeMode: 'cover',
                      width: 30,
                      height: 20,
                      borderRadius: 3,
                      backgroundColor: 'transparent',
                      //    borderWidth: 1 / PixelRatio.get(),
                      // borderColor: '#eee',
                      //elevation: 3,
                      opacity: 0.8,
                    }}
                    source={{
                      uri:
                        'https://autobeeb.com/wsImages/flags/' +
                        item.ISOCode +
                        '.png',
                    }}
                  />
                </View>
              )}

              {
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 15,
                    flex: 4,
                    color: Color.secondary,
                    marginLeft: 10,
                    textAlign: 'left',
                  }}
                >
                  {item.FormatedPrice ? item.FormatedPrice + ' ' : ''}
                </Text>
              }
            </View>
          </View>
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: Color.secondary,
            flexDirection: 'row',

            alignSelf: 'flex-end',
            //   padding: 7,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => Communications.phonecall(item.Phone, true)}
          >
            <Text
              style={{
                textAlign: 'center',
                color: '#fff',
                // borderRightWidth: 1,
                // borderColor: "#fff",
                marginVertical: 10,
              }}
            >
              <IconFa name="phone" size={15} color="white" />
              {'  ' + Languages.Call}
            </Text>
          </TouchableOpacity>

          {(this.props.userData == null ||
            (this.props.userData &&
              this.props.userData.ID != item.OwnerID)) && (
            <TouchableOpacity
              style={[
                {
                  flex: 1,
                  backgroundColor: '#2B9531',
                  borderLeftWidth: 1,
                  borderLeftColor: '#fff',
                },
                !!item.online && {backgroundColor: '#2B9531'},
              ]}
              onPress={() => {
                if (this.props.userData) {
                  delete item.Views;
                  KS.AddEntitySession({
                    userID: this.props.userData.ID,
                    targetID: item.OwnerID,
                    relatedEntity: JSON.stringify(item),
                  }).then((data) => {
                    this.props.navigation.navigate('ChatScreen', {
                      targetID: item.OwnerID,
                      ownerName: item.OwnerName,
                      description: item.Name,
                      entityID: item.ID,
                      sessionID: data.SessionID,
                    });
                  });
                } else {
                  this.props.navigation.navigate('LoginScreen');
                }
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  textAlign: 'center',
                  color: '#fff',

                  //    borderColor: "#fff",
                  marginVertical: 10,
                }}
              >
                <IconIon name="md-chatbubbles" size={15} color="white" />
                {'  ' + Languages.Chat}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
const mapStateToProps = ({user}) => ({
  userData: user.user,
});

export default connect(mapStateToProps, null)(Cards);
