import React from "react";
import {
  StyleSheet,
  Platform,
  Text,
  ScrollView,
  ActionSheetIOS,
  View,  
  TouchableOpacity,
  Image,
  Alert
} from "react-native";
import {Input, Label, Item, Card, CardItem, Left, Container } from 'native-base';

import { ImagePicker, ImageManipulator } from "expo";

import DatePicker from 'react-native-datepicker'
import { Permissions} from "expo";

import * as firebase from "firebase";

const TINT_COLOR = "#39b9c3";
const BACKGROUND_COLOR = "#d7e4e5";


export default class NewEventPage extends React.Component {
  state = {
      image: '',
      nomeEvento: '',
      regione: '',
      provincia: '',
      citta: '',
      data: '',
      orario: '',
      prezzo: '',
      descrizioneBreve: '',
      descrizioneCompleta: '',
      isLoading: false,
      id_evento: ""
  }

  //FUNZIONE PER CARICARE DATI
  upload_event_data = () => {

    // crea un id per il nuovo evento
    var id = firebase
    .database()
    .ref("App/" + "Events/")
    .push(data);
    var id_evento = id.key;
    this.setState({id_evento: id_evento});
    
    const localita = {
      Regione: this.state.regione,
      Provincia: this.state.provincia,
      Citta: this.state.citta,
     }
    const data = {
      IDevento: id_evento,
      ImmagineEvento: this.state.image,
      NomeEvento: this.state.nomeEvento,
      Localita: localita,
      Data: this.state.data,
      Orario: this.state.orario,
      Prezzo: this.state.prezzo,
      DescrizioneBreve: this.state.descrizioneBreve,
      DescrizioneCompleta: this.state.descrizioneCompleta,
      ImmagineAgenzia: this.props.navigation.state.params.profileImage,
      Agenzia: this.props.navigation.state.params.username,
      IDorganizzatore: this.props.navigation.state.params.idOrganizzatore,
      Sede: this.props.navigation.state.params.sede,
      Email: this.props.navigation.state.params.email,
      Numero: this.props.navigation.state.params.numero,
    };

    firebase
      .database()
      .ref("App/" + "Events/" + id_evento)
      .update(data);
    
    this._uploadImage(this.state.image);
  };
    

  //FUNZIONE DI CONTROLLO
  _upLoad = () => {
    //controlli sulla compilazione di tutti i campi
    if (
      !(
        this.state.image 

      )
    ) {
      Alert.alert(
        "Riempi i campi vuoti per poter creare l'evento",
        "",
        [
          {
            text: "Cancella",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          }
        ],
        { cancelable: false }
      );
      return;
    }
  
     this.upload_event_data();
     Alert.alert(
      "Inserimento avvenuto con successo!",
        "",
        [
           {
            text: "Continua",
             onPress: () => console.log("Evento creato con successo!"),
             style: "cancel"
           }
         ],
         { cancelable: false }
       );
     this.props.navigation.navigate("Profile");
      
      
  };


