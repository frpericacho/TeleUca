import React from 'react';
import { Image, Text } from "react-native-elements";
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = ({navigation}:any) => {
    return (
      <View style={{ display:"flex", flexDirection:"row", justifyContent:'space-between', alignSelf:'center', width: '100%', height: '100%'}}>
        <View style={{ height: '100%'}}>
          <Icon name="menu" size={30} color="#900" onPress={()=>navigation.openDrawer()}/>
        </View> 
        <View style={{ height: '100%', width:'60%'}}>
          <Image
            source={require( '../assets/logoo.png')}
            style={{ height: '100%', resizeMode: 'contain' }}
          />
        </View>
        <View style={{ height: '100%' }}>
          <Icon name="magnify" size={30} color="#900" onPress={()=>console.log('navigation',navigation)} />
        </View>
      </View>
    )
}

export default Header;