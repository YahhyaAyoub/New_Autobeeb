import React, {Component} from 'react';
import NewHeader from '../containers/NewHeader';
import {connect} from 'react-redux';
import ks from '@services/KSAPI';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  BackHandler,
  Dimensions,
  Platform,
} from 'react-native';
import {HeaderBackButton} from 'react-navigation-stack';

import {Color, Constants, Languages} from '@common';

import ListingType from '@components/ListingType';
import ListingSellType from '@components/ListingSellType';
import ListingMake from '@components/ListingMake';
import ListingModel from '@components/ListingModel';
import ListingYear from '@components/ListingYear';
import ListingCondition from '@components/ListingCondition';
import ListingCategory from '@components/ListingCategory';
import ListingSection from '@components/ListingSection';
import ListingGearBox from '@components/ListingGearBox';
import ListingPaymentMethod from '@components/ListingPaymentMethod';
import ListingColor from '@components/ListingColor';
import ListingMileage from '@components/ListingMileage';
import ListingPhone from '@components/ListingPhone';
import ListingUserName from '@components/ListingUserName';
import ListingReview from '@components/ListingReview';
import ListingFuelType from '@components/ListingFuelType';
import ListingCity from '@components/ListingCity';
import ListingRentPeriod from '@components/ListingRentPeriod';
import ListingSubCategory from '@components/ListingSubCategory';
import ListingEmail from '@components/ListingEmail';

import {toast} from '../Omni';
import IconEn from 'react-native-vector-icons/MaterialCommunityIcons';
import autoMergeLevel1 from 'redux-persist/es/stateReconciler/autoMergeLevel1';
import * as Animatable from 'react-native-animatable';
import {isIphoneX} from 'react-native-iphone-x-helper';

class PostOfferScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: this.props.navigation.getParam('step', 1),
      sellType: undefined,
      sellTypeLabel: undefined,

      listingType: undefined,
      listingTypeLabel: undefined,

      makeID: undefined,
      makeLabel: undefined,

      modelID: undefined,
      modelLabel: undefined,

      colorID: undefined,
      colorLabel: undefined,

      EditingMake: false,
      navObject: {},
      Makes: [],
      Models: [],
      Years: [],
      Colors: [],
      sectionID: undefined,
      rentPeriod: undefined,
      RelatedEntity: undefined,
      userName: this.props.user?.Name || '',
      mileage: '',
      subCategoryLabel: '',
      skipSteps: [],
      EditOffer: this.props.navigation.getParam('EditOffer', false),
      EditOfferLoading: true,
      description:
        this.props.navigation.getParam('Listing', {Description: ''})
          .Description || '',
      price: this.props.navigation.getParam('Listing', {Price: ''})
        .OriginalPrice
        ? this.props.navigation
            .getParam('Listing', {Price: ''})
            .OriginalPrice.toString()
        : '',
      title: this.props.navigation.getParam('Listing', {Name: ''}).Name || '',
      boardNumber:
        this.props.navigation.getParam('Listing', {Name: ''}).Name || '',
      PartNumber:
        this.props.navigation.getParam('Listing', {PartNumber: ''})
          .PartNumber || '',
      email: this.props.user?.Email || '',
      isPaymentPending: false,
    };
  }
  ConvertToPostListing(item, section) {
    // console.log(item);
    //converting for edit
    this.setState(
      {
        RelatedEntity: section ? section.RelatedEntity : undefined,
        sellTypeLabel: this.sellTypes.find((x) => x.ID == item.SellType)
          ? this.sellTypes.find((x) => x.ID == item.SellType).Name
          : '',
        sellType: this.sellTypes.find((x) => x.ID == item.SellType)
          ? this.sellTypes.find((x) => x.ID == item.SellType).ID
          : '',

        listingType: item.TypeID,
        listingTypeLabel: item.TypeName,

        makeID: item.MakeID,
        makeLabel: item.MakeName,

        modelID: item.ModelID,
        modelLabel: item.ModelName,

        colorID: item.ColorID,
        colorLabel: item.ColorLabel,
        sectionID: item.Section,
        sectionLabel: item.SectionName,
        selectedYear: item.Year,
        categoryID: item.CategoryID,
        categoryLabel: item.CategoryName,
        userName: item.OwnerName,
        mileage: item.Consumption,
        cityLabel: item.CityName,
        cityID: item.CityID,
        ID: item.ID,
        phone: item.Phone,
        rentPeriod: this.rentPeriod.find((x) => x.ID == item.RentPeriod)
          ? this.rentPeriod.find((x) => x.ID == item.RentPeriod)
          : '',
        fuelType: this.fuelTypes.find((x) => x.ID == item.FuelType)
          ? this.fuelTypes.find((x) => x.ID == item.FuelType)
          : '',
        condition: this.offerCondition.find((x) => x.ID == item.Condition)
          ? this.offerCondition.find((x) => x.ID == item.Condition)
          : '',
        gearBox: this.gearBoxTrucks.find((x) => x.ID == item.GearBox)
          ? this.gearBoxTrucks.find((x) => x.ID == item.GearBox)
          : '',
        paymentMethod: this.paymentMethods.find(
          (x) => x.ID == item.PaymentMethod
        )
          ? this.paymentMethods.find((x) => x.ID == item.PaymentMethod)
          : '',
      },
      () => {
        this.FindStep(
          //to find the stepArray which is needed to render data in ListingReview

          18,
          this.state.listingType,
          this.state.sellType,
          true
        ).then((result) => {
          this.setState({navObject: result, EditOfferLoading: false});
        });
      }
    );
  }

  componentDidMount = async () => {
    ks.CountriesGet({langid: Languages.langID}).then((CountriesData) => {
      if (CountriesData && CountriesData.Success == '1') {
        this.setState({CountriesData: CountriesData.Countries});
      }
    });

    if (this.state.EditOffer) {
      this.ConvertToPostListing(
        this.props.navigation.getParam('Listing', 0),
        this.props.navigation.getParam('Section', undefined)
      );
      ks.ListingTypesGet({
        langID: Languages.langID,
        parentID: this.props.navigation.getParam('Listing', 0).TypeID,
      }).then((data) => {
        this.setState({Sections: data});
      });

      if (this.props.navigation.getParam('ParentCategory', false)) {
        //  alert("sub");
        this.setState({
          subCategoryLabel: this.props.navigation.getParam('Category', 0).Name,
          categoryLabel: this.props.navigation.getParam('ParentCategory', 0)
            .Name,
        });
      }
    }

    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress
    );

    let years = [];
    for (let i = 1960; i <= new Date().getFullYear(); i++) {
      years.push(i.toString());
    }
    if (new Date().getMonth() >= 6) {
      years.push((new Date().getFullYear() + 1).toString());
    }
    this.setState({Years: years.reverse()});

    if (this.props.user && this.props.user?.Phone && !this.state.EditOffer) {
      //  alert(JSON.stringify(this.props.user));
      this.setState({phone: this.props.user?.Phone});
    }
    ks.ColorsGet({langid: Languages.langID}).then((Colors) => {
      this.setState({Colors});
    });

    if (
      (this.props.user &&
        !this.props.user?.OTPConfirmed &&
        !this.props.user?.EmailRegister) ||
      (this.props.user?.EmailRegister && !this.props.user?.EmailConfirmed)
    ) {
      ks.UserListings({
        langid: Languages.langID,
        page: 1,
        pagesize: 1000,
        offerStatus: 10,
        userid: this.props.user?.ID,
      }).then((data) => {
        //    alert(JSON.stringify(data));
        if (data && data.Success) {
          if (data.Listings && data.Listings.length > 0)
            this.setState({
              VerifyAccount: true,
            });
        }
        this.setState({ListingsLoading: false});
      });
    }

    if (
      this.props.user &&
      (this.props.user?.OTPConfirmed ||
        (this.props.user?.EmailConfirmed &&
          this.props.user?.EmailRegister &&
          this.props.user?.EmailApproved))
    ) {
      let UserData = await ks.UserGet({
        userID: this.props.user?.ID,
        langid: Languages.langID,
      });
      if (UserData.User != null) {
        //  alert(JSON.stringify(UserData.User));
        if (UserData.User.IsActive == false) {
          this.props.navigation.goBack();
          toast(Languages.AccountBlocked, 3500);
        }
        ks.UserListings({
          langid: Languages.langID,
          page: 1,
          pagesize: 1000,
          offerStatus: 16,
          userid: this.props.user?.ID,
        }).then((data) => {
          //    alert(JSON.stringify(data));

          // alert(JSON.stringify(User));

          let userLimit =
            UserData && UserData.User && UserData.User.IsDealer
              ? UserData.User.DealerLimit
              : UserData.User.UserLimit;

          let isDealerPending =
            UserData.User.MemberOf.filter(
              (x) => x.ID == '33333333-3333-3333-3333-333333333333'
            ).length > 0 &&
            !UserData.User.IsDealer &&
            !UserData.User.PaidPlans;
          let isPaymentPending =
            UserData.User.MemberOf.filter(
              (x) => x.ID == '33333333-3333-3333-3333-333333333333'
            ).length > 0 &&
            !UserData.User.IsDealer &&
            UserData.User.PaidPlans;
          this.setState({
            isDealerPending: isDealerPending,
            isDealer:
              UserData.User.IsDealer || isDealerPending || isPaymentPending,
            isPaymentPending,
          });
          if (data && data.Success) {
            if (data.Listings && data.Listings.length >= userLimit) {
              this.setState({limitFull: true});
            }
          }
          this.setState({ListingsLoading: false});
        });
      }
    }

    if (
      this.props.user &&
      this.props.user?.EmailConfirmed &&
      this.props.user?.EmailRegister
    ) {
      let UserData = await ks.UserGet({
        userID: this.props.user?.ID,
        langid: Languages.langID,
      });
      if (UserData.User && UserData.User.EmailApproved == false) {
        let userCountry = this.state.CountriesData.find(
          (country) => country.ISOCode == this.props.user?.ISOCode
        );

        this.setState({
          countryLimit: UserData.User.IsDealer
            ? userCountry.DealerLimit
            : userCountry.Limit,
          showEmailNotApproved: true,
        });
      }
    }
  };

  convertToNumber(number) {
    if (number) {
      number = number + '';
      return number
        .replace(/٠/g, '0')
        .replace(/،/g, '.')
        .replace(/٫/g, '.')
        .replace(/,/g, '.')
        .replace(/١/g, '1')
        .replace(/٢/g, '2')
        .replace(/٣/g, '3')
        .replace(/٤/g, '4')
        .replace(/٥/g, '5')
        .replace(/٦/g, '6')
        .replace(/٧/g, '7')
        .replace(/٨/g, '8')
        .replace(/٩/g, '9');
    } else return '';
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }
  handleBackPress = () => {
    this.handleBack();
    return true;
  };

  FindStep = (
    step,
    listingType,
    sellType = 1,
    loggedIn,
    skipSteps = this.state.skipSteps
  ) => {
    // console.log("step" + step);
    // console.log("listingType" + listingType);

    // console.log("sellType" + sellType);

    // console.log("loggedIn" + loggedIn);
    let counter = 50;

    if (
      this.props.user &&
      (this.props.user?.OTPConfirmed ||
        (this.props.user?.EmailRegister && this.props.user?.EmailConfirmed))
    ) {
      loggedIn = true;
    } else {
      loggedIn = false;
    }
    //  alert(this.state.sectionID);

    if (this.state.sectionID) {
      listingType = this.state.sectionID;
    }
    return new Promise((resolve, reject) => {
      try {
        let stepObj = Constants.addingSteps.find((x) => x.ID == listingType); // should be turned into an await async

        let stepArray = [];
        switch (sellType) {
          case 1:
            stepArray = loggedIn ? stepObj.UserSell : stepObj.GuestSell;
            break;
          case 2:
            stepArray = loggedIn ? stepObj.UserRent : stepObj.GuestRent;
            break;
          case 4:
            stepArray = loggedIn ? stepObj.UserWanted : stepObj.GuestWanted;
            break;
        }
        let index = stepArray.indexOf(step);

        let nextStep =
          stepArray && index < stepArray.length ? stepArray[index + 1] : 1;
        let prevStep = stepArray && index - 1 >= 0 ? stepArray[index - 1] : 1;

        if (skipSteps.includes(nextStep)) {
          let skipStep = skipSteps[skipSteps.length - 1];
          index = stepArray.indexOf(skipStep);
          nextStep =
            stepArray && index < stepArray.length ? stepArray[index + 1] : 1;
        }
        // console.log(`mh ${skipSteps}`);

        // console.log(`mh ${prevStep}`);
        while (skipSteps.includes(prevStep) && counter > 0) {
          // let skipStep = skipSteps[0];
          index = stepArray.indexOf(prevStep);
          prevStep = stepArray && index - 1 >= 0 ? stepArray[index - 1] : 1;

          counter--;
        }

        let result = {
          next: nextStep,
          prev: prevStep,
          stepArray: stepArray,
          stepObj: stepObj,
        };
        //   console.log(result);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };

  resetState() {
    this.setState({
      sellType: undefined,
      sellTypeLabel: undefined,
      makeID: undefined,
      makeLabel: undefined,
      modelID: undefined,
      modelLabel: undefined,
      colorID: undefined,
      colorLabel: undefined,
      Makes: [],
      Models: [],
      sectionID: undefined,
      rentPeriod: undefined,
      RelatedEntity: undefined,
      skipSteps: [],
      mileage: '',
      subCategoryLabel: '',
    });
  }

  renderPage(step) {
    switch (step) {
      case 1:
        return (
          <ListingType
            step={1}
            onClick={(item) => {
              this.resetState();
              this.setState({
                listingType: item.ID,
                listingTypeLabel: item.Name,
                sectionID: undefined,
                RelatedEntity: undefined,
                step: this.state.step + 1,
              });

              ks.ListingTypesGet({
                langID: Languages.langID,
                parentID: item.ID,
              }).then((data) => {
                this.setState({Sections: data});
              });
            }}
            currentStep={this.state.step}
            types={this.props.homePageData.MainTypes}
          />
        );
        break;
      case 2:
        return (
          <ListingSellType
            step={2}
            onClick={(item) => {
              this.setState(
                {sellType: item.ID, sellTypeLabel: item.Name},
                () => {
                  this.FindStep(
                    this.state.step,
                    this.state.listingType,
                    this.state.sellType,
                    this.props.user ? true : false
                  ).then((result) => {
                    this.setState({navObject: result, step: result.next});
                  });
                }
              );
            }}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            types={this.sellTypes}
          />
        );
        break;
      case 3:
        return (
          <ListingSection
            step={3}
            currentStep={this.state.step}
            onClick={(item) => {
              //     alert(JSON.stringify(item));

              this.setState({
                makeID: undefined,
                makeLabel: undefined,
                modelID: undefined,
                modelLabel: undefined,
              });
              this.FindStep(
                this.state.step,
                item.ID,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result}, () => {
                  this.setState(
                    {
                      sectionID: item.ID,
                      sectionLabel: item.Name,
                      RelatedEntity: item.RelatedEntity,
                    },
                    () => {
                      this.setState({step: this.state.navObject.next});
                    }
                  );
                });
              });
            }}
            Sections={this.state.Sections}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
          />
        );
        break;
      case 4:
        return (
          <ListingCategory
            step={4}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            sectionID={this.state.sectionID || ''}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                subCategoryID: undefined,
                subCategoryLabel: undefined,

                categoryID: item.ID,
                categoryLabel: item.Name,
                ChildrenCount: item.ChildrenCount,
                step: item.ChildrenCount > 0 ? 19 : 18,
                isEditing: item.ChildrenCount ? true : false,
              });
            }}
            onClick={(item) => {
              this.setState({
                subCategoryID: undefined,
                subCategoryLabel: undefined,

                categoryID: item.ID,
                categoryLabel: item.Name,
                ChildrenCount: item.ChildrenCount,
                //   step: this.state.navObject.next
              });
            }}
            RelatedEntity={this.state.RelatedEntity}
            FindStep={(item) => {
              let skipStep = item.ChildrenCount < 1 ? 19 : -1;
              let skipSteps = [];
              skipSteps.push(skipStep);
              //if tailer for sale skip makes models 5 6
              if (this.state.listingType == 16) {
                skipSteps = [];
                skipSteps.push(5);
                skipSteps.push(6);
              }

              //if trailer spare parts (256)
              if (this.state.sectionID == 256) {
                skipSteps = [];
                skipStep = item.ChildrenCount < 1 ? 19 : -1;
                if (skipStep > 0) {
                  skipSteps.push(19);
                }
                skipSteps.push(5);
                skipSteps.push(6);
                skipSteps.push(7);
              }

              this.setState({
                skipSteps: skipSteps,
              });
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false,
                skipSteps
              ).then((result) => {
                this.setState({navObject: result, step: result.next});
              });
            }}
          />
        );
        break;
      case 5:
        return (
          <ListingMake
            step={5}
            onClick={(item) => {
              this.setState({
                makeID: item.ID,
                makeLabel: item.Name,
              });
              ks.ModelsGet({
                langID: Languages.langID,
                listingType: this.state.sectionID
                  ? this.state.RelatedEntity
                    ? this.state.RelatedEntity
                    : this.state.sectionID
                  : this.state.listingType,

                makeID: item.ID,
              }).then((data) => {
                data.push({ID: '', Name: Languages.Other});
                this.setState({
                  Models: data,
                  step: this.state.navObject.next,
                });
              });
            }}
            onEditingClick={(item) => {
              // this.setState({
              //   makeID: item.ID,
              //   makeLabel: item.Name,
              //   step: 18,
              //   isEditing: false
              // });
              this.setState({
                makeID: item.ID,
                makeLabel: item.Name,
              });
              ks.ModelsGet({
                langID: Languages.langID,
                listingType: this.state.RelatedEntity
                  ? this.state.RelatedEntity
                  : this.state.listingType,
                makeID: item.ID,
              }).then((data) => {
                this.setState({
                  Models: data,
                  EditingMake: true,
                  step: 6,
                });
              });
            }}
            FindStep={(item) => {
              //alert(JSON.stringify(item));
              let skipSteps = [];

              // || listingType to handle spareparts as thier related entity BUT in case of equipment we as always have a new specail case :(
              //if equipment (4) and for rent (2) or wanted (4) skip model 6
              if (
                this.state.listingType == 4 &&
                (this.state.sellType == 2 || this.state.sellType == 4)
              ) {
                skipSteps = [];
                skipSteps.push(6);
              }
              //if trucks (2) and for rent (2) skip model 6   //sell type
              if (
                this.state.listingType == 2 &&
                (this.state.sellType == 2 || this.state.sellType == 4)
              ) {
                skipSteps = [];
                skipSteps.push(6);
              }
              //if buses and vans (8) and for rent (2) skip model 6
              if (
                (this.state.listingType == 4 || this.state.listingType == 8) &&
                (this.state.sellType == 2 || this.state.sellType == 4)
              ) {
                skipSteps = [];
                skipSteps.push(6);
              }
              //if equipment spare parts and  (1024) and for sale (1) or wanted (4) skip model 6
              if (
                this.state.sectionID == 1024 &&
                (this.state.sellType == 1 || this.state.sellType == 4)
              ) {
                skipSteps = [];
                skipSteps.push(6);
              }

              if (this.state.sectionID == 128 || this.state.sectionID == 512) {
                skipSteps = [];

                skipSteps.push(6);
              }

              //in all cases if makeid is empty then we picked up other so skip model
              if (item.ID == '') {
                skipSteps = [];
                skipSteps.push(6);
                this.setState({
                  modelID: item.ID,
                  modelLabel: Languages.Other,
                  makeLabel: Languages.Other,
                });
              } else if (item.ID < 0) {
                skipSteps = null;
              }

              this.setState({
                skipSteps: skipSteps,
              });

              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false,
                skipSteps
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            sectionID={this.state.sectionID || ''}
            isLoading={this.state.Makes.length < 1}
            RelatedEntity={this.state.RelatedEntity}
            isEditing={this.state.isEditing}

            //    Makes={this.state.Makes}
          />
        );
        break;
      case 6:
        return (
          <ListingModel
            step={6}
            currentStep={this.state.step}
            onClick={(item) => {
              this.setState({
                modelID: item.ID,
                modelLabel: item.Name,
                step: this.state.navObject.next,
              });
            }}
            onEditingClick={(item) => {
              this.setState({
                modelID: item.ID,
                EditingMake: false,
                modelLabel: item.Name,
                step: 18,
                isEditing: false,
              });
            }}
            EditingMake={this.state.EditingMake}
            isEditing={this.state.isEditing}
            makeID={this.state.makeID}
            listingType={this.state.listingType}
            sectionID={this.state.sectionID}
            RelatedEntity={this.state.RelatedEntity}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            Models={this.state.Models}
          />
        );
      case 7:
        return (
          <ListingYear
            step={7}
            currentStep={this.state.step}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                selectedYear: item,
                step: 18,
                isEditing: false,
              });
            }}
            onClick={(item) => {
              this.setState({
                selectedYear: item,
                step: this.state.navObject.next,
              });
            }}
            Years={this.state.Years}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
          />
        );
        break;
      case 8:
        return (
          <ListingCity
            step={8}
            currentStep={this.state.step}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                cityID: item.ID,
                cityLabel: item.Name,
                isEditing: false,
                step: 18,
              });
            }}
            onClick={(item) => {
              this.setState({
                cityID: item.ID,
                cityLabel: item.Name,

                step: this.state.navObject.next,
              });
            }}
            user={this.props.user}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            CountryCode={this.state.CountryCode}
          />
        );
        break;
      case 9:
        return (
          <ListingFuelType
            step={9}
            currentStep={this.state.step}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                fuelType: item,
                isEditing: false,
                step: 18,
              });
            }}
            onClick={(item) => {
              this.setState({
                fuelType: item,
                step: this.state.navObject.next,
              });
            }}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            types={this.fuelTypes}
          />
        );

      case 10:
        return (
          <ListingCondition
            step={10}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                condition: item,
                isEditing: false,
                step: 18,
              });
            }}
            onClick={(item) => {
              this.setState({
                condition: item,
                step: this.state.navObject.next,
              });
            }}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            types={this.offerCondition}
          />
        );
        break;
      case 11:
        return (
          <ListingGearBox
            step={11}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                gearBox: item,
                isEditing: false,
                step: 18,
              });
            }}
            onClick={(item) => {
              this.setState({
                gearBox: item,
                step: this.state.navObject.next,
              });
            }}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            gearBox={this.gearBox}
            gearBoxTrucks={this.gearBoxTrucks}
          />
        );
        break;
      case 12:
        return (
          <ListingPaymentMethod
            step={12}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                paymentMethod: item,
                isEditing: false,
                step: 18,
              });
            }}
            onClick={(item) => {
              this.setState({
                paymentMethod: item,
                step: this.state.navObject.next,
              });
            }}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            types={this.paymentMethods}
          />
        );
        break;
      case 13:
        return (
          <ListingRentPeriod
            step={13}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                rentPeriod: item,
                isEditing: false,
                step: 18,
              });
            }}
            onClick={(item) => {
              this.setState({
                rentPeriod: item,
                step: this.state.navObject.next,
              });
            }}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            types={this.rentPeriod}
          />
        );
        break;
      case 14:
        return (
          <ListingColor
            step={14}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                colorID: item.ID,
                colorLabel: item.Label,
                isEditing: false,
                step: 18,
              });
            }}
            onClick={(item) => {
              this.setState({
                colorID: item.ID,
                colorLabel: item.Label,

                step: this.state.navObject.next,
              });
            }}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            Colors={this.state.Colors}
          />
        );
        break;
      case 15:
        return (
          <ListingMileage
            step={15}
            currentStep={this.state.step}
            sellType={this.state.sellType}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingDone={() => {
              if (this.state.mileage.length > 0)
                this.setState({
                  step: 18,
                  isEditing: false,
                });
              else {
                toast(Languages.invalidInfo);
              }
            }}
            onDone={() => {
              if (this.state.mileage.length > 0)
                this.setState({
                  step: this.state.navObject.next,
                });
              else {
                toast(Languages.invalidInfo);
              }
            }}
            onChangeText={(mileage) => {
              this.setState({
                mileage: this.convertToNumber(mileage),
              });
            }}
            mileage={this.state.mileage}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
          />
        );
        break;
      case 16:
        return (
          <ListingPhone
            step={16}
            currentStep={this.state.step}
            user={this.props.user}
            listingType={this.state.listingType}
            onDone={(phone, CountryCode) => {
              let countries = this.state.CountriesData;
              let iso2 = CountryCode;
              let {user} = this.props;

              let selectedCountry =
                countries &&
                countries.find((x) => x.ISOCode.toLowerCase() == iso2)
                  ? countries.find((x) => x.ISOCode.toLowerCase() == iso2)
                  : null;
              // alert(JSON.stringify(selectedCountry));
              let skipSteps = [];
              if (Array.isArray(this.state.skipSteps)) {
                skipSteps = this.state.skipSteps;
              }

              if (!this.props.user) {
                //not logged in
                if (selectedCountry.EmailRegister) {
                  let index = -1;
                  index = skipSteps.findIndex((x) => x == 20);
                  if (index > -1) {
                    skipSteps.splice(index, 1);
                  }
                } else {
                  if (!skipSteps.includes(20)) {
                    skipSteps.push(20);
                  }
                }
              } else {
                if (
                  user.Country &&
                  user.Phone &&
                  (user.OTPConfirmed || user.EmailRegister)
                ) {
                  //user has country
                  if (user.EmailRegister) {
                    if (!user.EmailConfirmed) {
                      //we want to show step 20
                      let index = -1;
                      index = skipSteps.findIndex((x) => x == 20);
                      if (index > -1) {
                        skipSteps.splice(index, 1);
                      }
                    } else {
                      if (!skipSteps.includes(20)) {
                        // user is email confirmed,  skip 20
                        skipSteps.push(20);
                      }
                    }
                  } else {
                    if (!skipSteps.includes(20)) {
                      skipSteps.push(20);
                    }
                  }
                } else {
                  //user not a guest and does not has a country
                  if (selectedCountry.EmailRegister) {
                    if (!this.props.user?.EmailConfirmed) {
                      //current country is emailregister
                      let index = -1;
                      index = skipSteps.findIndex((x) => x == 20);
                      if (index > -1) {
                        skipSteps.splice(index, 1);
                      }
                    } else {
                      //send this to m7md // if user is already email confirmed && the country is email register , skip the email step
                      if (!skipSteps.includes(20)) {
                        skipSteps.push(20);
                      }
                    }
                  } else {
                    //here user is email confirmed or country not email register
                    if (!skipSteps.includes(20)) {
                      skipSteps.push(20);
                    }
                  }
                }
                if (
                  this.props.user?.EmailConfirmed ||
                  this.props.user?.OtpConfirmed ||
                  this.props.user?.Name
                ) {
                  //if any confirmed remove username step
                  if (!skipSteps.includes(17)) {
                    skipSteps.push(17);
                  }
                }
              }
              console.log(skipSteps);
              this.setState({skipSteps: skipSteps}, (data) => {
                this.FindStep(
                  this.state.step,
                  this.state.listingType,
                  this.state.sellType,
                  this.props.user ? true : false
                ).then((result) => {
                  this.setState({navObject: result}, (data) => {
                    this.setState({
                      phone,
                      CountryCode,
                      step: this.state.navObject.next,
                    });
                  });
                });
              });
            }}
            isEditing={this.state.isEditing}
            onEditingDone={(phone, CountryCode, EmailRegister) => {
              if (
                (EmailRegister && !this.props.user) ||
                (EmailRegister && this.props.user?.EmailConfirmed == false)
              ) {
                this.setState({
                  phone,
                  CountryCode,
                  step: 20,
                  //    isEditing: false
                });
              } else {
                this.setState({
                  phone,
                  CountryCode,
                  step: 8,
                  //    isEditing: false
                });
              }
            }}
            onChangePhoneNumber={(phone) => {
              this.setState({phone});
            }}
            phone={this.state.phone}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            CountriesData={this.state.CountriesData}
          />
        );
        break;
      case 17:
        return (
          <ListingUserName
            step={17}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingDone={() => {
              if (this.state.userName.length > 0)
                this.setState({
                  step: 18,
                  isEditing: false,
                });
              else {
                toast(Languages.invalidInfo);
              }
            }}
            onDone={() => {
              if (this.state.userName.length > 0)
                this.setState({
                  step: this.state.navObject.next,
                });
              else {
                toast(Languages.invalidInfo);
              }
            }}
            onChangeText={(userName) => {
              this.setState({userName});
            }}
            userName={this.state.userName}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
          />
        );
        break;
      case 18:
        return (
          <ListingReview
            step={18}
            EditOfferLoading={
              this.state.EditOfferLoading && this.state.EditOffer
            }
            CountryCode={this.state.CountryCode}
            CountriesData={this.state.CountriesData}
            data={this.state}
            stepArray={this.state.navObject.stepArray}
            isSubCat={(val) => {
              this.setState({isSubCat: val});
            }}
            goToStep={(step, isEditing) => {
              if (isEditing) {
                this.setState({step, isEditing: true});
              } else {
                this.setState({step});
              }
            }}
            onChangeDesc={(description) => {
              this.setState({description});
            }}
            description={this.state.description}
            onChangePrice={(price) => {
              this.setState({price});
            }}
            price={this.state.price}
            onChangeTitle={(title) => {
              if (title == ' ') return;
              let formattedTitle = this.convertToNumber(title);
              this.setState({title: formattedTitle});
            }}
            onChangePartNumber={(PartNumber) => {
              if (PartNumber == ' ') return;

              let formattedPartNumber = this.convertToNumber(PartNumber);
              this.setState({PartNumber: formattedPartNumber});
            }}
            partNumber={this.state.PartNumber}
            title={this.state.title}
            onChangeBoard={(boardNumber) => {
              if (boardNumber == ' ') return;

              let formattedBoardNumber = this.convertToNumber(boardNumber);

              this.setState({boardNumber: formattedBoardNumber});
            }}
            boardNumber={this.state.boardNumber}
            navigation={this.props.navigation}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
            types={this.offerCondition}
          />
        );
        break;

      case 19:
        return (
          <ListingSubCategory
            step={19}
            currentStep={this.state.step}
            categoryID={this.state.categoryID}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingClick={(item) => {
              this.setState({
                subCategoryID: item.ID,
                subCategoryLabel: item.Name,
                step: 18,
                isEditing: false,
              });
            }}
            sectionID={this.state.sectionID || ''}
            onClick={(item) => {
              this.setState({
                subCategoryID: item.ID,
                subCategoryLabel: item.Name,

                step: this.state.navObject.next,
              });
            }}
            RelatedEntity={this.state.RelatedEntity}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
          />
        );
        break;

      case 20:
        return (
          <ListingEmail
            step={20}
            currentStep={this.state.step}
            listingType={this.state.listingType}
            isEditing={this.state.isEditing}
            onEditingDone={() => {
              if (this.state.email.length > 0)
                this.setState({
                  step: 8,

                  isEditing: false,
                  email: this.state.email?.trim(),
                });
              else {
                toast(Languages.invalidInfo);
              }
            }}
            onDone={() => {
              if (this.state.email.length > 0)
                this.setState({
                  step: this.state.navObject.next,
                  email: this.state.email?.trim(),
                });
              else {
                toast(Languages.invalidInfo);
              }
            }}
            onChangeText={(email) => {
              this.setState({email});
            }}
            email={this.state.email}
            FindStep={() => {
              this.FindStep(
                this.state.step,
                this.state.listingType,
                this.state.sellType,
                this.props.user ? true : false
              ).then((result) => {
                this.setState({navObject: result});
              });
            }}
          />
        );
        break;
    }
  }

  handleBack() {
    let skipSteps = [];
    if (this.state.isEditing && this.state.phone.length < 9) {
      toast(Languages.InvalidNumber);
    } else if (this.state.EditOffer && this.state.step == 18) {
      this.props.navigation.navigate('ActiveOffers', {
        userid: this.props.user?.ID,
        status: 16,
        active: true,
      });
    } else if (this.state.EditingMake) {
      Alert.alert('', Languages.MustChooseModel);
      //  this.setState({  EditingMake: false });
    } else if (this.state.isEditing) {
      this.setState({step: 18, isEditing: false});
    } else if (this.state.step == 1) {
      this.props.navigation.goBack();
    } else if (this.state.step == 2) {
      this.setState({
        step: this.state.step - 1,
      });
    } else if (this.state.step == 5 || this.state.step == 4) {
      if (this.state.ChildrenCount < 1) {
        skipSteps.push(19);
      }

      this.FindStep(
        this.state.step,
        this.state.listingType,
        this.state.sellType,
        this.props.user ? true : false,
        skipSteps
      ).then((result) => {
        this.setState({step: result.prev});
      });
    } else {
      this.setState({
        step: this.state.navObject.prev,
      });
    }
  }

  renderHeader() {
    return (
      <View
        style={{
          paddingTop: Platform.OS == 'ios' ? 40 : 0,
          marginBottom: 5,
          height: Platform.OS == 'ios' ? 90 : 60,
          flexDirection: 'row',
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: {
            width: 1,
            height: 2,
          },
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <HeaderBackButton
          labelVisible={false}
          tintColor="#000"
          style={{flex: 1}}
          onPress={() => {
            this.handleBack();
          }}
        />
        {this.state.VerifyAccount ? (
          <Text
            style={{
              color: '#000',
              fontSize: Constants.mediumFont,
              textAlign: 'center',
              flex: 5,
            }}
          >
            {Languages.Warning}
          </Text>
        ) : (
          <Text
            style={{
              color: '#000',
              fontSize: Constants.mediumFont,
              textAlign: 'center',
              flex: 5,
            }}
          >
            {this.state.step == 15 &&
            this.state.sellType == 1 &&
            this.state.listingType == 4
              ? Languages.EnterWorkingHours
              : Languages.stepTitle[this.state.step - 1]}
          </Text>
        )}
        <TouchableOpacity
          style={{
            flex: 1,
            // marginRight: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            Alert.alert(
              Languages.AreYouSureExit,
              null,
              [
                {
                  text: Languages.Cancel,
                  onPress: () => {},
                  style: 'cancel',
                },
                {
                  text: Languages.Ok,
                  onPress: () => {
                    this.props.navigation.goBack();
                  },
                },
              ],
              {cancelable: false}
            );
          }}
        >
          <IconEn name="close" size={30} color={'#000'} />
        </TouchableOpacity>
      </View>
    );
  }

  renderVerify() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {this.props.user?.EmailRegister && !this.props.user?.EmailConfirmed ? (
          <Text style={{color: '#000', textAlign: 'center', fontSize: 21}}>
            {Languages.CantAddOfferUntilVerifyEmail +
              ' ' +
              this.props.user?.Email || Languages.SomethingWentWrong}{' '}
          </Text>
        ) : (
          <Text style={{color: '#000', textAlign: 'center', fontSize: 21}}>
            {Languages.CantAddOfferUntilVerify +
              ' ' +
              this.props.user?.Phone.replace('+', '') ||
              Languages.SomethingWentWrong}{' '}
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: Dimensions.get('screen').width,
            justifyContent: 'space-around',
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: Color.secondary,
              paddingVertical: 5,
              borderRadius: 5,
              flexGrow: 0,
              marginTop: 15,
              paddingHorizontal: 20,
            }}
            onPress={() => {
              this.props.navigation.replace('EditProfile', {
                ChangePhone:
                  this.props.user?.EmailRegister &&
                  !this.props.user?.EmailConfirmed
                    ? false
                    : true,
                ChangeEmail:
                  this.props.user?.EmailRegister &&
                  !this.props.user?.EmailConfirmed,
              });
            }}
          >
            <Text style={{color: '#fff', fontSize: 20}}>
              {this.props.user?.EmailRegister &&
              !this.props.user?.EmailConfirmed
                ? Languages.ChangeEmail
                : Languages.ChangeNumber}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              paddingVertical: 5,
              borderRadius: 5,
              flexGrow: 0,
              marginTop: 15,
              paddingHorizontal: 20,
            }}
            onPress={() => {
              this.props.navigation.replace('EditProfile', {
                VerifyPhone: !(
                  this.props.user?.EmailRegister &&
                  !this.props.user?.EmailConfirmed
                ),
                VerifyEmail:
                  this.props.user?.EmailRegister &&
                  !this.props.user?.EmailConfirmed,
              });
            }}
          >
            <Text style={{color: '#fff', fontSize: 20}}>
              {Languages.VerifyNow}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderEmailNotApproved() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {
          <Text style={{color: '#000', textAlign: 'center', fontSize: 21}}>
            {Languages.EmailApprovalAccountReview.replace(
              '{0}',
              this.state.countryLimit
            )}
          </Text>
        }
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: Dimensions.get('screen').width,
            justifyContent: 'space-around',
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              paddingVertical: 5,
              borderRadius: 5,
              flexGrow: 0,
              marginTop: 15,
              paddingHorizontal: 20,
            }}
            onPress={() => {
              this.props.navigation.navigate('HomeScreen');
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                paddingHorizontal: 20,
                textAlign: 'center',
              }}
            >
              {Languages.Ok}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderFullLimit() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <Text style={{color: '#000', textAlign: 'center', fontSize: 21}}>
          {Languages.ExhaustedActiveOffers}
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: 'green',
            paddingVertical: 5,
            borderRadius: 5,
            flexGrow: 0,
            marginTop: 15,
            paddingHorizontal: 20,
          }}
          onPress={() => {
            this.props.navigation.goBack();
            this.props.navigation.navigate('ActiveOffers', {
              userid: this.props.user && this.props.user?.ID,
              status: 16,
              active: true,
            });
          }}
        >
          <Text style={{color: '#fff', fontSize: 20}}>
            {Languages.DeactivateNow}
          </Text>
        </TouchableOpacity>

        {!this.state.isDealer && (
          <Text style={{textAlign: 'center', marginTop: 10}}>
            {Languages.IfYouAreADealer}
          </Text>
        )}

        {!this.state.isDealer && (
          <TouchableOpacity
            style={{
              backgroundColor: Color.primary,
              paddingVertical: 5,
              borderRadius: 5,
              width: 'auto',
              marginTop: 15,
              paddingHorizontal: 20,
            }}
            onPress={() => {
              this.props.navigation.navigate('DealerSignUp', {
                BecomeADealer: true,
              });
            }}
          >
            <Text style={{color: '#fff', fontSize: 20}}>
              {Languages.BecomeADealer}
            </Text>
          </TouchableOpacity>
        )}

        {this.state.isDealerPending && (
          <View style={{}}>
            <Animatable.Text
              useNativeDriver
              iterationCount="infinite"
              animation="flash"
              iterationDelay={5000}
              iterationDelay={1000}
              duration={3000}
              //  delay={1000}
              style={{
                textAlign: 'center',
                marginTop: 10,
                fontSize: 18,
                color: Color.primary,
                fontFamily: 'Cairo-Bold',
              }}
            >
              {Languages.DealerPendingApproval}
            </Animatable.Text>
          </View>
        )}
        {this.state.isPaymentPending && (
          <View style={{}}>
            <Animatable.Text
              useNativeDriver
              iterationCount="infinite"
              animation="flash"
              iterationDelay={5000}
              iterationDelay={1000}
              duration={3000}
              //  delay={1000}
              style={{
                textAlign: 'center',
                marginTop: 10,
                fontSize: 18,
                color: Color.primary,
                fontFamily: 'Cairo-Bold',
              }}
            >
              {Languages.AbleToAddNewAd}
            </Animatable.Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'green',
                paddingVertical: 5,
                borderRadius: 5,
                flexGrow: 0,
                marginTop: 15,
                paddingHorizontal: 20,
              }}
              onPress={() => {
                this.props.navigation.replace('SubscriptionsScreen', {
                  ISOCode: this.props.user?.ISOCode,
                  User: this.props.user,
                });
              }}
            >
              <Text style={{color: '#fff', fontSize: 20, textAlign: 'center'}}>
                {Languages.Subscribe}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  render() {
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
    this.gearBox = [
      {
        ID: 1,
        Name: Languages.Automatic,
      },
      {
        ID: 2,
        Name: Languages.Manual,
      },
    ];
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
    this.paymentMethods = [
      {
        ID: 1,
        Name: Languages.Cash,
      },
      {
        ID: 2,
        Name: Languages.CashOrPremium,
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

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <StatusBar backgroundColor={'#fff'} barStyle="dark-content" />

        {this.renderHeader()}

        {this.state.VerifyAccount
          ? this.renderVerify()
          : this.state.showEmailNotApproved
          ? this.renderEmailNotApproved()
          : this.state.limitFull && !this.state.EditOffer
          ? this.renderFullLimit()
          : this.renderPage(this.state.step)}
      </View>
    );
  }
}

const mapStateToProps = ({home, user}) => {
  return {
    homePageData: home.homePageData,
    finished: home.finished,
    isFetching: home.isFetching,
    user: user.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  const {actions} = require('@redux/HomeRedux');
  return {
    HomeScreenGet: (langId, callback) =>
      actions.HomeScreenGet(dispatch, langId, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PostOfferScreen);
