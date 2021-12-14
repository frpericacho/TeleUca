import { Text, View, FlatList, Platform, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import ChatItem from "../components/chatItem";
import { useEffect } from "react";
import {
  Modal,
  Portal,
  Button,
  Provider,
  FAB,
  Snackbar,
} from "react-native-paper";
import { Input, SpeedDial } from "react-native-elements";
import Chat from "../lib/Types/Chat";
import * as ImagePicker from "expo-image-picker";
import firebase from "firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Alert, ScrollView } from "react-native";
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import MultiSelect from 'react-native-multiple-select';

export default function Home({ navigation }: any) {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;

  //Chat
  const [chats, setChats] = useState<Array<Chat>>([]);
  const [user, setUser] = useState("");
  const [UserList, setUserList] = useState<Array<any>>([]);
  let textInput: any;

  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const [visible2, setVisible2] = useState(false);
  const showModal2 = () => setVisible2(true);
  const hideModal2 = () => setVisible2(false);
  
  const [openSpeedDial, setOpenSpeedDial] = React.useState(false);

  const containerStyle = { backgroundColor: "white", padding: 20 };
  const [open, setOpen] = useState(false);
  const onOpenSnackBar = () => setOpen(!open);
  const onDismissSnackBar = () => setOpen(false);

  //InputModal
  const [titleChat, setTitleChat] = useState("");
  const [DescriptionChat, setDescriptionChat] = useState("");

  //Add users
  const [showIndUser, setShowIndUser] = useState(false);
  const [showGroupUser, setShowGroupUser] = useState(false);
  const [showOptUser, setShowOptUser] = useState(true);

  // MultiSelect
  const [selectedSubjects, setSelectedSubjects] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);

  const [selectedCareer, setSelectedCareer] = React.useState([]);
  const [careers, setCareer] = React.useState([]);

  const [selected, setSelected] = useState(false);

  const Saved = {
    id: MyUserAuth?.email,
    title: "Mensajes guardados",
    //type: group
    type: "group",
    users: {
      UserList: MyUserAuth?.email,
    },
    description: "",
    avatar_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1E5SKljnQvLKVwFk1dcOTKNBVGvbyDNl_qA&usqp=CAU",
    LastMessage: {},
    NewMessages: [
      {
        email: MyUserAuth?.email,
        NewMessage: false,
      },
    ],
  };

  const registerForPushNotificationsAsync = async () => {
    let token:any;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if(token){
      firebase.firestore().collection('users').where('email','==',firebase.auth().currentUser?.email).get().then((doc)=>{
        firebase.firestore().collection('users').doc(doc.docs[0].id).update({token: token})
      })
    }
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
  }

  const Item = ({ item }: any) => (
    <ChatItem navigation={navigation} Chat={item} Search={false} />
  );

  const fetchCareers = async () => {
    await firebase
      .firestore()
      .collection("careers")
      .get().then((snapshot)=>{
        snapshot.docs.forEach((element)=>{
          let career = {
            id: element.id,
            name: element.data().name
          }
          careers.push(career)
        })
      })
  }

  useEffect(() => {
    fetchChat();
    retrieveUser();
    fetchCareers();
    registerForPushNotificationsAsync();
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const retrieveUser = async () => {
    UserList.push(MyUserAuth?.email);
  };

  const fetchChat = async () => {
    let docs: any = [];
    firebase
      .firestore()
      .collection("chats")
      .where("users.UserList", "array-contains", MyUserAuth?.email)
      .orderBy('LastMessage.createdAt','desc')
      .onSnapshot(async (snapshot) => {
        docs = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        await setChats(docs);
      });
  };

  const renderChatItem = ({ item }: any) => <Item item={item} />;

  const deleteItem = async (item: any) => {
    let arr = UserList.filter(function (it) {
      return it !== item;
    });
    setUserList(arr);
  };

  const renderUserItem = ({ item }: any) => {
    if (item == MyUserAuth?.email) {
      return null;
    } else {
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text>{item}</Text>
          <TouchableOpacity onPress={() => deleteItem(item)}>
            <Icon
              name="delete"
              style={{ paddingLeft: 10, paddingRight: 10 }}
              size={20}
              color="red"
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  const handleSubmit = async (title: string, description: string) => {
    if(visible){
      if(showIndUser){
        submitGroup(title, description)
      }else if(showGroupUser){
        submitGroupSubjects(title, description)
      }
    }else if(visible2){
      console.log('le has dado a crear chat de difusion')
      if(showIndUser){
        submitDiffusion(title, description)
      }else if(showGroupUser){
        submitDiffusionSubjects(title, description)
      }
    }
  }

  const submitDiffusionSubjects = async (title: string, description: string) => {
    if(selectedCareer.length == 0) {
      Alert.alert("Debes seleccionar al menos una titulación");
    } else if(selectedSubjects.length == 0) {
      await fetchUsersByCareer()
      await submitDiffusion(title, description)
    } else {
      await fetchUsersBySubjects()
      await submitDiffusion(title, description)
    }
  }

  const submitGroupSubjects = async (title: string, description: string) => {
    if(selectedCareer.length == 0) {
      Alert.alert("Debes seleccionar al menos una titulación");
    } else if(selectedSubjects.length == 0) {
      await fetchUsersByCareer()
      await submitGroup(title, description)
    } else {
      await fetchUsersBySubjects()
      await submitGroup(title, description)
    }
  }

  const fetchUsersBySubjects = async () => {
    let auxArray=[]
    setUserList([])
    await firebase
    .firestore()
    .collection('users')
    .where("subjects","array-contains-any",selectedSubjects)
    .get().then((users)=>{
      users.docs.forEach((user)=>{
        auxArray.push(user.data().email)
      })
    })
    auxArray.forEach((item)=>{
      if(item !== MyUserAuth?.email){
        UserList.push(item)
      }
    })
  }

  const fetchUsersByCareer = async () => {
    let auxArray=[]
    setUserList([])
    await firebase
    .firestore()
    .collection('users')
    .where("career","==",selectedCareer[0])
    .get().then((users)=>{
      users.docs.forEach((user)=>{
        auxArray.push(user.data().email)
      })
    })
    auxArray.forEach((item)=>{
      if(item !== MyUserAuth?.email){
        UserList.push(item)
      }
    })
  }

  const submitGroup = async (title: string, description: string) => {
    if (title == "") {
      onOpenSnackBar();
    }  else {
      firebase
        .firestore()
        .collection("chats")
        .add({
          avatar_url: "",
          description: DescriptionChat,
          title: titleChat,
          titleLowerCase: titleChat.toLowerCase(),
          //type: group
          type: "group",
          users: {
            UserList,
          },
          LastMessage: {
            createdAt: new Date()
          },
          NewMessages: [],
          Admin: MyUserAuth?.email,
        })
        .then(async(chat) => {
          let NewMessages: any = [];
          UserList.forEach((user: string) => {
            NewMessages.push({
              email: user,
              NewMessage: false,
            });
          });
          chat.update({
            NewMessages: NewMessages,
          });
          setUserList([firebase.auth().currentUser?.email]);
          hideModal();

          await setTitleChat('')
          await setDescriptionChat('')
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const submitDiffusion = async (title: string, description: string) => {
    if (title == "") {
      onOpenSnackBar();
    } else {
      firebase
        .firestore()
        .collection("chats")
        .add({
          avatar_url: "",
          description: DescriptionChat,
          title: titleChat,
          titleLowerCase: titleChat.toLowerCase(),
          //type: difusion
          type: "difusion",
          users: {
            UserList,
          },
          LastMessage: {
            createdAt: new Date()
          },
          NewMessages: [],
          Admin: MyUserAuth?.email,
        })
        .then(async(chat) => {
          let NewMessages: any = [];
          UserList.forEach((user: string) => {
            NewMessages.push({
              email: user,
              NewMessage: false,
            });
          });
          chat.update({
            NewMessages: NewMessages,
          });
          setUserList([firebase.auth().currentUser?.email]);
          hideModal();

          await setTitleChat('')
          await setDescriptionChat('')
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  const addUserChat = async () => {
    if (MyUserAuth?.email?.includes("@alum.uca.es")) {
      if (user.includes("@uca.es")) {
        Alert.alert("No puedes incluir a un profesor");
        textInput.clear();
        await setUser('')
      } else {
        if(user != ""){
          if(UserList.includes(user)){
            Alert.alert("Este usuario ya está añadido al chat");
            textInput.clear();
            await setUser('')
          }else{
            setUserList([...UserList, user]);
            textInput.clear();
            await setUser('')
          }
        }
      }
    } else {
      if(user != ""){
        if(UserList.includes(user)){
          Alert.alert("Este usuario ya está añadido al chat");
          textInput.clear();
          await setUser('')
        }else{
          setUserList([...UserList, user]);
          textInput.clear();
          await setUser('')
        }
      }
    }
  };

  const fetchSubjects = async (selectedItem) => {
    await firebase
      .firestore()
      .collection("careers")
      .where("name","==",selectedItem)
      .get().then((snapshot)=>{
        snapshot.docs[0].data().subjects.forEach(element => {
          element.get().then((doc)=>{
            let subject = {
              id: doc.id,
              name: doc.data().name,
              acronym: doc.data().acronym
            }
            subjects.push(subject)
          })
        });
      })
  }

  const sortChat = async (a: Chat, b: Chat) => {
    return a.LastMessage.createdAt > b.LastMessage.createdAt;
  }

  const resetStates = async () => {
    setShowGroupUser(false);
    setShowIndUser(false);
    setSelected(false);
    setShowOptUser(true);
    setSelectedCareer([]);
    setSelectedSubjects([]);
    setSubjects([])
  }

  return (
    <Provider>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={()=> {hideModal(); setUserList([firebase.auth().currentUser?.email]); resetStates()}}
          contentContainerStyle={containerStyle}
          style={{height: "80%"}}
        >
          <ScrollView>
            <Text style={{marginLeft:10, marginBottom:10, fontWeight: 'bold', fontSize: 20, color: 'grey'}}>Crear Chat</Text>
            <Input
              label="Titulo:"
              labelStyle={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}
              onChangeText={(value) => setTitleChat(value)}
              placeholder="Titulo"
            />
            <Input
              label="Descripcion:"
              labelStyle={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}
              onChangeText={(value) => setDescriptionChat(value)}
              placeholder="Descripcion"
            />
            {showOptUser ? 
              <View>
                <Text style={{marginLeft:10, marginBottom:10, fontWeight: 'bold', fontSize: 15, color: 'grey'}}>Añadir usuarios</Text>
                <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>
                  <Button style={{backgroundColor:'#039BE5'}} labelStyle={{color:'white'}} onPress={()=> {setShowIndUser(true); setShowOptUser(false)}}>
                    Individual
                  </Button>
                  <Button style={{backgroundColor:'#039BE5'}} labelStyle={{color:'white'}} onPress={()=> {setShowGroupUser(true); setShowOptUser(false)}}>
                    Por Grupos
                  </Button>
                </View>
              </View>
            : null}
            {showIndUser ?
              <View>
                <Input
                  label="Añadir usuario:"
                  ref={(input) => {
                    textInput = input;
                  }}
                  onChangeText={(value) => setUser(value)}
                  placeholder="email usuario"
                  clearTextOnFocus
                  autoCapitalize={"none"}
                  rightIcon={
                    <TouchableOpacity onPress={addUserChat}>
                      <Icon name="account-plus" size={20} color="#03A9F4" />
                    </TouchableOpacity>
                  }
                />
                <FlatList
                  style={{ marginBottom: 3 }}
                  data={UserList}
                  renderItem={renderUserItem}
                  keyExtractor={(item) => item}
                />
              </View>
            : null}
            {showGroupUser ? 
              <View>
                <View>
                  <MultiSelect
                    items={careers}
                    selectedItems={selectedCareer}
                    onSelectedItemsChange={(selectedItems)=>{setSelectedCareer(selectedItems); setSelected(true); fetchSubjects(selectedItems[0])}}
                    selectText="Escoge titulación"
                    searchInputPlaceholderText="Buscar titulaciones..."
                    noItemsText="No se encuentran coincidencias"
                    styleTextDropdown={{marginLeft:10}}
                    styleTextDropdownSelected={{marginLeft:10}}
                    searchInputStyle={{height:40}}
                    hideDropdown
                    single
                    textInputProps={{autoFocus:false}}
                    displayKey="name"
                    uniqueKey="name"
                  />
                </View>
                {selected ? 
                  <View style={{marginTop:20}}>
                    <MultiSelect
                      items={subjects}
                      selectedItems={selectedSubjects}
                      onSelectedItemsChange={(selectedItems)=>setSelectedSubjects(selectedItems)}
                      selectText="Escoge asignaturas"
                      searchInputPlaceholderText="Buscar asignaturas..."
                      noItemsText="No se encuentran coincidencias"
                      submitButtonText="Añadir asignaturas"
                      hideSubmitButton
                      styleTextDropdown={{marginLeft:10}}
                      styleTextDropdownSelected={{marginLeft:10}}
                      searchInputStyle={{height:40}}
                      tagContainerStyle={{
                        maxWidth: '90%'
                      }}
                      hideDropdown
                      textInputProps={{autoFocus:false}}
                      displayKey="name"
                      uniqueKey="id"
                    />
                  </View>
                : null }
              </View> 
            : null}
            {!showOptUser ?
              <Button onPress={() => /*submitGroup(titleChat, DescriptionChat)*/handleSubmit(titleChat, DescriptionChat)}>
                Crear
              </Button>
            : null}
          </ScrollView>
        </Modal>
        <Snackbar duration={1000} visible={open} onDismiss={onDismissSnackBar}>
          El chat requiere un título
        </Snackbar>
      </Portal>
      <Portal>
        <Modal
          visible={visible2}
          onDismiss={()=> {hideModal2(); setUserList([firebase.auth().currentUser?.email]); resetStates()} }
          contentContainerStyle={containerStyle}
          style={{height: "80%"}}
        >
          <ScrollView>
            <Text>Crear Chat de difusión</Text>
            <Input
              label="Titulo:"
              labelStyle={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}
              onChangeText={(value) => setTitleChat(value)}
              placeholder="Titulo"
            />
            <Input
              label="Descripcion:"
              labelStyle={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}
              onChangeText={(value) => setDescriptionChat(value)}
              placeholder="Descripcion"
            />
            {showOptUser ? 
              <View>
                <Text style={{marginLeft:10, marginBottom:10, fontWeight: 'bold', fontSize: 15, color: 'grey'}}>Añadir usuarios</Text>
                <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>
                  <Button style={{backgroundColor:'#039BE5'}} labelStyle={{color:'white'}} onPress={()=> {setShowIndUser(true); setShowOptUser(false)}}>
                    Individual
                  </Button>
                  <Button style={{backgroundColor:'#039BE5'}} labelStyle={{color:'white'}} onPress={()=> {setShowGroupUser(true); setShowOptUser(false)}}>
                    Por Grupos
                  </Button>
                </View>
              </View>
            : null}
            {showIndUser ?
              <View>
                <Input
                  label="Añadir usuario:"
                  ref={(input) => {
                    textInput = input;
                  }}
                  onChangeText={(value) => setUser(value)}
                  placeholder="email usuario"
                  clearTextOnFocus
                  autoCapitalize={"none"}
                  rightIcon={
                    <TouchableOpacity onPress={addUserChat}>
                      <Icon name="account-plus" size={20} color="#03A9F4" />
                    </TouchableOpacity>
                  }
                />
                <FlatList
                  style={{ marginBottom: 3 }}
                  data={UserList}
                  renderItem={renderUserItem}
                  keyExtractor={(item) => item}
                />
              </View>
            : null}
            {showGroupUser ? 
              <View>
                <View>
                  <MultiSelect
                    items={careers}
                    selectedItems={selectedCareer}
                    onSelectedItemsChange={(selectedItems)=>{setSelectedCareer(selectedItems); setSelected(true); fetchSubjects(selectedItems[0])}}
                    selectText="Escoge titulación"
                    searchInputPlaceholderText="Buscar titulaciones..."
                    noItemsText="No se encuentran coincidencias"
                    styleTextDropdown={{marginLeft:10}}
                    styleTextDropdownSelected={{marginLeft:10}}
                    searchInputStyle={{height:40}}
                    hideDropdown
                    single
                    textInputProps={{autoFocus:false}}
                    displayKey="name"
                    uniqueKey="name"
                  />
                </View>
                {selected ? 
                  <View style={{marginTop:20}}>
                    <MultiSelect
                      items={subjects}
                      selectedItems={selectedSubjects}
                      onSelectedItemsChange={(selectedItems)=>setSelectedSubjects(selectedItems)}
                      selectText="Escoge asignaturas"
                      searchInputPlaceholderText="Buscar asignaturas..."
                      noItemsText="No se encuentran coincidencias"
                      submitButtonText="Añadir asignaturas"
                      hideSubmitButton
                      styleTextDropdown={{marginLeft:10}}
                      styleTextDropdownSelected={{marginLeft:10}}
                      searchInputStyle={{height:40}}
                      tagContainerStyle={{
                        maxWidth: '90%'
                      }}
                      hideDropdown
                      textInputProps={{autoFocus:false}}
                      displayKey="name"
                      uniqueKey="id"
                    />
                  </View>
                : null }
              </View> 
            : null}
            {!showOptUser ?
              <Button onPress={() => /*submitDiffusion(titleChat, DescriptionChat)*/handleSubmit(titleChat, DescriptionChat)}>
                Crear
              </Button>
            : null}
          </ScrollView>
        </Modal>
        <Snackbar duration={1000} visible={open} onDismiss={onDismissSnackBar}>
          El chat requiere un título
        </Snackbar>
      </Portal>
      <View>
        <ChatItem navigation={navigation} Chat={Saved} Search={false} />
        <FlatList
          style={{ marginBottom: 1 }}
          data={chats}
          renderItem={renderChatItem}
        />
      </View>
      {/*
      <FAB
        style={{
          backgroundColor: "#03A9F4",
          position: "absolute",
          margin: 16,
          padding: 5,
          right: 0,
          bottom: 0,
        }}
        small
        color="#FFF"
        icon="chat-plus"
        onPress={showModal}
      />
      */}
      <SpeedDial
        isOpen={openSpeedDial} 
        icon={{ name: 'edit', color: '#fff' }} 
        openIcon={{ name: 'close', color: '#fff' }} 
        onOpen={() => setOpenSpeedDial(!openSpeedDial)} 
        onClose={() => setOpenSpeedDial(!openSpeedDial)}
        color='#03A9F4'
      >
        <SpeedDial.Action 
          icon={{ name: 'add', color: '#fff' }} 
          title="Crear Chat" 
          onPress={() => {showModal(); setOpenSpeedDial(!openSpeedDial)}}
          color='#03A9F4'
        />  
        <SpeedDial.Action 
          icon={{ name: 'delete', color: '#fff' }} 
          title="Crear Chat Difusión" 
          onPress={() => {showModal2(); setOpenSpeedDial(!openSpeedDial)}}
          color='#03A9F4'
        />
      </SpeedDial>
    </Provider>
  );
}

