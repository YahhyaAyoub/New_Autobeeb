/**
 * Created by Kensoftware on 23/02/2017.
 */

import React, {Component} from 'react';
import {
  Image,
  StyleSheet,
  Platform,
  UIManager,
  View,
  Dimensions,
  Linking,
} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import {connect} from 'react-redux';
import {Images, Styles, Languages} from '@common';
import {Timer} from '@app/Omni';
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';
import RNBootSplash from 'react-native-bootsplash';
import KS from '@services/KSAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const minDisplayTime = 100;

class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      finishedLoadingHomescreen: false,
    };

    this.prepareData = this.prepareData.bind(this);
  }
  handleOpenURL = (event) => {
    // D
    // this.navigate(event.url);
    let url = event.url;
    if (url) {
      let ID = url.split('/')[url.split('/').length - 2];
      let TypeID = url.split('/')[url.split('/').length - 1];
      let IDarray = url.match(
        /([a-z0-9A-Z]{8}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{12})/g
      );
      let userID = IDarray && IDarray.length > 0 ? IDarray[0] : undefined;
      if (ID && TypeID && url.includes('offer')) {
        this.props.navigation.navigate('CarDetails', {
          item: {ID: ID, TypeID: TypeID},
        });
      } else if (url.includes('dealer') && userID) {
        this.props.navigation.navigate('DealerProfileScreen', {
          userid: userID, //last parameter which is the dealer ID
        });
      } else if (url.includes('profile') && userID) {
        this.props.navigation.navigate('UserProfileScreen', {
          userid: userID,
        });
      }
    }
  };

  componentDidMount() {
    // console.log("splashscreen yazeed");

    // setTimeout(() => {
    //   alert(JSON.stringify(this.props.ViewingCurrency));
    // }, 200);
      AsyncStorage.getItem('@chatIconDot').then((res)=>{
        if(res&&res==='true'){
          this.props.editChat({type:'EDIT_CHAT', payload:true});
        }else if(res&&res==='false'){
          this.props.editChat({type:'EDIT_CHAT', payload:false});
        }else{ 
          this.props.editChat({type:'EDIT_CHAT', payload:false});
        }
      }
      );
    setTimeout(() => {
      if (this.props.ViewingCurrency) {
        global.ViewingCurrency = this.props.ViewingCurrency;
      }
    }, 500);

    AsyncStorage.getItem('cca2', (error, data) => {
      //  alert(data);
      //   alert(JSON.stringify(this.props.ViewingCurrency));
      if (data) {
        if (this.props.ViewingCurrency) {
          this.props.HomeScreenGet(
            Languages.langID,
            data,
            5,
            this.props.ViewingCurrency.ID,
            () => {
              this.setState({finishedLoadingHomescreen: true});
              this.prepareData();
              // Timer.setTimeout(this.prepareData, minDisplayTime);
            }
          );
        } else {
          KS.CurrencyGetByISOCode({
            langid: Languages.langID,
            isoCode: data,
          }).then((curr) => {
            //  alert(JSON.stringify(curr));
            global.ViewingCurrency = curr.currency;
            this.props.setViewingCurrency(curr.currency);

            this.props.HomeScreenGet(
              Languages.langID,
              data,
              5,
              curr.currency.ID,
              () => {
                this.setState({finishedLoadingHomescreen: true});
                Timer.setTimeout(this.prepareData, minDisplayTime);
              }
            );
          });
        }
      } else {
        this.setState({finishedLoadingHomescreen: true});

        Timer.setTimeout(this.prepareData, minDisplayTime);
      }
    });
    setTimeout(() => {
      if (!this.state.finishedLoadingHomescreen) {
        this.prepareData(); //incase something wrong happened with asyncstorage
      }
    }, 15000);

    if (Platform.OS == 'android') {
      RNBootSplash.hide({duration: 100});
    }
    Linking.addEventListener('url', this.handleOpenURL);
  }

  render() {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
        <LottieView source={require('./AutobeebFast.json')} autoPlay loop />

        {false && (
          <Image
            style={{width: Dimensions.get('screen').width * 0.7}}
            resizeMode={'contain'}
            source={require('@images/autobeeb.png')}
          />
        )}
      </View>
    );
  }

  /**
   * All necessary task like: pre-load data from server, checking local resource, configure settings,...
   * Should be done in this function and redirect to other screen when complete.
   */
  prepareData = async () => {
    //noinspection Eslint

    const {user, netInfo, navigation} = this.props;
    const SkipLanguage = await AsyncStorage.getItem('SkipLanguage');
    const country = await AsyncStorage.getItem('country');
    this.props.setViewingCountry(JSON.parse(country));
    // alert(JSON.parse(country.cca2));

    let NavigateLanguageSelect = {
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({routeName: 'LanguageSelector'})],
    };

    if (JSON.parse(SkipLanguage) === true) {
      AsyncStorage.getItem('user', (error, result2) => {
        const user = JSON.parse(result2);
        const {login} = this.props;
        // alert(JSON.stringify(result2))
        if (result2 !== null) {
          login(user);
          this.props.navigation.replace('App');
          //    navigation.dispatch(StackActions.reset(NavigateHomeScreen));
        } else {
          AsyncStorage.getItem('introScene', (err, result) => {
            if (result == '1') {
              //  navigation.dispatch(StackActions.reset(NavigateHomeScreen));
              this.props.navigation.replace('App');
            } else {
              this.props.navigation.replace('App');
            }

            //navigation.dispatch(StackActions.reset(NavigateIntro));
          });
        }
      });
    } else {
      navigation.dispatch(StackActions.reset(NavigateLanguageSelect));
    }
    if (Platform.OS === 'android') {
      setTimeout(() => {
        Linking.getInitialURL().then((url) => {
          //  alert(JSON.stringify(url));
          if (url) {
            let ID = url.split('/')[url.split('/').length - 2];
            let TypeID = url.split('/')[url.split('/').length - 1];
            let IDarray = url.match(
              /([a-z0-9A-Z]{8}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{12})/g
            );
            let userID = IDarray && IDarray.length > 0 ? IDarray[0] : undefined;
            if (ID && TypeID && url.includes('offer')) {
              this.props.navigation.navigate('CarDetails', {
                item: {ID: ID, TypeID: TypeID},
              });
            } else if (url.includes('dealer') && userID) {
              this.props.navigation.navigate('DealerProfileScreen', {
                userid: userID, //last parameter which is the dealer ID
              });
            } else if (url.includes('profile') && userID) {
              this.props.navigation.navigate('UserProfileScreen', {
                userid: userID,
              });
            }
          }
        });
      }, 200);
    }
    //NavigationActions.navigate({routeName: 'HomeScreen'});
  };
}

