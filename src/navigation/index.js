'use strict';
import React from 'react';
import {
  createAppContainer,
  createSwitchNavigator,
  getActiveChildNavigationOptions,
} from 'react-navigation';
import {Text, StyleSheet, View} from 'react-native';
import {createStackNavigator} from 'react-navigation-stack';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';
import {ChatIcon} from '../components';

//import {createTabNavigator} from 'react-navigation-tabs'
import {SplashScreen} from '@containers';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import SearchScreen from './SearchScreen';
import ListingsScreen from './ListingsScreen';
import HomeScreen from './HomeScreen';
import ForgotPassword from './ForgotPassword';
import SettingScreen from './SettingScreen';
import EditProfile from './EditProfile';
import MessagesScreen from './MessagesScreen';
import ChatScreen from './ChatScreen';
import LanguageSelector from './LanguageSelector';
import RecentListings from './RecentListings';
import CarDetails from './CarDetails';
import SellTypeScreen from './SellTypeScreen';
import MakesScreen from './MakesScreen';
import PostOfferScreen from './PostOfferScreen';
import SectionsScreen from './SectionsScreen';
import CategoriesScreen from './CategoriesScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import DealerSignUp from './DealerSignUp';
import DealersScreen from './DealersScreen';
import DealerProfileScreen from './DealerProfileScreen';
import UserProfileScreen from './UserProfileScreen';
import ActiveOffers from './ActiveOffers';
import InactiveOffers from './InactiveOffers';
import PrivacyPolicy from './PrivacyPolicy';
import SearchResult from './SearchResult';
import FavoriteScreen from './FavoriteScreen';
import BlogDetails from './BlogDetails';
import Color from './../common/Color';
import Languages from './../common/Languages';
import Drawer from './../components/Drawer';
import BlogsScreen from './BlogsScreen';
import RecentlyViewedScreen from './RecentlyViewedScreen';
import SubscriptionsScreen from './SubscriptionsScreen';

const styles = StyleSheet.create({
  labelStyle: {fontSize: 12, lineHeight: 18},
});

const App = createStackNavigator(
  {
    HomeScreen: {
      screen: HomeScreen,
      //   navigationOptions: {header: null},
    },
    SellTypeScreen: {
      screen: SellTypeScreen,
      navigationOptions: {header: null},
    },
    MakesScreen: {
      screen: MakesScreen,
      navigationOptions: {header: null},
    },
    // MessagesScreen: {
    //   screen: MessagesScreen
    //   //  navigationOptions: { header: null }
    // },
    ChatScreen: {
      screen: ChatScreen,
      // navigationOptions: { header: null }
    },
    BlogDetails: {
      screen: BlogDetails,
    },
    BlogsScreen: {
      screen: BlogsScreen,
    },

    EditProfile: {
      screen: EditProfile,
    },
    SettingScreen: {
      screen: SettingScreen,
    },

    ListingsScreen: {
      screen: ListingsScreen,
      navigationOptions: {header: null},
    },

    Search: {
      screen: SearchScreen,
    },
    LanguageSelector: {
      screen: LanguageSelector,
      navigationOptions: {header: null},
    },

    LoginScreen: {
      screen: LoginScreen,
      navigationOptions: {header: null},
    },

    RecentListings: {
      screen: RecentListings,
    },

    ForgotPassword: {
      screen: ForgotPassword,
      navigationOptions: {header: null},
    },

    RegisterScreen: {
      screen: RegisterScreen,
      navigationOptions: {tabBarVisible: false, header: null},
    },
    CarDetails: {
      screen: CarDetails,
      navigationOptions: {header: null},
    },
    PostOfferScreen: {
      screen: PostOfferScreen,
      navigationOptions: {header: null},
    },
    SectionsScreen: {
      screen: SectionsScreen,
      navigationOptions: {header: null},
    },

    CategoriesScreen: {
      screen: CategoriesScreen,
      navigationOptions: {header: null},
    },

    ChangePasswordScreen: {
      screen: ChangePasswordScreen,
      navigationOptions: {header: null},
    },
    DealerSignUp: {
      screen: DealerSignUp,
      //  navigationOptions: { header: null }
    },
    DealersScreen: {
      screen: DealersScreen,
      navigationOptions: {header: null},
    },
    UserProfileScreen: {
      screen: UserProfileScreen,
      navigationOptions: {header: null},
    },
    DealerProfileScreen: {
      screen: DealerProfileScreen,
      navigationOptions: {header: null},
    },
    // ActiveOffers: {
    //   screen: ActiveOffers,
    //   navigationOptions: { header: null }
    // },
    InactiveOffers: {
      screen: InactiveOffers,
      navigationOptions: {header: null},
    },
    PrivacyPolicy: {
      screen: PrivacyPolicy,
      navigationOptions: {header: null},
    },
    SearchResult: {
      screen: SearchResult,
      navigationOptions: {header: null},
    },
    FavoriteScreen: {
      screen: FavoriteScreen,
      navigationOptions: {header: null},
    },
    RecentlyViewedScreen: {
      screen: RecentlyViewedScreen,
      navigationOptions: {header: null},
    },

    SubscriptionsScreen: {
      screen: SubscriptionsScreen,
      navigationOptions: {header: null},
    },
  },
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      animationEnabled: false,
    },
    navigationOptions: ({navigation, screenProps}) => {
      return {
        headerVisible: false,
        animationEnabled: false,
        tabBarVisible: false,
        header: null,
        ...getActiveChildNavigationOptions(navigation, screenProps),

        initialRouteName: 'HomeScreen',
      };

      // navigationOptions: { header: null }
    },
  }
);

