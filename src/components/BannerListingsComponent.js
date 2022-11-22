//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  I18nManager,
  Platform,
} from 'react-native';
import {Color, Languages} from '@common';
import IconFa from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Moment from 'moment';
import IconEn from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';
import {toast} from '@app/Omni';
import KS from '@services/KSAPI';
// create a component
class Cards extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageIndex: 0,
      Favorite: true,
    };
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

  render() {
    const item = this.props.item?.item?.m_Item2 || this.props.item;
    //  console.log(item);
    this.sellTypes = [
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
          {
            marginBottom: 10,
            elevation: 1,
          },

          this.props.isListingsScreen && {
            height: Dimensions.get('screen').height * 0.36,
          },
          DifferentCountry && {
            borderWidth: 2,
            borderColor: Color.primary,
            overflow: 'hidden',
            width: Dimensions.get('window').width * 0.96,
            alignSelf: 'center',
            borderRadius: 5,
          },
        ]}
      >
        <TouchableOpacity
          key={item.ID}
          style={[
            this.props.itemStyle || {
              elevation: 3,
              borderTopWidth: DifferentCountry ? 0 : 1,
              width: Dimensions.get('window').width * 0.95,
              height: Dimensions.get('window').width / 1.77,
              borderWidth: 0,
              borderColor: '#eee',
              overflow: 'hidden',
              borderTopColor: '#eee',
              justifyContent: 'space-between',
              shadowColor: '#fff',
              shadowOpacity: 0.2,
              shadowOffset: {
                width: 1,
                height: 2,
              },
              backgroundColor: '#fff',
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              alignSelf: 'center',
            },
            !item.PartNumber &&
              !(item.IsDealer && item.OwnerName) && {
                borderRadius: 5,
              },
          ]}
          onPress={() =>
            this.props.navigation.push('CarDetails', {
              item: item,
            })
          }
        >
          {item.Images && item.Images.length > 1 && (
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
              onPress={() => {
                this.setState({imageIndex: this.state.imageIndex - 1});
              }}
              disabled={this.state.imageIndex === 0}
              style={{
                position: 'absolute',
                top: 80,
                left: 10,
                zIndex: 9999,
                elevation: 9999,
              }}
            >
              <IconEn
                name={
                  I18nManager.isRTL
                    ? 'chevron-small-right'
                    : 'chevron-small-left'
                }
                size={35}
                color={this.state.imageIndex === 0 ? 'gray' : Color.primary}
              />
            </TouchableOpacity>
          )}

          {item.Images && item.Images.length > 1 && (
            <TouchableOpacity
              onPress={() => {
                this.setState({imageIndex: this.state.imageIndex + 1});
              }}
              hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
              disabled={this.state.imageIndex + 1 >= item.Images.length}
              style={{
                position: 'absolute',
                top: 80,
                right: 10,
                zIndex: 9999,
                elevation: 9999,
              }}
            >
              <IconEn
                name={
                  I18nManager.isRTL
                    ? 'chevron-small-left'
                    : 'chevron-small-right'
                }
                size={35}
                color={
                  this.state.imageIndex + 1 >= item.Images.length
                    ? 'gray'
                    : Color.primary
                }
              />
            </TouchableOpacity>
          )}

          <View style={{}}>
            {!!item.ThumbURL ? (
              <FastImage
                style={
                  this.props.imageStyle || {
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').width / 1.77,
                    borderColor: '#fff',
                  }
                }
                source={{
                  uri:
                    'https://autobeeb.com/' +
                    item.ImageBasePath +
                    item.Images[this.state.imageIndex] +
                    '_750x420.jpg',
                  cache:
                    Platform.OS === 'ios'
                      ? FastImage.cacheControl.immutable //wasnt working needed to be default before thats why ill leave the check for now
                      : FastImage.cacheControl.immutable,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <View style={{}}>
                <View
                  style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').width / 1.77,
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    //   zIndex: 5,
                    backgroundColor: 'rgba(28,126,164,0.1)',
                  }}
                />
                <FastImage
                  style={{
                    marginTop: 15,
                    width: Dimensions.get('window').width * 0.7,
                    height: Dimensions.get('screen').height * 0.2,
                    alignSelf: 'center',
                  }}
                  source={require('@images/placeholder.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            )}

            {false && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 8,

                  right: 8,
                }}
                onPress={() => {}}
              >
                <FastImage
                  style={{
                    width: 30,
                    height: 30,
                    tintColor: item.ThumbURL ? '#fff' : Color.secondary,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  source={require('@images/parkList.png')}
                />
              </TouchableOpacity>
            )}

            {!!(item.Condition == 1) && false && (
              <Text
                style={{
                  color: '#fff',
                  backgroundColor: '#2B9531',
                  padding: 3,
                  minWidth: 45,
                  textAlign: 'center',
                  position: 'absolute',
                  left: 0,
                  zIndex: 10,
                  bottom: 30,
                }}
              >
                {Languages.New}
              </Text>
            )}

            {!!item.SellType && (
              <Text
                style={{
                  color: '#fff',
                  backgroundColor: this.sellTypes.find(
                    (ST) => ST.ID == item.SellType
                  ).backgroundColor,
                  padding: 3,
                  minWidth: 45,
                  //   opacity: 0.6,
                  textAlign: 'center',
                  position: 'absolute',
                  zIndex: 10,

                  left: 0,
                  top: 0,
                }}
              >
                {item.ThumbURL
                  ? this.sellTypes.find((ST) => ST.ID == item.SellType).Name
                  : item.TypeName +
                    ' ' +
                    this.sellTypes.find((ST) => ST.ID == item.SellType).Name}
              </Text>
            )}

            {this.props.isFavorites && (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                  backgroundColor: '#fbfbfb',
                  elevation: 3,
                  position: 'absolute',
                  top: 5,
                  right: 5,
                }}
                onPress={() => {
                  KS.WatchlistAdd({
                    listingID: item.ID,
                    userid: this.props.user.ID,
                    type: 1,
                  }).then((data) => {
                    if (data && data.Success) {
                      this.setState({Favorite: data.Favorite});
                      if (data.Favorite == false) {
                        this.props.removeFavorite(item.ID);
                      }
                    }
                  });
                }}
              >
                <IconFa
                  name={this.state.Favorite ? 'heart' : 'heart-o'}
                  size={20}
                  color={this.state.Favorite ? Color.primary : 'black'}
                />
              </TouchableOpacity>
            )}
            {DifferentCountry && (
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  position: 'absolute',
                  zIndex: 999,
                  top: 0,
                  width: '100%',
                  height: Dimensions.get('screen').width * 1.77,
                }}
              />
            )}
          </View>
          <View
            style={{
              //    backgroundColor: "rgba(0,0,0,0.2)",
              position: 'absolute',
              width: Dimensions.get('screen').width,
              bottom: 0,
              //   minHeight: 68,
            }}
          >
            <LinearGradient
              colors={[
                'rgba(0,0,0,0)',
                // "rgba(0,0,0,0.3)",
                'rgba(0,0,0,0.5)',
                'rgba(0,0,0,.7)',
              ]}
              style={{
                width: Dimensions.get('screen').width,
                padding: 5,
              }}
            >
              {item.Images && item.Images.length > 0 && (
                <Text style={{color: '#fff', fontSize: 18, textAlign: 'left'}}>
                  {this.state.imageIndex + 1 + '/' + item.Images.length}
                </Text>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',

                  //     justifyContent: "space-between"
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!!item.FormatedPrice && (
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#fff',
                        textAlign: 'left',
                      }}
                    >
                      {item.FormatedPrice
                        ? item.FormatedPrice
                        : Languages.CallForPrice}
                    </Text>
                  )}

                  {item.PaymentMethod && item.PaymentMethod == 2 && (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{color: '#fff', fontSize: 15}}>
                        {'  / ' + Languages.Installments}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                {
                  <FastImage
                    style={{width: 30, height: 30, marginRight: 5}}
                    resizeMode={FastImage.resizeMode.contain}
                    source={
                      this.props.AllCountries ||
                      item.ISOCode != this.props.AppCountryCode
                        ? {
                            uri:
                              'https://autobeeb.com/wsImages/flags/' +
                              item.ISOCode +
                              '.png',
                          }
                        : item.TitleFullImagePath
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
                }
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#fff',
                    textAlign: 'left',
                    maxWidth: Dimensions.get('screen').width * 0.85,
                  }}
                >
                  {item.Name}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
        {this.props.user &&
          !this.props.user.EmailRegister &&
          this.props.user.OTPConfirmed == false &&
          this.props.activeOffers && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: 5,
                width: Dimensions.get('window').width * 0.95,
              }}
            >
              <View
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  padding: 10,
                }}
              >
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('EditProfile', {
                      ChangePhone: true,
                    });
                  }}
                >
                  <Text style={{color: '#000', textAlign: 'center'}}>
                    {Languages.EnterCodeToPublish + this.props.user.Phone}
                    <Text style={{color: '#00f'}}>
                      {' (' + Languages.Change + ')'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'green',
                    alignSelf: 'center',
                    marginVertical: 10,
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    this.props.onVerify();
                  }}
                >
                  <Text style={{color: '#fff'}}>{Languages.VerifyNow}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {this.props.user &&
          this.props.user.EmailRegister &&
          this.props.user.EmailConfirmed == false &&
          this.props.activeOffers && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: 5,
                width: Dimensions.get('window').width * 0.95,
              }}
            >
              <View
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  padding: 10,
                }}
              >
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.props.navigation.navigate('EditProfile', {
                      ChangeEmail: true,
                    });
                  }}
                >
                  <Text style={{color: '#000', textAlign: 'center'}}>
                    {Languages.EnterCodeToPublish + this.props.user.Email}
                    <Text style={{color: '#00f'}}>
                      {' (' + Languages.Change + ')'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'green',
                    alignSelf: 'center',
                    marginVertical: 10,
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    this.props.onVerify();
                  }}
                >
                  <Text style={{color: '#fff'}}>{Languages.VerifyNow}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {this.props.user &&
          this.props.user.EmailRegister &&
          this.props.user.EmailConfirmed &&
          this.props.user.EmailApproved == false && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: 5,
                width: Dimensions.get('window').width * 0.95,
              }}
            >
              <View
                style={{
                  padding: 10,
                }}
              >
                <Text style={{color: '#000', textAlign: 'center'}}>
                  {Languages.EmailPendingApproval}
                </Text>
              </View>
            </View>
          )}

        {this.props.activeOffers &&
          this.props.active &&
          this.props.user &&
          (this.props.user.OTPConfirmed ||
            (this.props.user.EmailConfirmed &&
              this.props.user.EmailRegister &&
              this.props.user.EmailApproved)) && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: this.props.activeOffers ? 0 : 5,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}
              >
                {this.state.renewed ? (
                  <Text style={{color: '#000'}}>
                    {Languages.publishedIn + Moment().format('YYYY-MM-DD')}
                  </Text>
                ) : (
                  <Text style={{color: '#000'}}>
                    {Languages.publishedIn +
                      Moment(item.RenewalDate).format('YYYY-MM-DD')}
                  </Text>
                )}

                {this.state.renewed ? (
                  <Text style={{color: 'red'}}>
                    {item.TypeID == 32
                      ? Languages.To +
                        Moment()
                          .add(1, 'year')
                          .format('YYYY-MM-DD')
                      : Languages.To +
                        Moment()
                          .add(6, 'months')
                          .format('YYYY-MM-DD')}
                  </Text>
                ) : (
                  <Text style={{color: 'red'}}>
                    {item.TypeID == 32
                      ? Languages.To +
                        Moment(item.RenewalDate)
                          .add(1, 'year')
                          .format('YYYY-MM-DD')
                      : Languages.To +
                        Moment(item.RenewalDate)
                          .add(6, 'months')
                          .format('YYYY-MM-DD')}
                  </Text>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onDeactivate(item);
                  }}
                >
                  <IconFa
                    name={'trash'}
                    size={25}
                    color={'red'}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Deactivate}</Text>
                </TouchableOpacity>

                {true && (
                  <TouchableOpacity
                    style={styles.userButton}
                    onPress={() => {
                      this.props.onEdit(item);
                    }}
                  >
                    <IconFa
                      name={'edit'}
                      size={25}
                      color={Color.secondary}
                      style={{marginTop: 5}}
                    />
                    <Text style={{color: '#000'}}>{Languages.Edit}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onShare(item);
                  }}
                >
                  <IconFa
                    name={'share-alt'}
                    size={25}
                    color={Color.secondary}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.ShareOffer}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    KS.RenewOffer({listingid: item.ID}).then((data) => {
                      if (data && data.Success) {
                        if (data.Status == 1) {
                          this.setState({renewed: true});
                        } else {
                          toast(Languages.CantRenew, 3000);
                        }
                      }
                    });
                  }}
                >
                  <IconEn
                    name={'cycle'}
                    size={25}
                    color={Color.primary}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Renew}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {this.props.activeOffers &&
          !this.props.active &&
          this.props.user &&
          (this.props.user.OTPConfirmed ||
            (this.props.user.EmailConfirmed &&
              this.props.user.EmailRegister &&
              this.props.user.EmailApproved)) && (
            <View
              style={{
                backgroundColor: '#fff',
                marginBottom: this.props.activeOffers ? 0 : 5,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',

                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    color: '#f00',
                    textAlign: 'left',
                    maxWidth: Dimensions.get('screen').width * 0.8,
                  }}
                  numberOfLines={2}
                >
                  {Languages.ThisOfferWillBeDeleted +
                    ' ' +
                    Moment(item.RenewalDate)
                      .add(3, 'months')
                      .format('YYYY-MM-DD')}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onDelete(item);
                  }}
                >
                  <IconFa
                    name={'trash'}
                    size={25}
                    color={'red'}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Delete}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onEdit(item);
                  }}
                >
                  <IconFa
                    name={'edit'}
                    size={25}
                    color={Color.secondary}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Edit}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => {
                    this.props.onActivate(item);
                  }}
                >
                  <IconFa
                    name={'upload'}
                    size={25}
                    color={'green'}
                    style={{marginTop: 5}}
                  />
                  <Text style={{color: '#000'}}>{Languages.Activate}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        <View
          style={[
            {
              backgroundColor: '#fff',
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
              elevation: 1,
              alignSelf: 'center',
              overflow: 'hidden',
              width: Dimensions.get('screen').width * 0.95,
            },
            this.props.activeOffers && {
              borderTopWidth: 1,
              borderTopColor: '#ddd',
            },
          ]}
        >
          {item.PartNumber && (
            <Text style={{paddingHorizontal: 10}}>
              <Text style={{color: Color.secondary}}>{Languages.PartNo}:</Text>
              {` ${item.PartNumber}`}
            </Text>
          )}

          {item.IsDealer && item.OwnerName && !this.props.activeOffers && (
            <Text
              numberOfLines={1}
              style={{
                paddingHorizontal: 10,
                alignSelf: 'center',
                textAlign: 'left',
                width: Dimensions.get('screen').width * 0.95,
              }}
            >
              {item.OwnerName}
            </Text>
          )}
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  userButton: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    justifyContent: 'center',
    //   backgroundColor: "red"
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default Cards;