  //Apertura galleria per choosing foto profilo utente
    _openPhotoGallery = async () => {
      const { status } = await Permissions.getAsync(Permissions.CAMERA_ROLL);
      if (status !== "granted") {
        const result = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (result.status !== "granted") {
          alert("Consenti l'accesso alla galleria");
          return;
        }
      }
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.cancelled) {
        console.log(result);
        // Resize the image
        const manipResult = await ImageManipulator.manipulate(
          result.uri,
          [{ resize: { width: 375 } }],
          { format: "png" }
        );
        console.log(manipResult);
        this.setState({ image: manipResult.uri });
      }
    };
  
    _selectPhoto = () => {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Fotocamera", "Galleria", "Cancella"],
            cancelButtonIndex: 2,
            title: "Scegli immagine da:"
          },
          buttonIndex => {
            if (buttonIndex == 1) {
              this._openPhotoGallery();
            }
          }
        );
      }
      else{
        Alert.alert(
          'Seleziona immagine',
          'Seleziona un immagine da utilizzare come immagine evento',
          [
            {text: 'Apri galleria', onPress: () => this._openPhotoGallery()},
            {text: 'Cancella', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            
          ],
          { cancelable: false }
        )
      }
    };
    
    //Carimecameno foto
    _uploadImage = async localURI => {
      //const id_evento = id.key;
      const uid = firebase.auth().currentUser.uid;
      const response = await fetch(localURI);
      const blob = await response.blob();
      const ref = firebase
        .storage()
        .ref("Users/" + uid +"/EventsImages/"+ this.state.nomeEvento )
        const uploadStatus = await ref.put(blob);
        const downloadURL = await uploadStatus.ref.getDownloadURL();

      await firebase
      .database()
      .ref("App/Events/" + this.state.id_evento)
      .update({ImmagineEvento: downloadURL})
      //this.setState({image : downloadURL});
      console.log("download url:" + downloadURL)
    };


    // FUNZIONI PER OTTENERE DATA CORRENTE
  _getCurrentDate=()=>{
    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();
    return  year+ '-' + month + '-' + date;
   }

   _getCurrentDay=()=>{
     var day = new Date().getDate();
     return day;}
   _getCurrentMonth=()=>{
     var month = new Date().getMonth() + 1;
     return month;}
   _getCurrentYear=()=>{
     var year = new Date().getFullYear();
     return year;}

 


  render() {
    return (
      <Container style={{ backgroundColor : BACKGROUND_COLOR}}>
        <ScrollView>
          <Card style={{ marginLeft: 10, marginRight: 10, borderRadius: 10}}>
          
              {/* IMMAGINE EVENTO */}
              <TouchableOpacity
                style={{  alignSelf: "center" }}
                onPress={this._selectPhoto}
                
               >
                 <Image  style={{margin: 10, borderRadius:10, height: 200, width: 335}}
                         source = {  this.state.image ?  { uri: this.state.image } :
                                                           require("../assets/selectImage.png")}/>
               </TouchableOpacity>


              {/* Nome Evento */}
              <CardItem  style={{borderColor: BACKGROUND_COLOR, borderWidth: 1, marginLeft: 10, marginRight: 5, marginBottom: 5, borderRadius: 10}} >
                <Left style={{}}>
                    {/* <Image style={{width:23, height: 23, marginRight:10}} source={require('../assets/description.png')}/> */}
                    <Item floatingLabel style={{ marginTop: 0 }}>
                       <Label style={{fontSize: 14, textAlign: 'center'}}>Inserisci Nome Evento</Label>
                       <Input
                       style={{fontSize:14, textAlign: 'center'}}
                       onChangeText={text => this.setState({ nomeEvento: text })}
                      />
                    </Item>     
                </Left>
              </CardItem>
              {/* Nome Evento */}
              <CardItem  style={{borderColor: BACKGROUND_COLOR, borderWidth: 1, marginLeft: 10, marginRight: 5, marginBottom: 5, borderRadius: 10}} >
                <Left style={{}}>
                    {/* <Image style={{width:23, height: 23, marginRight:10}} source={require('../assets/description.png')}/> */}
                    <Item floatingLabel style={{ marginTop: 0 }}>
                       <Label style={{fontSize: 13, textAlign: 'center'}}>Regione</Label>
                       <Input
                       style={{fontSize:14, textAlign: 'center'}}
                       onChangeText={text => this.setState({ regione: text })}
                      />
                    </Item>     
                </Left>
                <Left style={{}}>
                    {/* <Image style={{width:23, height: 23, marginRight:10}} source={require('../assets/description.png')}/> */}
                    <Item floatingLabel style={{ marginTop: 0 }}>
                       <Label style={{fontSize: 13, textAlign: 'center'}}>Provincia</Label>
                       <Input
                       style={{fontSize:14, textAlign: 'center'}}
                       onChangeText={text => this.setState({ provincia: text })}
                      />
                    </Item>     
                </Left>
                <Left style={{}}>
                    {/* <Image style={{width:23, height: 23, marginRight:10}} source={require('../assets/description.png')}/> */}
                    <Item floatingLabel style={{ marginTop: 0 }}>
                       <Label style={{fontSize: 13, textAlign: 'center'}}>Città</Label>
                       <Input
                       style={{fontSize:14, textAlign: 'center'}}
                       onChangeText={text => this.setState({ citta: text })}
                      />
                    </Item>     
                </Left>
              </CardItem>

              

              {/* LOCALITA' E ID_EVENTO*/}
              {/* <CardItem >
                <Left style={{flex:0.8, flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text style={{fontSize:10, fontStyle: 'italic'}}>{}, {}</Text>
                
                </Left>
                <Right>
                <Text style={{fontSize:10, fontStyle: 'italic'}}>Codice di riferimento: {}</Text>
                </Right>
              </CardItem>

              <CardItem style={{flexDirection: 'column', alignItems: 'center' }} >
              <Text style={{fontSize: 24, textAlign: 'center'}}>{}</Text>
              </CardItem> */}

              {/* GIORNO E ORARIO EVENTO */}
              <CardItem  style={{borderColor: BACKGROUND_COLOR, borderWidth: 1, marginLeft: 10, marginRight: 10, marginTop: 5, marginBottom: 5, borderRadius: 10}} >
                {/* Giorno */}
                <Left style={{marginRight:0}}>
                    <Image style={{width:20, height: 20, marginRight:-15}} source={require('../assets/calendar.png')}/>
                    <DatePicker
                    style={{width: 100*110/100}}
                    date={this.state.data}
                    mode="date"
                    locale={'it'}
                    placeholder="Data"
                    format="YYYY-MM-DD"
                    minDate={this._getCurrentDate()}
                    maxDate={this._getCurrentYear()+1+'-'+this._getCurrentMonth()+'-'+this._getCurrentDay()}
                    confirmBtnText="Conferma"
                    cancelBtnText="Cancella"
                    customStyles={{
                      dateIcon: {
                        display: 'none',
                      },
                      dateInput: {
                        borderWidth: 0,
                        marginRight: 0,
                      },
                      dateText: {
                        textAlign: 'center',
                        fontSize: 13
                      }
              
                    }}
                    onDateChange={(date) => {this.setState({data: date})}}
                  />
                </Left>
                {/* Orario */}
                <Left>
                   <Image style={{width:20, height: 20, marginRight:-15}} source={require('../assets/clock.png')}/>
                   <DatePicker
                    style={{width: 100*110/100}}
                    date={this.state.orario}
                    mode="time"
                    locale={'it'}
                    placeholder="Orario"
                    confirmBtnText="Conferma"
                    cancelBtnText="Cancella"
                    customStyles={{
                      dateIcon: {
                        display: 'none',
                      },
                      dateInput: {
                        borderWidth: 0,
                        marginRight: 0
                      },
                      dateText: {
                        textAlign: 'center',
                        fontSize: 13
                      }
              
                    }}
                    onDateChange={(time) => {this.setState({orario: time})}}
                  />
                </Left>

                <Left style={{}}>
                <Image style={{width:20, height: 20, marginRight:10}} source={require('../assets/money.png')}/>
                     <Item floatingLabel style={{ marginTop: 0,width:70 }}>
                       <Label style={{fontSize: 14, width:70}}>Prezzo</Label>
                       <Input
                       style={{fontSize:14}}
                       onChangeText={text => this.setState({ prezzo: text })}
                      />
                    </Item>                      
                </Left>
              </CardItem>

              {/* TEMPO E PREZZO'*/}
              <CardItem  style={{borderColor: BACKGROUND_COLOR, borderWidth: 1, marginLeft: 10, marginRight: 10, marginBottom: 5, borderRadius: 10}} >
                {/* 
                COUNTER PER PACCHETTI DI PIU' GIORNI, TO DO NEXT
                <Left style={{flexDirection: 'row'}}>
                    <Image style={{width:20, height: 20, marginRight:0}} source={require('../assets/stopwatch.png')}/>
                      <Button transparent
                              onPress={() => this.setState({ days: this.state.days>0 ? this.state.days - 1 : 0 })}
                              style={{marginLeft:10,width:50, height:50}}
                      ><Icon style={{}} size={25} color={TINT_COLOR} name='minus-circle'/></Button>
                      <Text style={{marginLeft: -13,marginRight:10}}>{this.state.days}</Text>
                      <Button transparent
                              onPress={() => this.setState({ days: this.state.days + 1 })}
                              style={{width:50, height:50}}
                      ><Icon style={{}} size={25} color={TINT_COLOR} name='plus-circle'/></Button>
                </Left> */}
                {/* DESCRIZIONE BREVE*/}
                <Left style={{}}>
                <Image style={{width:20, height: 20, marginRight:10}} source={require('../assets/description.png')}/>
                     <Item floatingLabel style={{ width: 270}}>
                       <Label style={{fontSize: 13, }}>Descrizione Breve</Label>
                       <Input
                        multiline
      
                       style={{ width: 50,fontSize:14, marginBottom: 20}}
                       onChangeText={text => this.setState({ descrizioneBreve: text })}
                      />
                    </Item>                      
                </Left>
              </CardItem>

              
                
              <CardItem  style={{borderColor: BACKGROUND_COLOR, borderWidth: 1, marginLeft: 10, marginRight: 10, marginBottom: 5, borderRadius: 10}} >

               {/* DESCRIZIONE Lunga*/}
               <Left style={{}}>
                <Image style={{width:20, height: 20, marginRight:10}} source={require('../assets/description.png')}/>
                     <Item floatingLabel style={{ width: 270}}>
                       <Label style={{fontSize: 13, }}>Descrizione Dettagliata</Label>
                       <Input
                        multiline={true}
      
                       style={{ height: 100, width: 50,fontSize:14, marginBottom: 20}}
                       onChangeText={text => this.setState({ descrizioneCompleta: text })}
                      />
                    </Item>                      
                </Left>
              </CardItem>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  loading={this.state.isLoading}
                  raised
                  onPress={this._upLoad}
                  style={styles.searchButton}
                  activeOpacity={0.5}
                >
               <Text style={{ textAlign: "center", color: "white" }}>Carica Evento</Text>
            </TouchableOpacity>
          </View>

              
            </Card>
          
        </ScrollView>
        
    </Container>
    );
  };
};

NewEventPage.navigationOptions = ({ navigation }) => {
  return {
    title: "Nuovo evento",
    headerStyle: {
      backgroundColor: BACKGROUND_COLOR,
      borderBottomWidth: 0
    },
  };
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    margin: 30
  },

  searchButton: {
    marginLeft: '10%',
    marginRight: '10%',
    padding: 10,
    backgroundColor: TINT_COLOR,
    borderRadius: 30,
  },
});
