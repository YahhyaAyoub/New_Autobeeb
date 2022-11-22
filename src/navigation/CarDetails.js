import React, { Component } from "react";

import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  FlatList,
  StatusBar,
  SectionList,
  RefreshControl,
  Linking,
  I18nManager,
  InteractionManager,
  BackHandler,
  Platform,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { connect } from "react-redux";
import { Languages, Color, Constants } from "@common";
import { toast } from "@app/Omni";
import { LogoSpinner, DealersBanner, OTPModal } from "../components";
import Moment from "moment";
import LinearGradient from "react-native-linear-gradient";
import IconMa from "react-native-vector-icons/MaterialIcons";
import IconFa from "react-native-vector-icons/FontAwesome";
import IconSLI from "react-native-vector-icons/SimpleLineIcons";
import IconEV from "react-native-vector-icons/EvilIcons";
import IconFE from "react-native-vector-icons/Feather";
import IconEn from "react-native-vector-icons/Entypo";
import IconIon from "react-native-vector-icons/Ionicons";
import Octicons from "react-native-vector-icons/Octicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import KS from "@services/KSAPI";
import ImageViewer from "react-native-image-zoom-viewer";
import { HeaderBackButton } from "react-navigation-stack";
import { isIphoneX } from "react-native-iphone-x-helper";
import FastImage from "react-native-fast-image";
import { NavigationEvents } from "react-navigation";
import Communications from "react-native-communications";
import * as Animatable from "react-native-animatable";
import getDirections from "react-native-google-maps-directions";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import admob, {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from "@react-native-firebase/admob";
import { ButtonIndex } from "../components";
import Modal from "react-native-modalbox";

const tempListing = {
  Name: "Loading",
  NameFirstPart: "Loading",
  NameSecondPart: "",
  GearBox: 1,
  FuelType: 1,
  PaymentMethod: 1,
  RentPeriod: null,
  ColorID: 4,
  Color: "#000",
  ColorLabel: "Black",
  Extras: 0,
  Consumption: 0,
  ID: 0,
  TypeID: 1,
  TypeName: "Cars",
  SellType: 1,
  Status: 16,
  Condition: 2,
  Section: null,
  SectionName: null,
  MakeID: 1638,
  MakeName: "Nissan",
  ModelID: 5306,
  ModelName: "Murano",
  Year: 2005,
  CityID: 7785,
  CityName: "Amman",
  CountryID: 979,
  CountryName: "Jordan",
  Price: 6500.0,
  EntryPrice: 6500.0,
  EntryCur: "1",
  CategoryID: 256,
  CategoryName: "SUV",
  ISOCode: "JO",
  DateAdded: "2020-05-19T04:02:29.433",
  RenewalDate: "2020-05-19T04:02:29.433",
  Favorite: false,
  Description: "Loading",
};
let reportData = {
  userId: "",
  listingId: "",
  typeId: "",
  message: "",
  email: "",
  listingname: "",
};
let reportOptions = [
  {
    title: "MisleadingAd",
    type: 1,
    icon: (x = "#555") => <IconMa name="bug-report" color={x} size={30} />,
  },
  {
    title: "DuplicatedAd",
    type: 2,
    icon: (x = "#555") => (
      <MaterialCommunityIcons name="repeat" color={x} size={30} />
    ),
  },
  {
    title: "FraudulentAd",
    type: 3,
    icon: (x = "#555") => <IconMa name="report" color={x} size={30} />,
  },
  {
    title: "SoldAd",
    type: 4,
    icon: (x = "#555") => <IconMa name="money-off" color={x} size={30} />,
  },
  {
    title: "WrongSectionAd",
    type: 5,
    icon: (x = "#555") => <IconMa name="sim-card-alert" color={x} size={30} />,
  },
  {
    title: "Other",
    type: 6,
    icon: (x = "#555") => (
      <IconEn name="dots-three-horizontal" color={x} size={30} />
    ),
  },
];
class CarDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: 1,
      date: new Date(),

      interval: null,
      isLoading: true,
      footerShown: true,
      modalPhotoOpen: false,
      DescriptionHidden: true,
      selectedFeatures: [],
      selectedDropdownFeatures: [],
      Listing:
        this.props.navigation.getParam("item", undefined) &&
        this.props.navigation.getParam("item", undefined).Name
          ? this.props.navigation.getParam("item", tempListing)
          : tempListing,
      isFocused: true,
      imageIndex: 1,
      loadingReport: false,
      reportDetailError: false,
      firstLoad:false
    };
    AsyncStorage.getItem("warningShown", (error, data) => {
      console.log(data);
      if (!data) {
        AsyncStorage.setItem("warningShown","true");
        this.setState({firstLoad:true});
      }
    });
  }

  renderCurrency(Listing) {
    switch (Listing.ISOCode) {
      case "JO":
        return I18nManager.isRTL ? "دينار" : "JOD";
      case "PS":
        return I18nManager.isRTL ? "شيكل" : "ILS";
      default:
        return "";
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  handleGetDirections = (destination) => {
    const data = {
      destination: destination,
      params: [
        {
          key: "travelmode",
          value: "driving", // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: "dir_action",
          value: "navigate", // this instantly initializes navigation using the given travel mode
        },
      ],
    };

    getDirections(data);
  };

  componentDidMount() {
    //console.log(this.state.Listing);
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
    const item = this.props.navigation.getParam("item", 0);
    if (
      this.props.navigation.getParam("showFeatures", false) ||
      this.props.navigation.getParam("isNewUser", false)
    ) {
      KS.FeaturesGet({
        langid: Languages.langID,
        selltype: item.SellType,
        typeID: item.Section ? item.Section : item.TypeID,
      }).then((data) => {
        if (data && data.Success == 1) {
          if (data.Features && data.Features.length > 0) {
            this.setState(
              {
                FeaturesSwitch: data.FeaturesSwitch,
                FeaturesDropDown: data.FeaturesDropDown,
                FeaturesLoaded: true,
              },
              () => {
                if (
                  this.props.navigation.getParam("showFeatures", false) == true
                ) {
                  this.setState({ isFeaturesModalOpen: true });
                }
              }
            );
          } else {
            if (this.props.navigation.getParam("isNewUser", false) == true) {
              this.setState({
                OtpOpen: true,
              });
            }
            if (
              this.props.navigation.getParam("pendingDelete", false) == true
            ) {
              this.setState({ pendingDelete: true, OtpOpen: true });
            }
          }
        }
      });
    }

    KS.ListingGet({
      langid: Languages.langID,
      pID: this.props.navigation.getParam("item", 0).ID,
      typeID: this.props.navigation.getParam("item", { TypeID: 1 }).TypeID,
      userid: (this.props.userData && this.props.userData.ID) || "",
      isoCode: this.props.ViewingCountry?.cca2,
    }).then((data) => {
      console.log(
        JSON.stringify({
          langid: Languages.langID,
          pID: this.props.navigation.getParam("item", 0).ID,
          typeID: this.props.navigation.getParam("item", { TypeID: 1 }).TypeID,
          userid: (this.props.userData && this.props.userData.ID) || "",
          isoCode: this.props.ViewingCountry?.cca2,
        })
      );
      if (data && data.Success == 1) {
        this.setState(
          {
            Listing: data.Listing,
            Features: data.ItemFeatures,
            Owner: data.Owner,
            Dealer: data.Dealer || undefined,
            RelatedListings: data.RelatedListings,
            Favorite: data.Listing?.Favorite,
          },
          () => {
            this.setState({ isLoading: false });
          }
        );
        if (!this.props.userData || this.props.userData?.ID != data.Owner?.ID) {
          this.props.updateRecentlySeenListings(data.Listing);
        }
        if (data.Deleted) {
          this.props.navigation.replace("HomeScreen");
        }
      } else {
        //   alert("hh");
        //   toast(Languages.SomethingWentWrong);
        this.props.navigation.goBack();
      }
    });

    if (item.ID % 2 == 0) {
      AsyncStorage.getItem("cca2", (error, data) => {
        if (data) {
          KS.BannersGet({
            isoCode: data,
            langID: Languages.langID,
            placementID: 9,
          }).then((data) => {
            if (data && data.Success == "1" && data.Banners?.length > 0) {
              this.setState({
                AutobeebBanner:
                  data.Banners[this.getRandomInt(data.Banners.length - 1)],
              });
            }
          });
        }
      });
    }
  }

  checkCountry(callback) {
    if (!this.props.userData) {
      //if user isnt logged in check if country is email based or phone based
      AsyncStorage.getItem("cca2", (error, data) => {
        if (data) {
          KS.CountriesGet({ langid: Languages.langID }).then(
            (CountriesData) => {
              if (CountriesData && CountriesData.Success == "1") {
                this.setState(
                  { CountriesData: CountriesData.Countries },
                  () => {
                    let selectedCountry =
                      this.state.CountriesData &&
                      this.state.CountriesData.find(
                        (x) => x.ISOCode.toLowerCase() == data.toLowerCase()
                      )
                        ? this.state.CountriesData.find(
                            (x) => x.ISOCode.toLowerCase() == data.toLowerCase()
                          )
                        : null;
                    callback(selectedCountry.EmailRegister);
                  }
                );
              }
            }
          );
        }
      });
    } else {
      callback(false);
    }
  }

  AppLink() {
    return `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`;
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleBackPress = () => {
    if (this.state.modalPhotoOpen) {
      this.setState({ modalPhotoOpen: false }, () => {
        setTimeout(() => {
          if (this.state.scrollToImage) {
            this.refs.imagesList?.scrollToIndex({
              animated: true,
              index: this.state.scrollToImage,
            });
          }
        }, 1000);
      });
    } else {
      this.props.navigation.goBack();
    }
    return true;
  };

  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          Languages.CheckOffer +
          "\n" +
          (I18nManager.isRTL
            ? "https://autobeeb.com/ar/offer/"
            : "https://autobeeb.com/offer/") +
          this.state.Listing.Name.replace(/\ /g, "-") +
          "/" +
          this.state.Listing.ID +
          "/" +
          this.state.Listing.TypeID +
          "\n" +
          "\n" +
          Languages.DownloadAutobeeb +
          "\n" +
          this.AppLink(),
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  renderPaymentMethod(value) {
    switch (value) {
      case 1:
        return "";
      case 2:
        return "/ " + Languages.Installments;
      default:
        return "";
    }
  }

  renderFuelType(value) {
    try {
      if (value) {
        return this.fuelTypes.find((FT) => FT.ID == value).Name;
      } else {
        return Languages.SomethingWentWrong;
      }
    } catch {
      return "";
    }
  }
  renderGearBox(value) {
    try {
      if (value) {
        return this.gearBoxTrucks.find((GB) => GB.ID == value).Name;
      } else {
        return Languages.SomethingWentWrong;
      }
    } catch {
      return "";
    }
  }

  renderSection(Listing) {
    try {
      if (Listing.TypeID == 4 && Languages.langID != 2) {
        return Listing.SectionName.split(" ")[0];
      } else if (
        Listing.TypeID == 32 &&
        Listing.SectionName.split(" ").length > 2 &&
        Languages.langID != 2
      ) {
        return Listing.SectionName.split(" ")[0];
      } else if (
        Listing.TypeID == 32 &&
        Listing.SectionName.split(" ").length > 2 &&
        Languages.langID == 2
      ) {
        return Listing.SectionName.split(" ")[2];
      } else {
        return Listing.SectionName;
      }
    } catch {
      return Listing.SectionName;
    }
  }

  resendCode() {
    this.setState({ otp: "" });
    KS.ResendOTP({
      userID: this.props.navigation.getParam("User", 0).ID,
    }).then((data) => {
      if (data.Success == 1) {
        //     alert(JSON.stringify(data));
      } else {
        alert("something went wrong");
      }
      //
    });
  }

  openPhoto = (index) => {
    this.setState(
      {
        index: index,
      },
      () => {
        this.setState({
          modalPhotoOpen: true,
        });
      }
    );
  };
  closePhoto = () =>
    this.setState({
      modalPhotoOpen: false,
    });
  handleScroll(event) {
    let page = this.state.imageIndex;
    if (I18nManager.isRTL) {
      page =
        this.state.Listing?.Images?.length -
        1 -
        Math.round(
          event.nativeEvent.contentOffset.x / Dimensions.get("screen").width
        );

      this.setState({ imageIndex: Math.round(page) + 1 });
    } else {
      page = event.nativeEvent.contentOffset.x / Dimensions.get("screen").width;
      this.setState({ imageIndex: Math.round(page) + 1 });
    }
    //   alert(JSON.stringify(page))
    //console.log(Math.round(page));
    //  alert(JSON.stringify(page))
  }

  renderImages = () => {
    //  return (<Text>"yazz"</Text>)
    return (
      <View
        style={[
          {
            height: Dimensions.get("screen").width / 1.2,
            width: Dimensions.get("screen").width,
          },
          this.state.Listing &&
            this.state.Listing.Images &&
            this.state.Listing.Images.length == 0 && {
              alignItems: "center",
              justifyContent: "center",
            },
        ]}
      >
        {this.state.Listing &&
        this.state.Listing.Images &&
        this.state.Listing.Images.length > 0 ? (
          <FlatList
            ref="imagesList"
            style={{
              height: Dimensions.get("screen").width / 1.2,
              width: Dimensions.get("screen").width,
            }}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={this.handleScroll.bind(this)}
            initialNumToRender={16}
            data={this.state.Listing.Images}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{}}
                  onPress={() => {
                    this.openPhoto(index);
                  }}
                >
                  <FastImage
                    style={{
                      height: Dimensions.get("screen").width / 1.2,
                      width: Dimensions.get("screen").width,
                    }}
                    resizeMode="cover"
                    source={{
                      uri:
                        "https://autobeeb.com/" +
                        this.state.Listing.ImageBasePath +
                        item +
                        "_1024x853.jpg",
                    }}
                  />
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <Image
            style={{
              height: Dimensions.get("screen").width / 1.2,
              width: Dimensions.get("screen").width * 0.7,
              alignSelf: "center",
            }}
            resizeMode="contain"
            source={require("@images/placeholder.png")}
          />
        )}

        {
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              paddingTop: 2,
              backgroundColor: "rgba(255,255,255,0.8)",
              elevation: 3,
              position: "absolute",
              bottom: 10,
              left: I18nManager.isRTL ? 10 : undefined,
              right: I18nManager.isRTL ? undefined : 10,
            }}
            onPress={() => {
              if (this.props.userData) {
                KS.WatchlistAdd({
                  listingID: this.state.Listing.ID,
                  userid: this.props.userData.ID,
                  type: 1,
                }).then((data) => {
                  if (data && data.Success) {
                    this.setState({ Favorite: data.Favorite });
                  }
                });
              } else {
                this.props.navigation.navigate("LoginScreen");
              }
            }}
          >
            <IconFa
              name={this.state.Favorite ? "heart" : "heart-o"}
              size={25}
              color={this.state.Favorite ? Color.primary : "#252525"}
            />
          </TouchableOpacity>
        }
        {this.state.Listing.Images && this.state.Listing.Images.length > 1 && (
          <Text
            style={{
              textAlign: "center",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              position: "absolute",
              zIndex: 100,
              top: 25,
              //    right: 0,
              alignSelf: "center",
              paddingHorizontal: 5,
              fontSize: 19,
              borderRadius: 8,
            }}
          >{`${this.state.imageIndex} / ${this.state.Listing.Images.length}`}</Text>
        )}
      </View>
    );
  };

  checkOTP() {
    const _this = this;
    const otp = this.state.otp;
    {
      KS.UserVerifyOTP({
        otpcode: otp,
        userid: this.props.navigation.getParam(
          "UserID",
          this.props.userData && this.props.userData.ID
        ),
        username:
          this.props.navigation.getParam("isEmailRegister", false) ||
          (this.props.userData &&
            this.props.userData.EmailRegister &&
            this.props.userData.EmailConfirmed == false)
            ? this.props.navigation.getParam(
                "Email",
                this.props.userData?.Email
              )
            : this.props.navigation.getParam(
                "Phone",
                this.props.userData && this.props.userData.Phone
              ),
      }).then((data) => {
        if (data.OTPVerified == true || data.EmailConfirmed == true) {
          //    this.setPushNotification(this.props.navigation.getParam("id", 0));

          if (this.state.pendingDelete)
            KS.TransferListing({
              userid: this.props.navigation.getParam(
                "UserID",
                this.props.userData && this.props.userData.ID
              ),
              listingID: this.state.Listing.ID,
            });

          toast(Languages.PublishSuccess, 3500);

          if (data.User) {
            _this.props.storeUserData(data.User, () => {
              this.refs.OTPModal.close();
              //     _this.props.navigation.goBack();
            });
          }
          //
        } else {
          toast(Languages.WrongOTP);

          setTimeout(() => {
            this.setState({ otp: "" });
          }, 1800);
        }
      });
    }
  }
  resendCode() {
    this.setState({ otp: "" });
    KS.ResendOTP({
      userID: this.props.navigation.getParam(
        "UserID",
        this.props.userData && this.props.userData.ID
      ),
    }).then((data) => {
      if (data.Success == 1) {
        //    alert(JSON.stringify(data));
      } else {
        alert("something went wrong");
      }
      //
    });
  }

  renderOkCancelButton(onCancelPress, onOkPress) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderTopColor: "#ccc",
          borderTopWidth: 1,
          marginTop: 5,
          //  padding: 8,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,

          justifyContent: "center",
          //    backgroundColor: "#ff0"
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#fff",
          }}
          onPress={() => {
            onCancelPress();
          }}
        >
          <Text
            style={{
              color: Color.secondary,
              textAlign: "center",
              paddingVertical: 14,
              fontFamily: "Cairo-Bold",
              fontSize: 15,
            }}
          >
            {Languages.CANCEL}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: Color.secondary,
            borderRadius: 5,
          }}
          onPress={() => {
            onOkPress();
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              paddingVertical: 10,
              fontSize: 15,
            }}
          >
            {Languages.OK}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { Listing } = this.state;

    this.gearBoxTrucks = [
      {
        ID: 1,
        Name: Languages.Automatic,
      },
      {
        ID: 2,
        Name: Languages.Manual,
      },
      {
        ID: 4,
        Name: Languages.SemiAutomatic,
      },
    ];

    this.fuelTypes = [
      {
        ID: 1,
        Name: Languages.Benzin,
      },
      {
        ID: 2,
        Name: Languages.Diesel,
      },
      {
        ID: 4,
        Name: Languages.Electric,
      },
      {
        ID: 8,
        Name: Languages.Hybrid,
      },
      {
        ID: 16,
        Name: Languages.Other,
      },
    ];

    this.offerCondition = [
      {
        ID: 1,
        Name: Languages.New,
      },
      {
        ID: 2,
        Name: Languages.Used,
      },
    ];

    this.sellTypes = [
      {
        ID: 1,
        Name: Languages.ForSale,
        img: require("@images/SellTypes/WhiteSale.png"),

        backgroundColor: "#0F93DD",
      },
      {
        ID: 2,
        Name: Languages.ForRent,
        img: require("@images/SellTypes/WhiteRent.png"),

        backgroundColor: "#F68D00",
      },
      {
        ID: 4,
        Name: Languages.Wanted,
        img: require("@images/SellTypes/WhiteWanted.png"),

        backgroundColor: "#D31018",
      },
    ];
    this.rentPeriod = [
      {
        ID: 1,
        Name: Languages.Daily,
      },
      {
        ID: 2,
        Name: Languages.Weekly,
      },
      {
        ID: 4,
        Name: Languages.Monthly,
      },
      {
        ID: 8,
        Name: Languages.Yearly,
      },
      {
        ID: 15,
        Name: Languages.AnyPeriod,
      },
    ];

    const notOtpConfirmed =
      this.props.userData &&
      this.props.userData.OTPConfirmed == false &&
      this.props.userData.ID == this.state.Owner?.ID &&
      !this.props.userData.EmailRegister;

    const notEmailConfirmed =
      this.props.userData &&
      this.props.userData.EmailConfirmed == false &&
      this.props.userData.ID == this.state.Owner?.ID &&
      this.props.userData.EmailRegister;
    if (this.state.isLoading && !this.state.Listing.Name) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", backgroundColor: "#fff" }}
        >
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          ></StatusBar>
          <LogoSpinner fullStretch={true} />
        </View>
      );
    }

    if (!this.state.isFocused || this.state.modalPhotoOpen) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", backgroundColor: "#fff" }}
        >
          <NavigationEvents
            onWillFocus={() => {
              this.setState({ isFocused: this.props.navigation.isFocused() });
            }}
            onDidBlur={() =>
              this.setState({ isFocused: this.props.navigation.isFocused() })
            }
          />

          <LinearGradient
            colors={[
              "rgba(0,0,0,0.8)",
              "rgba(0,0,0,0.5)",
              "rgba(0,0,0,0.3)",
              "rgba(0,0,0,0.1)",
            ]}
            style={{
              position: "absolute",

              top: 0,
              zIndex: 200,
              //   elevation:10,
              minHeight: 50,
              paddingTop: isIphoneX() ? 20 : 10,
              width: Dimensions.get("screen").width,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingTop: 20,
                justifyContent: "space-between",
              }}
            >
              <HeaderBackButton
                labelVisible={false}
                tintColor="#fff"
                style={{}}
                onPress={() => {
                  if (this.state.modalPhotoOpen) {
                    this.setState({ modalPhotoOpen: false }, () => {
                      setTimeout(() => {
                        if (this.state.scrollToImage) {
                          this.refs.imagesList?.scrollToIndex({
                            animated: true,
                            index: this.state.scrollToImage,
                          });
                        }
                      }, 1000);
                    });
                  } else {
                    this.props.navigation.goBack();
                  }
                }}
              />
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  this.onShare();
                }}
              >
                <IconEV name="share-google" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <Modal //the full view
            ref="modalPhoto"
            isOpen={this.state.modalPhotoOpen}
            swipeToClose={false}
            animationDuration={200}
            style={styles.modalBoxWrap}
            useNativeDriver={true}
          >
            <ImageViewer
              renderIndicator={(data) => {
                if (this.state.Listing?.Images?.length)
                  return (
                    <Text
                      style={{
                        textAlign: "center",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        position: "absolute",
                        zIndex: 100,
                        top: 25,
                        //    right: 0,
                        alignSelf: "center",
                        paddingHorizontal: 5,
                        fontSize: 19,
                        borderRadius: 8,
                      }}
                    >{`${this.state.imageIndex} / ${this.state.Listing.Images.length}`}</Text>
                  );
              }}
              backgroundColor="#D2E5EC"
              onChange={(index) => {
                // console.log(index);
                this.setState({
                  imageIndex: index + 1,
                  scrollToImage: index,
                });
              }}
              pageAnimateTime={100}
              enablePreload
              // onClick={() => {
              //   this.openPhoto(this.state.index);
              // }}
              style={{ zIndex: 50 }}
              index={this.state.index}
              //   saveToLocalByLongPress={Platform.OS == "android"}
              // onSave={url => {
              //   SaveImage.downloadImage(url, "soogah");
              // }}
              saveToLocalByLongPress={false}
              enableImageZoom={true}
              enableSwipeDown
              onSwipeDown={() => {
                this.setState(
                  {
                    modalPhotoOpen: false,
                  },
                  () => {
                    setTimeout(() => {
                      if (this.state.scrollToImage) {
                        this.refs.imagesList?.scrollToIndex({
                          animated: true,
                          index: this.state.scrollToImage,
                        });
                      }
                    }, 1000);
                  }
                );
              }}
              imageUrls={
                this.state.Listing &&
                this.state.Listing.Images &&
                this.state.Listing.Images.map((image) => ({
                  url:
                    "https://autobeeb.com/" +
                    this.state.Listing.ImageBasePath +
                    image +
                    "_635x811.jpg",
                  width: Dimensions.get("screen").width,
                  //   height: Dimensions.get("screen").width / 1.77
                }))
              }
              renderImage={(props) => <Image {...props} resizeMode="cover" />}
            />
          </Modal>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {this.state.firstLoad&&(<Modal
        ref="WarningPopup"
        isOpen={this.state.firstLoad}
      
        style={[
          styles.modelModal,
        ]}
        position="center"
        onClosed={() => {
          this.setState({firstLoad:false});
        }}
        backButtonClose
        entry="bottom"
        swipeToClose={true}
        backdropPressToClose
        coverScreen={Platform.OS == "android"}
        backdropOpacity={0.9}
      >
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
          <IconFE name="alert-triangle" style={{fontSize:90, color:'#ffcc00'}}></IconFE>
          <Text style={{fontSize:20, color:'#ffcc00', textAlign:'center'}}>{Languages.WarningMessage}</Text>
          <TouchableOpacity onPress={()=>{this.setState({firstLoad:false});}}><Text style={{paddingHorizontal:25, paddingVertical:5, borderRadius:10,marginTop:20,fontSize:20, color:'#ffffff', backgroundColor:Color.secondary, textAlign:'center'}}>{Languages.OK}</Text></TouchableOpacity>
        </View>
      </Modal>)}
        {this.state.isLoading && <LogoSpinner fullStretch={true} />}
        <NavigationEvents
          //  onWillFocus={payload => console.log('will focus', payload)}
          onDidFocus={() => {
            // alert(JSON.stringify(payload))
            this.setState({ isFocused: this.props.navigation.isFocused() });
          }}
          onDidBlur={() =>
            this.setState({ isFocused: this.props.navigation.isFocused() })
          }
          //   onDidBlur={payload => console.log('did blur', payload)}
        />
        <OTPModal
          ref="OTPModal"
          isOpen={this.state.OtpOpen}
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterItNow}
          pendingDelete={this.state.pendingDelete}
          onOpened={() => {
            this.setState({ footerShown: false });
          }}
          Username={
            this.props.navigation.getParam("isEmailRegister", false) ||
            (this.props.userData &&
              this.props.userData.EmailRegister &&
              this.props.userData.EmailConfirmed == false)
              ? this.props.navigation.getParam(
                  "Email",
                  this.props.userData?.Email
                )
              : this.props.navigation.getParam(
                  "Phone",
                  this.props.userData && this.props.userData.Phone
                )
          }
          otp={this.state.otp}
          onChange={(otp) => {
            this.setState({ otp });
          }}
          checkOTP={() => {
            this.checkOTP();
          }}
          toast={(msg) => {
            toast(msg);
          }}
          onClosed={() => {
            this.setState({ footerShown: true });
          }}
          resendCode={() => {
            this.resendCode();
          }}
        />
        <Modal
          ref="FeaturesModal"
          isOpen={this.state.isFeaturesModalOpen}
          //    onLayout={e => this.props.onLayout(e)}
          style={[styles.modelModal]}
          position="center"
          onClosed={() => {
            if (this.props.navigation.getParam("isNewUser", false) == true) {
              this.setState({
                OtpOpen: true,
              });
            }
            if (
              this.props.navigation.getParam("pendingDelete", false) == true
            ) {
              this.setState({ pendingDelete: true, OtpOpen: true });
            }
          }}
          backButtonClose={true}
          entry="bottom"
          swipeToClose={false}
          // backdropPressToClose
          coverScreen={true}
          backdropOpacity={0.5}
        >
          <View
            style={[
              styles.modelContainer,
              {
                backgroundColor: "#fff",
                maxHeight: Dimensions.get("screen").height * 0.8,
              },
            ]}
          >
            <ScrollView nestedScrollEnabled={true}>
              {this.state.FeaturesLoaded ? (
                <View style={{}}>
                  <Text
                    style={{ padding: 5, textAlign: "center", color: "#000" }}
                  >
                    {Languages.SelectFeatureSet}
                  </Text>
                  <View style={{}}>
                    <FlatList
                      nestedScrollEnabled
                      keyExtractor={(item, index) => index.toString()}
                      data={this.state.FeaturesSwitch || []}
                      style={{
                        maxHeight: Dimensions.get("screen").height * 0.75,
                      }}
                      extraData={this.state}
                      renderItem={({ item, index }) => {
                        return (
                          <TouchableOpacity
                            style={[
                              {
                                borderBottomWidth: 1,
                                borderBottomColor: "#ddd",
                                flexDirection: "row",
                                justifyContent: "space-around",
                                alignItems: "center",
                                backgroundColor:
                                  this.state.selectedFeatures &&
                                  this.state.selectedFeatures.filter(
                                    (model) => model.ID == item.ID
                                  ).length > 0
                                    ? Color.primary
                                    : "#fff",
                              },
                            ]}
                            onPress={() => {
                              if (
                                this.state.selectedFeatures &&
                                this.state.selectedFeatures.filter(
                                  (model) => model.ID == item.ID
                                ).length > 0 //model is already selected
                              ) {
                                let models = this.state.selectedFeatures.filter(
                                  (model) => model.ID != item.ID //remove model
                                );

                                this.setState({
                                  selectedFeatures: models,
                                });
                              } else {
                                let models = this.state.selectedFeatures;

                                models.push(item);
                                this.setState({
                                  selectedFeatures: models,
                                });
                              }
                            }}
                          >
                            <Image
                              style={{
                                width: 50,
                                height: 50,
                              }}
                              tintColor={
                                this.state.selectedFeatures &&
                                this.state.selectedFeatures.filter(
                                  (model) => model.ID == item.ID
                                ).length > 0
                                  ? "#FFF"
                                  : Color.secondary
                              }
                              resizeMode={"contain"}
                              source={{
                                uri:
                                  "https://autobeeb.com/" +
                                  item.FullImagePath +
                                  "_300x150.png",
                              }}
                            />

                            <Text
                              style={{
                                color:
                                  this.state.selectedFeatures &&
                                  this.state.selectedFeatures.filter(
                                    (model) => model.ID == item.ID
                                  ).length > 0
                                    ? "#FFF"
                                    : Color.secondary,
                                fontSize: 15,
                                textAlign: "left",
                                flex: 1,
                              }}
                            >
                              {item.Name}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />

                    <SectionList
                      sections={this.state.FeaturesDropDown.map((item) => {
                        return { title: item.Name, data: item.Options };
                      })}
                      keyExtractor={(item, index) => item + index}
                      style={
                        {
                          //marginHorizontal: 10
                        }
                      }
                      renderItem={({ item }) => {
                        return (
                          <TouchableOpacity
                            style={{
                              marginBottom: 3,
                            }}
                            onPress={() => {
                              let SingleFeature = this.state.FeaturesDropDown.find(
                                (x) => x.ID == item.FeatureID
                              );
                              SingleFeature.Value = item.ID; // this set the state of the item

                              let selectedDropdownFeatures = this.state
                                .selectedDropdownFeatures;
                              if (
                                selectedDropdownFeatures.filter(
                                  (x) => x.ID == item.FeatureID
                                ).length == 0
                              ) {
                                //already selected value for this
                                selectedDropdownFeatures = [
                                  ...this.state.selectedDropdownFeatures,
                                  SingleFeature,
                                ];
                              }

                              var mapped = selectedDropdownFeatures.map(
                                (item) => ({
                                  [item.ID]: item.Value,
                                })
                              );
                              let newObj = Object.assign({}, ...mapped);

                              this.setState({
                                selectedDropdownFeatures,
                                FormattedDropDownFeatures: newObj,
                              });
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: "left",
                                marginLeft: 10,
                                color:
                                  this.state.selectedDropdownFeatures.filter(
                                    (x) => x.Value == item.ID
                                  ).length > 0
                                    ? Color.primary
                                    : "black",
                              }}
                            >
                              {item.Name}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                      renderSectionHeader={({ section: { title } }) => (
                        <Text
                          style={{
                            color: Color.secondary,
                            borderBottomWidth: 1,
                            textAlign: "left",

                            fontSize: 18,
                            marginTop: 15,
                            borderBottomColor: "#ddd",
                            fontFamily: "Cairo-Bold",
                          }}
                        >
                          {title}
                        </Text>
                      )}
                    />
                  </View>
                </View>
              ) : (
                <Text style={{}}>{"loading"}</Text>
              )}
            </ScrollView>
            {this.renderOkCancelButton(
              () => {
                this.refs.FeaturesModal.close();
              },
              () => {
                KS.FeatureSetAdd({
                  listingID: this.state.Listing.ID,
                  featureSet: {
                    FeaturesOn: this.state.selectedFeatures
                      ? this.state.selectedFeatures.map((feature) => feature.ID)
                      : [],
                    FeaturesDropdown:
                      this.state.FormattedDropDownFeatures || {},
                  },
                }).then((data) => {
                  if (data && data.Success == 1) {
                    KS.ListingGet({
                      // to refresh features
                      userid:
                        (this.props.userData && this.props.userData.ID) || "",
                      langid: Languages.langID,
                      pID: this.props.navigation.getParam("item", 0).ID,
                      typeID: this.props.navigation.getParam("item", 0).TypeID,
                      ignoreDelete:
                        this.props.navigation.getParam("item", 0).TypeID == 32
                          ? false
                          : true,
                    }).then((data) => {
                      if (data.Success == 1) {
                        this.setState({
                          Listing: data.Listing,
                          Features: data.ItemFeatures,
                        });
                      } else {
                        toast(Languages.SomethingWentWrong);
                      }
                    });
                    this.refs.FeaturesModal.close();
                  }
                });
              }
            )}
          </View>
        </Modal>

        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        ></StatusBar>

        <LinearGradient
          colors={[
            "rgba(0,0,0,0.8)",
            "rgba(0,0,0,0.5)",
            "rgba(0,0,0,0.3)",
            "rgba(0,0,0,0.1)",
          ]}
          style={{
            position: "absolute",

            top: 0,
            zIndex: 200,
            //   elevation:10,
            minHeight: 50,
            paddingTop: isIphoneX() ? 20 : 10,
            width: Dimensions.get("screen").width,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 20,
              justifyContent: "space-between",
            }}
          >
            <HeaderBackButton
              labelVisible={false}
              tintColor="#fff"
              style={{}}
              onPress={() => {
                if (this.state.modalPhotoOpen) {
                  this.setState({ modalPhotoOpen: false });
                } else {
                  this.props.navigation.goBack();
                }
              }}
            />
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => {
                this.onShare();
              }}
            >
              <IconEV name="share-google" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {!this.state.modalPhotoOpen && this.state.footerShown && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: Dimensions.get("screen").width,
              zIndex: 2,
              backgroundColor: "rgba(28,125,192,0.9)",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {
              <TouchableOpacity
                style={styles.bottomBox}
                onPress={() => {
                  if (this.state.Owner && this.state.Owner.IsDealer) {
                    this.props.navigation.navigate("DealerProfileScreen", {
                      userid: this.state.Owner?.ID,
                    });
                  } else {
                    this.props.navigation.navigate("UserProfileScreen", {
                      userid: this.state.Owner?.ID,
                    });
                  }
                }}
              >
                <IconFa
                  name="user-circle-o"
                  size={25}
                  color="white"
                  style={{ marginRight: 5 }}
                />
                <Text style={{ color: "white", fontSize: 18 }}>
                  {Languages.Profile}
                </Text>
              </TouchableOpacity>
            }
            {!(
              this.state.Dealer &&
              this.state.Dealer.HideMobile &&
              this.state.Dealer.User.Phone == Listing.Phone
            ) && ( // if the dealer hide his phone and the phone is the same as it, hide it too
              <TouchableOpacity
                style={styles.bottomBox}
                onPress={() => {
                  Linking.openURL(`tel:${Listing.Phone}`);
                }}
              >
                <IconFE
                  name="phone-call"
                  size={25}
                  color="white"
                  style={{ marginRight: 5 }}
                />
                <Text style={{ color: "white", fontSize: 18 }}>
                  {Languages.Call}
                </Text>
              </TouchableOpacity>
            )}
            {(this.props.userData == null ||
              (this.props.userData &&
                this.props.userData.ID != this.state.Owner?.ID)) && (
              <TouchableOpacity
                style={[
                  styles.bottomBox,
                  { backgroundColor: "#2B9531", borderRightWidth: 0 },
                ]}
                onPress={() => {
                  if (this.props.userData) {
                    delete Listing.Views;
                    KS.AddEntitySession({
                      userID: this.props.userData.ID,
                      targetID: this.state.Owner?.ID,
                      relatedEntity: JSON.stringify(Listing),
                    }).then((data) => {
                      this.props.navigation.navigate("ChatScreen", {
                        targetID: this.state.Owner?.ID,
                        ownerName: this.state.Owner.Name,
                        description: Listing.Name,
                        entityID: Listing.ID,
                        sessionID: data.SessionID,
                      });
                    });
                  } else {
                    this.props.navigation.navigate("LoginScreen");
                  }
                }}
              >
                <IconIon
                  name="md-chatbubbles"
                  size={25}
                  color="white"
                  style={{ marginRight: 5 }}
                />
                <Text style={{ color: "white", fontSize: 18 }}>
                  {Languages.Chat}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {Listing && (
          <ScrollView
            //  scrollEnabled={true}
            style={{ flex: 1 }}
            contentContainerStyle={{
              backgroundColor: "#F3F3F3",
              paddingBottom: 60,
            }}
          >
            {this.renderImages()}
            <View
              style={{
                paddingHorizontal: 10,

                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderColor: "#eee",
                backgroundColor: "#fff",
              }}
            >
              {(notOtpConfirmed || notEmailConfirmed) && (
                <TouchableOpacity
                  style={{}}
                  onPress={() => {
                    this.refs.OTPModal.open();
                  }}
                >
                  <Text style={{ color: "#000", textAlign: "left" }}>
                    {Languages.UnpublishedOffer}
                    <Text style={{ color: Color.primary, textAlign: "left" }}>
                      {Languages.VerifyNow}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {Listing.Name && (
                  <Text
                    style={{
                      color: Color.secondary,
                      fontSize: 20,
                      textAlign: "left",
                    }}
                  >
                    {Listing.Name.replace(/\n/g, " ")}
                  </Text>
                )}

                {false && (
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      this.props.navigation.navigate("HomeScreen");
                    }}
                  >
                    <Image
                      style={{ width: 30, height: 30 }}
                      resizeMode={"contain"}
                      source={require("@images/parkList.png")}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  marginTop: 5,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <IconFa name="map-marker" size={16} color="gray" />

                <Text
                  style={{ color: "gray", marginHorizontal: 10, fontSize: 16 }}
                >
                  {`${Listing.CountryName} / ${
                    Listing?.CityName ? Listing.CityName : ""
                  }`}
                </Text>

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                  onPress={() => {
                    if (this.props.userData) {
                      this.refs.reportPopup.open();
                    } else {
                      Alert.alert("", Languages.YouNeedToLoginFirst, [
                        {
                          text: Languages.Ok,
                          onPress: () =>
                            this.props.navigation.navigate("LoginScreen"),
                        },
                        { text: Languages.Cancel },
                      ]);
                    }
                  }}
                  style={{
                    backgroundColor: "#eee",
                    height: 40,
                    width: 40,
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "flex-end",
                  }}
                >
                  <Octicons name="alert" size={20} color="#e44e44" />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  marginTop: 5,

                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {Listing && Listing.SellType != 4 && (
                  <Text
                    style={{
                      color: Color.primary,
                      fontSize: 18,
                      fontFamily: "Cairo-Bold",
                      fontSize: 16,
                      marginRight: 15,
                    }}
                  >
                    {Listing.FormatedPrice
                      ? Listing.FormatedPrice
                      : Languages.CallForPrice}
                  </Text>
                )}
                {!!Listing.PaymentMethod && (
                  <Text
                    style={{
                      color: "green",
                      fontFamily: "Cairo-Bold",
                      fontSize: 18,
                      fontSize: 16,
                    }}
                  >
                    {this.renderPaymentMethod(Listing.PaymentMethod)}
                  </Text>
                )}
              </View>
            </View>
            {(Listing.TypeID == 1 ||
              Listing.TypeID == 2 ||
              Listing.TypeID == 4 ||
              Listing.TypeID == 8) &&
              Listing.SellType == 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                    backgroundColor: "#fff",
                  }}
                >
                  {!!Listing.Year && (
                    <View style={styles.box}>
                      <Image
                        style={{
                          width: 28,
                          height: 28,
                        }}
                        resizeMode="contain"
                        source={require("@images/year.png")}
                      />
                      <Text
                        style={{
                          color: "black",
                          fontSize: 16,

                          textAlign: "center",
                        }}
                      >
                        {Listing.Year}
                      </Text>
                    </View>
                  )}
                  {!!Listing.FuelType && (
                    <View style={styles.box}>
                      <Image
                        style={{
                          width: 28,
                          height: 28,
                        }}
                        resizeMode="contain"
                        source={require("@images/fuelType.png")}
                      />
                      <Text
                        style={{
                          color: "black",
                          fontSize: 16,

                          textAlign: "center",
                        }}
                      >
                        {this.renderFuelType(Listing.FuelType)}
                      </Text>
                    </View>
                  )}
                  {!!Listing.Consumption && (
                    <View style={styles.box}>
                      <Image
                        style={{
                          width: 28,
                          height: 28,
                        }}
                        resizeMode="contain"
                        source={require("@images/km.png")}
                      />
                      <Text
                        style={{
                          color: "black",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        {Listing.TypeID == 4
                          ? Listing.Consumption + Languages.Hrs
                          : Listing.Consumption + Languages.KM}
                      </Text>
                    </View>
                  )}

                  {!!Listing.GearBox && (
                    <View style={[styles.box, { borderRightWidth: 0 }]}>
                      <Image
                        style={{
                          width: 28,
                          height: 28,
                        }}
                        resizeMode="contain"
                        source={require("@images/gearbox.png")}
                      />
                      <Text
                        style={{
                          color: "black",
                          fontSize: 16,

                          textAlign: "center",
                        }}
                      >
                        {this.renderGearBox(Listing.GearBox)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

            {
              <View
                style={{
                  marginVertical: 5,
                  alignItems: "center",
                  minHeight: 10,
                  //   paddingVertical: 5,
                  //backgroundColor: "white",
                  justifyContent: "center",
                }}
              >
                <BannerAd
                  unitId={Platform.select({
                    android: "ca-app-pub-2004329455313921/8851160063",
                    ios: "ca-app-pub-2004329455313921/8383878907",
                  })}
                  size={BannerAdSize.BANNER}
                />
              </View>
            }

            <Text style={[styles.blackHeader, { paddingHorizontal: 10 }]}>
              {Languages.Information}
            </Text>
            <View
              style={[
                styles.boxContainer,

                { flexDirection: "row", flexWrap: "wrap" },
              ]}
            >
              {!!Listing.SellType && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.SellType}</Text>

                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text style={[styles.sectionValue, { marginRight: 4 }]}>
                      {Listing.TypeName + " "}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: this.sellTypes.find(
                          (val) => val.ID == Listing.SellType
                        ).backgroundColor,
                      }}
                    >
                      {
                        this.sellTypes.find((val) => val.ID == Listing.SellType)
                          .Name
                      }
                    </Text>
                  </View>
                </View>
              )}

              {!!Listing.Section && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Section}</Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {this.renderSection(Listing)}
                  </Text>
                </View>
              )}

              {!!Listing.PartNumber && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>
                    {Languages.PartNumber}
                  </Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {Listing.PartNumber}
                  </Text>
                </View>
              )}
              {!!Listing.CategoryName && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Category}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text numberOfLines={1} style={styles.sectionValue}>
                      {Listing.CategoryName}
                    </Text>
                    <Image
                      style={{ width: 40, height: 40 }}
                      source={{
                        uri:
                          "https://autobeeb.com/" +
                          "content/newlistingcategories/" +
                          Listing.TypeID +
                          "" +
                          Listing.CategoryID +
                          "/" +
                          Listing.CategoryID +
                          "_50x50.jpg",
                      }}
                    />
                  </View>
                </View>
              )}
              {
                //subcategory
              }
              {!!Listing.MakeName && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Make}</Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {Listing.MakeName}
                  </Text>
                </View>
              )}
              {!!Listing.ModelName && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Model}</Text>
                  <Text numberOfLines={1} style={styles.sectionValue}>
                    {Listing.ModelName}
                  </Text>
                </View>
              )}
              {!!Listing.Condition && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Status}</Text>
                  <Text style={styles.sectionValue}>
                    {
                      this.offerCondition.find(
                        (val) => val.ID == Listing.Condition
                      ).Name
                    }
                  </Text>
                </View>
              )}

              {!!Listing.Year && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Year}</Text>
                  <Text style={styles.sectionValue}>{Listing.Year}</Text>
                </View>
              )}

              {!!Listing.RentPeriod && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>
                    {Languages.RentPeriod}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {
                      this.rentPeriod.find(
                        (val) => val.ID == Listing.RentPeriod
                      ).Name
                    }
                  </Text>
                </View>
              )}

              {!!Listing.GearBox && (
                <View style={styles.sectionHalf}>
                  <Text numberOfLines={1} style={styles.sectionTitle}>
                    {Languages.GearBox}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {this.renderGearBox(Listing.GearBox)}
                  </Text>
                </View>
              )}

              {!!Listing.FuelType && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.FuelType}</Text>
                  <Text style={styles.sectionValue}>
                    {this.renderFuelType(Listing.FuelType)}
                  </Text>
                </View>
              )}
              {!!Listing.CityName &&
                Listing.CityName != "null" &&
                Listing.CityName != null && (
                  <View style={styles.sectionHalf}>
                    <Text style={styles.sectionTitle}>{Languages.City}</Text>
                    <Text numberOfLines={1} style={styles.sectionValue}>
                      {Listing.CityName}
                    </Text>
                  </View>
                )}

              {!!Listing.Consumption && (
                <View style={styles.sectionHalf}>
                  <Text numberOfLines={1} style={styles.sectionTitle}>
                    {Listing.TypeID == 4
                      ? Languages.WorkingHours
                      : Languages.Mileage}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {Listing.TypeID == 4
                      ? Listing.Consumption + Languages.Hrs
                      : Listing.Consumption}
                  </Text>
                </View>
              )}

              {!!Listing.ColorLabel && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.Color}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      //    justifyContent: "space-between"
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        elevation: 2,
                        borderRadius: 10,
                        backgroundColor: Listing.Color,
                      }}
                    />
                    <Text style={styles.sectionValue}>
                      {" " + Listing.ColorLabel}
                    </Text>
                  </View>
                </View>
              )}
              {!!Listing.ID && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>{Languages.OfferID}</Text>
                  <Text style={styles.sectionValue}>{Listing.ID}</Text>
                </View>
              )}
              {!!Listing.DateAdded && (
                <View style={styles.sectionHalf}>
                  <Text style={styles.sectionTitle}>
                    {Languages.PublishedDate}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {Moment(Listing.DateAdded).format("YYYY-MM-DD")}
                  </Text>
                </View>
              )}
            </View>
            {//!!Listing.Extras && (
            this.state.Features && this.state.Features.length > 0 && (
              <View style={{}}>
                <Text
                  style={[
                    styles.blackHeader,
                    {
                      marginTop: 10,
                      paddingHorizontal: 10,
                    },
                  ]}
                >
                  {Languages.Features}
                </Text>

                {this.state.Features && (
                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={[styles.boxContainer]}
                    numColumns={2}
                    data={this.state.Features.filter((x) => x.Type == 1)}
                    renderItem={({ item, index }) => {
                      if (item.Type == 1)
                        return (
                          <View
                            style={[
                              styles.featuresHalf,
                              Math.ceil((index + 1) / 2) % 2 == 0 && {
                                backgroundColor: "#FBFBFB",
                              },
                            ]}
                          >
                            <Image
                              style={{
                                width: 25,
                                height: 25,
                                marginRight: 5,
                              }}
                              resizeMode={"contain"}
                              tintColor={"#bbb"}
                              source={{
                                uri:
                                  "https://autobeeb.com/" +
                                  item.FullImagePath +
                                  ".png",
                              }}
                            />
                            <Text numberOfLines={1} style={styles.featuresText}>
                              {item.Name}
                            </Text>
                          </View>
                        );
                    }}
                  />
                )}
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={[
                    styles.boxContainer,
                    { borderTopWidth: 0 },
                  ]}
                  data={this.state.Features.filter((x) => x.Type == 2)}
                  renderItem={({ item, index }) => {
                    return (
                      <View
                        style={[
                          styles.featuresHalf,
                          index % 2 == 0 && {
                            backgroundColor: "#FBFBFB",
                          },
                        ]}
                      >
                        {false && (
                          <Image
                            style={{ width: 25, height: 25, marginRight: 5 }}
                            resizeMode={"contain"}
                            tintColor={"#bbb"}
                            source={{
                              uri:
                                "https://autobeeb.com/" +
                                item.FullImagePath +
                                ".png",
                            }}
                          />
                        )}

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text numberOfLines={1} style={[styles.featuresText]}>
                            {item.Name}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[styles.featuresText, { marginLeft: 5 }]}
                          >
                            {item.OptionName}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
            )}
            {!!Listing.Description && (
              <View>
                <Text
                  style={[
                    styles.blackHeader,
                    { paddingHorizontal: 10, marginTop: 10 },
                  ]}
                >
                  {Languages.Description}
                </Text>

                <View style={[styles.boxContainer, { padding: 15 }]}>
                  <Text
                    style={{ color: "gray", fontSize: 18, textAlign: "left" }}
                    numberOfLines={this.state.DescriptionHidden ? 10 : 100}
                  >
                    {Listing.Description}
                  </Text>
                </View>
                {Listing.Description && Listing.Description.length > 100 && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "white",
                      borderTopWidth: 1,
                      borderTopColor: "#eee",
                      paddingVertical: 10,
                    }}
                    onPress={() => {
                      this.setState({
                        DescriptionHidden: !this.state.DescriptionHidden,
                      });
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: Color.primary }}>
                        {this.state.DescriptionHidden
                          ? Languages.ShowMore
                          : Languages.ShowLess}
                      </Text>
                      <IconEn
                        name={
                          this.state.DescriptionHidden
                            ? "chevron-down"
                            : "chevron-up"
                        }
                        size={20}
                        color={Color.primary}
                        style={{ marginLeft: 7 }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text
              style={[
                styles.blackHeader,
                {
                  paddingHorizontal: 10,
                  marginTop: 10,
                },
              ]}
            >
              {Languages.ShareOffer}
            </Text>

            <TouchableOpacity
              activeOpacity={0.6}
              style={[
                styles.boxContainer,
                { padding: 15, flexDirection: "row" },
              ]}
              onPress={() => {
                this.onShare();
              }}
            >
              <View style={styles.socialBox}>
                <IconEn name={"facebook"} size={28} color={"#3b5998"} />
              </View>
              <View style={styles.socialBox}>
                <IconFa name={"whatsapp"} size={28} color={"#25d366"} />
              </View>

              <View style={styles.socialBox}>
                <IconFa name={"twitter-square"} size={28} color={"#1da1f2"} />
              </View>

              <View style={styles.socialBox}>
                <IconSLI
                  name={"envelope-letter"}
                  size={28}
                  color={Color.primary}
                />
              </View>

              <View style={styles.socialBox}>
                <IconMa name={"sms"} size={28} color={"#34b7f1"} />
              </View>
            </TouchableOpacity>

            {
              //------------------------------Begin Advices
            }

            <Modal
              ref="reportPopup"
              backButtonClose
              swipeToClose={false}
              animationDuration={350}
              style={{
                backgroundColor: "#fff",
                width: "100%",
                flex: 1,
              }}
              useNativeDriver={true}
              coverScreen
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : null}
                style={{
                  width: "100%",
                  flex: 1,
                  paddingTop:
                    Platform.OS === "android"
                      ? StatusBar.currentHeight + 10
                      : isIphoneX()
                      ? 40
                      : 25,
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 50 }}
                  style={{ width: "100%", flex: 1 }}
                >
                  <IconMa
                    name="close"
                    size={32}
                    color="#000"
                    style={{
                      padding: 7,
                      marginHorizontal: 10,
                      alignSelf: I18nManager.isRTL ? "flex-start" : "flex-end",
                    }}
                    onPress={() => this.refs.reportPopup.close()}
                  />

                  <Text
                    style={{
                      alignSelf: "center",
                      fontSize: 18,
                      color: "#000",
                      marginBottom: 20,
                      textAlign: "center",
                    }}
                  >
                    {Languages.WhyReportThisListing}
                  </Text>

                  <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      {reportOptions.map((d, i) => (
                        <TouchableOpacity
                          key={i}
                          activeOpacity={0.5}
                          style={{
                            alignItems: "center",
                            marginVertical: 10,
                            width: Dimensions.get("screen").width / 3.8,
                            height: Dimensions.get("screen").width / 3.8,
                            borderWidth: 2,
                            borderRadius: 5,
                            padding: 5,
                            justifyContent: "space-evenly",
                            borderColor:
                              reportData.typeId === d.type
                                ? Color.primary
                                : "#555",
                          }}
                          onPress={() => {
                            reportData.typeId = d.type;
                            this.forceUpdate();
                          }}
                        >
                          {d.icon(
                            reportData.typeId === d.type
                              ? Color.primary
                              : "#555"
                          )}
                          <Text
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            style={{
                              color:
                                reportData.typeId === d.type
                                  ? Color.primary
                                  : "#555",
                              fontSize: 14,
                              lineHeight: 20,
                              textAlign: "center",
                            }}
                          >
                            {Languages[d.title]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text
                      style={{
                        color: "#000",
                        fontSize: 16,
                        marginTop: 20,
                        marginBottom: 5,
                      }}
                    >
                      {Languages.Email}
                    </Text>
                    <TextInput
                      placeholder={Languages.EnterYourEmail}
                      keyboardType="email-address"
                      onChangeText={(txt) => {
                        reportData.email = txt.trim();
                        this.forceUpdate();
                      }}
                      value={reportData.email}
                      style={{
                        width: "100%",
                        borderWidth: 1,
                        borderColor: "#bbb",
                        height: 45,
                        paddingVertical: 0,
                        paddingHorizontal: 7,
                        color: "#000",
                      }}
                    />

                    <Text
                      style={{
                        color: "#000",
                        fontSize: 16,
                        marginTop: 20,
                        marginBottom: 5,
                      }}
                    >
                      {Languages.Comment}
                    </Text>
                    <TextInput
                      placeholder={Languages.WhatToReportThisAd}
                      onChangeText={(txt) => {
                        reportData.message = txt;
                        this.forceUpdate();
                      }}
                      value={reportData.message}
                      multiline
                      textAlign="left"
                      textAlignVertical="top"
                      style={{
                        width: "100%",
                        borderWidth: this.state.reportDetailError ? 2 : 1,
                        borderColor: this.state.reportDetailError
                          ? "#e22e22"
                          : "#bbb",
                        height: 100,
                        paddingVertical: 0,
                        paddingHorizontal: 7,
                        color: "#000",
                      }}
                    />

                    <ButtonIndex
                      containerStyle={styles.submitButton}
                      onPress={() => {
                        if (reportData.typeId === "") {
                          Alert.alert("", Languages.selectType);
                          return true;
                        } else if (
                          reportData.email.trim().length < 6 ||
                          !reportData.email.includes(".") ||
                          !reportData.email.includes("@")
                        ) {
                          Alert.alert("", Languages.InvalidEmail);
                          return true;
                        } else if (
                          reportData.typeId === 6 &&
                          reportData.message.trim().length < 3
                        ) {
                          this.setState({ reportDetailError: true });
                          return true;
                        } else {
                          this.setState({ loadingReport: true });
                          KS.ReportListing(reportData).then((data) => {
                            if (data && data?.Success == 1) {
                              this.refs.reportPopup.close();
                              Alert.alert("", Languages.ReportedSuccessfully);
                              reportData.typeId = "";
                              reportData.message = "";
                              reportData.email = "";

                              this.setState({ reportDetailError: false });
                            }
                            this.setState({ loadingReport: false });
                            __DEV__ && alert(JSON.stringify(data));
                          });
                        }
                      }}
                      text={Languages.Send}
                    />
                  </View>
                </ScrollView>

                {this.state.loadingReport && (
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <ActivityIndicator size="large" color={Color.primary} />
                  </View>
                )}
              </KeyboardAvoidingView>
            </Modal>

            <View>
              <Text
                style={[
                  styles.blackHeader,
                  {
                    paddingHorizontal: 10,
                    marginTop: 10,
                  },
                ]}
              >
                {Languages.Advices}
              </Text>

              <View
                style={[
                  styles.boxContainer,
                  {
                    flexDirection: "column",
                    backgroundColor: "#eebc37",
                    padding: 15,
                    marginHorizontal: 10,
                    borderRadius: 5,
                  },
                ]}
              >
                <Text>- {Languages.Advices1}</Text>
                <Text>- {Languages.Advices2}</Text>
                <Text>- {Languages.Advices3}</Text>
              </View>
            </View>

            {false && (
              <TouchableOpacity
                onPress={() => this.refs.reportPopup.open()}
                style={{
                  backgroundColor: "#e33e33",
                  height: 35,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  marginTop: 20,
                  marginHorizontal: 10,
                  flexDirection: "row",
                }}
              >
                <View style={{ width: 25 }} />
                <Text style={{ color: "#fff" }}>{Languages.Report}</Text>
                <Octicons
                  name="alert"
                  size={24}
                  color="#fff"
                  style={{ marginHorizontal: 10 }}
                />
              </TouchableOpacity>
            )}
            {
              //------------------------------End Advices
            }
            <View>
              <Text
                style={[
                  styles.blackHeader,
                  {
                    paddingHorizontal: 10,
                    marginTop: 10,
                  },
                ]}
              >
                {this.state.Owner && this.state.Owner.IsDealer
                  ? Languages.DealerDetails
                  : Languages.SelllerDetails}
              </Text>

              {this.state.Owner && this.state.Owner.IsDealer ? (
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <DealersBanner
                    item={this.state.Dealer}
                    detailsScreen
                    full
                    navigation={this.props.navigation}
                    mobile={Listing.Phone}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.boxContainer]}
                  onPress={() => {
                    this.props.navigation.navigate("UserProfileScreen", {
                      userid: this.state.Owner?.ID,
                    });
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      flex: 1,
                      alignItems: "center",
                      padding: 15,
                    }}
                  >
                    {this.state.Owner && this.state.Owner.ThumbImage ? (
                      <Image
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 10,
                          marginRight: 5,
                        }}
                        resizeMode={"contain"}
                        source={{
                          uri:
                            "https://autobeeb.com/" +
                            this.state.Owner.FullImagePath +
                            "_400x400.jpg" +
                            "?time=" +
                            this.state.date,
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
                        resizeMode={"contain"}
                        source={require("@images/seller.png")}
                      />
                    )}
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          {
                            textAlign: "center",
                            fontSize: 17,
                            color: "#000",

                            lineHeight: 24,
                          },
                        ]}
                      >
                        {Listing.OwnerName}
                      </Text>
                      {this.state.Owner && (
                        <Text style={{ lineHeight: 24 }}>
                          {Languages.MemberSince +
                            Moment(this.state.Owner.RegistrationDate).format(
                              "YYYY-MM-DD"
                            )}
                        </Text>
                      )}

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-around",
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
                            Communications.phonecall(Listing.Phone, true)
                          }
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconFa
                              name="phone"
                              size={25}
                              color="white"
                              style={{ marginRight: 10 }}
                            />
                            <Text style={{ color: "white", fontSize: 18 }}>
                              {Listing.Phone}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            {this.state.Dealer?.LatLng && (
              <View>
                <Text
                  style={[
                    styles.blackHeader,
                    {
                      paddingHorizontal: 10,
                      marginTop: 10,
                    },
                  ]}
                >
                  {Languages.Address}
                </Text>

                <MapView
                  ref={(instance) => (this.map = instance)}
                  liteMode
                  region={{
                    latitude: parseFloat(
                      this.state.Dealer?.LatLng.split(",")[0]
                    ),
                    longitude: parseFloat(
                      this.state.Dealer?.LatLng.split(",")[1]
                    ),
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                  }}
                  onPress={() => {
                    this.handleGetDirections({
                      latitude: parseFloat(
                        this.state.Dealer?.LatLng.split(",")[0]
                      ),
                      longitude: parseFloat(
                        this.state.Dealer?.LatLng.split(",")[1]
                      ),
                    });
                  }}
                  provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                  style={{
                    width: "100%",
                    height: 80,
                    backgroundColor: "#fff",
                  }}
                >
                  {
                    <MapView.Marker
                      onPress={() => {
                        this.handleGetDirections({
                          latitude: parseFloat(
                            this.state.Dealer?.LatLng.split(",")[0]
                          ),
                          longitude: parseFloat(
                            this.state.Dealer?.LatLng.split(",")[1]
                          ),
                        });
                      }}
                      coordinate={{
                        latitude: parseFloat(
                          this.state.Dealer?.LatLng.split(",")[0]
                        ),
                        longitude: parseFloat(
                          this.state.Dealer?.LatLng.split(",")[1]
                        ),
                      }}
                    />
                  }
                </MapView>
              </View>
            )}
            <View
              style={{
                marginVertical: 5,
                alignItems: "center",
                minHeight: 10,
                //   paddingVertical: 5,
                //backgroundColor: "white",
                justifyContent: "center",
              }}
            >
              {this.state.AutobeebBanner ? (
                <TouchableOpacity
                  disabled={!this.state.AutobeebBanner.Link}
                  style={
                    {
                      // height: this.state.measuredItem,
                    }
                  }
                  onPress={() => {
                    let URL = this.state.AutobeebBanner.Link;

                    KS.BannerClick({
                      bannerID: this.state.AutobeebBanner.ID,
                    });
                    // .then((data) => {
                    //   alert(JSON.stringify(data));
                    // });
                    if (URL.includes("details")) {
                      this.props.navigation.push("CarDetails", {
                        item: {
                          ID: URL.split("/")[URL.split("/").length - 2],
                          TypeID: URL.split("/")[URL.split("/").length - 1],
                        },
                      });
                    } else if (URL.includes("postoffer")) {
                      this.props.navigation.navigate("PostOfferScreen");
                    } else if (URL.includes("dealers")) {
                      this.props.navigation.navigate("DealersScreen", {
                        Classification: URL.split("/")[
                          URL.split("/").length - 1
                        ],
                      });
                    } else if (URL.includes("dealer_info")) {
                      this.props.navigation.navigate("DealerProfileScreen", {
                        userid: URL.split("/")[URL.split("/").length - 1],
                      });
                    } else if (URL.includes("blog")) {
                      this.props.navigation.navigate("BlogDetails", {
                        Blog: {
                          ID: URL.split("/")[URL.split("/").length - 1],
                        },
                      });
                    } else if (URL.includes("freeSearch")) {
                      this.props.navigation.navigate("Search", {
                        query: URL.split("/")[URL.split("/").length - 1],
                      });
                    } else {
                      Linking.openURL(URL);
                    }
                  }}
                >
                  <Image
                    resizeMode="contain"
                    source={{
                      uri: `https://autobeeb.com/${this.state.AutobeebBanner.FullImagePath}.jpg`,
                    }}
                    style={{
                      //  marginVertical: 10,
                      alignSelf: "center",
                      width: Dimensions.get("window").width * 0.8,
                      height: (Dimensions.get("window").width * 0.8) / 1.8,
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <BannerAd
                  unitId={Platform.select({
                    android: "ca-app-pub-2004329455313921/8851160063",
                    ios: "ca-app-pub-2004329455313921/8383878907",
                  })}
                  size={
                    this.state.RectangleBannerLoaded
                      ? BannerAdSize.MEDIUM_RECTANGLE
                      : BannerAdSize.MEDIUM_RECTANGLE
                  }
                />
              )}
            </View>

            {this.state.RelatedListings &&
              this.state.RelatedListings.filter((x) => x.ThumbURL).length >
                0 && (
                <View>
                  <Text
                    style={[
                      styles.blackHeader,
                      {
                        paddingHorizontal: 10,
                        marginTop: 10,
                      },
                    ]}
                  >
                    {this.state.Owner && this.state.Owner.IsDealer
                      ? //      ? Languages.DealerOffers
                        Languages.RelatedOffers //was dealer offers, i kept the logic in case he want to switch it back again
                      : Languages.RelatedOffers}
                  </Text>

                  <View style={[styles.boxContainer, { paddingVertical: 15 }]}>
                    <FlatList
                      numColumns={3}
                      style={{ width: "100%" }}
                      keyExtractor={(item, index) => index.toString()}
                      contentContainerStyle={{ alignItems: "center" }}
                      data={this.state.RelatedListings.filter(
                        (x) => x.ThumbURL
                      )}
                      renderItem={({ item, index }) => {
                        return (
                          <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => {
                              this.props.navigation.push("CarDetails", {
                                key: item.ID,
                                item: item,
                              });
                            }}
                            style={{
                              //   flex: 1,
                              width: Dimensions.get("screen").width * 0.32,
                              alignItems: "center",
                              marginBottom: 2,
                              justifyContent: "center",
                              marginHorizontal: 2,
                            }}
                          >
                            <View style={{}}>
                              <FastImage
                                style={{
                                  width: Dimensions.get("screen").width * 0.32,
                                  aspectRatio: 1,
                                  //  flex: 1,
                                  //   height: 150,
                                  borderWidth: 0,

                                  borderRadius: 5,
                                }}
                                resizeMode={"contain"}
                                source={{
                                  uri:
                                    "https://autobeeb.com/" +
                                    item.FullImagePath +
                                    "_400x400.jpg",
                                }}
                              />

                              {!!item.FormatedPrice && false && (
                                <View
                                  style={[
                                    {
                                      backgroundColor: "rgba(0,0,0,0.4)",
                                      position: "absolute",
                                      bottom: 0,
                                      borderTopRightRadius: I18nManager.isRTL
                                        ? 0
                                        : 10,
                                      borderBottomLeftRadius: I18nManager.isRTL
                                        ? 0
                                        : 10,
                                      borderTopLeftRadius: I18nManager.isRTL
                                        ? 10
                                        : 0,
                                      borderBottomRightRadius: I18nManager.isRTL
                                        ? 10
                                        : 0,
                                      overflow: "hidden",
                                    },
                                    I18nManager.isRTL
                                      ? { right: 0 }
                                      : { left: 0 },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      {
                                        color: "#fff",
                                        paddingHorizontal: 5,
                                      },
                                    ]}
                                  >
                                    {item.FormatedPrice}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                </View>
              )}
            <View style={{ backgroundColor: "white" }}>
              <TouchableOpacity
                style={{
                  width: Dimensions.get("screen").width * 0.96,
                  marginVertical: 5,
                  alignSelf: "center",
                  flexDirection: "row",
                  elevation: 1,
                  borderRadius: 5,
                  marginBottom: 10,
                  backgroundColor: Color.primary,
                }}
                onPress={() => {
                  this.checkCountry((isEmailBased) => {
                    if (isEmailBased) {
                      this.props.navigation.navigate("LoginScreen", {
                        skippable: true,
                      });
                    } else {
                      this.props.navigation.navigate("PostOfferScreen");
                    }
                  });
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconFa
                    name="plus"
                    size={25}
                    color="white"
                    style={{ marginRight: 5 }}
                  />
                  <Animatable.Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      padding: 10,
                      fontFamily: "Cairo-Regular",
                      fontSize: 22,
                    }}
                  >
                    {Languages.PostYourOffer}
                  </Animatable.Text>
                  <Animatable.Text
                    iterationCount="infinite"
                    animation="flash"
                    iterationDelay={5000}
                    iterationDelay={1000}
                    duration={2500}
                    style={{
                      // color: "#3F3F37",
                      color: "#fff",
                      fontSize: 22,
                      fontFamily: "Cairo-Regular",
                    }}
                  >
                    {Languages.FREE}
                  </Animatable.Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        <Modal
          ref="modalPhoto"
          isOpen={this.state.modalPhotoOpen}
          swipeToClose={false}
          animationDuration={200}
          style={styles.modalBoxWrap}
        >
          <ImageViewer
            renderIndicator={(data) => {
              if (this.state.Listing?.Images?.length)
                return (
                  <Text
                    style={{
                      textAlign: "center",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "white",
                      position: "absolute",
                      zIndex: 100,
                      top: 25,
                      //    right: 0,
                      alignSelf: "center",
                      paddingHorizontal: 5,
                      fontSize: 19,
                      borderRadius: 8,
                    }}
                  >{`${this.state.index} / ${this.state.Listing.Images.length}`}</Text>
                );
            }}
            backgroundColor="#D2E5EC"
            onChange={(index) => {
              this.setState({
                index: index,
              });
            }}
            pageAnimateTime={100}
            enablePreload
            // onClick={() => {
            //   this.openPhoto(this.state.index);
            // }}
            style={{ zIndex: 50 }}
            index={this.state.index}
            //   saveToLocalByLongPress={Platform.OS == "android"}
            // onSave={url => {
            //   SaveImage.downloadImage(url, "soogah");
            // }}
            saveToLocalByLongPress={false}
            enableImageZoom={true}
            enableSwipeDown
            onSwipeDown={() => {
              this.setState({
                modalPhotoOpen: false,
              });
            }}
            imageUrls={
              this.state.Listing &&
              this.state.Listing.Images &&
              this.state.Listing.Images.map((image) => ({
                url:
                  "https://autobeeb.com/" +
                  this.state.Listing.ImageBasePath +
                  image +
                  "_635x811.jpg",
                width: Dimensions.get("screen").width,
                //   height: Dimensions.get("screen").width / 1.77
              }))
            }
            renderImage={(props) => <Image {...props} resizeMode="cover" />}
          />
        </Modal>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  modalBoxWrap: {
    position: "absolute",
    // borderRadius: 2,
    flex: 1,
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
    zIndex: 9999,
  },
  iconZoom: {
    position: "absolute",
    right: 0,
    top: 100,
    backgroundColor: "rgba(255,255,255,.9)",
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    zIndex: 9999,
  },
  textClose: {
    color: Color.primary,
    // fontWeight: "600",
    fontFamily: "Cairo-Bold",
    fontSize: 17,
    margin: 10,
    zIndex: 9999,
  },
  bottomBox: {
    flexDirection: "row",
    borderRightColor: "#fff",
    borderRightWidth: 1,
    flex: 1,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  blackHeader: {
    color: "#000",
    fontSize: 18,
    marginBottom: 5,
    fontFamily: "Cairo-Regular",
    textAlign: "left",
  },
  boxContainer: {
    backgroundColor: "#fff",
    //  marginBottom: 10,
    borderTopWidth: 1,
    //   padding: 15,
    // borderBottomWidth: 1,
    borderColor: "#eee",
  },
  box: {
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    flex: 1,
    marginVertical: 10,
    borderRightColor: "#eee",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    // padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionHalf: {
    //  flex: 1
    width: Dimensions.get("screen").width / 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    // fontSize: 18,
    // color: Color.secondary
    // backgroundColor: "red",
    fontSize: 16,
    textAlign: "left",
    color: "#000",
  },
  sectionValue: {
    fontSize: 18,
    textAlign: "left",
    color: "#283B77",
  },
  featuresRow: {
    borderBottomWidth: 1,
    paddingVertical: 15,
    borderBottomColor: "#eee",
    flexDirection: "row",
  },

  featuresHalf: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    flex: 1,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    //   paddingBottom: 5,
    //   marginBottom: 5
  },
  featuresText: {
    fontSize: 16,
    color: "#61667B",
  },
  modelModal: {
    // backgroundColor: "red",
    zIndex: 550,
    flex: 1,
    backgroundColor: "transparent",
    alignSelf: "center",
    // alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  modelContainer: {
    borderRadius: 10,
    alignSelf: "center",
    width: Dimensions.get("screen").width * 0.8,
    //  height: Dimensions.get("screen").height * 0.5,

    backgroundColor: "#eee",
    padding: 5,
    borderRadius: 10,
  },
  socialBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    //  marginVertical: 10,
    backgroundColor: Color.primary,
    marginTop: 15,
    borderRadius: 5,
    // height: 25,
    fontFamily: Constants.fontFamily,

    elevation: 1,
  },
});

const mapStateToProps = ({ user, menu }) => ({
  userData: user.user,
  ViewingCountry: menu.ViewingCountry,
});

const mapDispatchToProps = (dispatch) => {
  const UserActions = require("@redux/UserRedux");
  const { actions } = require("@redux/RecentListingsRedux");

  return {
    storeUserData: (user, callback) =>
      UserActions.actions.storeUserData(dispatch, user, callback),
    updateRecentlySeenListings: (listing, callback) => {
      actions.updateRecentlySeenListings(dispatch, listing, callback);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CarDetails);
