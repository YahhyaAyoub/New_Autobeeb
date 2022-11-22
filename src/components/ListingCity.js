import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  I18nManager,
} from 'react-native';
import {Color, Images, Styles, Constants, Languages, Icons} from '@common';
import IconEn from 'react-native-vector-icons/Entypo';
import ks from '@services/KSAPI';
import {SearchableFlatList} from 'react-native-searchable-list';
import {LogoSpinner} from '@components';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ListingCity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Cities: [],
      fullCities: [],
      isLoading: true,
    };
  }
  componentDidMount() {
    this.setState({isLoading: true});

    ks.CitiesGet({
      langID: Languages.langID,
      isoCode:
        this.props.CountryCode || this.props.user.ISOCode || this.state.cca2,
    }).then((Cities) => {
      this.setState({Cities, fullCities: Cities});
      this.setState({isLoading: false});
    });

    this.props.FindStep();
  }

  renderItem({item, index}) {
    return (
      <TouchableOpacity
        key={index}
        style={styles.row}
        onPress={() => {
          if (!this.props.isEditing) {
            this.props.onClick(item);
          } else {
            this.props.onEditingClick(item);
          }
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.FullImagePath && (
            <Image
              style={{
                width: 40,
                height: 40,
                // tintColor: "#636363"
              }}
              resizeMode={'contain'}
              source={{
                uri:
                  'https://autobeeb.com/' + item.FullImagePath + '_50x50.png',
              }}
            />
          )}
          <Text
            style={{
              color: '#333',
              marginLeft: 20,
              fontSize: Constants.mediumFont,
            }}
          >
            {item.Name}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  render() {
    let tempCities = [];

    if (this.state.isLoading) {
      return <LogoSpinner fullStretch={true} />;
    } else
      return (
        <View style={{}}>
          <TextInput
            contextMenuHidden={true}
            style={{
              height: 60,
              borderColor: Color.secondary,
              borderBottomWidth: 1,
              paddingHorizontal: 15,
              paddingVertical:0,
              fontSize: Constants.mediumFont,
              fontFamily: 'Cairo-Regular',
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            }}
            placeholder={Languages.Search}
            onChangeText={(text) => {
              tempCities = this.state.fullCities.filter((item) => {
                return item.Name.toUpperCase().includes(text.toUpperCase());
              });
              this.setState({Cities: tempCities, text});
            }}
            value={this.state.text}
          />

          <FlatList
            data={this.state.Cities || []}
            keyExtractor={(item, index) => index.toString()}
            //  style={{ flex: 1 }}
            extraData={this.state}
            contentContainerStyle={{paddingBottom: 150}}
            renderItem={this.renderItem.bind(this)}
          />
        </View>
      );
  }
}
const styles = StyleSheet.create({
  whiteContainer: {
    //  marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
});

export default ListingCity;
