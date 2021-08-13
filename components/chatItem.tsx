import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, StyleSheet } from 'react-native';
import {Avatar,Title} from 'react-native-paper'
import {Badge, withBadge} from 'react-native-elements'
import firebase from "firebase";

// POSIBLE FORMA DE MARCAR MENSAJES NO LEIDOS
// https://www.youtube.com/watch?v=k_szzEIYA80

const ChatItem = ({Chat, navigation}:any) => {
    //MyUser
    const MyUserAuth = firebase.auth().currentUser;

    if(checkNewMessages(Chat, MyUserAuth)){
        //console.log('tengo un nuevo mensaje en el chat:', Chat.title)
    }else{
        //console.log('pues no: ', Chat.title)
    }
    if(Chat.group){
        return(
            <TouchableOpacity onPress={()=>{navigation.navigate('Chat',Chat)}}>
                <View style={{flexDirection:'row', backgroundColor: '#00bde6', height:75, width:'100%', alignItems:'center', marginBottom:1}}>
                    <View style={{flexDirection:'column'}}>
                        <Avatar.Image
                            source={Chat.avatar_url ? {uri:Chat.avatar_url} : {uri:'../assets/icon.png'}}
                            size={50}
                            style={{marginLeft:20}}
                        />
                        <Badge
                            status="success"
                            containerStyle={{ position: 'absolute', top: -4, right: -4 }}
                            value="!"
                        />
                    </View>
                    <View style={{marginLeft:15, flexDirection:'column', width:'60%'}}>
                        <Title adjustsFontSizeToFit style={styles.title}>{Chat.title}</Title>
                        <Title adjustsFontSizeToFit style={styles.subTitle}>{Chat.description}</Title>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }else{

        let titleDisplay = Chat.users.UserList.filter((email:string)=>{
            return email != MyUserAuth?.email
        })
        
        return(
            <TouchableOpacity onPress={()=>{navigation.navigate('Chat',Chat)}}>
                <View style={{flexDirection:'row', backgroundColor: '#00bde6', height:75, width:'100%', alignItems:'center', marginBottom:1}}>
                    <View style={{flexDirection:'column'}}>
                        <Avatar.Image
                            source={Chat.avatar_url ? {uri:Chat.avatar_url} : {uri:'../assets/icon.png'}}
                            size={50}
                            style={{marginLeft:20}}
                        />
                        <Badge
                            status="success"
                            containerStyle={{ position: 'absolute', top: -4, right: -4 }}
                            value="!"
                        />
                    </View>
                    <View style={{marginLeft:15, flexDirection:'column', width:'60%'}}>
                        <Title adjustsFontSizeToFit style={styles.title}>{titleDisplay[0].split('@')[0]}</Title>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
export default ChatItem;

function checkNewMessages(Chat: any, MyUserAuth: firebase.User|null){
    console.log('el chat',Chat)
    console.log('el user',MyUserAuth?.email)

    // HACER EL CHECK DE SI EL QUE VE EL CHATITEM TIENE NEWMESSAGES A TRUE

    return false
}

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