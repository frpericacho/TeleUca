import React, { useState } from "react";
import { Image } from "react-native-elements";
import { Searchbar } from "react-native-paper";
import { View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Header = ({ navigation, Page }: any) => {
  const [search, setState] = useState("");
  const updateSearch = (searchContent: string) => {
    setState(searchContent);
  };

  const HomeView = () => {
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignSelf: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <View style={{ height: "100%", display: "flex" }}>
          <Icon
            name="menu"
            size={30}
            color="#900"
            onPress={() => navigation.openDrawer()}
          />
        </View>
        <View style={{ height: "100%", width: "60%" }}>
          <Image
            source={require("../assets/logoo.png")}
            style={{ height: "100%", resizeMode: "contain" }}
          />
        </View>
        <View style={{ height: "100%" }}>
          <Icon
            name="magnify"
            size={30}
            color="#900"
            onPress={() => navigation.navigate("Search")}
          />
        </View>
      </View>
    );
  }

  switch (Page) {
    case "Home":
      return HomeView();
    case "Search":
      return (
        <View style={{ display: "flex", justifyContent: "space-around" }}>
          <Searchbar
            style={{ width: "100%" }}
            inputStyle={{ width: "100%" }}
            placeholder="Search"
            onChangeText={updateSearch}
            value={search}
          />
        </View>
      );
    case "Chat":
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <View style={{ height: "100%", width: "60%", marginLeft: 25 }}>
            <Image
              source={require("../assets/logoo.png")}
              style={{ height: "100%", resizeMode: "contain" }}
            />
          </View>
          <View style={{ height: "100%" }}>
            <Icon
              name="magnify"
              size={30}
              color="#900"
              onPress={() => navigation.navigate("Search")}
            />
          </View>
        </View>
      );
    default:
      return HomeView();
  }
};

export default Header;
