import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Image,
  TouchableOpacity
} from "react-native";
import KS from "@services/KSAPI";
import { Languages, Color } from "@common";
import {
  LogoSpinner,
  RowListingsComponent,
  BannerListingsComponent
} from "@components";
import NewHeader from "../containers/NewHeader";
import Moment from "moment";
import IconFa from "react-native-vector-icons/FontAwesome";

class ActiveOffers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      ListingsLoading: true,
      UserLoading: true
    };
  }

  componentDidMount() {
    try {
      KS.UserGet({
        userID: this.props.navigation.getParam("userid", null),
        langid: Languages.langID
      }).then(data => {
        //   alert(JSON.stringify(data));
        if (data && data.Success == 1) {
          this.setState({
            UserLoading: false,
            User: data.User
          });
        } else {
          this.setState({
            UserLoading: false
          });
        }
      });

      KS.UserListings({
        langid: Languages.langID,
        page: 1,
        pagesize: 5,
        offerStatus: 10,
        userid: this.props.navigation.getParam("userid", null)
      }).then(data => {
        //    alert(JSON.stringify(data));
        if (data && data.Success) {
          this.setState({
            Listings: data.Listings,
            TotalPages: data.TotalPages
          });
        }
        this.setState({ ListingsLoading: false });
      });
    } catch (e) {
      alert(JSON.stringify(e));
      //    this.setState({ ListingsLoading: false, UserLoading: false });
    }
  }

  render() {
    if (this.state.ListingsLoading || this.state.UserLoading) {
      return (
        <View style={{ flex: 1 }}>
          <NewHeader
            navigation={this.props.navigation}
            HomeScreen
            onCountryChange={item => {
              this.setState({ cca2: item.cca2 });
            }}
          />
          <LogoSpinner fullStretch />
        </View>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        style={{ backgroundColor: "#eee" }}
      >
        <StatusBar
          backgroundColor="#fff"
          barStyle="dark-content"
          translucent={false}
        />

        <NewHeader
          navigation={this.props.navigation}
          back
          onCountryChange={item => {
            this.setState({ cca2: item.cca2 });
          }}
        />

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            alignItems: "center",
            paddingVertical: 10
            //  paddingVertical: 20
          }}
          data={this.state.Listings}
          renderItem={({ item, index }) => {
            return (
              <BannerListingsComponent
                key={index}
                activeOffers
                onDelete={() => {
          //        alert("Waiting Mohammad impementation");
                }}
                item={item}
                navigation={this.props.navigation}
              />
            );
          }}
          onEndReached={() => {
            this.setState({ page: this.state.page + 1 }, () => {
              if (this.state.page <= this.state.TotalPages) {
                this.setState({ footerLoading: true });

                KS.UserListings({
                  langid: Languages.langID,
                  page: 1,
                  pagesize: 5,
                  offerStatus: 10,
                  userid: this.props.navigation.getParam("userid", null)
                }).then(data => {
                  if (data && data.Success) {
                    let concattedListings = this.state.Listings.concat(
                      data.Listings
                    );
                    this.setState({
                      Listings: concattedListings,
                      footerLoading: false
                    });
                  }
                  this.setState({ ListingsLoading: false });
                });
              }
            });
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            this.state.footerLoading && (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10
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

export default ActiveOffers;
