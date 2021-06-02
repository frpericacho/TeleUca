import React from 'react';
import { Image } from "react-native-elements";
import { View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function Header({navigation}){
    return (
        <View style={{ display:"flex", justifyContent:"space-evenly", width: '100%', height: 50}}>
          <View>
            <Icon style={{marginLeft: 10}} name="menu" size={30} color="#900" onPress={()=>navigation.openDrawer()} />
          </View>
          <View>
            <Image
              source={require( '../assets/logoo.png')}
              style={{ height: '100%', resizeMode: 'contain' }}
            />
          </View>
          <View>
            <Icon style={{marginRight: 10}} name="magnify" size={30} color="#900" onPress={()=>console.log('open search')} />
          </View>
        </View>
    )
}