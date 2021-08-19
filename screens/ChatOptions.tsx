import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, BackHandler, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from "react-native-elements";
import UserItem from '../components/userItem';
import { SwipeListView } from 'react-native-swipe-list-view';
import firebase from "firebase";

const ChatOptions = ({route,navigation}:any) => {
    //MyUser
    const MyUserAuth = firebase.auth().currentUser;
    
    //User
    const [users, setUsers] = useState<Array<any>>([])

    useLayoutEffect(() => {
        console.log('route.params.chat',route.params.chat)
        fetchUsers()
    },[])

    const fetchUsers = async () => {
        let userDocs:any = [];
        firebase.firestore().collection('users').where('email','in',route.params.chat.users.UserList).get().then((snapshot)=>{
            userDocs = snapshot.docs.filter((user)=>{
                return user.data().email != MyUserAuth?.email
            }).map((user)=>{
                return user.data()
            })
            setUsers(userDocs)
        })
    }

    const renderUserItem = ({ item }:any) => (
        <UserItem navigation={navigation} User={item} Search={false}/>
    );

    const renderHiddenUserItem = (data:any) => (
        <View style={styles.rowBack}>
            <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={()=> DeleteUserFromChat(data)}>
                <Icon name="delete" size={30} color="#FFF"/>
            </TouchableOpacity>
        </View>
    )

    const DeleteUserFromChat = async (data:any) => {
        firebase.firestore().collection('chats').doc(route.params.chat?.id).get().then((chat)=>{
            let UserListAux = chat.data()?.users.UserList
            let NewMessagesAux = chat.data()?.NewMessages
            let usersAux = users.filter((user:any)=>{
                return user.email != data.item.email
            })

            NewMessagesAux = NewMessagesAux.filter((user:any)=>{
                return user.email != data.item.email
            })
            UserListAux = UserListAux.filter((email:string)=>{
                return email != data.item.email
            })

            setUsers(usersAux)

            chat.ref.update({
                NewMessages: NewMessagesAux,
                users:{
                    UserList:UserListAux
                }
            })
        })
    }
    
    if(route.params.Admin){
        return(
            <View style={{flexDirection:'column', height:'100%', justifyContent:'flex-start'}}>
                <View style={{backgroundColor:'white', height:'7%', flexDirection:'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View style={{ marginLeft:15}}>
                        <TouchableOpacity>
                            <Icon name="arrow-left" size={30} color="#900" onPress={()=>navigation.push('Chat',route.params.chat)}/>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text>
                            {route.params.title}
                        </Text>
                    </View>
                    <View style={{marginRight:15}}>
                        <Icon name="dots-vertical" size={30} color="white"/>
                    </View> 
                </View>
                <View style={{height:'93%', flex:1, flexDirection: "column"}}>
                    <View style={{flex:1}}>
                        <Image
                            source={{uri:route.params.chat.avatar_url}}
                            style={{ height: '100%', resizeMode: 'contain' }}
                        />
                    </View>
                    <View style={{ flex: 2, backgroundColor: "darkorange" }} >
                        <Text>
                            Participantes
                        </Text>
                        <SwipeListView
                            data={users}
                            renderItem={renderUserItem}
                            renderHiddenItem={ (data) => (
                                renderHiddenUserItem(data)
                            )}
                            rightOpenValue={-75}
                        />
                    </View>
                </View>
            </View>
        )
    }else{
        return(
            <View style={{flexDirection:'column', height:'100%', justifyContent:'flex-start'}}>
                <View style={{backgroundColor:'white', height:'7%', flexDirection:'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View style={{ marginLeft:15}}>
                        <TouchableOpacity>
                            <Icon name="arrow-left" size={30} color="#900" onPress={async () => await navigation.navigate('Chat',route.params.chat)}/>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text>
                            {route.params.title}
                        </Text>
                    </View>
                    <View style={{marginRight:15}}>
                        <Icon name="dots-vertical" size={30} color="white"/>
                    </View> 
                </View>
                <View style={{height:'93%', flex:1, flexDirection: "column"}}>
                    <View style={{flex:1}}>
                        <Image
                            source={{uri:route.params.chat.avatar_url}}
                            style={{ height: '100%', resizeMode: 'contain' }}
                        />
                    </View>
                    
                </View>
            </View>
        )
    }
}

export default ChatOptions;

const styles = StyleSheet.create({
    backTextWhite: {
        color: '#FFF',
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        marginBottom:1
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0,
    },
});
