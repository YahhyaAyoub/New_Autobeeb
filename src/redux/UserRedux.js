import ks from '@services/KSAPI';
import {Languages} from '@common';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

FCM = messaging();
// check to make sure the user is authenticated

// requests permissions from the user
FCM.requestPermission();
// gets the device's push token

const types = {
  LOGOUT: 'LOGOUT',
  LOGIN: 'LOGIN_SUCCESS',
  USER_LISTING_FETCH_PENDING: 'USER_LISTING_FETCH_PENDING',
  USER_FAVORITES_FETCH_PENDING: 'USER_FAVORITES_FETCH_PENDING',
  USER_GENERATE_OTP: 'USER_GENERATE_OTP',
  USER_FAVORITES_FETCH_SUCCESS: 'USER_FAVORITES_FETCH_SUCCESS',
  USER_FAVORITES_UPDATED: 'USER_FAVORITES_UPDATED',
  USER_MERMBERSHIP_UPDATE_PENDING: 'USER_MERMBERSHIP_UPDATE_PENDING',
  USER_MERMBERSHIP_UPDATE_SUCCESS: 'USER_MERMBERSHIP_UPDATE_SUCCESS',
  USER_MEMBERSHIP_SET_GROUPID: 'USER_MEMBERSHIP_SET_GROUPID',
  USER_OTP_CONFIRM: 'USER_OTP_CONFIRM',
  USER_REGISTER_PENDING: 'USER_REGISTER_PENDING',
  USER_REGISTER_SUCCESS: 'USER_REGISTER_SUCCESS',
  USER_REGISTER_FAIL: 'USER_REGISTER_FAIL',
  USER_LOGIN_PENDING: 'USER_LOGIN_PENDING',
  USER_LOGIN_SUCCESS: 'USER_LOGIN_SUCCESS',
  USER_LOGIN_FAIL: 'USER_LOGIN_FAIL',
  USER_FORGOT_PASSWORD_PENDING: 'USER_FORGOT_PASSWORD_PENDING',
  USER_FORGOT_PASSWORD_SUCCESS: 'USER_FORGOT_PASSWORD_SUCCESS',
  USER_TYPE_UPDATE: 'USER_TYPE_UPDATE',
  USER_USERNAME_UPDATE: 'USER_USERNAME_UPDATE',
};

export const actions = {
  login: (dispatch, user) => {
    //   alert(JSON.stringify(user))
    FCM.getToken().then((token) => {
      ks.SetUserToken({
        userID: user.ID,
        token: token,
      });
    });

    dispatch({
      type: types.LOGIN,
      user: user,
    });
  },
  logout() {
    // alert("logout");
    //FBLoginManager.logout(function(error, data) {});
    return {type: types.LOGOUT};
  },
  forgotPassword(dispatch, data, callback) {
    dispatch({
      type: types.USER_FORGOT_PASSWORD_PENDING,
    });
    ks.forgotPassword(data).then((data) => {
      //  alert(JSON.stringify(data))
      dispatch({
        type: types.USER_FORGOT_PASSWORD_SUCCESS,
      });
      if (callback) callback(data);
    });
  },
  storeUserData(dispatch, data, callback) {
    const _this = this;
    // console.log("my user is:", data);
    AsyncStorage.setItem('user', JSON.stringify(data), () => {
      //const customers = await WooWorker.getCustomerById(json.user.id);
      _this.login(dispatch, data);
      if (callback) callback(data);
      //navigation.dispatch(NavigationActions.reset(resetData));
    });
  },

  GoogleSignin(dispatch, email, callback) {
    const _this = this;
    dispatch({type: types.USER_LOGIN_PENDING});
    ks.GoogleSignin({email: email}).then((data) => {
      _this.storeUserData(dispatch, data, callback);
    });
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },
  GoogleRegister(dispatch, email, name, callback) {
    const _this = this;
    dispatch({type: types.USER_LOGIN_PENDING});
    ks.GoogleRegister({email: email, name: name}).then((data) => {
      _this.storeUserData(dispatch, data, callback);
    });
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },

  facebookLogin(dispatch, user, callback) {
    const _this = this;
    dispatch({type: types.USER_LOGIN_PENDING});
    ks.facebookLogin({
      facebookid: user.id,
      email: user.email,
      name: user.name,
      langid: Languages.langID,
    }).then((data) => {
      _this.storeUserData(dispatch, data, callback);
    });
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },
  getFacebookUser(dispatch, user, callback) {
    const _this = this;
    dispatch({type: types.USER_LOGIN_PENDING});
    ks.getFacebookUser({facebookid: user.id, langid: Languages.langID}).then(
      (data) => {
        if (callback) callback(data);
      }
    );
    //dispatch({ type: types.LOGIN, payload: { uid: user.id} });
  },

  verifyCODE(dispatch, data, callback) {
    ks.verifyCODE(data).then((data) => {
      if (callback) callback(data);
    });
  },
  EditUser(dispatch, name, phone) {
    dispatch({type: types.USER_USERNAME_UPDATE, name: name, phone: phone});
  },
};

const initialState = {
  user: null,
  language: 'en',
  favorites: [],
  LogoImage: '',
  listings: [],
  isFetching: false,
  reLoad: false,
  isLoggedIn: false,
  error: false,
  errorMessage: '',
};

export const reducer = (state = initialState, action) => {
  const {type, user} = action;
  switch (type) {
    case types.USER_LOGIN_PENDING:
      return {
        ...state,
        error: false,
        errorMessage: '',
        isFetching: true,
        user: {},
        isLoggedIn: false,
      };

    case types.LOGOUT:
      return {...state, user: null};
    case types.LOGIN:
      return {...state, user: user};
    case types.USER_USERNAME_UPDATE:
      return {
        ...state,
        user: {
          ...state.user,
          phone: action.phone,
          name: action.name,
        },
      };
    default:
      return state;
  }
};
