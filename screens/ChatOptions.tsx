import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
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

    const renderUserItem = ({ item }:any) => (
        <UserItem navigation={navigation} User={item} Search={false}/>
    );

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

    useLayoutEffect(() => { 
        fetchUsers();
    },[])
    
    if(route.params.Admin){

        //SWIPER
        //https://www.youtube.com/watch?v=k-Ra0tdCEOc

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
                        <SwipeListView
                            data={users}
                            renderItem={renderUserItem}
                            renderHiddenItem={ (data, rowMap) => (
                                <View>
                                    <Text>Left</Text>
                                    <Text>Right</Text>
                                </View>
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
    }
}

export default ChatOptions;