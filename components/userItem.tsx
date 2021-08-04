import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, StyleSheet } from 'react-native';
import {Avatar,Title} from 'react-native-paper'
import firebase from "firebase";

const UserItem = ({User, navigation}:any) => {
    //MyUser
    const MyUserAuth = firebase.auth().currentUser;

        //Para ver como poder hacer chat 1-1
        //https://www.youtube.com/watch?v=svlEVg0To_c
        //1:30:00

    const submit = async () => {
        firebase.firestore().collection('chats').add({
            avatar_url: '',
            description: "chat individual",
            title: "titleChat",
            users:{
                UserList:[
                    MyUserAuth?.email,
                    User.email
                ]
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    const createChatOneToOne = async () => {
        let docs:any = [];
        firebase.firestore().collection('chats').where('users.UserList','==',[User.email,MyUserAuth?.email]&&[MyUserAuth?.email,User.email]).get().then((snapshot)=>{
            docs = snapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() }
            })
            if(docs.length!=0){
                navigation.navigate('Chat',docs[0])
            }else{
                
            }
        })
    }

    return(
        <TouchableOpacity /*onPress={()=>{navigation.navigate('Chat',User)}}*/ onPress={createChatOneToOne} >
            <View style={{flexDirection:'row', backgroundColor: '#00bde6', height:75, alignItems:'center', marginBottom:1}}>
                <Avatar.Image
                    source={User.avatar_url ? {uri:User.avatar_url} : {uri:'../assets/icon.png'}}
                    size={50}
                    style={{marginLeft:20}}
                />
                <View style={{marginLeft:15, flexDirection:'column'}}>
                    <Title style={styles.title}>{User.email}</Title>
                </View>
            </View>
        </TouchableOpacity>
    )
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