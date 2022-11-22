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
  Platform,
} from 'react-native';
import KS from '@services/KSAPI';
import {Languages, Color} from '@common';
import {LogoSpinner, RowListingsComponent} from '@components';
import NewHeader from '../containers/NewHeader';
import Moment from 'moment';
import IconFa from 'react-native-vector-icons/FontAwesome';
import Communications from 'react-native-communications';
import {connect} from 'react-redux';
import admob, {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from '@react-native-firebase/admob';

class UserProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      ListingsLoading: true,
      UserLoading: true,
    };
  }
  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });
  componentDidMount() {
    try {
      KS.UserGet({
        userID: this.props.navigation.getParam('userid', null),
        langid: Languages.langID,
      }).then((data) => {
        //   alert(JSON.stringify(data));
        if (data && data.Success == 1) {
          this.setState({
            UserLoading: false,
            User: data.User,
          });
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
        offerStatus: 16,

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
  }

  render() {
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
          back
          onCountryChange={(item) => {
            this.setState({cca2: item.cca2});
          }}
        />

        {this.state.User && (
          <View
            style={{
              flexDirection: 'row',
              // flex: 1,
              alignItems: 'center',
              padding: 15,
            }}
          >
            {this.state.User && this.state.User.ThumbImage ? (
              <Image
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  marginRight: 5,
                }}
                resizeMode={'contain'}
                source={{
                  uri:
                    'https://autobeeb.com/' +
                    this.state.User.FullImagePath +
                    '_400x400.jpg',
                }}
              />
            ) : (
              <Image
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  marginRight: 5,
                }}
                resizeMode={'contain'}
                source={require('@images/seller.png')}
              />
            )}
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Text
                numberOfLines={1}
                style={[
                  {
                    textAlign: 'center',
                    fontSize: 17,
                    color: '#000',

                    lineHeight: 24,
                  },
                ]}
              >
                {this.state.User.Name}
              </Text>
              <Text style={{lineHeight: 24}}>
                {Languages.MemberSince +
                  Moment(this.state.User.RegistrationDate).format('YYYY-MM-DD')}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: Color.secondary,
                    paddingVertical: 3,
                    paddingHorizontal: 5,
                    borderRadius: 5,
                  }}
                  onPress={() =>
                    Communications.phonecall(this.state.User.Phone, true)
                  }
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconFa
                      name="phone"
                      size={25}
                      color="white"
                      style={{marginRight: 10}}
                    />
                    <Text style={{color: 'white', fontSize: 18}}>
                      {this.state.User.Phone}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <View
          style={{
            marginVertical: 5,
            alignItems: 'center',
            minHeight: 10,
            // paddingVertical: 5,
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
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            alignItems: 'center',
            paddingVertical: 10,
            //  paddingVertical: 20
          }}
          data={this.state.Listings}
          ListEmptyComponent={() => {
            return <Text style={{}}>{Languages.NoOffers}</Text>;
          }}
          renderItem={({item, index}) => {
            if (item.Banner) {
              return (
                <View
                  style={{
                    alignItems: 'center',
                    minHeight: 10,
                    //    paddingVertical: 5,
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
                <RowListingsComponent
                  key={index}
                  profile
                  item={item}
                  navigation={this.props.navigation}
                  AppCountryCode={this.props.ViewingCountry?.cca2}
                />
              );
          }}
          onEndReached={() => {
            this.setState({page: this.state.page + 1}, () => {
              if (this.state.page <= this.state.TotalPages) {
                this.setState({footerLoading: true});

                KS.UserListings({
                  langid: Languages.langID,
                  userid: this.props.navigation.getParam('userid', null),
                  page: this.state.page,
                  offerStatus: 16,

                  pagesize: 6,
                }).then((data) => {
                  if (data && data.Success) {
                    let concattedListings = this.state.Listings;
                    concattedListings.push({Banner: true});
                    concattedListings = concattedListings.concat(data.Listings);

                    this.setState({
                      Listings: concattedListings,
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
      </ScrollView>
    );
  }
}

const mapStateToProps = ({menu}) => ({
  ViewingCountry: menu.ViewingCountry,
});

export default connect(mapStateToProps)(UserProfileScreen);
