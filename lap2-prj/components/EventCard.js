import React, { Component } from 'react';
import { Image, TouchableOpacity, Text} from 'react-native';
import {  Card, CardItem, Thumbnail, Left, Body, Right } from 'native-base';
import { Feather } from "@expo/vector-icons";



export default class EventCard extends Component {

  componentWillMount() {
    //this.props.checkFavorite()
  }

  render() {
    
    return (
      <TouchableOpacity onPress={this.props.onEventPress}>
      <Card style={{ marginLeft: 10, marginRight: 10, borderRadius: 25}}>
       
        {/* IMMAGINE UTENTE - EVENTO - AGENZIA - PREZZO */}
        <CardItem style={{borderRadius: 25}}>

          <Left style={{flex:0.8}}>
            <TouchableOpacity>
            <Thumbnail source={{uri: this.props.data.immagineAgenzia}} /> 
            </TouchableOpacity>
            <Body>
              <Text style={{fontSize: 20}}>{this.props.data.nomeEvento}</Text>
              <TouchableOpacity onPress={this.props.onManagerPress}>
                <Text note style={{color: 'gray'}}>{this.props.data.agenzia}</Text>
              </TouchableOpacity>
            </Body>
          </Left>

          <Right style={{flex:0.2}}>
            <Text>{this.props.data.prezzo}</Text>
          </Right>

        </CardItem>
      
        {/* IMMAGINE EVENTO */}
        <CardItem cardBody >

          <Image  style={{borderRadius: 5, marginLeft: 5, marginRight: 5, height: 200, width: null, flex: 1}}
                  source={{uri: this.props.data.immagineEvento}}
           />

        </CardItem>

        {/* LOCALITA' - DESCRIZIONE - FAVORITE */}
        <CardItem content style={{borderRadius: 25}}>
  
          <Left style={{flex:0.8, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={{fontStyle: 'italic'}}>{this.props.data.citta}</Text>
            <Text>{this.props.data.descrizioneBreve}</Text>
          </Left>

          <Right style={{flex:0.2}}>
            <TouchableOpacity onPress={this.props.onFavorite}>
                   {this.props.data.favorite ? (
                     <Feather name="heart" size={25} color="red"/>) : (
                     <Feather name="heart" size={25} color="black"/>)}
            </TouchableOpacity>
          </Right>

        </CardItem>
      </Card>
      </TouchableOpacity>
    )
  }
}