const DrawerStack = createStackNavigator(
  {
    Drawer: {
      screen: Drawer,
      //   navigationOptions: {header: null},
    },

    SettingScreen: {
      screen: SettingScreen,
    },
    EditProfile: {
      screen: EditProfile,
    },

    LoginScreen: {
      screen: LoginScreen,
      navigationOptions: {header: null},
    },

    RecentListings: {
      screen: RecentListings,
    },

    ForgotPassword: {
      screen: ForgotPassword,
      navigationOptions: {header: null},
    },

    RegisterScreen: {
      screen: RegisterScreen,
      navigationOptions: {tabBarVisible: false, header: null},
    },
    CarDetails: {
      screen: CarDetails,
      navigationOptions: {header: null},
    },
    PostOfferScreen: {
      screen: PostOfferScreen,
      navigationOptions: {header: null},
    },
    SectionsScreen: {
      screen: SectionsScreen,
      navigationOptions: {header: null},
    },

    ChangePasswordScreen: {
      screen: ChangePasswordScreen,
      navigationOptions: {header: null},
    },
    DealerSignUp: {
      screen: DealerSignUp,
      //  navigationOptions: { header: null }
    },
    DealersScreen: {
      screen: DealersScreen,
      navigationOptions: {header: null},
    },
    UserProfileScreen: {
      screen: UserProfileScreen,
      navigationOptions: {header: null},
    },
    DealerProfileScreen: {
      screen: DealerProfileScreen,
      navigationOptions: {header: null},
    },

    PrivacyPolicy: {
      screen: PrivacyPolicy,
      navigationOptions: {header: null},
    },
    SearchResult: {
      screen: SearchResult,
      navigationOptions: {header: null},
    },
    FavoriteScreen: {
      screen: FavoriteScreen,
      navigationOptions: {header: null},
    },

    SubscriptionsScreen: {
      screen: SubscriptionsScreen,
      navigationOptions: {header: null},
    },
  },
  {
    headerMode: 'none',
    navigationOptions: ({navigation, screenProps}) => {
      return {
        headerVisible: false,
        tabBarVisible: false,
        header: null,
        ...getActiveChildNavigationOptions(navigation, screenProps),

        initialRouteName: 'Drawer',
      };

      // navigationOptions: { header: null }
    },
  }
);
const ChatStack = createStackNavigator(
  {
    MessagesScreen: {
      screen: MessagesScreen,
      // navigationOptions: { header: null }
    },
    ChatScreen: {
      screen: ChatScreen,
      navigationOptions: {header: null},
    },

    CarDetails: {
      screen: CarDetails,
      navigationOptions: {header: null},
    },

    DealersScreen: {
      screen: DealersScreen,
      navigationOptions: {header: null},
    },
    UserProfileScreen: {
      screen: UserProfileScreen,
      navigationOptions: {header: null},
    },
    DealerProfileScreen: {
      screen: DealerProfileScreen,
      navigationOptions: {header: null},
    },
  },
  {
    headerMode: 'none',

    navigationOptions: {
      headerVisible: false,

      header: null,

      initialRouteName: 'MessagesScreen',
    },
  }
);

