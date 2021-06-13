import React, { useState } from 'react';
import { Image, Text } from "react-native-elements";
import { Searchbar } from 'react-native-paper';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = ({navigation, hideMenu, searchBar}:any) => {
  const [search, setState] = useState('')
  const updateSearch = (search:string) => {
    setState( search );
    console.log('search',search)
  };

  if(hideMenu){
    if(searchBar){
      return(
        <View style={{display:'flex', justifyContent:'space-around'}}>
          <Searchbar
            style={{width:'100%'}}
            inputStyle={{width:'100%'}}
            placeholder="Search"
            onChangeText={updateSearch}
            value={search}
          />
        </View>
      )
    }else{
      return (
        <View style={{ display:"flex", flexDirection:"row", justifyContent:'space-between', alignSelf:'center', width: '100%', height: '100%'}}>
          <View style={{ height: '100%', width:'60%', marginLeft:25}}>
            <Image
              source={require( '../assets/logoo.png')}
              style={{ height: '100%', resizeMode: 'contain' }}
            />
          </View>
          <View style={{ height: '100%' }}>
            <Icon name="magnify" size={30} color="#900" onPress={()=>navigation.navigate('SecondHome')} />
          </View>
        </View>
      )
    }
  }else{
    return (
      <View style={{ display:"flex", flexDirection:"row", justifyContent:'space-between', alignSelf:'center', width: '100%', height: '100%'}}>
        <View style={{ height: '100%', display: hideMenu ? "none" : "flex"}}>
          <Icon name="menu" size={30} color="#900" onPress={()=>navigation.openDrawer()}/>
        </View> 
        <View style={{ height: '100%', width:'60%'}}>
          <Image
            source={require( '../assets/logoo.png')}
            style={{ height: '100%', resizeMode: 'contain' }}
          />
        </View>
        <View style={{ height: '100%' }}>
          <Icon name="magnify" size={30} color="#900" onPress={()=>navigation.navigate('SecondHome')} />
        </View>
      </View>
    )
  }
}

export default Header;