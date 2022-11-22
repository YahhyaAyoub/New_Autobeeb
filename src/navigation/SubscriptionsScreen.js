import React, {createRef, useState, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  I18nManager,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modalbox';
import {connect} from 'react-redux';
import {AppIcon, Color} from '../common';
import Constants from '../common/Constants';
import Languages from '../common/Languages';
import {NewHeader} from '../containers';
import IconEn from 'react-native-vector-icons/Feather';
import KS from '../services/KSAPI';
//import { requestOneTimePayment } from "react-native-paypal";
//import MyWebView from 'react-native-webview-autoheight';
import HTML, {IGNORED_TAGS} from 'react-native-render-html';
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import {HeaderBackButton} from 'react-navigation-stack';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {NavigationActions, StackActions} from 'react-navigation';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {WebView} from 'react-native-webview';
const ActivityIndicatorElement = () => {
  return (
    <ActivityIndicator
      color="#009688"
      size="large"
      style={{
        alignSelf: 'center',
        position: 'absolute',
        zIndex: 99,
        top: '50%',
      }}
    />
  );
};

const SubscriptionsScreen = ({navigation, storeUserData}) => {
  const PaymentMethodModalRef = createRef();
  const PaymentModal = createRef();
  const plansListRef = createRef();
  const itemSkus = Platform.select({
    ios: [
      'one_year_subscription_01',
      'one_year_subscription_02',
      'one_year_subscription_03',
      'one_year_subscription_04',
      'one_year_subscription_05',
    ],
    android: [
      'one_year_subscription_01',
      'one_year_subscription_02',
      'one_year_subscription_03',
      'one_year_subscription_04',
      'one_year_subscription_05',
    ],
  });
  let htmlStyle =
    `<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Cairo"><style>
  *{direction:` +
    (Languages.langID == '2' ? 'rtl' : 'ltr') +
    `; font-family:'cairo'}
  li{ font-size:35px; text-align:` +
    (Languages.langID == '2' ? 'right' : 'left') +
    `;padding:5px}
</style>`;

  const webViewScript = `
  setTimeout(function() { 
    window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight); 
  }, 500);
  true; // note: this is required, or you'll sometimes get silent failures
`;

  const [selectedType, setselectedType] = useState({
    ID: 2,
    Name: 'عادي',
    MonthPrice: 18,
    ThreeMonthsPrice: 50,
    SixMonthsPrice: 90,
    NineMonthsPrice: 120,
    YearPrice: 150,
    AdsNumber: 25,
  });

  const [Plans, setPlans] = useState(navigation.getParam('Plans', []));
  const [selectedGateway, setselectedGateway] = useState();
  const [Card, setCard] = useState();
  const [Loading, setLoading] = useState(false);
  const [Refresh, setRefresh] = useState(false);
  //const [PendingTransactionID, setPendingTransactionID] = useState();
  const [InAppPurchases, setInAppPurchases] = useState([]);
  const [pmid, setpmid] = useState();
  const [webViewHeight, setWebViewHeight] = useState(0);
  const [PaymentMethods, setPaymentMethods] = useState([
    {
      ID: 2,

      Name: 'Visa',
      Image: 'https://1000logos.net/wp-content/uploads/2017/06/VISA-logo.png',
      localImage: true,
      Image: require('@images/visa.png'),
    },
    {
      ID: 3,

      Name: 'Mastercard',
      localImage: true,
      Image: require('@images/mastercard.png'),
    },
    {
      ID: 1,
      Name: 'PayPal',
      localImage: true,
      Image: require('@images/paypal.png'),
    },
  ]);
  const colors = [
    Color.primary,
    Color.secondary,
    '#932F6D',
    '#FFD400',
    '#C20037',
    '#018404',
    '#9D4E01',
    '#636363',
  ];

  /*let ArabicLanguageList = [
    'IL',
    'JO',
    'PS',
    'SY',
    'LB',
    'IQ',
    'SA',
    'QA',
    'OM',
    'BH',
    'KW',
    'AE',
    'SD',
    'SO',
    'DZ',
    'MA',
    'TN',
    'KM',
    'LY',
    'EG',
    'YE',
    'MR',
    'DJ',
  ];*/
  let ArabicLanguageList = [
    'IN',
    'TH',
    'PH',
    'PK',
    'BD',
    'KP',
    'KR',
    'HK',
    'MY',
    'ZH',
    'CN',
  ];
  let nopp = [
    'PR',
    'PS',
    'UZ',
    'TR',
    'SY',
    'SZ',
    'SD',
    'SS',
    'PK',
    'MM',
    'LY',
    'LR',
    'LB',
    'KP',
    'IQ',
    'IR',
    'HT',
    'GH',
    'CU',
    'CF',
    'BD',
    'AF',
  ];
  let nocred = [
    'KR',
    'MX',
    'CA',
    'TH',
    'IN',
    'TW',
    'BG',
    'PK',
    'RO',
    'RS',
    'SI',
    'BR',
    'HU',
    'UA',
    'IR',
    'VN',
    'SG',
    'CZ',
    'KP',
    'EE',
    'PH',
    'RU',
    'AL',
    'AM',
    'US',
    'CR',
    'BY',
    'BO',
    'CM',
    'CL',
    'KG',
    'KE',
    'GH',
    'UZ',
    'LK',
    'PR',
    'TJ',
    'MD',
    'NA',
    'NI',
    'LT',
    'PE',
    'AR',
    'AZ',
    'CU',
    'BD',
    'BT',
    'KH',
    'TD',
    'KZ',
    'SV',
    'UY',
    'MT',
    'PY',
    'PT',
    'SN',
    'SK',
    'AO',
    'HR',
    'BT',
    'BW',
    'LS',
    'LV',
    'GE',
    'GT',
    'HN',
    'ZM',
    'ZA',
    'NG',
    'MK',
    'PG',
    'RW',
    'CO',
    'EC',
    'LA',
    'JM',
    'GM',
    'VE',
    'TM',
    'TZ',
    'MN',
    'PA',
    'SL',
    'KM',
  ];
  // let PaymentMethods = ArabicLanguageList.includes(
  //   navigation.getParam("ISOCode", "US")
  // )
  //   ? [
  //       {
  //         ID: 2,

  //         Name: "Visa",
  //         Image:
  //           "https://1000logos.net/wp-content/uploads/2017/06/VISA-logo.png",
  //       },
  //       {
  //         ID: 3,

  //         Name: "Mastercard",
  //         Image:
  //           "https://1000logos.net/wp-content/uploads/2017/03/MasterCard-Logo-768x510.png",
  //       },
  //       {
  //         ID: 1,
  //         Name: "PayPal",
  //         Image:
  //           "https://1000logos.net/wp-content/uploads/2017/05/Paypal-Logo-768x232.png",
  //       },

  //       // {
  //       //   ID: 4,

  //       //   Name: "iap",
  //       //   localImage: true,
  //       //   Image: require("@images/iap.png"),
  //       // },
  //     ]
  //   : [
  //       {
  //         ID: 2,

  //         Name: "Visa",
  //         Image:
  //           "https://1000logos.net/wp-content/uploads/2017/06/VISA-logo.png",
  //       },
  //       {
  //         ID: 3,

  //         Name: "Mastercard",
  //         Image:
  //           "https://1000logos.net/wp-content/uploads/2017/03/MasterCard-Logo-768x510.png",
  //       },
  //       {
  //         ID: 1,
  //         Name: "PayPal",
  //         Image:
  //           "https://1000logos.net/wp-content/uploads/2017/05/Paypal-Logo-768x232.png",
  //       },
  //       {
  //         ID: 5,
  //         Name: "alipay",
  //         Image:
  //           "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Alipay_logo.svg/1200px-Alipay_logo.svg.png",
  //       },
  //       // {
  //       //   ID: 4,
  //       //   Name: "iap",
  //       //   localImage: true,
  //       //   Image: require("@images/iap.png"),
  //       // },
  //     ];
  useEffect(() => {
    if (!Plans || Plans == [] || Plans.length == 0) {
      KS.PlansGet({
        langid: Languages.langID,
        isocode: navigation.getParam('ISOCode', 'US'),
      }).then((data) => {
        if (data?.Plans?.length > 0) {
          setPlans(data.Plans);
        } else {
          navigation.goBack();
        }
      });
    }
    RNIap.getProducts(itemSkus)
      .then((data) => {
        setInAppPurchases(data);
      })
      .catch((err) => {
        alert(JSON.stringify(err));
      });

    RNIap.initConnection().then(() => {
      // we make sure that "ghost" pending payment are removed
      // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
      RNIap.flushFailedPurchasesCachedAsPendingAndroid()
        .catch(() => {
          // exception can happen here if:
          // - there are pending purchases that are still pending (we can't consume a pending purchase)
          // in any case, you might not want to do anything special with the error
        })
        .then(() => {
          if (this.purchaseUpdateSubscription) {
            this.purchaseUpdateSubscription.remove();
            this.purchaseUpdateSubscription = null;
          }
          this.purchaseUpdateSubscription = purchaseUpdatedListener(
            (purchase) => {
              console.log('purchaseUpdatedListener', purchase);
              const receipt = purchase.transactionReceipt;
              //RNIap.finishTransaction(purchase, true); //only enable in testing to remove the stuck purchase
              AsyncStorage.getItem('pendingTransactionID').then(
                async (pendTransactionID) => {
                  if (receipt && pendTransactionID && pendTransactionID != '') {
                    console.log('complete PURCHASE ' + pendTransactionID);
                    KS.CompleteTransaction({
                      transactionID: JSON.parse(pendTransactionID),
                    }).then(async (CompleteTransactionData) => {
                      console.log(JSON.stringify(CompleteTransactionData));
                      await RNIap.finishTransaction(purchase, true);
                      AsyncStorage.removeItem('pendingTransactionID');
                      storeUserData(CompleteTransactionData.User, () => {
                        // navigation.replace("App");
                        navigation.dispatch(
                          StackActions.reset({
                            index: 0,
                            key: null,
                            actions: [
                              NavigationActions.navigate({routeName: 'App'}),
                            ],
                          })
                        );
                      });
                    });
                  }
                }
              );
            }
          );

          purchaseErrorSubscription = purchaseErrorListener((error) => {
            console.warn('purchaseErrorListener', error);
          });
        });
    });
    var tempPaymentMethods = [...PaymentMethods];
    if (ArabicLanguageList.includes(navigation.getParam('ISOCode', 'US'))) {
      tempPaymentMethods = [
        ...tempPaymentMethods,
        {
          ID: 5,
          Name: 'alipay',
          Image:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Alipay_logo.svg/1200px-Alipay_logo.svg.png',
        },
      ];
    }
    /*if (
      nocred.includes(navigation.getParam('ISOCode', 'JO')) &&
      tempPaymentMethods.length > 2
    ) {
      tempPaymentMethods.splice(0, 2);
      tempPaymentMethods = [
        ...tempPaymentMethods,
        {
          ID: 1,
          Name: 'Card',
          localImage: true,
          Image: require('@images/card.png'),
        },
      ];
    }*/
    if (
      nopp.includes(navigation.getParam('ISOCode', 'JO')) &&
      tempPaymentMethods.length > 2
    ) {
      tempPaymentMethods.splice(2, 1);
    }
    setPaymentMethods([...tempPaymentMethods]);
    //  alert(JSON.stringify(Plans));
    // KS.PlansGet({
    //   langid: Languages.langID,
    //   isocode: navigation.getParam("ISOCode", "US"),
    // }).then((data) => {
    //   if (data?.Plans?.length > 0) {
    //     setPlans(data.Plans);
    //   } else {
    //     navigation.goBack();
    //   }
    // });
  }, []);

  function PlanPeriodType(period) {
    switch (period) {
      case 1:
        return I18nManager.isRTL ? 'سنة' : Languages.Year;
      case 2:
        return Languages.Month;
      case 3:
        return Languages.Day;
    }
  }

  function handlePaymentMethod(PaymentMethod) {
    switch (PaymentMethod.ID) {
      case 1:
        return handleHyperPay('A');
      case 2:
        return handleHyperPay('H', 'VISA');

      case 3:
        return handleHyperPay('H', 'MASTER');
      case 4:
        return handleIAP();
      case 5:
        return handleHyperPay('P', null, 'alipay_cn');
    }
  }

  async function handlePayPal() {
    // const ClientTokenData = await KS.GenerateClientToken();
    // if (ClientTokenData?.Success == "1") {
    //   const payment = await requestOneTimePayment(ClientTokenData.ClientToken, {
    //     amount: "5", // required
    //     // any PayPal supported currency (see here: https://developer.paypal.com/docs/integration/direct/rest/currency-codes/#paypal-account-payments)
    //     currency: "USD",
    //     // any PayPal supported locale (see here: https://braintree.github.io/braintree_ios/Classes/BTPayPalRequest.html#/c:objc(cs)BTPayPalRequest(py)localeCode)
    //     localeCode: "en_US",
    //     shippingAddressRequired: false,
    //     //    merchantAccountId: "qzx7xk4fz4xxk73p",
    //     userAction: "commit", // display 'Pay Now' on the PayPal review page
    //     // one of 'authorize', 'sale', 'order'. defaults to 'authorize'. see details here: https://developer.paypal.com/docs/api/payments/v1/#payment-create-request-body
    //     intent: "authorize",
    //   });
    //   //  alert(JSON.stringify(payment));
    // }
  }

  async function handleIAP() {
    let inAppPurch = InAppPurchases.find(
      (IAP) =>
        IAP.productId ==
        Platform.select({
          ios: selectedType.AppStoreProductId,
          android: selectedType.GoogleProductId,
        })
    );

    if (inAppPurch) {
      await KS.AddPendingTransaction({
        userid: navigation.getParam('User', {ID: ''}).ID,
        planid: selectedType.ID,
        gatewaytype: Platform.select({
          ios: 12,
          android: 13,
        }),
      }).then(async (data) => {
        if (data && data.Success == 1) {
          console.log('prepurchase - ' + data.TransactionID);
          // setPendingTransactionID(data.TransactionID);
          await AsyncStorage.setItem(
            'pendingTransactionID',
            JSON.stringify(data.TransactionID)
          );
          await RNIap.requestSubscription(inAppPurch.productId);
        }
      });
    }
  }

  async function handleHyperPay(gateway, cardType, payssionpmid) {
    setselectedGateway(gateway);
    if (cardType) {
      setCard(cardType);
    }
    if (payssionpmid) {
      setpmid(payssionpmid);
    }

    PaymentModal.current.open();
  }
  function ActivityIndicatorLoadingView() {
    return (
      <ActivityIndicator
        color="#009688"
        size="large"
        style={{
          alignSelf: 'center',
          position: 'absolute',
          zIndex: 99,
          top: '50%',
        }}
      />
    );
  }
  return (
    <View style={styles.container}>
      {Loading && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.6)',
            width: '100%',
            height: '100%',
            elevation: 2,
            zIndex: 100,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {false && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 10,
            zIndex: 10,
            top: Platform.select({ios: 40, android: 15}),
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <IconEn
            name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
            size={30}
            color={'#000'}
          />
        </TouchableOpacity>
      )}

      <NewHeader navigation={navigation} back></NewHeader>

      <Modal
        ref={PaymentMethodModalRef}
        coverScreen
        //   isOpen
        statusBarTranslucent
        backdropPressToClose
        useNativeDriver={false}
        backButtonClose
        swipeToClose={false}
        style={styles.modalStyle}
      >
        {selectedType.ID != null && (
          <View
            style={{
              flex: 1,
              backgroundColor: '#F8F8F8',
            }}
          >
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: Platform.select({
                  ios: 50,
                  android: 35,
                }),
                left: 15,
                zIndex: 150,
                paddingHorizontal: 20,
                paddingVertical: 5,
                backgroundColor: '#000',
                borderRadius: 20,
              }}
              onPress={() => {
                setselectedType({ID: null});
                PaymentMethodModalRef.current.close();
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: '#fff',
                  fontFamily: Constants.fontFamily,
                }}
              >
                {Languages.Close}
              </Text>
            </TouchableOpacity>
            <ScrollView ref={plansListRef}>
              <View style={{}}>
                <View
                  style={{
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: '#FFF',
                    width: Dimensions.get('screen').width,
                    //     height: Dimensions.get("screen").width / 2,

                    paddingTop: 60,
                    paddingBottom: 20,
                  }}
                >
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={[
                        styles.planName,
                        {color: '#000', marginVertical: 15, fontSize: 22},
                      ]}
                    >
                      {selectedType.Name}
                    </Text>

                    <HTML
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      width={
                        Dimensions.get('screen').width -
                        Dimensions.get('screen').width * 0.04 -
                        15
                      }
                      originWhitelist={['*']}
                      onLoadEnd={() => setRefresh(!Refresh)}
                      source={{html: htmlStyle + selectedType.Description}}
                      injectedJavaScript={webViewScript}
                      javaScriptEnabled={true}
                      tagsStyles={{
                        li: {
                          textAlign: Languages.langID == '2' ? 'right' : 'left',
                          width: '100%',
                          marginVertical: 5,
                        },
                        br: {height: 0},
                      }}
                      ignoredTags={[...IGNORED_TAGS, 'br']}
                    />
                  </View>
                  <View style={{}}>
                    <Text style={[styles.planPrice, {flex: 0}]}>
                      {'$' + selectedType.Price}
                    </Text>
                  </View>
                </View>
                <View style={{}}>
                  <Text
                    style={{
                      fontFamily: Constants.fontFamilyBold,
                      fontSize: 18,
                      color: '#000',
                      textAlign: 'center',
                      marginVertical: 15,
                    }}
                  >
                    {Languages.SelectPaymentMethod}
                  </Text>
                </View>
                <FlatList
                  contentContainerStyle={{
                    alignItems: 'center',
                  }}
                  keyExtractor={(item, index) => index.toString()}
                  data={PaymentMethods}
                  numColumns={2}
                  renderItem={({item, index}) => {
                    // if(item?.Name!=="iap")//this line to hide google and apple pay (for huawei builds)
                    return (
                      <TouchableOpacity
                        style={[
                          {
                            backgroundColor: '#fff',
                            padding: 15,
                            borderRadius: 15,
                            marginBottom: 20,
                            //    width: "90%",
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexDirection: 'row',
                            elevation: 1,
                            marginHorizontal: 10,
                          },
                        ]}
                        onPress={() => {
                          handlePaymentMethod(item);
                        }}
                      >
                        <Image
                          style={{width: 120, height: 60}}
                          resizeMode="contain"
                          source={
                            item.localImage ? item.Image : {uri: item.Image}
                          }
                        />
                      </TouchableOpacity>
                    );
                    // else
                    // return(<View/>)
                  }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    paddingHorizontal: 10,
                  }}
                >
                  {Languages.AmountWillDeducted}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
        <Modal
          ref={PaymentModal}
          coverScreen
          //   isOpen
          statusBarTranslucent
          backdropPressToClose
          backButtonClose
          swipeToClose={false}
          style={styles.modalStyle}
        >
          <View
            style={{
              zIndex: 200,
              //   elevation:10,
              minHeight: 50,
              paddingTop: isIphoneX() ? 20 : 10,
              paddingBottom: 10,
              width: Dimensions.get('screen').width,
              //  backgroundColor: "red",
              //  elevation: 1,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 20,
                justifyContent: 'space-between',
              }}
            >
              <HeaderBackButton
                labelVisible={false}
                tintColor="#000"
                style={{}}
                onPress={() => {
                  PaymentModal.current.close();
                }}
              />
            </View>
          </View>
          <WebView
            thirdPartyCookiesEnabled={true}
            originWhitelist={['*']}
            mixedContentMode={'always'}
            domStorageEnabled={true}
            allowUniversalAccessFromFileURLs={true}
            javaScriptEnabled={true}
            style={{flex: 1}}
            onLoad={() => {
              // console.log(
              //   `https://autobeeb.com/MobileCreditCardPayment?uid=${
              //     navigation.getParam("User", { ID: "" }).ID
              //   }&packageID=${selectedType.ID}&gateway=${selectedGateway}`
              // );
            }}
            onMessage={(event) => {
              let data = JSON.parse(event.nativeEvent.data);
              console.log(data);
              setLoading(true);
              if (data && data.success == '1') {
                KS.UserGet({
                  userID: data.userID,
                  langid: Languages.langID,
                }).then((data2) => {
                  storeUserData(data2.User, () => {
                    // navigation.replace("App");
                    navigation.dispatch(
                      StackActions.reset({
                        index: 0,
                        key: null,
                        actions: [
                          NavigationActions.navigate({routeName: 'App'}),
                        ],
                      })
                    );
                  });
                });
              } else if (data && data.success == '0') {
                navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [NavigationActions.navigate({routeName: 'App'})],
                  })
                );
              }
            }}
            source={{
              uri: `https://autobeeb.com/MobileCreditCardPayment?uid=${
                navigation.getParam('User', {ID: ''}).ID
              }&packageID=${
                selectedType.ID
              }&gateway=${selectedGateway}&card=${Card}&langid=${
                Languages.langID
              }&pmid=${pmid}`,
            }}
            renderLoading={() => (
              <ActivityIndicator
                color={Color.primary}
                size="large"
                style={{
                  alignSelf: 'center',
                  position: 'absolute',
                  zIndex: 99,
                  top: '50%',
                }}
              />
            )}
            startInLoadingState={true}
          />
        </Modal>
      </Modal>

      <FlatList
        ListHeaderComponent={() => {
          return (
            <Text style={styles.headerText}>{Languages.SelectPlanType}</Text>
          );
        }}
        contentContainerStyle={{
          paddingHorizontal: 15,
          flexGrow: 1,
          paddingBottom: 15,
        }}
        keyExtractor={(item, index) => index.toString()}
        data={Plans?.sort((a, b) => a.ExtraOffers - b.ExtraOffers)}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={{
                backgroundColor: '#FFF',
                marginTop: 15,
                borderRadius: 5,
                overflow: 'hidden',
                elevation: 5,
              }}
              activeOpacity={0.9}
              onPress={() => {
                let IAP = {
                  ID: 4,

                  Name: 'iap',
                  localImage: true,
                  Image:
                    Platform.OS === 'ios'
                      ? require('@images/iap.png')
                      : require('@images/googleIAP.png'),
                };

                if (
                  InAppPurchases.some(
                    (x) =>
                      x.productId == item.GoogleProductId ||
                      x.productId == item.AppStoreProductId
                  ) &&
                  PaymentMethods.filter((PM) => PM.ID == 4).length == 0
                ) {
                  //         alert("yea");
                  setPaymentMethods([...PaymentMethods, IAP]);
                } else if (
                  PaymentMethods.filter((PM) => PM.ID == 4).length > 0 &&
                  !InAppPurchases.some(
                    (x) =>
                      x.productId == item.GoogleProductId ||
                      x.productId == item.AppStoreProductId
                  )
                ) {
                  let tempPaymentMethods = [...PaymentMethods];
                  tempPaymentMethods.pop();
                  setPaymentMethods(tempPaymentMethods);
                }
                setselectedType(item);
                PaymentMethodModalRef.current.open();
              }}
            >
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 25,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{flex: 1, alignItems: 'flex-start'}}>
                  <View
                    style={{
                      alignItems: 'center',
                      elevation: 5,
                      backgroundColor: '#FFF',
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={[
                        styles.planName,
                        {fontFamily: Constants.fontFamilyBold},
                      ]}
                    >
                      {item.PeriodInterval}
                    </Text>
                    <Text style={[styles.planName, {fontSize: 14}]}>
                      {PlanPeriodType(item.PeriodType)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.planName, {flex: 1, textAlign: 'center'}]}>
                  {item.Name + '\n'}
                  <Text
                    style={[
                      styles.planPrice,
                      {
                        color: colors[index],
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {item.Price == 0 ? Languages.Free : '$' + item.Price}
                  </Text>
                </Text>
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <View
                    style={{
                      alignItems: 'center',
                      elevation: 5,
                      backgroundColor: '#FFF',
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={[styles.planName, {fontSize: 14}]}>
                      {Languages.Ad}
                    </Text>
                    <Text
                      style={[
                        styles.planName,
                        {fontFamily: Constants.fontFamilyBold},
                      ]}
                    >
                      {item.ExtraOffers}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: colors[index],
                  //height: 50,
                  paddingVertical: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFF',
                    fontFamily: Constants.fontFamilyBold,
                    fontSize: 20,
                  }}
                >
                  {Languages.Subscribe}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

//export default SubscriptionsScreen;

const mapDispatchToProps = (dispatch) => {
  const {actions} = require('@redux/AddRedux');
  const UserActions = require('@redux/UserRedux');
  const HomeRedux = require('@redux/HomeRedux');

  return {
    DoAddListing: (data, images, callback) => {
      actions.DoAddListing(dispatch, data, images, callback);
    },
    storeUserData: (user, callback) =>
      UserActions.actions.storeUserData(dispatch, user, callback),
  };
};

export default connect(undefined, mapDispatchToProps)(SubscriptionsScreen);

const styles = StyleSheet.create({
  modalStyle: {
    flex: 1,
  },
  planPrice: {
    flex: 1,
    fontSize: 20,
    fontFamily: Constants.fontFamilyBold,
  },
  planName: {
    fontSize: 16,
    fontFamily: Constants.fontFamilyBold,
    color: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  headerText: {
    fontSize: 20,
    fontFamily: Constants.fontFamilyBold,
    color: '#000',
    marginTop: 20,
    textAlign: 'center',
  },
  activityIndicatorStyle: {
    flex: 1,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
