import React, { useState } from 'react';
import { View } from "react-native";
import { Searchbar } from 'react-native-paper';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from "firebase";

export default function Search({navigation}:any) {
    //MyUser
    const MyUserAuth = firebase.auth().currentUser;
    //SearchBar
    const [search, setState] = useState('')
    const updateSearch = (search:string) => {
      setState( search );
      console.log('search',search)
    };

    const fetchChat = async () => {
        let docs:any = [];
        firebase.firestore().collection('chats').where('users.UserList','array-contains',MyUserAuth?.email).get().then((snapshot)=>{
          docs = snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() }
          })
          console.log('docs',docs)
        })
    }

    return(
        <View>
            <View style={{flexDirection:'row', display:'flex', width: '100%',}}>
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
            <View>
                
            </View>
        </View>
    );
};