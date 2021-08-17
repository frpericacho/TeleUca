import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from "react-native-elements";
import UserItem from '../components/userItem';
import firebase from "firebase";

const ChatOptions = ({route,navigation}:any) => {
    //MyUser
    const MyUserAuth = firebase.auth().currentUser;

    //User
    const [users, setUsers] = useState<Array<any>>([])

    const renderUserItem = ({ item }:any) => (
        <UserItem navigation={navigation} User={item}/>
    );

    const fetchUser = async (email:string) => {
        let user:any
        await firebase.firestore().collection('users').where('email','==',email).get().then((snapshot)=>{
            if(snapshot.docs[0].data().email != MyUserAuth?.email){
                user = snapshot.docs[0].data()
            }
        })
        return user
    }

    const fetchUsers = async () => {
        let usersChat:Array<any> = []
        usersChat = await route.params.chat.users.UserList.map(async(email:string)=>{
            return await fetchUser(email) 
        })
        console.log('usersChat',usersChat)
        setUsers(usersChat)
    }

    useLayoutEffect(() => { 
        fetchUsers();
    },[])
    
    if(route.params.Admin){
        return(
            <View style={{flexDirection:'column', height:'100%', justifyContent:'flex-start'}}>
                <View style={{backgroundColor:'white', height:'7%', flexDirection:'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View style={{ marginLeft:15}}>
                        <TouchableOpacity>
                            <Icon name="arrow-left" size={30} color="#900" onPress={()=>navigation.goBack()}/>
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
                        <FlatList
                            style={{marginBottom:1}}
                            data={users}
                            renderItem={renderUserItem}
                            keyExtractor={(item) => item.email}
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
                            <Icon name="arrow-left" size={30} color="#900" onPress={()=>navigation.goBack()}/>
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
                        
                    </View>
                </View>
            </View>
        )
    }
}

export default ChatOptions;