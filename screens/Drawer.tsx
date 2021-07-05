import * as React from 'react';
import { Button, Input, Image } from "react-native-elements";
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';
import {Avatar,Title,Text,Caption,Paragraph,Drawer,TouchableRipple,Switch} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from 'firebase';

export function DrawerContent(props: any){
    return(
        <View style={{flex: 1}}>
            <DrawerContentScrollView { ...props}>
                <View style={{flexDirection:'row',marginTop: 15}}>
                    <Avatar.Image 
                        source={{
                            uri: 'https://api.adorable.io/avatars/50/abott@adorable.png'
                        }}
                        size={50}
                    />
                    <View style={{marginLeft:15, flexDirection:'column'}}>
                        <Title style={styles.title}>John Doe</Title>
                    </View>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem 
                    label="Cerrar sesion"
                    labelStyle={{color:'red'}}
                    icon={({size})=>(
                        <Icon
                            name="exit-to-app"
                            color='red'
                            size={size}
                        />
                    )}
                    onPress={()=> firebase.auth().signOut()}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
      flex: 1,
    },
    userInfoSection: {
      paddingLeft: 20,
    },
    title: {
      fontSize: 16,
      marginTop: 3,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 14,
      lineHeight: 14,
    },
    row: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
    },
    paragraph: {
      fontWeight: 'bold',
      marginRight: 3,
    },
    drawerSection: {
      marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: 'red',
        borderTopWidth: 1
    },
    preference: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  });