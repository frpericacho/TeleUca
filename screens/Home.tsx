import { Text, View, FlatList, StyleSheet, Platform, TouchableOpacity } from "react-native";
import React, { useState } from 'react';
import ChatItem from '../components/chatItem';
import { useEffect } from "react";
import { Modal, Portal, Button, Provider } from 'react-native-paper';
import { Input } from "react-native-elements";
import Chat from '../lib/Types/Chat'
import * as ImagePicker from 'expo-image-picker';
import firebase from "firebase";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Home({navigation}:any) {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;
  
  //Chat
  const [chats, setChats] = useState<Array<Chat>>([])
  const [user, setUser] = useState('')
  const [UserList,setUserList] = useState([]);
  let textInput:any

  //Modal
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20};

  //InputModal
  const [titleChat, setTitleChat] = React.useState('');
  const [DescriptionChat, setDescriptionChat] = React.useState('');

  const Saved ={
    id: MyUserAuth?.email,
    title: 'Saved',
    group: true,
    users:{
      UserList: MyUserAuth?.email
    },
    description: 'Saved Messages',
    avatar_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1E5SKljnQvLKVwFk1dcOTKNBVGvbyDNl_qA&usqp=CAU',
  }
  
  const Item = ({ item }:any) => (
    <ChatItem navigation={navigation} Chat={item} />
  );

  useEffect(() =>{ 
    fetchChat();
    retrieveUser();
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  },[])

  const retrieveUser = async () => {
    UserList.push(MyUserAuth?.email)
  }

  const fetchChat = async () => {
    let docs:any = [];
    firebase.firestore().collection('chats').where('users.UserList','array-contains',MyUserAuth?.email).onSnapshot((snapshot)=>{
      docs = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() }
      })
      setChats(docs)
    })
  }

  const renderChatItem = ({ item }:any) => (
    <Item item={item}/>
  );

  const deleteItem = async (item:any) => {
    let arr = UserList.filter(function(it) {
      return it !== item
    })
    setUserList(arr);
  }

  const renderUserItem = ({item}:any) => {
    return (
      <View style={{display:'flex', flexDirection:"row", justifyContent:"space-between"}}>
        <Text>
          {item}
        </Text>
        <TouchableOpacity onPress={() => deleteItem(item)}>
            <Icon name="delete" style={{paddingLeft: 10,paddingRight:10}} size={20} color="red" />
        </TouchableOpacity>
      </View>
    );
  }

  const submit = async (title:string, description:string) =>{
    firebase.firestore().collection('chats').add({
      avatar_url: '',
      description: DescriptionChat,
      title: titleChat,
      group: true,
      users:{
        UserList
      }
    }).then(()=>{
      setUserList([firebase.auth().currentUser?.email]);
      hideModal();
      fetchChat();
    }).catch((err)=>{
      console.log(err);
    })
  }

  const addUserChat = async () =>{
    UserList.push(user)
    textInput.clear()
  }

  return(
    <Provider>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          <Text>Añadir Chat</Text>
          <Input
            label="Titulo:"
            onChangeText={value => setTitleChat(value)}
            placeholder='Titulo'
          />
          <Input
            label="Descripcion:"
            onChangeText={value => setDescriptionChat(value)}
            placeholder='Descripcion'
          />
          <Input
            label="Añadir usuario:"
            ref={input => { textInput = input }} 
            onChangeText={value => setUser(value)}
            placeholder='email usuario'
            clearTextOnFocus
            rightIcon={
              <TouchableOpacity onPress={addUserChat}>
                <Icon name="account-plus" size={20} color="#00bde6"/>
              </TouchableOpacity>
            }
          />
          <FlatList 
            style={{marginBottom:3}}
            data={UserList}
            renderItem={renderUserItem}
            keyExtractor={(item) => item}          
          />
          <Button onPress={()=>submit(titleChat,DescriptionChat)}>
            Enviar
          </Button>
        </Modal>
      </Portal>
      <View>
        <ChatItem navigation={navigation} Chat={Saved} />
        <FlatList
          style={{marginBottom:1}}
          data={chats.sort((a,b)=> sortChat(a,b))}
          renderItem={renderChatItem}
        />
      </View>

      <Button icon="chat-plus" style={{marginTop: 30}} onPress={showModal}>
      </Button>
    </Provider>
  );
};

function sortChat(a:Chat, b:Chat) {
  return a.LastMessage.createdAt < b.LastMessage.createdAt
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
})