const MyOffersStack = createStackNavigator(
  {
    ActiveOffers: {
      screen: ActiveOffers,
      // navigationOptions: { header: null }
    },
    ChatScreen: {
      screen: ChatScreen,
      navigationOptions: {header: null},
    },
    EditProfile: {
      screen: EditProfile,
    },
    PostOfferScreen: {
      screen: PostOfferScreen,
      navigationOptions: {header: null},
    },

    CarDetails: {
      screen: CarDetails,
      navigationOptions: {header: null},
    },

    DealersScreen: {
      screen: DealersScreen,
      navigationOptions: {header: null},
    },
    UserProfileScreen: {
      screen: UserProfileScreen,
      navigationOptions: {header: null},
    },
    DealerProfileScreen: {
      screen: DealerProfileScreen,
      navigationOptions: {header: null},
    },
  },
  {
    headerMode: 'none',

    navigationOptions: {
      headerVisible: false,

      header: null,

      initialRouteName: 'ActiveOffers',
    },
  }
);

ChatStack.navigationOptions = ({navigation}) => {
  let tabBarVisible = true;

  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};

MyOffersStack.navigationOptions = ({navigation, navigationOptions}) => {
  let tabBarVisible = true;

  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};

const BottomNavigation = createMaterialBottomTabNavigator(
  {
    HomeScreen: {
      screen: App,
      navigationOptions: ({navigation, navigationOptions}) => {
        return {
          header: null,
          tabBarLabel: <Text style={styles.labelStyle}>{Languages.Home}</Text>,
          tabBarVisible: navigationOptions.tabBarVisible,
          tabBarIcon: ({focused, horizontal, tintColor}) => {
            return (
              <IconMC
                name="home"
                color={focused ? Color.secondary : Color.tabBarInactive}
                size={25}
              />
            );
          },
        };
      },
    },
    MessagesScreen: {
      screen: ChatStack,
      navigationOptions: ({navigation, navigationOptions}) => ({
        header: null,
        tabBarLabel: <Text style={styles.labelStyle}>{Languages.MyChats}</Text>,

        tabBarColor: Color.secondary,
        tabBarIcon: ({focused, horizontal, tintColor}) => {
          return <ChatIcon focused={focused} />;
        },
      }),
    },
    // FavoriteTab: {
    //   screen: FavoriteScreen,
    //   navigationOptions: {
    //     header: null,
    //     tabBarLabel: Languages.MyFavourites,
    //     tabBarColor: Color.primary,
    //     tabBarIcon: ({ focused, horizontal, tintColor }) => {
    //       return (
    //         <IconFA
    //           name="heart"
    //           color={focused ? Color.secondary : Color.primary}
    //           size={focused ? 24 : 20}
    //         ></IconFA>
    //       );
    //     }
    //   }
    // },

    ActiveOffers: {
      screen: MyOffersStack,
      navigationOptions: ({navigation, navigationOptions}) => ({
        header: null,
        tabBarLabel: (
          <Text style={styles.labelStyle}>{Languages.MyOffers}</Text>
        ),

        tabBarIcon: ({focused, horizontal, tintColor}) => {
          return (
            <IconMC
              name="playlist-check"
              color={focused ? Color.secondary : Color.tabBarInactive}
              size={25}
            />
          );
        },
      }),
    },
    DrawerStack: {
      screen: DrawerStack,
      navigationOptions: ({navigation, navigationOptions}) => ({
        header: null,
        tabBarLabel: <Text style={styles.labelStyle}>{Languages.Profile}</Text>,

        tabBarIcon: ({focused, horizontal, tintColor}) => {
          return (
            <IconMC
              name="account"
              color={focused ? Color.secondary : Color.tabBarInactive}
              size={25}
            />
          );
        },
      }),
    },
  },
  {
    initialRouteName: 'HomeScreen',
    barStyle: {backgroundColor: '#Fff'},
    labeled: true,
    shifting: false,
    activeColor: Color.secondary,
    inactiveColor: Color.tabBarInactive,
  }
);

const AppNavigator = createStackNavigator(
  {
    SplashScreen: SplashScreen,
    CarDetails: {
      screen: CarDetails,
      navigationOptions: {header: null},
    },
    LanguageSelector: {
      screen: LanguageSelector,
      navigationOptions: {header: null},
    },

    //   Auth: Auth,
    App: {screen: BottomNavigation, navigationOptions: {header: null}},
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const mapStateToProps = ({chat}) => ({
  chat: chat,
});
export default createAppContainer(AppNavigator);
//export default connect(mapStateToProps)(createAppContainer(AppNavigator));
