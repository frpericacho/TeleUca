import React, { useState } from 'react';
import { View, FlatList } from "react-native";
import { Searchbar } from 'react-native-paper';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from "firebase";
import Chat from '../lib/Types/Chat';
import ChatItem from '../components/chatItem';
import User from '../lib/Types/User';
import UserItem from '../components/userItem';

export default function Search({navigation}:any) {
    //MyUser
    const MyUserAuth = firebase.auth().currentUser;
    //SearchBar
    const [search, setState] = useState('')
    //Chat
    const [chats, setChats] = useState<Array<Chat>>([])
    //User
    const [users, setUsers] = useState<Array<User>>([])

    const updateSearch = (search:string) => {
        setState( search );
        if(!search){
            setChats([])
            setUsers([])
        }else{
            let docs:any = [];
            let userDocs:any = [];
            firebase.firestore().collection('chats').orderBy('title').startAt(search).endAt(search+'\uf8ff').onSnapshot((snapshot)=>{
                //Añadir .filter para filtrar solo aquellos chats en los que aparezca el user en userList del chat
                docs = snapshot.docs.filter((doc)=>{
                    return doc.data().users.UserList.includes(MyUserAuth.email)
                }).map((doc) => {
                    return { id: doc.id, ...doc.data() }
                })
                setChats(docs)
                //console.log('docs',docs)
            })
            firebase.firestore().collection('users').orderBy('email').startAt(search).endAt(search+'\uf8ff').onSnapshot((snapshot)=>{
                userDocs = snapshot.docs.filter((doc)=>{
                    return doc.data().email != MyUserAuth.email
                }).map((doc) => {
                    return { id: doc.id, ...doc.data() }
                })
                setUsers(userDocs)
                //console.log('docs',userDocs)
            })
            //console.log('search',search)
        }
    };

    const renderUserItem = ({ item }:any) => (
        <UserItem navigation={navigation} User={item}/>
    );

    const renderChatItem = ({ item }:any) => (
        <ChatItem navigation={navigation} Chat={item}/>
    );

    return(
        <View>
            <View style={{flexDirection:'row', display:'flex', width: '100%', marginTop:5}}>
                <View style={{display:'flex', justifyContent:'center', alignContent:'center'}}>
                    <Button onPress={()=>navigation.goBack()}>
                        <Icon name="arrow-left" style={{width:'100%', height:'100%'}} size={20} color="#00bde6"/>
                    </Button>
                </View>
                <Searchbar
                    style={{width:'100%'}}
                    inputStyle={{width:'100%'}}
                    placeholder="Search"
                    onChangeText={updateSearch}
                    value={search}
                />
            </View>
            <View style={{marginTop:10}}>
                <FlatList
                    style={{marginBottom:1}}
                    data={chats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.title}
                />
            </View>
            <View style={{marginTop:10}}>
                <FlatList
                    style={{marginBottom:1}}
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.email}
                />
            </View>
        </View>
    );
};