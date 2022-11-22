import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  I18nManager,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {Languages, Constants, Styles, Color} from '@common';
import {openDrawer} from '@app/Omni';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Entypo from 'react-native-vector-icons/Entypo';
import {HeaderBackButton} from 'react-navigation-stack';
import IconFa from 'react-native-vector-icons/FontAwesome';
import CountryPicker from 'react-native-country-picker-modal-kensoftware';

class NewHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      cca2: 'JO',
      countryName: null,
    };
  }

  // componentDidMount() {
  //   AsyncStorage.getitem("cca2", (error, data) => {
  //     if (data) {
  //       this.setState({ cca2: data });
  //       fetch("https://restcountries.eu/rest/v2/alpha/" + data)
  //         .then(response => response.text())

  //         .then(response => JSON.parse(response))
  //         .then(responseData => {
  //           this.setState({ countryName: responseData.name });
  //         });
  //       //   this.props.setViewingCountry(data);
  //     }
  //   });
  // }

  render() {
    return (
      <View
        style={[
          Styles.Common.newMenu,
          {
            elevation: this.props.noElevation ? 0 : 2,
          },
          Platform.OS == 'ios'
            ? isIphoneX()
              ? {
                  height: 90,
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  backgroundColor:
                    this.props.blue && false ? '#1C7EA5' : '#fff',
                }
              : {
                  height: Platform.select({ios: 80, android: 60}),
                  backgroundColor:
                    this.props.blue && false ? '#1C7EA5' : '#fff',

                  //justifyContent: 'center',
                  alignItems: 'flex-end',
                }
            : {height: 60}, //android
        ]}
        //  tintColor={Color.headerTintColor}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: this.props.blue && false ? '#1C7EA5' : '#fff',
            alignItems: 'center',
            width: Dimensions.get('screen').width,
            justifyContent: 'space-between',
            flex: 1,

            height: 60,
          }}
        >
          <View style={{}}>
            {/* <CartIcons navigation={navigation} hideWishlist />*/}
            {this.props.back ? (
              <HeaderBackButton
                labelVisible={false}
                tintColor={this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)'}
                style={{flex: 1, backgroundColor: 'transparent'}}
                onPress={() => {
                  this.props.navigation.goBack();
                }}
              />
            ) : (
              <TouchableOpacity
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                style={{
                  paddingLeft: 15,
                }}
                onPress={(data) => {
                  this.props.navigation.navigate('DrawerStack');
                }}
              >
                <Entypo name="menu" size={35} color={'black'} />
              </TouchableOpacity>
            )}

            {false && (
              <View
                style={{
                  paddingLeft: 25,
                }}
              />
            )}

            {/* <NavigationBarIcon
          icon={Images.IconSearch}
          size={17}
          onPress={() => this.toggleSearch()}
       color={Color.primary} /> */}
          </View>

          {this.props.CustomSearchComponent ? (
            <View
              style={{
                flexDirection: 'row',
                //  paddingVertical: 3,
                borderBottomWidth: 1,
                borderBottomColor: this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)',
                // borderWidth: 1,
                //     borderColor: "#ddd",
                //   borderRadius: 20,
                //  backgroundColor: "red",
                height: 40,

                paddingHorizontal: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconFa
                name="search"
                size={18}
                style={{marginRight: 5}}
                color={this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)'}
              />
              <TextInput
                // style={{
                //   height: 40,
                //   width: Dimensions.get("screen").width * 0,
                //   borderRadius: 5,
                //   fontFamily: "Cairo-Regular",
                //   backgroundColor: "#f8f8f8",
                //   borderColor: "#eee",
                //   borderWidth: 1,
                //   textAlign: I18nManager.isRTL ? "right" : "left",
                // }}
                style={{
                  //    backgroundColor: "red",
                  color: 'gray',
                  height: 40,
                  fontSize: 16,
                  marginTop: 10,
                  width: Dimensions.get('screen').width * 0.45,
                  textAlign: 'left',
                  fontFamily: 'Cairo-Regular',
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                placeholder={this.props.placeholder}
                maxLength={26}
                onChangeText={this.props.onChangeText}
                value={this.props.searchValue}
                onSubmitEditing={this.props.onSubmitEditing}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                {
                  //   borderWidth: 1,
                  borderColor: Color.secondary,
                  borderRadius: 5,
                  paddingHorizontal: 3,
                  paddingVertical: 11,
                },
                //      this.props.blue && false && { backgroundColor: "white" }
              ]}
              onPress={() => {
                if (this.props.query) {
                  this.props.navigation.navigate('Search', {
                    query: this.props.query,
                  });
                } else {
                  this.props.navigation.navigate('Search');
                }
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingVertical: 3,
                  borderBottomWidth: 1,
                  borderBottomColor: this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)',
                  // borderWidth: 1,
                  //     borderColor: "#ddd",
                  //   borderRadius: 20,

                  paddingHorizontal: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconFa
                  name="search"
                  size={18}
                  style={{marginRight: 5}}
                  color={this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)'}
                />
                <Text
                  style={{
                    color: this.props.blue && false ? '#fff' : 'gray',
                    fontSize: 17,
                    minWidth: Dimensions.get('screen').width * 0.45,
                    textAlign: 'left',
                    //     fontSize: 16
                  }}
                >
                  {this.props.query
                    ? this.props.query
                    : Languages.SearchByMakeOrModel}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center',
              marginRight: 15,
              justifyContent: 'space-evenly',
            }}
            onPress={() => {
              this.refs.countryPicker.openModal();
            }}
          >
            <View
              style={{
                marginBottom: 3,
              }}
            >
              {this.props.ViewingCountry && (
                <CountryPicker
                  filterPlaceholder={Languages.Search}
                  hideAlphabetFilter
                  ref="countryPicker"
                  filterable
                  AllCountries
                  autoFocusFilter={false}
                  styles={{
                    input: {
                      //   paddingVertical: 20
                    },
                    header: {
                      paddingVertical: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: Color.secondary,
                    },
                  }}
                  closeable
                  transparent
                  onChange={(value) => {
                    if (this.props.onCountryChange) {
                      this.setState(
                        {
                          cca2: value.cca2,
                          countryName: value.name,
                        },
                        () => {
                          this.props.setViewingCountry(value);
                          this.props.onCountryChange(value);
                        }
                      );
                    } else {
                      this.setState(
                        {
                          cca2: value.cca2,
                          countryName: value.name,
                        },
                        () => {
                          this.props.setViewingCountry(value);
                        }
                      );
                    }
                  }}
                  cca2={this.props.ViewingCountry.cca2}
                  translation={Languages.translation}
                />
              )}
            </View>

            {false && this.props.ViewingCountry && (
              <Text
                numberOfLines={1}
                style={{
                  color: this.props.blue && false ? '#fff' : '#111',
                  fontSize: Constants.smallFont,
                  width: 60,
                  textAlign: 'center',
                  marginHorizontal: 4,
                }}
              >
                {this.props.ViewingCountry.name}
              </Text>
            )}
            {false && (
              <Entypo
                name="triangle-down"
                size={18}
                color={this.props.blue && false ? '#fff' : 'rgba(0,0,0,0.7)'}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({menu}) => ({
  ViewingCountry: menu.ViewingCountry,
});

const mapDispatchToProps = (dispatch) => {
  const {actions} = require('@redux/MenuRedux');

  return {
    setViewingCountry: (country, callback) =>
      actions.setViewingCountry(dispatch, country, callback),

    //  fetchListings: (parentid) => Listingredux.actions.fetchListings(dispatch, parentid, 1)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewHeader);
