import { onPress, Pressable, Text, View , StyleSheet} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { useContext, useLayoutEffect, useState, useEffect, useRef} from "react";


import { AllContext } from "../store/context/all-context";
import { useBearStore2 } from "../components/LocationPicker";
import  VolumeManager  from "../components/VolumeManager";
import { useVolumeMgr }  from '../components/VolumeManager';
 

import {
  init,
  dropUser,
  dropAllUsers,
  fetchRegisteredUsers,
  getTokenFromPhone,
} from "../util/database";
import LocationPicker from "../components/LocationPicker";
import { create } from "zustand";
import { useStore } from '../components/VolumeManager';

function ManageUserScreen({ route, navigation }) {
  const allContext = useContext(AllContext);
  //5-5 const [displayLocation,setDisplayLocation] = useState(false);
  //const volume = useVolumeMgr((state) => state.volume)
  //const setVolNormal = useVolumeMgr((state) => state.setVolumeNormal);
  //const setVolVibration = useVolumeMgr((state) => state.setVolumeVibration);
  const VolumeManagerRef = useRef();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.selectedUser,
    });
  }, [navigation]);
  useEffect(()=>{
    // 5-5 displayLocation
    //5-5 setDisplayLocation(true);
    allContext.setDisplayLocationStoreCtx(true);
  },[allContext.displayLocationStoreCtx])
  console.log("in manageuserscreen ");
  console.log("phone = " + route.params.phone);
  console.log("route in manageuserscreen ");
  console.log(JSON.stringify(route, null, 2));

  // sender function
  async function sendNotificationLocation() {
    // send notification to the target
    // with the demmand of Location Cordinates

    // display location in sender bellow button
    
    //5-5 setDisplayLocation(false);
    allContext.setDisplayLocationStoreCtx(false)
    // get pushtoken from Sqlite

    let userObject = await getTokenFromPhone(route.params.phone);

    // 13-7 adding condition that not undefined
    // 14-7 better check if ( userObject.rows._array[0].pushtoken){
      if ( typeof userObject.rows._array[0].pushtoken !== 'undefined'){
        sendMeInfo("location-request", userObject.rows._array[0].pushtoken);
      }
  }
  /*
  // sender function
  function sendMeInfo(request, targetPudhToken) {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: targetPudhToken,
        title: request,
        body: allContext.localPushTokenCtx,
        data: { pushToken: allContext.localPushTokenCtx },
      }),
    });
  }
*/
  const sendMeInfo = async (request, targetPudhToken) => {
    const apiUrl = "https://exp.host/--/api/v2/push/send";
    const notificationData = {
      to: targetPudhToken,
      title: request,
      body: allContext.localPushTokenCtx,
      //data: { pushToken: allContext.localPushTokenCtx},
      // add goal to data:
      data: { pushToken: allContext.localPushTokenCtx, goal: 'location-request' },
    };
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error("Error sending push notification:", error.message);
    }
  };

  function deletUserFromDb(userName, e) {
    console.log("userName =" + userName);
    // update the state
    allContext.removeRegisteredUserCtx(userName);
    console.log("userName =" + userName);
    // update the db
    dropUser(userName);
    // navigate to Homescreen
    navigation.navigate("HomeScreen");
  }
  function deletAllUserFromDb() {
    //console.log("userName =" + userName);
    // update the state
    allContext.removeAllRegisteredUserCtx();
    //console.log("userName =" + userName);
    // update the db
    dropAllUsers();
    // navigate to Homescreen
    navigation.navigate("HomeScreen");
  }
  const executeTriggerFunction = useStore((state) => state.executeTriggerFunction);

  async function setVolumeNormal() {
   
    ///!! 5-6-Following is not needed in setVolumeNorml
    // allContext.setDisplayLocationStoreCtx(false)
    // get pushtoken from Sqlite

    let userObject = await getTokenFromPhone(route.params.phone);

    /////$$$sendMeInfo("location-request", route.params.pushtoken);
    //sendMeInfo("location-request", userObject.rows._array[0].pushtoken);
    // 13-7 adding condition that not undefined
    if (userObject.rows._array[0].pushtoken){
    sendExecuteTriggerFunction("volume-request", userObject.rows._array[0].pushtoken);
    }
  }
  // 15-7 duplicated from setVolumeNormal
  async function natuaralizeTemporarry() {
   
    ///!! 5-6-Following is not needed in setVolumeNorml
    // allContext.setDisplayLocationStoreCtx(false)
    // get pushtoken from Sqlite

    let userObject = await getTokenFromPhone(route.params.phone);

    /////$$$sendMeInfo("location-request", route.params.pushtoken);
    //sendMeInfo("location-request", userObject.rows._array[0].pushtoken);
    // 13-7 adding condition that not undefined
    if (userObject.rows._array[0].pushtoken){
    sendExecuteTriggerFunction("naturalize-temporarry", userObject.rows._array[0].pushtoken);
    }
  }
  
  const sendExecuteTriggerFunction = async (request, targetPudhToken) => {
    const apiUrl = "https://exp.host/--/api/v2/push/send";
    const notificationData = {
      to: targetPudhToken,
      title: request,
      body: allContext.localPushTokenCtx,
      //data: { pushToken: allContext.localPushTokenCtx},
      // add goal to data:
      // 15-7 data: { pushToken: allContext.localPushTokenCtx, goal: 'volume-request' },
      //15-7 make it general function
      data: { pushToken: allContext.localPushTokenCtx, goal: request},
    };
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error("Error sending push notification:", error.message);
    }
  };

  
  let locationText = JSON.stringify(useBearStore2.getState().zustandAcceptedLocation)
  let locationTextStart = locationText.indexOf('city')
  let locationTextEnd = locationText.indexOf('streetNumber')  + 20;
  // the following contains Platform + Random number
  let locationTextStartMeta = locationText.indexOf("SM-")
  locationText = locationText.substring(locationTextStart,locationTextEnd) + 
  locationText.substring(locationTextStartMeta);
  //locationText = locationText.replace('":\"', '');
  let locationFormatedStart = locationText.indexOf("formatedAddress") + 89;
  let locationIsoCountryCode = locationText.indexOf("isoCountryCode") -5;
  locationText = locationText.substring(locationFormatedStart, locationIsoCountryCode);

  console.log("locationText",locationText)
 
  const volumeIsNormal = useStore((state) => state.volumeIsNormal);
  useEffect(()=>{
    console.log('QQQQQQQQQQQQQQQ inside useeffect useStore.getState().volumeIsNormal;')
    volumeIsNormal;
  },[volumeIsNormal])

  return (
    <View style={styles.total}>
      {/*<Text onPress={() => Linking.openURL("tel:" + route.params.phone)}>
        ManageUserScreen
  </Text>*/}
      <Text style={styles.dial}>חייג </Text>
      <Text style={styles.place_title} onPress={sendNotificationLocation}> הצג מיקום </Text>
      { allContext.displayLocationStoreCtx ? <Text style={styles.place_result}>{locationText}</Text> : null }
       <Text style={styles.volume_title} onPress={setVolumeNormal}>הרם ווליום</Text>
      {volumeIsNormal ? <Text style={styles.volume_result} >{"ווליום הועלה אצל הנמען"}</Text> : null}
      <Text style={styles.listen_title} >האזן לטלפון</Text>
      <Text style={styles.volume_title} onPress={natuaralizeTemporarry}>נטרל משתמש זמנית</Text>
      <Text style={styles.del_user} onPress={deletUserFromDb.bind(this, route.params.selectedUser)}>
        מחק משתמש
      </Text>
      <Text style={styles.del_all} onPress={deletAllUserFromDb}>מחק את כל המשתמשים</Text>
      <VolumeManager ref={VolumeManagerRef} />
    </View>
  );
}

export default ManageUserScreen;

const styles =  StyleSheet.create({
  total:{
    marginTop: 100
  },
  dial:{
  },
  place_title:{

  },
  place_result:{

  },
  volume_title:{

  },
  volume_result:{

  },
  listen_title:{

  },
  del_user:{

  },
  del_all:{

  }
})