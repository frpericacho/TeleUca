import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, StyleSheet } from 'react-native';
import {Avatar,Title} from 'react-native-paper'

const UserItem = ({User, navigation}:any) => {
    return(
        <TouchableOpacity onPress={()=>{navigation.navigate('Chat',User)}}>
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