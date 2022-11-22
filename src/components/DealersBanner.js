import React, {Component} from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {Languages, Color} from '@common';
import Moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import IconFa from 'react-native-vector-icons/FontAwesome';
import Communications from 'react-native-communications';
import FastImage from 'react-native-fast-image';

class DealersBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: this.props.date || new Date(),
    };
  }

  // componentDidMount() {
  //   alert(JSON.stringify(this.props.item));
  //   console.log(this.props.item);
  // }

  render() {
    let coverPhoto = this.props.item.FullImagePath;
    console.log(coverPhoto);
    let profilePhoto = this.props.item?.User?.FullImagePath;
    let Dealer = this.props.item.User;
    const DifferentCountry =
      this.props.cca2 != 'ALL' &&
      this.props.cca2 &&
      this.props.cca2 != this.props.item.ISOCode;
    return (
      <TouchableOpacity
        style={[
          this.props.full
            ? {
                //     elevation: this.props.dealerProfile ? 0 : 1,
                alignSelf: 'center',
                borderRadius: this.props.dealerProfile ? 0 : 5,
                marginVertical: this.props.dealerProfile ? 0 : 5,
                overflow: 'hidden',
                width: this.props.dealerProfile
                  ? Dimensions.get('screen').width
                  : Dimensions.get('screen').width * 0.95,
                height: this.props.dealerProfile
                  ? Dimensions.get('screen').width / 1.7
                  : (Dimensions.get('screen').width * 0.95) / 1.56,
              }
            : {
                borderWidth: 1,
                //    elevation: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                marginHorizontal: 5,
                overflow: 'hidden',
                width: Dimensions.get('screen').width * 0.85,
                height: (Dimensions.get('screen').width * 0.85) / 1.56,
              },
          DifferentCountry && {
            borderWidth: 3,
            borderColor: Color.primary,
          },
        ]}
        onPress={() => {
          this.props.navigation.navigate('DealerProfileScreen', {
            userid: Dealer.ID,
          });
        }}
        disabled={this.props.dealerProfile}
        // onLayout={(event) => {
        //   if (this.props.onLayout) {
        //     this.props.onLayout(event);
        //   }
        // }}
      >
        <FastImage
          style={
            this.props.full
              ? {
                  alignSelf: 'center',
                  justifyContent: 'flex-end',
                  borderRadius: this.props.dealerProfile ? 0 : 5,

                  width: this.props.dealerProfile
                    ? Dimensions.get('screen').width
                    : Dimensions.get('screen').width * 0.95,
                  height: this.props.dealerProfile
                    ? Dimensions.get('screen').width / 1.7
                    : (Dimensions.get('screen').width * 0.95) / 1.56,
                }
              : {
                  borderRadius: 5,
                  alignSelf: 'center',
                  justifyContent: 'flex-end',

                  width: Dimensions.get('screen').width * 0.85,
                  height: (Dimensions.get('screen').width * 0.85) / 1.56,
                }
          }
          imageStyle={{
            borderRadius: this.props.dealerProfile ? 0 : 5,
          }}
          resizeMode="cover"
          source={
            this.props.item.ThumbImage
              ? {
                  uri: 'https://autobeeb.com/' + coverPhoto + '_750x420.jpg',
                  // +
                  // "?time=" +
                  // this.state.date,
                }
              : require('@images/Oldplaceholder.png')
          }
        >
          {!this.props.dealerProfile && (
            <View
              style={{
                position: 'absolute',
                backgroundColor: Color.primary,
                borderBottomLeftRadius: 5,
                top: 0,
                zIndex: 10,
                right: 0,
                paddingHorizontal: 5,
              }}
            >
              <Text style={{color: '#fff', textAlign: 'center'}}>
                {Languages.Ads + '' + this.props.item.ListingsCount}
              </Text>
            </View>
          )}
          <LinearGradient
            colors={[
              'rgba(0,0,0,0)',
              'rgba(0,0,0,0.4)',
              'rgba(0,0,0,0.5)',
              'rgba(0,0,0,0.6)',

              'rgba(0,0,0,.7)',
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                //   backgroundColor:'red',
                paddingHorizontal: 5,
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
            >
              {Dealer && Dealer.ThumbImage ? (
                <Image
                  style={{
                    // flex: 1,
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginRight: 5,
                  }}
                  source={{
                    uri:
                      'https://autobeeb.com/' +
                      profilePhoto +
                      '_400x400.jpg' +
                      '?time=' +
                      this.state.date,
                  }}
                />
              ) : (
                <IconFa
                  name="user-circle"
                  size={50}
                  color={'#fff'}
                  style={{marginRight: 15, flex: 1}}
                />
              )}

              <View style={{flex: 5}}>
                <Text
                  numberOfLines={1}
                  style={{color: '#fff', textAlign: 'left', fontSize: 15}}
                >
                  {Dealer && Dealer.Name}
                </Text>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {DifferentCountry && (
                    <FastImage
                      style={{width: 30, height: 30, marginRight: 5}}
                      resizeMode={'contain'}
                      source={{
                        uri:
                          'https://autobeeb.com/wsImages/flags/' +
                          this.props.item.ISOCode +
                          '.png',
                      }}
                    />
                  )}

                  {this.props.item.CityName &&
                    this.props.item.CountryName &&
                    !this.props.detailsScreen && (
                      <Text
                        numberOfLines={1}
                        style={{
                          color: '#fff',
                          fontSize: 13,
                          textAlign: 'left',
                        }}
                      >
                        {this.props.item.CountryName +
                          ', ' +
                          this.props.item.CityName}
                      </Text>
                    )}
                </View>

                {Dealer && this.props.detailsScreen && (
                  <Text
                    style={{color: '#fff', fontSize: 13, textAlign: 'left'}}
                  >
                    {Languages.MemberSince +
                      Moment(Dealer.RegistrationDate).format('YYYY-MM-DD')}
                  </Text>
                )}
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 10,
                marginTop: 5,
                marginBottom: 5,
                flexWrap: 'wrap',
                //  justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {!!(Dealer.Phone && !this.props.item.HideMobile) && (
                <TouchableOpacity
                  style={{
                    backgroundColor: Color.secondary,
                    paddingHorizontal: 5,
                    borderRadius: 5,
                    marginRight: 10,
                    marginTop: 5,
                  }}
                  onPress={() => {
                    Communications.phonecall(Dealer.Phone, true);
                  }}
                >
                  <Text
                    style={[
                      {color: '#fff'},
                      !this.props.full && {fontSize: 14},
                    ]}
                  >
                    {this.props.mobile ? this.props.mobile : Dealer.Phone}
                  </Text>
                </TouchableOpacity>
              )}

              {this.props.item.HideMobile &&
                this.props.mobile &&
                this.props.mobile != Dealer.Phone && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: Color.secondary,
                      paddingHorizontal: 5,
                      borderRadius: 5,
                      marginRight: 10,
                      marginTop: 5,
                    }}
                    onPress={() => {
                      Communications.phonecall(Dealer.Phone, true);
                    }}
                  >
                    <Text
                      style={[
                        {color: '#fff'},
                        !this.props.full && {fontSize: 14},
                      ]}
                    >
                      {this.props.mobile}
                    </Text>
                  </TouchableOpacity>
                )}

              {!!this.props.item.Phone && (
                <TouchableOpacity
                  style={{
                    backgroundColor: Color.secondary,
                    paddingHorizontal: 5,
                    marginTop: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    Communications.phonecall(this.props.item.Phone, true);
                  }}
                >
                  <Text
                    style={[
                      {color: '#fff'},
                      !this.props.full && {fontSize: 14},
                    ]}
                  >
                    {this.props.item.Phone}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
          {DifferentCountry && (
            <View
              style={{
                backgroundColor: 'rgba(128,128,128,0.3)',
                position: 'absolute',
                zIndex: 999,
                top: 0,
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </FastImage>
      </TouchableOpacity>
    );
  }
}

export default DealersBanner;
