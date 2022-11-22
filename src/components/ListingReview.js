import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  StyleSheet,
  NativeModules,
  Keyboard,
  I18nManager,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import {Color, Images, Styles, Constants, Languages, Icons} from '@common';
import {toast} from '@app/Omni';
import IconEn from 'react-native-vector-icons/Entypo';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from 'react-native-popup-menu';
import IconFa from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';
import DialogBox from 'react-native-dialogbox';
import KS from '@services/KSAPI';
var ImagePicker = NativeModules.ImageCropPicker;

class ListingReview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: global.ViewingCurrency || this.props.ViewingCurrency,
      imagePendingDelete: false,
      images: [],
      description:
        this.props.navigation.getParam('Listing', {Description: ''})
          .Description || '',
      price: this.props.navigation.getParam('Listing', {Price: ''}).Price
        ? this.props.navigation
            .getParam('Listing', {Price: ''})
            .Price.toString()
        : '',
      title: this.props.navigation.getParam('Listing', {Name: ''}).Name || '',
      boardNumber:
        this.props.navigation.getParam('Listing', {Name: ''}).Name || '',
      paddingBottom: 0,
      mainImageFromGallery: false, // when editing we want to know if the user uploaded any new pics
      hideEmail: false,
    };
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow.bind(this)
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide.bind(this)
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    if (Platform.OS == 'ios') {
      setTimeout(() => {
        this.refs.scrollview && this.refs.scrollview.scrollToEnd();
      }, 100);
    }
    this.setState({paddingBottom: Platform.select({ios: 0, android: 50})});
  }

  _keyboardDidHide() {
    this.setState({paddingBottom: 0});
  }

  componentDidMount() {
    this.props.FindStep();
    if (this.props.navigation.getParam('Listing', false)) {
      this.setState({
        editListing: this.props.navigation.getParam('Listing', 0),
        imagesEdit: this.props.navigation.getParam('Listing', 0).Images,
        mainImage: this.props.navigation.getParam('Listing', 0).Images[0],
      });
    }
    setTimeout(() => {
      this.refs.scrollview && this.refs.scrollview.scrollToEnd();
    }, 500);

    if (this.props.CountriesData && this.props.CountryCode) {
      let selectedCountry =
        this.props.CountriesData &&
        this.props.CountriesData.find(
          (x) => x.ISOCode.toLowerCase() == this.props.CountryCode
        )
          ? this.props.CountriesData.find(
              (x) => x.ISOCode.toLowerCase() == this.props.CountryCode
            )
          : null;

      if (!selectedCountry.EmailRegister) {
        this.setState({hideEmail: true});
      }
    }

    KS.PrimaryCurrenciesGet({
      langid: Languages.langID,
      currencyID: this.props.navigation.getParam('Listing', false)
        ? this.props.navigation.getParam('Listing', false).EntryCur
        : global.ViewingCurrency
        ? global.ViewingCurrency.ID
        : '2',
      isocode: this.props.navigation.getParam('Listing', false)
        ? this.props.navigation.getParam('Listing', false).ISOCode
        : this.props.CountryCode ||
          (this.props.userData && this.props.userData?.ISOCode),
    })
      .then((result) => {
        if (result && result.Success) {
          //   alert(JSON.stringify(result));

          this.setState({PrimaryCurrencies: result.Currencies});

          result.Currencies &&
            result.Currencies.forEach((cur) => {
              if (cur.ID == global.ViewingCurrency?.ID) {
                this.setState({currency: cur});
              }
            });
          if (this.props.navigation.getParam('Listing', false)) {
            this.setState({
              currency: result.Currencies.find(
                (cur) =>
                  cur.ID ==
                  this.props.navigation.getParam('Listing', false).EntryCur
              ),
            });
          }
        } else {
          //should never happen, in case something goes wrong ill have fallback currencies
          this.setState({
            PrimaryCurrencies: [
              {
                ID: 2,
                Ratio: 1.0,
                Standard: true,
                Name: 'USD',
                Format: '$ {0}',
                Rank: 0,
                NumberFormat: 'N0',
                ShortName: 'USD',
                Primary: true,
              },
              {
                ID: 29,
                Ratio: 0.92,
                Standard: false,
                Name: 'Euro',
                Format: '€ {0}',
                Rank: 0,
                NumberFormat: 'N0',
                ShortName: 'EUR',
                Primary: true,
              },
            ],
          });
        }
      })
      .catch((err) => {});

    // this.refs.priceInput && this.refs.priceInput.focus();
  }

  showImageOptions() {
    const _this = this;
    this.dialogbox.pop({
      title: Languages.ImageSource,
      btns: [
        {
          text: Languages.camera,

          callback: () => {
            _this.dialogbox.close();
            setTimeout(() => {
              _this.pickSingleWithCamera();
            }, 500);
          },
        },
        {
          text: Languages.Gallery,

          callback: () => {
            _this.dialogbox.close();
            setTimeout(() => {
              _this.pickMultiple();
            }, 500);
          },
        },
      ],
    });
  }
  pickMultiple() {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      waitAnimationEnd: true,
      includeExif: true,
      maxFiles: 15,
      includeBase64: true,
      compressImageQuality: 0.7,
    })
      .then((images) => {
        this.setState({mainImage: null});

        this.setState({image: null});
        var myImages = this.state.images;
        if (!myImages) myImages = [];
        images.map((i, index) => {
          if (
            this.props.navigation.getParam('EditOffer', false) &&
            this.state.imagesEdit &&
            this.state.imagesEdit.length > 0
          ) {
            if (myImages.length < 15 - this.state.imagesEdit.length) {
              myImages.push({
                uri: i.path,
                width: i.width,
                height: i.height,
                mime: i.mime,
                data: i.data,
              });
            }
          } else {
            if (myImages.length < 15) {
              myImages.push({
                uri: i.path,
                width: i.width,
                height: i.height,
                mime: i.mime,
                data: i.data,
              });
            }
          }
        });

        this.setState({images: myImages}, () => {
          this.setState((prevState) => ({
            index: prevState.index + 1,
          }));
          //this.props.onDone(this.state.images);
        });
      })
      .catch(
        (e) => {}
        //console.log(e)
      );
  }

  pickSingleWithCamera() {
    ImagePicker.openCamera({
      cropping: false,
      width: 500,
      height: 500,
      includeExif: true,
      includeBase64: true,
      compressImageQuality: 0.7,
    })
      .then((image) => {
        this.setState({mainImage: null});

        this.setState({image: null});
        var myImages = this.state.images;
        if (!myImages) myImages = [];
        //alert(JSON.stringify(image));
        if (
          this.props.navigation.getParam('EditOffer', false) &&
          this.state.imagesEdit &&
          this.state.imagesEdit.length > 0
        ) {
          if (myImages.length <= 14 - this.state.imagesEdit.length) {
            myImages.push({
              uri: image.path,
              width: image.width,
              height: image.height,
              mime: image.mime,
              data: image.data,
            });
          }
        } else {
          if (myImages.length <= 14) {
            myImages.push({
              uri: image.path,
              width: image.width,
              height: image.height,
              mime: image.mime,
              data: image.data,
            });
          }
        }

        this.setState({images: myImages}, () => {
          //this.props.onDone(this.state.images);
        });
      })
      .catch((e) => console.log(e));
  }

  renderImage(image, index) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.refs.imagesList) {
            //   this.refs.imagesList.scrollTo({ x: 0, y: 0, animated: true });

            this.refs.imagesList.scrollToOffset({
              animated: true,
              offset: 0,
            });
          }
          // var oldmain = this.state.images[0];
          //    this.state.images[0] = this.state.images[index];
          //    this.state.images[index] = oldmain;

          let img = this.state.images[index];
          this.state.images.splice(index, 1);
          this.setState({mainImage: null});
          this.state.images.unshift(img);
          this.setState({images: this.state.images});
        }}
      >
        <Image
          style={[
            {
              width: 90,
              height: 90,
              borderRadius: 10,
              resizeMode: 'cover',
              marginBottom: 7,
            },
            index == 0 &&
              !this.state.mainImage && {
                borderWidth: 3,
                borderColor: Color.primary,
              },

            styles.imageBox,
          ]}
          source={image}
        />
      </TouchableOpacity>
    );
  }

  deleteImage(listingID, fileName, index) {
    let isPrimary = this.state.mainImage && this.state.mainImage == fileName;
    this.setState({imagePendingDelete: true});
    KS.ListingImageDelete({
      id: listingID,
      fileName: fileName,
      primary: isPrimary,
    }).then((result) => {
      this.setState({imagePendingDelete: false});

      if (result.Success == 1) {
        this.state.imagesEdit.splice(index, 1);
        this.setState({imagesEdit: this.state.imagesEdit}, () => {
          if (this.state.imagesEdit && this.state.imagesEdit.length > 0) {
            this.setState({mainImage: this.state.imagesEdit[0]});
          } else {
            this.setState({mainImage: null});
          }
        });
      } else {
        alert('Error Delete Image : ' + JSON.stringify(result.Message));
      }
    });
  }

  renderEditImage(image, index) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.refs.imagesEditList) {
            //   this.refs.imagesList.scrollTo({ x: 0, y: 0, animated: true });
            this.refs.imagesEditList.scrollToOffset({
              animated: true,
              offset: 0,
            });
          }
          // var oldmain = this.state.images[0];
          //    this.state.images[0] = this.state.images[index];
          //    this.state.images[index] = oldmain;

          let img = this.state.imagesEdit[index];
          this.state.imagesEdit.splice(index, 1);
          this.setState({mainImage: image});
          this.state.imagesEdit.unshift(img);
          this.setState({imagesEdit: this.state.imagesEdit});
        }}
      >
        <Image
          style={[
            {
              width: 90,
              height: 90,
              borderRadius: 10,
              resizeMode: 'cover',
              marginBottom: 7,
            },
            index == 0 &&
              this.state.mainImage == image && {
                borderWidth: 3,
                borderColor: Color.primary,
              },

            styles.imageBox,
          ]}
          source={{
            uri:
              'https://autobeeb.com/' +
              this.state.editListing.ImageBasePath +
              image +
              '_400x400.jpg',
          }}
        />
      </TouchableOpacity>
    );
  }
  renderRow = (value, step, singleEdit) => {
    return (
      <View style={[styles.rowContainer]}>
        <TouchableOpacity
          style={[styles.ValueButton]}
          onPress={() => {
            // if (isSubCat) {
            //   this.props.isSubCat(true);
            // } else {
            //   this.props.isSubCat(false);
            // }
            if (step == 6 && !this.props.data.makeID) {
              Alert.alert('', Languages.ChooseMakeFirst);
            } else if (step == 2) {
              this.props.goToStep(1);
            } else if (!value || step == 16 || singleEdit) {
              this.props.goToStep(step, true);
            } else {
              this.props.goToStep(step);
            }
          }}
          disabled={
            this.props.userData &&
            this.props.userData?.EmailRegister &&
            this.props.userData?.EmailConfirmed &&
            this.props.userData?.EmailApproved &&
            step == 16
          }
        >
          <Text
            style={[
              styles.headerText,
              step == 16 && {
                color: Color.secondary,
              },
            ]}
          >
            {step == 15 &&
            this.props.data.sellType == 1 &&
            this.props.data.listingType == 4
              ? Languages.WorkingHours
              : Languages.stepHeader[step]}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={styles.ValueText}>{value}</Text>
            {step != 16 && (
              <IconEn
                name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
                size={18}
                color={Color.secondary}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderPrice = () => {
    return (
      <View style={[styles.rowContainer, {marginTop: 10}]}>
        <Text style={{textAlign: 'left'}}>{Languages.Price}</Text>
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              //     borderBottomColor: Color.secondary,
            },
          ]}
        >
          <TextInput
            ref="priceInput"
            style={[
              {
                //  height: 50,
                flex: 4,
                //    backgroundColor: "red",
                fontSize: Constants.smallFont,
                fontFamily: 'Cairo-Regular',
                textAlign: I18nManager.isRTL ? 'right' : 'left',
              },
              I18nManager.isRTL
                ? {
                    //  borderLeftColor: "#000",
                    //    borderLeftWidth: 1
                  }
                : {
                    //  borderRightWidth: 1,
                    //   borderRightColor: "#000"
                  },
            ]}
            placeholder={Languages.EnterPrice}
            maxLength={8}
            onChangeText={this.props.onChangePrice}
            value={this.props.price}
            keyboardType="numeric"
          />
          {
            <Menu
              onSelect={(value) => this.setState({currency: value})}
              style={{
                paddingHorizontal: 5,
                borderLeftWidth: 1,
              }}
            >
              <MenuTrigger>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{fontSize: 14, color: 'blue'}}>
                    {this.state.currency?.Name}
                  </Text>
                  <IconEn
                    name="triangle-down"
                    size={15}
                    color={'#000'}
                    style={{}}
                  />
                </View>
              </MenuTrigger>

              <MenuOptions>
                {this.state.PrimaryCurrencies &&
                  this.state.PrimaryCurrencies.map((currency) => {
                    return (
                      <MenuOption value={currency}>
                        <Text
                          style={[
                            {fontSize: 15},
                            this.state.currency.ID == currency.ID && {
                              color: 'blue',
                            },
                          ]}
                        >
                          {currency.Name}
                        </Text>
                      </MenuOption>
                    );
                  })}
              </MenuOptions>
            </Menu>
          }
        </View>
      </View>
    );
  };

  renderTitle = () => {
    return (
      <View
        style={[
          styles.rowContainer,
          {
            marginTop: 3,
          },
        ]}
      >
        <Text
          style={{
            textAlign: 'left',
            color:
              this.props.title && this.props.title.length > 0
                ? 'green'
                : 'crimson',
            fontFamily:
              this.props.title && this.props.title.length > 0
                ? 'Cairo-Regular'
                : 'Cairo-Bold',
          }}
        >
          {Languages.Title}
        </Text>
        <View>
          <TextInput
            style={{
              //  height: 50,
              flex: 1,
              fontSize: Constants.smallFont,
              fontFamily: 'Cairo-Regular',
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            }}
            maxLength={70}
            placeholder={Languages.EnterTitle}
            onChangeText={this.props.onChangeTitle}
            value={this.props.title}
          />
        </View>
      </View>
    );
  };
  renderPartNumber = () => {
    const {data} = this.props;

    return (
      <View
        style={[
          styles.rowContainer,
          {
            marginTop: 3,
          },
        ]}
      >
        <Text
          style={{
            textAlign: 'left',
            color:
              (data.sellType && data.sellType == 4) ||
              (data.condition && data.condition.ID != 1)
                ? 'black'
                : this.props.partNumber && this.props.partNumber.length >= 3
                ? 'green'
                : 'crimson',
            fontFamily:
              (data.sellType && data.sellType == 4) ||
              (data.condition && data.condition.ID != 1)
                ? 'Cairo-Regular'
                : this.props.partNumber && this.props.partNumber.length >= 3
                ? 'Cairo-Regular'
                : 'Cairo-Bold',
          }}
        >
          {Languages.PartNumber}
        </Text>
        <View>
          <TextInput
            style={{
              //  height: 50,
              width: Dimensions.get('screen').width,
              fontSize: Constants.smallFont,
              fontFamily: 'Cairo-Regular',
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            }}
            maxLength={20}
            placeholder={Languages.EnterPartNumber}
            onChangeText={this.props.onChangePartNumber}
            value={this.props.partNumber}
          />
        </View>
      </View>
    );
  };
  renderBoardNumber = () => {
    return (
      <View
        style={[
          styles.rowContainer,
          {
            marginTop: 3,
          },
        ]}
      >
        <Text
          style={{
            textAlign: 'left',
            color:
              this.props.boardNumber && this.props.boardNumber.length > 0
                ? 'green'
                : 'crimson',
            fontFamily:
              this.props.boardNumber && this.props.boardNumber.length > 0
                ? 'Cairo-Regular'
                : 'Cairo-Bold',
          }}
        >
          {Languages.BoardNumber}
        </Text>
        <TextInput
          style={{
            //  height: 50,
            width: Dimensions.get('screen').width,
            fontSize: Constants.smallFont,

            fontFamily: 'Cairo-Regular',
            textAlign: I18nManager.isRTL ? 'right' : 'left',
          }}
          placeholder={Languages.EnterBoardNumber}
          onChangeText={this.props.onChangeBoard}
          value={this.props.boardNumber}
        />
      </View>
    );
  };

  renderDescription = () => {
    return (
      <View
        style={[styles.rowContainer, {marginTop: 3}]}
        // pointerEvents="none"
      >
        <Text style={{textAlign: 'left'}}>{Languages.Description}</Text>
        <TextInput
          ref="description"
          nestedScrollEnabled
          contextMenuHidden={false}
          style={{
            //  height: 50,
            width: Dimensions.get('screen').width * 0.85,
            backgroundColor: '#f2f2f2',
            elevation: 1,
            borderWidth: 0,
            borderRadius: 10,
            alignSelf: 'center',
            marginTop: 10,
            padding: 5,
            //   flex: 1,
            fontSize: Constants.smallFont,
            fontFamily: 'Cairo-Regular',
            textAlign: I18nManager.isRTL ? 'right' : 'left',
            height: 120,
          }}
          numberOfLines={5}
          multiline
          placeholder={Languages.EnterDescription}
          onChangeText={(text) => {
            this.refs.scrollview &&
              this.refs.scrollview.scrollToEnd({animated: true});
            this.props.onChangeDesc(text);
          }}
          value={this.props.description}
        />
      </View>

      //   <TouchableOpacity
      //     style={{}}
      //     onPress={() => {
      //       if (this.refs.description) {

      //         this.refs.description.focus();
      //       }
      //     }}
      //   >
      // </TouchableOpacity>
    );
  };

  renderEditImages = () => {
    if (this.state.imagesEdit && this.state.imagesEdit.length > 0)
      return (
        <View
          style={{
            backgroundColor: 'white',
            paddingTop: 10,
            paddingLeft: 10,
            marginTop: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {this.state.editListing && this.state.imagesEdit && (
              <FlatList
                ref="imagesEditList"
                keyExtractor={(item, index) => index.toString()}
                extraData={this.state}
                data={this.state.imagesEdit}
                horizontal
                contentContainerStyle={{
                  flexGrow: 1,
                  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                }}
                renderItem={({item, index}) => {
                  return (
                    <View
                      key={index}
                      style={{
                        marginHorizontal: 3,
                        overflow: 'visible',
                        paddingVertical: 18,
                        paddingHorizontal: 5,
                      }}
                    >
                      {this.renderEditImage(item, index)}
                      {!this.state.imagePendingDelete && (
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 2,
                            backgroundColor: '#000',
                            zIndex: 500,
                            elevation: 1,
                            width: 25,
                            height: 25,
                            borderRadius: 15,
                            alignContent: 'center',
                            justifyContent: 'center',
                          }}
                          onPress={() =>
                            this.deleteImage(
                              this.state.editListing.ID,
                              item,
                              index
                            )
                          }
                        >
                          <Text
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                            }}
                          >
                            X
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>

          {this.state.imagesEdit &&
            this.state.imagesEdit.length > 0 &&
            this.state.mainImage && (
              <Text
                style={{
                  color: Color.primary,
                  fontSize: 12,
                  textAlign: 'left',
                }}
              >
                {Languages.highlightedImage}
              </Text>
            )}
        </View>
      );
    else return <View style={{}}></View>;
  };

  renderImagePicker = () => {
    return (
      <View
        style={{
          backgroundColor: 'white',
          paddingTop: 10,
          paddingLeft: 10,
          marginTop: 10,
        }}
      >
        <View
          style={{
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.showImageOptions();
              //   this.pickMultiple();
            }}
            style={[styles.addBox]}
          >
            <IconFa
              name="file-image-o"
              size={40}
              color={Color.primary}
              style={{marginVertical: 5}}
            />
            <IconFa
              name="plus"
              size={20}
              color={Color.primary}
              style={{
                position: 'absolute',
                top: 12,
                right: 5,
              }}
            />
            <Text style={{fontSize: 12, color: Color.primary}}>
              {Languages.addPhotos}
            </Text>
          </TouchableOpacity>
          {this.state.images && (
            <FlatList
              ref="imagesList"
              keyExtractor={(item, index) => index.toString()}
              extraData={this.state.images}
              data={this.state.images}
              horizontal
              inverted={Platform.OS == 'ios' && I18nManager.isRTL}
              contentContainerStyle={{
                flexGrow: 1,
                //        flexDirection: I18nManager.isRTL ? "row-reverse" : "row"
              }}
              renderItem={({item, index}) => {
                return (
                  <View
                    key={index}
                    style={{
                      marginHorizontal: 3,
                      overflow: 'visible',
                      paddingVertical: 18,
                      paddingHorizontal: 5,
                    }}
                  >
                    {this.renderImage(item, index)}
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 2,
                        backgroundColor: '#000',
                        zIndex: 500,
                        elevation: 1,
                        width: 25,
                        height: 25,
                        borderRadius: 15,
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => this.cleanupImage(item)}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          textAlign: 'center',
                        }}
                      >
                        X
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </View>

        {this.state.images &&
          this.state.images.length > 0 &&
          !this.state.mainImage && (
            <Text
              style={{color: Color.primary, fontSize: 12, textAlign: 'left'}}
            >
              {Languages.highlightedImage}
            </Text>
          )}
      </View>
    );
  };
  cleanupImage(image) {
    this.setState({images: this.state.images.filter((x) => x !== image)});
    ImagePicker.cleanSingle(image ? image.uri : null);
  }

  PublishOffer() {
    const {
      listingType,
      sellType,
      makeID,
      modelID,
      selectedYear,
      categoryID,
      condition,
      gearBox,
      fuelType,
      colorID,
      paymentMethod,
      phone,
      userName,
      mileage,
      cityID,
      price,
      sectionID,
      rentPeriod,
      description,
      subCategoryID,
      email,
    } = this.props.data;
    let deviceID = DeviceInfo.getUniqueID();
    this.setState({disablePublish: true});
    // console.log("add listing body :::::\n", {
    //   ownerID: (this.props.userData && this.props.userData?.ID) || undefined,
    //   TypeID: listingType,
    //   sellType,
    //   makeID,
    //   modelID,
    //   year: selectedYear,
    //   categoryID: subCategoryID ? subCategoryID : categoryID,
    //   rentPeriod: rentPeriod?.ID,
    //   phone,
    //   userName,
    //   cityID,
    //   description: this.props.description,
    //   title: this.props.title,
    //   price: this.props.price,
    //   condition: condition?.ID,
    //   gearBox: gearBox?.ID,
    //   fuelType: fuelType?.ID,
    //   colorID,
    //   paymentMethod: paymentMethod?.ID,
    //   consumption: mileage,
    //   sectionID,
    //   boardNumber: this.props.boardNumber,
    //   partNumber: this.props.partNumber,
    //   otpconfirmed:
    //     (this.props.userData && this.props.userData?.OTPConfirmed) || false,
    //   langID: Languages.langID,
    //   deviceID: deviceID,
    //   isoCode:
    //     this.props.CountryCode ||
    //     (this.props.userData && this.props.userData?.ISOCode),
    //   currency: this.state.currency ? this.state.currency.ID : "2",
    //   ID: this.props.data.ID || "",
    //   email: this.state.hideEmail ? "" : email,
    //   mainimage:
    //     this.state.imagesEdit &&
    //     this.state.imagesEdit.length > 0 &&
    //     this.state.mainImage
    //       ? this.state.mainImage
    //       : "",
    // });
    this.props.DoAddListing(
      {
        ownerID: (this.props.userData && this.props.userData?.ID) || undefined,
        TypeID: listingType,
        sellType,
        makeID,
        modelID,
        year: selectedYear,
        categoryID: subCategoryID ? subCategoryID : categoryID,
        rentPeriod: rentPeriod?.ID,
        phone,
        userName,
        cityID,
        description: this.props.description,
        title: this.props.title,
        price: this.props.price,
        condition: condition?.ID,
        gearBox: gearBox?.ID,
        fuelType: fuelType?.ID,
        colorID,
        paymentMethod: paymentMethod?.ID,
        consumption: mileage,
        sectionID,
        boardNumber: this.props.boardNumber,
        partNumber: this.props.partNumber,
        otpconfirmed:
          (this.props.userData && this.props.userData?.OTPConfirmed) || false,
        langID: Languages.langID,
        deviceID: deviceID,
        isoCode:
          this.props.CountryCode ||
          (this.props.userData && this.props.userData?.ISOCode),
        currency: this.state.currency ? this.state.currency.ID : '2',
        ID: this.props.data.ID || '',
        email: this.state.hideEmail ? '' : email,
        mainimage:
          this.state.imagesEdit &&
          this.state.imagesEdit.length > 0 &&
          this.state.mainImage
            ? this.state.mainImage
            : '',
      },
      this.state.images,

      (data) => {
        //  console.log("response is:", data);
        this.setState({disablePublish: false});
        if (data.Success == 1) {
          KS.ListingInitInfo({listingID: data.ID, langid: Languages.langID});
          if (data.User) {
            this.props.storeUserData(data.User);
          }
          if (!data.IsUserActive) {
            this.props.navigation.navigate('HomeScreen');
            toast(Languages.AccountBlocked, 3500);
          } else if (data.Status == 1) {
            // to be tested

            this.props.navigation.replace('CarDetails', {
              pendingDelete: true,
              item: {
                ID: data.ID,
                SellType: data.SellType,
                TypeID: data.TypeID,
              },
              Phone: data.Phone,
              UserID: data.UserID,
              showFeatures: true,
              isEmailRegister: data.EmailRegister && !data.EmailConfirmed,
              Email:
                data.EmailRegister && !data.EmailConfirmed ? data.Email : '',
            });
          } else if (data.EmailRegister && !data.EmailConfirmed) {
            this.props.navigation.replace('CarDetails', {
              isNewUser: true,
              isEmailRegister: true,
              Email: data.Email,

              User: data.User,
              OTPCode: data.OTPCode,
              item: {
                ID: data.ID,
                SellType: data.SellType,

                TypeID: data.TypeID,
              },

              ListingID: data.ID,
              Phone: data.Phone,
              UserID: data.UserID,
              showFeatures: true,
            });
          } else if (data.OTPConfirmed == false && !data.EmailRegister) {
            this.props.navigation.replace('CarDetails', {
              isNewUser: true,
              User: data.User,
              OTPCode: data.OTPCode,
              item: {
                ID: data.ID,
                SellType: data.SellType,

                TypeID: data.TypeID,
              },

              ListingID: data.ID,
              Phone: data.Phone,
              UserID: data.UserID,
              showFeatures: true,
            });
          } else {
            toast(Languages.PublishSuccess, 3500);

            this.props.navigation.replace('CarDetails', {
              isNewUser: false,
              User: data.User,
              item: {
                ID: data.ID,
                SellType: data.SellType,

                TypeID: data.TypeID,
              },
              Phone: data.Phone,
              UserID: data.UserID,
              ListingID: data.ID,
              showFeatures: true,
            });
          }
        } else {
          alert(data.Message);
        }
      }
    );
  }

  renderPaymentMethod(value) {
    switch (value) {
      case 1:
        return '';
      case 2:
        return '/ ' + Languages.Installments;
      default:
        return '';
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
      return '';
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
      return '';
    }
  }

  renderSection(Listing) {
    try {
      if (Listing.TypeID == 4 && Languages.langID != 2) {
        return Listing.SectionName.split(' ')[0];
      } else if (
        Listing.TypeID == 32 &&
        Listing.SectionName.split(' ').length > 2 &&
        Languages.langID != 2
      ) {
        return Listing.SectionName.split(' ')[0];
      } else if (
        Listing.TypeID == 32 &&
        Listing.SectionName.split(' ').length > 2 &&
        Languages.langID == 2
      ) {
        return Listing.SectionName.split(' ')[2];
      } else {
        return Listing.SectionName;
      }
    } catch {
      return Listing.SectionName;
    }
  }

  render() {
    const {data} = this.props;
    let Listing = this.props.navigation.getParam('Listing', {});
    const {stepArray} = this.props.data.navObject;
    // console.log(data);
    if (this.props.EditOfferLoading) {
      return <Text style={{}}>{'Something went wrong while editing '}</Text>;
    }
    return (
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', android: ''})}
        style={{flex: 1}}
      >
        <MenuProvider>
          <View style={{flex: 1}}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="never"
              ref="scrollview"
              style={{backgroundColor: '#eee'}}
              contentContainerStyle={{
                // flex: 1,
                paddingBottom: this.state.paddingBottom,
              }}
            >
              {this.renderRow(
                data.listingTypeLabel + ' ' + data.sellTypeLabel,
                2
              )}
              {stepArray.includes(3) && this.renderRow(data.sectionLabel, 3)}
              {stepArray.includes(4) &&
                this.renderRow(
                  data.subCategoryLabel
                    ? data.categoryLabel + ', ' + data.subCategoryLabel
                    : data.categoryLabel,
                  4,
                  //      data.subCategoryLabel ? false : true
                  true
                  //      data.subCategoryLabel ? true : false
                )}
              {stepArray.includes(5) && this.renderRow(data.makeLabel, 5, true)}
              {stepArray.includes(6) &&
                this.renderRow(data.modelLabel, 6, true)}
              {stepArray.includes(7) &&
                this.renderRow(data.selectedYear, 7, true)}
              {stepArray.includes(9) &&
                this.renderRow(data.fuelType.Name, 9, true)}
              {stepArray.includes(10) &&
                this.renderRow(data.condition && data.condition.Name, 10, true)}
              {stepArray.includes(11) &&
                this.renderRow(data.gearBox.Name, 11, true)}
              {stepArray.includes(12) &&
                this.renderRow(data.paymentMethod.Name, 12, true)}
              {stepArray.includes(13) &&
                this.renderRow(data.rentPeriod.Name, 13, true)}
              {stepArray.includes(14) &&
                this.renderRow(data.colorLabel, 14, true)}
              {stepArray.includes(15) && this.renderRow(data.mileage, 15, true)}
              {
                stepArray.includes(16) &&
                  !!data.userName &&
                  this.renderRow(data.userName, 17, true) //16 and 17 on purpose because it's switched at the last step
              }
              {stepArray.includes(8) && this.renderRow(data.cityLabel, 8, true)}
              {!this.state.hideEmail &&
                !!data.email &&
                !this.props.userData?.EmailConfirmed &&
                stepArray.includes(20) &&
                this.renderRow(data.email, 20, true)}
              {this.renderRow(data.phone, 16)}
              {this.props.navigation.getParam('EditOffer', false) == true &&
                this.renderEditImages()}
              {this.renderImagePicker()}
              {this.renderPrice()}
              {data.listingType == 32 &&
                !(data.listingType == 32 && data.sectionID == 4096) &&
                this.renderTitle()}
              {data.listingType == 32 &&
                data.sectionID < 2048 &&
                this.renderPartNumber()}
              {data.listingType == 32 &&
                data.sectionID == 4096 &&
                this.renderBoardNumber()}
              {this.renderDescription()}
              {!this.props.userData && (
                <TouchableOpacity
                  style={{backgroundColor: 'white', paddingVertical: 5}}
                  onPress={() => {
                    this.props.navigation.navigate('PrivacyPolicy');
                    //     this.setModalVisible(true);
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Cairo-Regular',
                      textAlign: 'center',
                      fontSize: 12,
                      paddingHorizontal: 30,
                    }}
                  >
                    {Languages.ByPostingAd}
                    <Text style={{color: Color.primary, fontSize: 12}}>
                      {' '}
                      {Languages.Terms}{' '}
                    </Text>
                    {Languages.AndPrivacy}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <TouchableOpacity
              disabled={this.state.disablePublish}
              style={[
                {
                  width: Dimensions.get('screen').width,
                  backgroundColor:
                    (data.listingType == 32 &&
                      data.sectionID != 4096 &&
                      !this.props.title) ||
                    (data.listingType == 32 &&
                      data.sectionID == 4096 &&
                      !this.props.boardNumber) ||
                    (data.condition &&
                      data.condition.ID == 1 &&
                      data.sellType &&
                      data.sellType != 4 &&
                      data.listingType == 32 &&
                      data.sectionID < 2048 &&
                      (!this.props.partNumber ||
                        this.props.partNumber.length < 3))
                      ? 'crimson'
                      : 'green',
                  paddingVertical: 12,
                },
                this.state.disablePublish && {backgroundColor: 'gray'},
              ]}
              onPress={() => {
                if (
                  data.listingType == 32 &&
                  data.sectionID != 4096 &&
                  !this.props.title
                ) {
                  Alert.alert('', Languages.PleaseEnterTitle);
                } else if (
                  data.listingType == 32 &&
                  data.sectionID == 4096 &&
                  !this.props.boardNumber
                ) {
                  Alert.alert('', Languages.PleaseEnterBoardNumber);
                } else if (
                  data.condition &&
                  data.condition.ID == 1 &&
                  data.sellType &&
                  data.sellType != 4 &&
                  data.listingType == 32 &&
                  data.sectionID < 2048 &&
                  (!this.props.partNumber || this.props.partNumber.length < 3)
                ) {
                  Alert.alert('', Languages.EnterPartNumber);
                } else {
                  this.PublishOffer();
                }
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: Constants.mediumFont,
                }}
              >
                {Languages.PublishOffer}
              </Text>
            </TouchableOpacity>
          </View>

          <DialogBox
            ref={(dialogbox) => {
              this.dialogbox = dialogbox;
            }}
          />
        </MenuProvider>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: Constants.smallFont,
    color: 'black',
  },
  rowContainer: {
    borderBottomWidth: 1,
    borderColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  ValueButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderWidth: 1,
    //  borderRadius: 5,
    //  borderColor: "green",
    //  paddingVertical: 5,
    //   paddingHorizontal: 10,
    marginVertical: 3,
  },
  ValueText: {
    fontSize: Constants.smallFont,
    color: '#aaa',
  },
  addBox: {
    backgroundColor: '#f8f8f8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginRight: 10,
    marginBottom: 10,
  },
});

const mapStateToProps = ({user, menu}) => ({
  userData: user.user,
  ViewingCountry: menu.ViewingCountry,
  ViewingCurrency: menu.ViewingCurrency,
});

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

export default connect(mapStateToProps, mapDispatchToProps)(ListingReview);
