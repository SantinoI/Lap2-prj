import React from "react";
import {
  StyleSheet,
  Platform,
  Text,
  ActionSheetIOS,
  ScrollView,
  View,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";

import { Card, CardItem, Body} from 'native-base';

import { Permissions, ImagePicker, ImageManipulator, } from "expo";
import { FontAwesome , MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";


import { Calendar} from 'react-native-calendars';


import * as firebase from "firebase";

const TINT_COLOR = "#39b9c3";
const BACKGROUND_COLOR = "#d7e4e5";


import {LocaleConfig} from 'react-native-calendars';

LocaleConfig.locales['it'] = {
  monthNames: ['Gennaio','Febbraio','Marzo','Aprile',' Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
  monthNamesShort: ['Gen.','Febr.','Mar.','Apr.','Mag.','Giu.','Lug.','Ago.','Sett.','Ott.','Nov.','Dic.'],
  dayNames: ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
  dayNamesShort: ['Dom.','Lun.','Mar.','Mer.','Gio.','Ven.','Sab.']
};

LocaleConfig.defaultLocale = 'it';

export default class Profile extends React.Component {
    state = {
      profileImage: null,
      username:"",
      nome:"",
      cognome:"",
      email:"",
      bookingList: [],
      dates: null,
      marked: false
    }

    _loadUserData = async => {
      const user = firebase.auth().currentUser;
      if (user) {
        //console.log(user.uid);
        var uid = user.uid;
      
        this.setState({imageLoading: true})
        firebase.database().ref("App/Users/" + uid)
          .on("value", snap => {
            //console.log(snap.val())
            this.setState({ profileImage: snap.val().ProfileImage});
            this.setState({ username: snap.val().Username});
            this.setState({ nome: snap.val().Nome});
            this.setState({ cognome: snap.val().Cognome});
            this.setState({ email: snap.val().Email});
          });
        

        
        this.setState({imageLoading: false})
      }
    }

    // funzione che preleva dal database i dati sulle prenotazioni dell'utente
    _loadBookings = async request => {
      const user = firebase.auth().currentUser;
      if (user) {
        //console.log(user.uid);
        let uid = user.uid;
        //console.log(path)
        let eventList = firebase.database().ref("App/Prenotazioni");
        eventList.on("value", snap => {
          var prenotazioni = [];
          snap.forEach(child => {
            if (child.val().IDcliente == uid) {
              //date.push(child.val().DatiEvento.Data)

              prenotazioni.push({
                IDevento: child.val().IDevento,
                agenzia: child.val().DatiOrganizzatore.Agenzia,
                numero: child.val().DatiOrganizzatore.Numero,
                immagineAgenzia: child.val().DatiOrganizzatore.ImmagineAgenzia,

                nomeEvento: child.val().DatiEvento.NomeEvento,
                citta: child.val().DatiEvento.localita.Citta,
                provincia: child.val().DatiEvento.localita.Provincia,
                descrizioneBreve: child.val().DatiEvento.DescrizioneBreve,
                descrizioneCompleta: child.val().DatiEvento.DescrizioneCompleta,
                prezzo: child.val().DatiEvento.Prezzo,
                data: child.val().DatiEvento.Data,
                orario: child.val().DatiEvento.Orario,
                immagineEvento: child.val().DatiEvento.ImmagineEvento,

                cognome: child.val().DatiUtente.cognome,
                nome: child.val().DatiUtente.nome,
                email: child.val().DatiUtente.email,
                username: child.val().DatiUtente.username,

                stato: child.val().Stato
              });
            }
          });

          this.setState({ bookingList: prenotazioni });
          console.log(this.state.bookingList);
        });
      }
    };

    // funzione che in base allo stato della prenotazione modifica l'oggetto per la visualizzazione delle date nel calendario
    _loadDays = () => {
      const user = firebase.auth().currentUser;
      if (user) {
        let uid = user.uid;

        let eventList = firebase.database().ref("App/Prenotazioni");
        eventList.on("value", snap => {
          var date = [];
          var color = "";
          snap.forEach(child => {
            if (child.val().IDcliente == uid) {

                if (child.val().Stato == "ATTESA") {
                  color = "#f1c40f"
                }
                else if (child.val().Stato == "ACCETTATA") {
                  color = "#2ecc71"
                }
                else if (child.val().Stato == "RIFIUTATA") {
                  color = "#e74c3c"
                }
                date.push({
                  data: child.val().DatiEvento.Data,
                  selcolor: color,
              });
            }
          }); 

          var obj = {};
          for (var i=0; i<date.length; i++) {
            obj[date[i].data] = ({selected: true, marked: true, selectedColor: date[i].selcolor, });
          }

          //var obj = date.reduce((c, v) => Object.assign(c, {[v]: {selected: true,marked: true, dotColor: "yellow"}}), {});

          this.setState({dates: obj});
          console.log(this.state.dates);
        });
      }
    }

    async componentWillMount() {
      firebase.auth().onAuthStateChanged( user => {
        if (user) {   // se l'utente è connesso allora:
          this.setState({logged: true}) // setta lo stato a true
          this._loadUserData();         // carica i dati utente
          this._loadBookings();         // carica le prenotazioni  
          this._loadDays();             // prepara i giorni del calendario
        }
        else {
          this.setState({logged: false})      //altrimenti setta lo stato a FALSO e spostati alla pagina di login
          this.props.navigation.navigate('Login')
        }
      })
    }


     //Carimecameno foto nello storage e nel DB
     _uploadImage = async localURI => {
      const uid = firebase.auth().currentUser.uid;
      const response = await fetch(localURI);
      const blob = await response.blob();
     
      const ref = firebase
        .storage()
        .ref("Users/" + uid +"/UserImages/"+ this.state.username )
      const uploadStatus = await ref.put(blob);
      const downloadURL = await uploadStatus.ref.getDownloadURL();
     
      firebase
      .database()
      .ref("App/Users/" + uid)
      .update({ProfileImage: downloadURL})

      this.setState({profileImage : downloadURL});
    };

  _updateProfileImage = () => {
    const userId = firebase.auth().currentUser.uid;
    firebase
    .database()
    .ref("App/" + "Users/" + userId)
    .update({ProfileImage: this.state.profileImage})
  }
      //Apertura galleria per scegliere foto profilo utente
  _openPhotoGallery = async () => {
    const { status } = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (status !== "granted") {
      const result = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (result.status !== "granted") {
        alert("you need to authorized the app");
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
      this._uploadImage(manipResult.uri);
    }
  };

 

  _selectPhoto = () => {
    console.log("show actions sheet");
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Camera", "Photo Gallery", "Cancel"],
          cancelButtonIndex: 2,
          title: "Scegli immagine da:"
        },
        buttonIndex => {
          if (buttonIndex == 1) {
            this._openPhotoGallery();
          }
        }
      );
    } else{
      Alert.alert(
        'Seleziona immagine',
        'Seleziona un immagine da utilizzare come immagine profilo',
        [
          {text: 'Apri galleria', onPress: () => this._openPhotoGallery()},
          {text: 'Cancella', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          
        ],
        { cancelable: false }
      )
    }
  };

    renderNotLog() {        // RENDER DA CARICARE QUANDO L'UTENTE E' OFFLINE
      return (
        <ScrollView style={{ paddingTop: 50 , backgroundColor:BACKGROUND_COLOR}}>
            <Card style={{ marginTop: 50,marginLeft: 10, marginRight: 10,marginBottom:88, borderRadius: 10, alignItems:"center"}}>

              <CardItem style={{flexDirection: 'column', alignItems: 'center', marginTop: 50 }} >
                  <FontAwesome name='user-circle-o' size={160} color={TINT_COLOR}/>                         
              </CardItem>            

                <CardItem style={{flexDirection: 'column', alignItems: 'center', marginBottom: 50 }} >
                <Text style={{fontSize: 24, textAlign: 'center'}}> Effettua l'accesso per visualizzare i tuoi contenuti! </Text>
                </CardItem>

                <CardItem style={{flexDirection: 'column', alignItems: 'center', marginBottom: 50 }} >
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.loginButton}
                        activeOpacity={0.5}
                        onPress={() => this.props.navigation.navigate("Login")}
                    >
                    <Text style={{textAlign:'center', color: "white" }}> ACCEDI </Text>
                    </TouchableOpacity>
                  </View>
                </CardItem>


             </Card>
             </ScrollView>
      );
    }

    renderLog() {       // RENDER DA CARICARE QUANDO L'UTENTE E' ONLINE
      return (

        <ScrollView style={{ paddingTop: 50, backgroundColor:BACKGROUND_COLOR }}>

          <Card style={{ marginTop: 50,marginLeft: 10, marginRight: 10,marginBottom:60, borderRadius: 10}}>
                <TouchableOpacity style={{marginTop: -75 ,marginBottom: 0, alignSelf: 'center'}} onPress={this._selectPhoto}>
                  <Image
                    resizeMode="cover"
                    rounded
                    style= {{borderRadius:80, width: 160, height: 160}}
                    source = {  this.state.profileImage ? { uri: this.state.profileImage } : require("../assets/imagep.png")}
                    />         
                </TouchableOpacity>

                <CardItem style={{flexDirection: 'column', alignItems: 'center' }} >
                <Text style={{fontSize: 24, textAlign: 'center'}}> {this.state.username} </Text>
                </CardItem>

                {/* AGENZIA E EMAIL */}
                <CardItem  style={{flexDirection: 'column', flexWrap: 'wrap',borderColor: BACKGROUND_COLOR, borderWidth: 1, marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10}} >
                  <Text>Informazioni personali</Text>

                  <Body style={{flexDirection: 'row', margin: 5}}>
                  <SimpleLineIcons name='user' size={16}/>
                  <Text style={{marginLeft: 10}}>{this.state.nome} {this.state.cognome}</Text>
                  </Body>

                  <Body style={{flexDirection: 'row', margin: 5}}>
                    <MaterialCommunityIcons name='email-outline' size={16}/>
                    <Text style={{marginLeft: 10}}>{this.state.email}</Text>
                </Body>

                </CardItem>                

                <CardItem  style={{flexDirection: 'column', flexWrap: 'wrap',borderColor: BACKGROUND_COLOR, borderWidth: 1, marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10}} >
                  <Text>Eventi in programma</Text>
                  <Calendar
                      style={styles.calendar}
                      current={'2018-01-01'}
                      minDate={'2018-01-01'}
                      maxDate={'2019-12-31'}
                      firstDay={1}
                      markedDates={this.state.dates}
                      onDayPress={(day) => {console.log(day)}}
                      // disabledByDefault={true}
                      hideArrows={false}
                    />
                  </CardItem>

                <CardItem style={{flexDirection: 'column', alignItems: 'center' }} >
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.searchButton}
                      activeOpacity={0.5}
                      onPress={() => this.props.navigation.navigate("Bookings")}
                      title="Trova Escursioni"
                    >
                      <Text style={{ color: "white" }}>Vai alle Prenotazioni</Text>
                    </TouchableOpacity>
                  </View>
                </CardItem>

                  <CardItem style={{flexDirection: 'column', alignItems: 'center', marginBottom: 30, marginTop: 20 }} >
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={() => firebase.auth().signOut()}>
                      <Text style={{textAlign:'center', color: "grey" }}>Esci</Text>
                    </TouchableOpacity>
                  </View>
                </CardItem>
                  
             </Card>

          </ScrollView>
      );
    }


    //render in base l'user è loggato
    render() {
      return(
          this.state.logged ? (this.renderLog()) : this.renderNotLog()           
      );
    }
}

