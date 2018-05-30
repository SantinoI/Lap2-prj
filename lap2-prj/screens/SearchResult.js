import React from "react";
import {
  StyleSheet,
  Platform,
  Text,
  ScrollView,
  View,
  FlatList,
  TouchableHighlight,
  TextInput
} from "react-native";
import { Permissions, Location } from "expo";

import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigator } from "react-navigation";
import { TabNavigator } from "react-navigation";

import { SearchBar, Button } from "react-native-elements";

import EventCard from "../components/EventCard";

import * as firebase from "firebase";

const TINT_COLOR = "rgb(4, 159, 239)";


const cardList = [
  { nomeEvento: "Evento1", localita: "località1", agenzia: "agenzia1"}
];

export default class Home extends React.Component {
  state = {
    cardList: cardList,
    request: "",
  };

  async componentWillMount(){
    let item = this.props.navigation.state.params.request;
      console.log(item);
      if (item) {
        this.setState({request: item});
      }
  }

  renderCard = ({item}) => (
    <EventCard data={item}/>
  )

  _keyExtractor = (item, index) => {
    item.id = index;
    String(index);
  };

  render() {
    return (
      <ScrollView>
        <View style={styles.searchContainer}>
          <Text>{this.state.request}</Text>
          <FlatList
            data={this.state.cardList}
            renderItem={this.renderCard}
            keyExtractor={this._keyExtractor}
          />
        </View>
      </ScrollView>
    );
  }   
}

Home.navigationOptions = ({ navigation }) => {
  return {
    title: "SearchResult",
    headerStyle: {}
  };
};

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    marginTop: 150,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "#ecf0f1"
  },
  searchBar: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "white"
  }
});
