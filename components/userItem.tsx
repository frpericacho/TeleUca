import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {Title} from 'react-native-paper'
import { Avatar } from 'react-native-elements'
import firebase from "firebase";

const UserItem = ({User, navigation, Search}:any) => {
    //MyUser
    const MyUserAuth = firebase.auth().currentUser;

        //Para ver como poder hacer chat 1-1
        //https://www.youtube.com/watch?v=svlEVg0To_c
        //1:30:00

    const createChatOneToOne = async () => {
        firebase.firestore().collection('chats').add({
            avatar_url: '',
            description: "",
            title: "",
            group: false,
            users:{
                UserList:[
                    MyUserAuth?.email,
                    User.email
                ]
            },
            LastMessage: {},
            NewMessages: [{
                email: MyUserAuth?.email,
                NewMessage: false
            },{
                email: User.email,
                NewMessage: false
            }],
            Admin: ""
        }).then((chat)=>{
            chat.get().then((docs)=>{
                navigation.navigate('Chat',{ id: docs.id, ...docs.data() })
            })
        })
        .catch((err)=>{
            console.log(err);
        })
    }

    const HandleChatOneToOne = async () => {
        let docsOther:any = [];
        let docsMe:any = [];
        let docs:any = []

        firebase.firestore().collection('chats')
        .where('group',"==",false)
        .where('users.UserList', '==', [User.email, MyUserAuth?.email])
        .get().then((snapshotOther)=>{

            firebase.firestore().collection('chats')
            .where('group',"==",false)
            .where('users.UserList', '==', [MyUserAuth?.email, User.email])
            .get().then((snapshotMe)=>{
                docsOther = snapshotOther.docs.map((doc) => {
                    return { id: doc.id, ...doc.data() }
                })
                docsMe = snapshotMe.docs.map((doc) => {
                    return { id: doc.id, ...doc.data() }
                })
                
                docs=[...docsOther,...docsMe]

                if(docs.length!=0){
                    navigation.push('Chat',docs[0])
                }else{
                    createChatOneToOne()
                }
            })
        })
    }

    if(Search){
        return(
            <TouchableOpacity onPress={HandleChatOneToOne} >
                <View style={{flexDirection:'row', backgroundColor: '#00bde6', height:75, alignItems:'center', marginBottom:1}}>
                    <Avatar
                        source={User.avatar_url ? {uri:User.avatar_url} : require('../assets/user.png')}
                        size="medium"
                        imageProps={{resizeMode: 'cover'}}
                        rounded
                        containerStyle={{marginLeft:20}}
                    />
                    <View style={{marginLeft:15, flexDirection:'column'}}>
                        <Title style={styles.title}>{User.email.split('@')[0]}</Title>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }else{
        return(
            <TouchableOpacity onPress={HandleChatOneToOne} >
                <View style={{flexDirection:'row', backgroundColor: '#00bde6', height:75, alignItems:'center', marginBottom:1}}>
                    <Avatar
                        source={User.avatar_url ? {uri:User.avatar_url} : require('../assets/user.png')}
                        size="medium"
                        imageProps={{resizeMode: 'cover'}}
                        rounded
                        containerStyle={{marginLeft:20}}
                    />
                    <View style={{marginLeft:15, flexDirection:'column'}}>
                        <Title style={styles.title}>{User.email.split('@')[0]}</Title>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
export default UserItem;

const styles = StyleSheet.create({
    title: {
        fontSize: 16,
        marginTop: 3,
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 12,
    }
  });