Profile.navigationOptions = ({ navigation }) => {
  _onAccountPress = () => {
    var uid = firebase.auth().currentUser;
    if (uid) {
     firebase.auth().signOut()
    }
  };

  return {
      title: "Profilo",
      headerStyle: {
        backgroundColor: BACKGROUND_COLOR,
        borderBottomWidth: 0
      },
    };
  };


  const styles = StyleSheet.create({
    searchContainer: {
      backgroundColor: BACKGROUND_COLOR,
      flexDirection: "column",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 20,
    },
    loginButton: {
      marginLeft: '10%',
      marginRight: '10%',
      width: 160,
      padding: 10,
      backgroundColor: TINT_COLOR,
      borderRadius: 30,
    },
    logoutButton: {
      marginLeft: '10%',
      marginRight: '10%',
      width: 160,
      //height: 30,
      padding: 10,
      backgroundColor: "white",
      borderRadius: 5,
      borderWidth: 1,
      borderColor:"grey"
    },

    searchButton: {
      //marginTop: 20,
      paddingTop: 15,
      paddingBottom: 15,
      padding: 30,
      marginLeft: 30,
      marginRight: 30,
      backgroundColor: TINT_COLOR,
      borderRadius: 30
    },

    noResultText: {
      color: TINT_COLOR,
      marginTop: '50%',
      fontSize: 20,
      textAlign: 'center'
    }
});
