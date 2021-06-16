import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, StyleSheet } from 'react-native';
import {Avatar,Title} from 'react-native-paper'

const ChatItem = ({Chat, navigation}:any) => {
    return(
        <TouchableOpacity onPress={()=>{navigation.navigate('Chat',Chat)}}>
            <View style={{flexDirection:'row', backgroundColor: '#00bde6', height:75, alignItems:'center', marginBottom:1}} >
                <Avatar.Image 
                    source={{
                        uri: Chat.avatar_url
                    }}
                    size={50}
                    style={{marginLeft:20}}
                />
                <View style={{marginLeft:15, flexDirection:'column'}}>
                    <Title style={styles.title}>{Chat.title}</Title>
                    <Title style={styles.subTitle}>{Chat.description}</Title>
                </View>
            </View>
        </TouchableOpacity>
    )
}
export default ChatItem;

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