import React from 'react';
import { Text, View } from "react-native";
import { StyleSheet } from 'react-native';

const Chat = () => {
    return(
        <View style={styles.Container}>
            <View style={styles.InputBar}>
                <Text>Soy la barra</Text>
            </View>
        </View>
    )
}
export default Chat;

const styles = StyleSheet.create({
    InputBar:{
        position:'absolute',
        width:'100%',
        bottom:0,
        height: 50,
        backgroundColor:'red'
    },
    Container:{
        position:'relative',
        height:'100%',
        width:'100%',
        backgroundColor:'green'
    }
})