const styles = StyleSheet.create({
  image: {
    height: Styles.height,
    alignItems: 'center',
    justifyContent: 'center',
    width: Styles.width - 30,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    //zIndex: 999,
    //  elevation: 12
  },
});

SplashScreen.navigationOptions = {
  header: null,
};

SplashScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  netInfo: PropTypes.object,
};

const mapStateToProps = ({netInfo, user, menu}) => ({
  netInfo,
  user,
  ViewingCountry: menu.ViewingCountry,
  ViewingCurrency: menu.ViewingCurrency,
});
import {actions as useractions} from '@redux/UserRedux';
import {actions as MenuActions} from '@redux/MenuRedux';

const HomeRedux = require('@redux/HomeRedux');

const mapDispatchToProps = (dispatch) => {
  return {
    login: (user) => useractions.login(dispatch, user),
    setViewingCountry: (country, callback) =>
      MenuActions.setViewingCountry(dispatch, country, callback),

    setViewingCurrency: (currency, callback) =>
      MenuActions.setViewingCurrency(dispatch, currency, callback),

    HomeScreenGet: (langId, isoCode, listingsCount, cur, callback) =>
      HomeRedux.actions.HomeScreenGet(
        dispatch,
        langId,
        isoCode,
        listingsCount,
        cur,
        callback
      ),

      editChat:(data)=> dispatch(data)

  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);
