import { Text, View, FlatList, StyleSheet, Platform } from "react-native";
import React, { useState } from 'react';
import ChatItem from '../components/chatItem';
import { useEffect } from "react";
import { Modal, Portal, Button, Provider } from 'react-native-paper';
import { Input } from "react-native-elements";
import Chat from '../lib/Types/Chat'
import * as ImagePicker from 'expo-image-picker';
import firebase from "firebase";

export default function Home({navigation}:any) {

  const [chats, setChats] = useState<Array<Chat>>([])
  
  //Modal
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20};

  //InputModal
  const [titleChat, setTitleChat] = React.useState('');
  const [DescriptionChat, setDescriptionChat] = React.useState('');

  const Saved:Chat ={
    id: 0,
    title: 'string',
    user_id: '2f4e944a-5cf1-49af-bc90-1fb5ff34dec0',
    description: 'string',
    avatar_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1E5SKljnQvLKVwFk1dcOTKNBVGvbyDNl_qA&usqp=CAU',
  }
  
  const Item = ({ item }:any) => (
    <ChatItem navigation={navigation} Chat={item} />
  );

  useEffect(() =>{ 
    fetchChat();
    //retriveUser();
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  },[])
  
  const fetchChat = async () => {
    let docs:any = [];
    firebase.firestore().collection('chats').get().then((snapshot)=>{
      docs = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() }
      })
      console.log('docs',docs)
      setChats(docs)
    })
  }

  /*
  const retriveUser = async () => {
    let { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabase.auth.user()?.id)
  }
*/
  const renderItem = ({ item }:any) => (
    <Item item={item}/>
  );

  const submit = async (title:string, description:string) =>{
    firebase.firestore().collection('chats').add({
      avatar_url: '',
      description: DescriptionChat,
      title: titleChat,
      user_id: ''
    }).then(()=>{
      hideModal();
      fetchChat();
    }).catch((err)=>{
      console.log(err);
    })
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
          <Button onPress={()=>submit(titleChat,DescriptionChat)}>
            Enviar
          </Button>
        </Modal>
      </Portal>
      
      <View>
        <ChatItem navigation={navigation} Chat={Saved} />
        <FlatList
          style={{marginBottom:1}}
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
        />
      </View>
      <Button icon="chat-plus" style={{marginTop: 30}} onPress={showModal}>
      </Button>
    </Provider>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
})