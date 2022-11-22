import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  StatusBar,
  I18nManager
} from "react-native";
import { NewHeader } from "@containers";
import {
  TabBarIcon,
  CartIcons,
  NavigationBarIcon,
  HorizontalList,
  SliderMainSubCat,
  LogoSpinner,
  Banner,
  ProductPrice,
  WishListIcon,
  PostLayout,
  MainListingsComponent
} from "@components";
import AddButton from "@components/AddAdvButton";
import IconMa from "react-native-vector-icons/MaterialIcons";
import IconFa from "react-native-vector-icons/FontAwesome";
import IconFE from "react-native-vector-icons/Feather";
import IconEn from "react-native-vector-icons/Entypo";

import IconMC from "react-native-vector-icons/MaterialCommunityIcons";

import IconIon from "react-native-vector-icons/Ionicons";
import { Languages, Constants, Color } from "@common";

import KS from "@services/KSAPI";

class CategoriesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCategoriesFetching: true,
      isMakesLoading: true
    };
  }
  componentDidMount() {
    KS.MakesGet({
      langID: Languages.langID,
      listingType: this.props.navigation.getParam("ListingType", 0).ID
    }).then(data => {
      let AllMakes = {
        //  FullImagePath: "yaz",
        Image: require("@images/SellTypes/BlueAll.png"),
        AllMake: true,
        All: true,
        ID: "",
        Name: Languages.AllMakes
      };
      data.unshift(AllMakes);
      this.setState({
        Makes: data,
        FullMakes: data,
        isMakesLoading: false
      });
    });

    KS.TypeCategoriesGet({
      langID: Languages.langID,
      typeID: this.props.navigation.getParam("ListingType", 0).ID
    }).then(data => {
      let AllMakes = {
        ID: "",
        //  FullImagePath: "yaz",
        Image: require("@images/SellTypes/BlueAll.png"),
        AllMake: true,
        All: true,
        Name: Languages.All
      };
      data.unshift(AllMakes);
      this.setState({
        Categories: data,
        FullCategories: data,
        isCategoriesFetching: false
      });
    });
  }

  renderCatRow({ item }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          this.props.navigation.navigate("ListingsScreen", {
            ListingType: this.props.navigation.getParam("ListingType", 0),
            SellType: this.props.navigation.getParam("SellType", 0),
            selectedMake: this.state.Makes[0],
            CategoryID: item.ID,
            selectedCategory: item,
            Makes: this.state.Makes
          });
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {item.FullImagePath && (
            <Image
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
              tintColor={Color.primary}
              source={{
                uri:
                  "https://autobeeb.com/" + item.FullImagePath + "_300x150.png"
              }}
            />
          )}

          {item.Image && (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: 50
              }}
            >
              <Image
                style={{ width: 25, height: 20, tintColor: Color.primary }}
                resizeMode="contain"
                tintColor={Color.primary}
                source={item.Image}
              />
            </View>
          )}
          <Text
            style={{
              color: "#333",
              marginLeft: 15,
              fontSize: Constants.mediumFont
            }}
          >
            {item.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? "chevron-small-left" : "chevron-small-right"
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  render() {
    if (this.state.isCategoriesFetching || this.state.isMakesLoading) {
      return (
        <View style={{ flex: 1 }}>
          <NewHeader navigation={this.props.navigation} back blue make />

          <LogoSpinner fullStretch={true} />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
        {false && (
          <StatusBar
            backgroundColor={Color.secondary}
            barStyle="light-content"
          />
        )}

        <NewHeader navigation={this.props.navigation} back blue make />
        <AddButton navigation={this.props.navigation} />

        {false && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 15
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  marginLeft: 20,

                  color: "#000"
                }}
              >
                {this.props.navigation.getParam("ListingType", 0).Name}
              </Text>

              <IconEn
                name={
                  I18nManager.isRTL
                    ? "chevron-small-left"
                    : "chevron-small-right"
                }
                size={25}
                color="#000"
                style={{ marginTop: 3 }}
              />
            </View>

            <Text
              style={{
                fontSize: 20,
                marginLeft: 10,

                color: "#000"
              }}
            >
              {this.props.navigation.getParam("ListingType", 0).Name +
                " " +
                this.props.navigation.getParam("SellType", 0).Name}
            </Text>
          </View>
        )}

        <TextInput
          style={[
            styles.whiteContainer,
            {
              height: 40,
              fontFamily: "Cairo-Regular",
              elevation: 1,
              textAlign: I18nManager.isRTL ? "right" : "left",

              //        borderColor: Color.secondary,
              borderBottomWidth: 1,
              paddingHorizontal: 15,
              marginBottom: 0,
              fontSize: Constants.mediumFont
            }
          ]}
          placeholder={Languages.Search}
          onChangeText={text => {
            tempCats = this.state.FullCategories.filter(item => {
              return item.Name.toUpperCase().includes(text.toUpperCase());
            });
            this.setState({ Categories: tempCats, text });
          }}
          value={this.state.text}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          style={styles.whiteContainer}
          data={this.state.Categories}
          renderItem={this.renderCatRow.bind(this)}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  whiteContainer: {
    //  marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    justifyContent: "space-between"
  }
});
export default CategoriesScreen;
