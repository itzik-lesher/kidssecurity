import { useLayoutEffect, useEffect, useContext, useState } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Alert,
  Pressable
} from "react-native";
import IconButton from "../components/GUI/IconButton";
import RegisteredUsers from "../registered_users/RegisteredUsres";
import { useBearStore2 } from "../components/LocationPicker";
import { useBearStore } from "../zu";
import * as TaskManager from "expo-task-manager";
//import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";
import { AllContext } from "../store/context/all-context";
import { useStore } from '../components/VolumeManager';
import VolumeManager from "../components/VolumeManager";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "../constnats/colors";
import { fetchRegisteredUsers, replaceUser } from "../util/database";
//--------------------------

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  // Start of Background Task 
  ({ data, error, executionInfo }) => {
    console.log(
      "Received a notification in the background!",
      data,
      executionInfo
    );
    const notifiData = JSON.parse(data.notification.data.body);
    const bears = useBearStore.getState().bears;
    // sendPushNotification(notifiData.pushToken, bears);
    // find out the incoming notification goall
    if (notifiData.goal === 'location-request'){
    sendBackLocationNotification(notifiData.pushToken, bears);
    // 30-4-2024 for debugging - add rows in db with
    // rest api just to verify that was sent here in the background
    // its used only in "location-request"
      /////////////////////////////////////////////////
  // Rest api from App.js
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      local_name: "localName",
      local_phone: "0551234567",
      local_token: "ExponentPushToken[trialIM1gSaXB-aDs8vlHa]",
      remote_name: "testname",
      remote_phone: Math.random().toString().slice(2,12),
      remote_token: new Date().toLocaleTimeString(),
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://kidssecurity.triplebit.com/wp-json/wp-learn-form-submissions-api/v1/form-submissions/",
      requestOptions
    )
      //.then((response) => response.text())
      // Worked only when I changed text() to json()
      .then((response) => response.json())
      .then((result) => {
        console.log("fetch to kidssecurity result = " + result);
        // if we have a matching partner we get 3 json porperties string
        if (Object.keys(result).length === 3) {
          // ther is a match to a partner record
          console.log("remote name = " + result.remote_name);
          console.log("remote phone = " + result.remote_phone);
          console.log("remote token = " + result.remote_token);
          // !!! modify that since may exists with unknown pushtoken
          replaceUser({
            name: result.remote_name,
            tel: result.remote_phone,
            pushtoken: result.remote_token,
          });
        } else if (result === 1) {
          // No match. The row was inserted to WP DB
          // there is no match to a partner
          // Insert it also to local DB with an unknown pudhToken
          console.log("phoneNumber = " + phoneNumber);
          replaceUser({
            name: name,
            tel: phoneNumber,
            pushtoken: "notKnown",
          });
        } else if (result === 0) {
          // Dont insert into local DB since not inserted in Rest DB
          // - probably duplicated user
          replaceUser({
            name: name,
            tel: phoneNumber,
            pushtoken: "notKnown",
          });
        }
      })
      .catch((error) => console.log("error", error));

// End Rest api
/////////////////////////////////////////////////     

    } // if (notifiData.goal === 'location-request'){

    else if (notifiData.goal === 'volume-request'){
      sendNotificatioVolumeResult(notifiData.pushToken, bears);
    }

    // the following runs in the Sender
    else if(notifiData.gaol === 'location-result'){
    setZustandAcceptedLocation(notifiData.location);
    }
  } // ({ data, error, executionInfo }) => {
  // End of bacground Task
); //TaskManager.defineTask(

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
//\\ temporary disable background respon
//\\ 27-4 resume that-probably must be fo forground and background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

//const increasePopulation = useState.callComponentFunction.getState().increasePopulation();
//  const reset = useState.callComponentFunction.getState().reset();

const sendNotificatioVolumeResult = async (pushToken, data) => {
   // the following 2 lines triggers changeMode(RINGER_MODE.normal)
  //  in VolumeManager by useEffect
  useStore.getState().callComponentFunction();
  useStore.getState().reset();
  /////////////////////////
  const apiUrl = "https://exp.host/--/api/v2/push/send";
  const notificationData = {
    to: pushToken,
    title: "volume-result",
    //body: `The app is in backGround ${data}`,
    // body: JSON.stringify(useBearStore2.getState().zustandProperty) + 
    body: "Volume Raised in Remot Client" +
    JSON.stringify(useBearStore2.getState().zustandPlatformModel) + 
    Math.random(100) + new Date().toLocaleTimeString(),
    // add goal
    //data: {location: JSON.stringify(useBearStore2.getState().zustandProperty) + 
    data: {volume: "Volume Raised in Remot Client" +
      JSON.stringify(useBearStore2.getState().zustandPlatformModel) + 
      Math.random(100), goal: 'location-result'}
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

const sendBackLocationNotification = async (pushToken, data) => {
  ////////////////
  // added from Forground and duplicate in order to trigger
  // updating state in useBearStore2
  useBearStore2.getState().increasePopulation();
  useBearStore2.getState().callComponentFunction();
  useBearStore2.getState().reset();
  
  useBearStore2.getState().increasePopulation();
  useBearStore2.getState().callComponentFunction();
  useBearStore2.getState().reset();
  /////////////////////////
  const apiUrl = "https://exp.host/--/api/v2/push/send";
  const notificationData = {
    to: pushToken,
    title: "location-result",
    //body: `The app is in backGround ${data}`,
    body: JSON.stringify(useBearStore2.getState().zustandProperty) + 
    JSON.stringify(useBearStore2.getState().zustandPlatformModel) + 
    Math.random(100) + new Date().toLocaleTimeString(),
    // add goal
    data: {location: JSON.stringify(useBearStore2.getState().zustandProperty) + 
      JSON.stringify(useBearStore2.getState().zustandPlatformModel) + 
      Math.random(100), goal: 'location-result'}
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




function HomeScreen({ navigation }) {
  const [platformModel, setPlatformModel] = useState(Platform.constants.Model);
  // // added in 23-6-2024
  const [localStateLocalPhone, setLocalStateLocalPhone] = useState(0);
  const [isSetLocalPhoneNumber, setISetLocalPhoneNumber] = useState(false);
  const allContext = useContext(AllContext);
  // Zustand hook to access the store and setter function
  const setZustandAcceptedLocation = useBearStore2((state) => state.setZustandAcceptedLocation);
  useLayoutEffect (()=>{
  //useEffect(()=>{
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('my-key');
        const localPhoneNumber = JSON.parse(jsonValue).localPhone;
        console.log('jjjjjjjjjjjjjjjjsonValue1', jsonValue);
        console.log('jjjjjjjjjjjjjjjjsonValue.localPhoneNumber', localPhoneNumber);
        if (jsonValue !== null){
          console.log('jjjjjjjjjjjjjjjjsonValue233', jsonValue);
          //storeData(localStateLocalPhone);
          //jsonValue.slice(1);
          //jsonValue.slice(-1);
          //jsonValue = '0' + jsonValue;
          const number = parseInt(jsonValue)
          console.log('jjjjjjjjjjjjjjjjsonValue234', number);
          setLocalStateLocalPhone(localPhoneNumber);
          // 6-7 this causes the localPhoneBox to disapear upon startup
          // to disply the box put false instead of true in thr following command
          setISetLocalPhoneNumber(true);
        }
        else{
          // display value
          console.log('ppppppppppp       ',JSON.parse(jsonValue));
        }
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (e) {
        // error reading value
        console.log('error reading AsyncStorage value');
      }
    };
    /* storeData is not called so commented out
    const storeData = async (value) => {
      try {
        console.log('jjjjjjjjjjjjjjjjsonValue22', value)
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem('my-key', jsonValue);
        const jsonValue2 = await AsyncStorage.getItem('my-key');
        console.log('jjjjjjjjjjjjjjjjsonValue22', jsonValue2)
      } catch (e) {
        // saving error
      }
    };
    */
      // atListOneRegisteredUser dteremines if LoaclPhone TextInput will be displayed or not
      // If at list one registered user exists - don't display

      // added 3-7
      //////////////////////////////
      async function fechUsers() {
        const regUsers = await fetchRegisteredUsers();
  
        allContext.setRegsiteredUsersCtx(regUsers.rows._array);
        console.log("Inside RegisterdUsers.js HomeScreen useEffect");
        console.log("regUsers.rows._array =" + regUsers.rows._array);
        console.log("regUsers.rows._array.length =" + regUsers.rows._array.length);
        console.  log ('LLLLL LLLLLL regUsers.rows.length', regUsers.rows.length);
        console.log(JSON.stringify(regUsers.rows._array, null, 2));
      }
      fechUsers();
      //////////////////////////////
      


      console.log ('isSetLocalPhoneNumber ', isSetLocalPhoneNumber);
      /*
      if (allContext.registeredUsersCtx.length > 0){
        setAtListOneRegisteredUser(true)
        console.log ('atListOneRegisteredUser ', atListOneRegisteredUser);
        console.log ('allContext.registeredUsersCtx ', allContext.registeredUsersCtx );
        console.log ('aaaaaaaaaaaaaa  aaaaa allContext.registeredUsersCtx lengt', allContext.registeredUsersCtx.length );
      }
      */
    // get data from AsyncStorage inside useLayoutEffect
    getData();
  },[])
  
  
  useLayoutEffect(() => {
    //console.log(JSON.stringify(navigation.route.name, null, 2));
    navigation.setOptions({
      headerRight: () => {
        return (
          <IconButton
            iconText="הוסף איש קשר"
            title="Tap Me"
            onPress={headerButtonPressHandler}
          />
        );
      },
    });
  }, [navigation,localStateLocalPhone]);

  //export default function App() {
  useEffect(() => {
    
    console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMModel,Noam  in Homescreen = SM-A515F " + platformModel);
    console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMModel,Noam  in Homescreen = SM-A515F " + Platform.constants.Model);
    async function configurePushNotifications() {
      
      const { status } = await Notifications.getPermissionsAsync();
      console.log("status getPermissionsAsync = " + status);
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("status requestPermissionsAsync = " + status);
        finalStatus = status;
      }

      //finalStatus = "granted";

      console.log("finalStatus requestPermissionsAsync = " + finalStatus);
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions."
        );
        return;
      }

      Alert.alert("notificatuion permission granted");
      //const pushTokenData = await Notifications.getExpoPushTokenAsync();
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "bd9aaf8c-d148-4cc2-91dc-6add6fb33250",
      });
      console.log('ZZZZZZZZZZZZ  following localpushtoken');
      console.log(JSON.stringify(pushTokenData), null, 2);
      alert(pushTokenData.data);
      console.log("following pushToken.data");
      console.log(JSON.stringify(pushTokenData.data), null, 2);
      allContext.addExpoPushTokenCtx(pushTokenData.data);
      console.log("LOCAL PUSHTOKEN FOLLOWS - allContext.pushToken");
      console.log(JSON.stringify(allContext.localPushTokenCtx), null, 2);
      console.log("LOCAL PUSHTOKEN = " + allContext.localPushTokenCtx);
      console.log(JSON.stringify(allContext.localPushTokenCtx.data), null, 2);
      Alert.alert(pushTokenData.data);

      /*
      // 26-6-24
      //!!! set automatic local phone numbers to my phone and Noams phone. Modify accordingly
      if (allContext.localPushTokenCtx === "ExponentPushToken[6ddt70RGPybF6zzn7bWCPUp]"){
      setLocalStateLocalPhone("0544662132");
      }
      else if (allContext.localPushTokenCtx === "ExponentPushToken[hG2KjjK9yy5_NjOumYGp9K]"){
        setLocalStateLocalPhone("0523010298");
      }
      */
      if (Platform.OS === "android") {
        const setChannelResult =
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        console.log("SET CHANNEL RESULT", setChannelResult);
      }
    }

    configurePushNotifications();
  }, []);



  const executeTriggerFunction = useStore((state) => state.executeTriggerFunction);
  //setVolumIsNormal: (value) => set({ volumeIsNormal: value });
  const setVolumIsNormal = useStore((state) => state.setVolumIsNormal);
  useEffect(() => {
    // this is where we treat forground notification arrival
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {       
        console.log('notification in HomeScreen follows');
        console.log(notification);
        //const userName = notification.request.content.data.userName;
        //console.log(userName);
        console.log("Receiving Notification inside HomeScreen useEffect");
        console.log(
          "notification.request.content.title = " +
            notification.request.content.title
        )
        console.log('platformModel in useeffect = ' + platformModel);
        //
        
        ///////////////////
        
      if (
        notification.request.content.body.slice(0, 17) === "ExponentPushToken"
      ) {
        // sender message- performed in target
        //console.log('slice1 = ' + notification.request.content.body.slice(0, 17));
        if (notification.request.content.title === "location-request") {
          // this calls the function getLocationHandler from LocationPicker.js
          // !!!!! I have still to use its return value here

          //const location = await locationPickerRef.current.myLocation();
          //const location = useBearStore2((state) => state.increasePopulation);
          //const location = useBearStore
          //  .getState()
          //  .increasePopulation((state) => state.bears + 1);
          useBearStore2.getState().increasePopulation();
          // the following 2 function modify the zustand state vraiable(in LocationPicker)
          // called isFunctionCalled from true to false
          // This triggers the useEffect that relays on isFunctionCalled
          // Inside it I will put the location code and put it in another
          // variable in Zustand. Then it will be taked by receiver notification
          // ( in  a second or third notification ) and sent back to the initiator
          useBearStore2.getState().callComponentFunction();
          useBearStore2.getState().reset();
          console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
          console.log("BBBBBBBBBBBB bears = " + useBearStore2.getState().bears);

          console.log(
            "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB zustandProperty"
          );
          console.log(
            "BBBBBBBBBBBB zustandProperty = " +
              useBearStore2.getState().zustandProperty
          );
          console.log(
            JSON.stringify(useBearStore2.getState().zustandProperty, null, 2)
          );
          //const location = { key: "sdsd" };
          console.log(
            "OOOOOOOOOOOOOOOOOOOOOOnotification.request.content.body"
          );

          console.log(
            JSON.stringify(notification.request.content.body, null, 2)
          );
          // send back my location to the sender
          // target meddage
          fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: notification.request.content.body,
              title: "location-result",
              body: JSON.stringify(useBearStore2.getState().zustandProperty) + 
              platformModel + Math.random(100) + new Date().toLocaleTimeString(),
              //body:  JSON.stringify(platformModel),
            }),
          });

          // 4-5 for Debugging send also SM1 Smasung
          fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: "ExponentPushToken[JTj4JIM1gSaXB-aDs8vlHa]",
              title: "location-result",
              body: JSON.stringify(useBearStore2.getState().zustandProperty) + 
              platformModel + Math.random(100) + new Date().toLocaleTimeString(),
              //body:  JSON.stringify(platformModel),
            }),
          });
          // 4-5 END - for Debugging send also SM1 Smasung
        } // if (notification.request.content.title === "location-request") {

        else  if (notification.request.content.title === "volume-request") {
          // this is receiver function when in forground
          console.log("receiver function when in forground");
          // imported from ManageUserScreen
          //const setVolumeNormal = () => {
            //console.log('in ManageUserScreen', volume)
            
            //if (volume === 'normal'){
             // return;
            //}
            //VolumeManagerRef.current.exposedSetVolumeNormal();
            //setVolNormal();
            executeTriggerFunction();
          //}

          // send back 'volume-result' to sender

          fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: notification.request.content.body,
              title: "volume-result",
              body: "Volume Raised in Targrt Forground" + 
              platformModel + Math.random(100) + new Date().toLocaleTimeString(),
              //body:  JSON.stringify(platformModel),
            }),
          });
         

        } // else  if (notification.request.content.title === "volume-request") {
           
      } else {
        //  notification.request.content.body.slice(0, 17) === "ExponentPushToken"
        // sender function - target message - performed in sender since slice(0, 17) != "ExponentPushToken"
        if (
          notification.request.content.title === "location-result" ||
          notification.request.content.title === "Backgorund"
        ) {
          console.log("here is sender message returning from target");
          console.log(
            "target message body = " + notification.request.content.body
          );
          console.log(
            "target message notification.request.content.title = " +
              notification.request.content.title
          );

          console.log(
            "notification.request.content.body   = " +
              notification.request.content.body
          );

          // move value to zustand. Than it will available in ManagedUserScreen
          // Define function to update Zustand state using component state value
          
        // Zustand hook to access the store and setter function
        //const setZustandProperty = useBearStore2((state) => state.setZustandProperty);
        //setZustandProperty(notification.request.content.body);

        //setZustandAcceptedLocation('location from App.js' + Math.random(100));
        // this should be the catual code
        setZustandAcceptedLocation(notification.request.content.body);
        allContext.setDisplayLocationStoreCtx(false);
        allContext.setDisplayLocationStoreCtx(true);
        }
        //await locationPickerRef.current.myLocation();

        else  if (notification.request.content.title === "volume-result") {
          // update source gui
          console.log('volume-result in sender useEffect');
          //setVolumIsNormal(false);
          //setVolumIsNormal(true);
          useStore.getState().setVolumeIsNormalFalse();
          useStore.getState().setVolumeIsNormalTrue();
        }

      }
      return {
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowAlert: true,
      };

        ///////////////////
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []); // const subscription1 = Notifications.addNotificationReceivedListener(

  function headerButtonPressHandler() {
    console.log("PRESS HomeScreen");
    //navigation.navigate("ContactsScreen");
    console.log('HHHHHHHHHHHHHH inside localStateLocalPhone',localStateLocalPhone);
    console.log('HHHHHHHHHHHHHH inside headerButtonPressHandler',localStateLocalPhone.length );
    // added  24-6-2024
    if (localStateLocalPhone.length != 10) {
      Alert.alert("הכנס מספר טלפון שלך");
      return;
    }
    navigation.navigate("ContactsScreen");
  }
  /*
  function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification.",
        data: { userName: "Max" },
      },
      trigger: {
        seconds: 5,
      },
    });
  }
*/
  // send to myself: Samsung A51
  function sendPushNotificationHandler() {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[EfInzDNrYcIgiRy5SJyhp5]",
        title: "title notification",
        body: "body notification",
      }),
    });
    // send notification to old Noams Samsung
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[nOUCd0BnWa0R9yG0QsGjfd]",
        title: "title notification",
        body: "body notification",
      }),
    });
  }
  // Modified in 23-6-2024
  const enterLoaclPhoneManuallyHandler = (newText) => {
    console.log('eeeeeeeeeeeeeeee e.target',localStateLocalPhone);
   setLocalStateLocalPhone(newText);
  };
   /*
   const justCheckState = () =>{ 28-6-24
    console.log('VVVVVVVVVVVVVVVVV  localStateLocalPhone inside useEffect', localStateLocalPhone);
 
   }
   */
  // added in 23-6-2024
  useEffect(()=>{
    allContext.setLocalPhoneNumberCtx(localStateLocalPhone);
    console.log('UUUUUUUUUUUUUUUUUUUUUUUU localPhoneNumberCtx inside useEffect', allContext.localPhoneNumberCtx);
    console.log('UUUUUUUUUUUUUUUUUUUUUUUU localStateLocalPhone inside useEffect', localStateLocalPhone);
    console.log('UUUUUUUUUUUUUUUUUUUUUUUU localPhoneNumberCtx inside useEffect', allContext.localPhoneNumberCtx);
 
  },[localStateLocalPhone])


  const storeData2 = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('my-key', jsonValue);
      console.log( 'inside storeData2 value', value);
      console.log( 'inside storeData2 value.localPhone', value.localPhone);
    } catch (e) {
      console.log( ' inside storeData2', e);
    }
  };
  const saveLocalPhoneHandler = () => {
    console.log( ' inside saveLocalPhoneHandler.lengh', localStateLocalPhone.length)
    //storeData2(parseInt(localStateLocalPhone));
    console.log( 'inside saveLocalPhoneHandler localStateLocalPhone', localStateLocalPhone);
    if (localStateLocalPhone.length < 10){
      Alert.alert('מספר הטלפון שהוזן חסר או חלקי. אנא הזינו מספר בן 10 ספרות')
      return;
    }
    // 6-7 this causes the localPhoneBox to disapear upon click on its save button
    setISetLocalPhoneNumber(true);
    // working with real object
    const storedValue = {
      localPhone:localStateLocalPhone,
      reserved: 'reserved-value'
    }
    storeData2(storedValue);
  }

  return (
    <View style={styles.homeScreenView}>
      <RegisteredUsers navigation={navigation} />
      <View style={styles.tittextInputButtonWrapper}>
        {/*<Button
          title="Schedule Notification"
          onPress={scheduleNotificationHandler}
  />*/}
        <VolumeManager />
        {/*<Button
          title="Send Notification"
          onPress={sendPushNotificationHandler}
        />*/}
        {/*<Button 28-6-24
          title="Send Notification"
          onPress={justCheckState}
        />*/}

        
        {isSetLocalPhoneNumber ? 
        (
        <View style= ''>
          <Text style= '' > הקש על אחד מהרשומים כדי לבצע עליו פעלויות בטיחות</Text>
        </View> 
        )
        :
        (
        <View style={styles.LocalPhoneWrapper}>
        <TextInput
        style={[styles.localPhone,{maxWidth:'70%'}]}
        placeholder="הכנס את מס. הטלפון שלך ב10 ספרות"
        // // added in 23-6-2024
        //value={allContext.localPhoneNumberCtx}
        defaultValue = {localStateLocalPhone}
        onChangeText={enterLoaclPhoneManuallyHandler}>
        </TextInput>
        
        <Pressable style={styles.saveButton} onPress={saveLocalPhoneHandler}>
          <View style={styles.textWrapper}>
            <Text style={styles.saveText}>שמור/י</Text>
          </View>
      </Pressable>
        </View>
        )}
        

        {/*!!!! temprorary show the following code  */}
        {/*}
        <View style={styles.LocalPhoneWrapper}>
        <TextInput
        style={[styles.localPhone,{maxWidth:'70%'}]}
        placeholder="הכנס את מס. הטלפון שלך ב10 ספרות"
        // // added in 23-6-2024
        //value={allContext.localPhoneNumberCtx}
        defaultValue = {localStateLocalPhone}
        onChangeText={enterLoaclPhoneManuallyHandler}
        keyboardType={'numeric'}
        />
        
        
        <Pressable style={styles.saveButton} onPress={saveLocalPhoneHandler} >
          <View style={styles.textWrapper}>
            <Text style={styles.saveText}>שמור/י</Text>
          </View>
      </Pressable>
        </View>
        */}
        {/*!!!! temprorary show the following code  */}

        {/*<Text>HomeScreen</Text>28-6-24 */} 
      </View>
      <View style={styles.scrollViewContainer}></View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  homeScreenView: {
    flexDirection: "column",
    flex: 1,
  },
  tittextInputButtonWrapper: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  scrollViewContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    flex: 1,
    minWidth: "60%",
    marginBottom: 10,
    borderColor: "#000",
    borderWidth: 2,
    paddingLeft: 5,
    paddingRight: 0,
  },
  LocalPhoneWrapper:{

  },
  localPhone: {
    minHeight: 50,
    maxWidth: "90%",
    backgroundColor: "#FFF",
    borderColor: "#000",
    borderWidth: 2,
    paddingRight: 10,
    paddingLeft: 10,
    fontSize: 20,
  },
  saveButton:{
    backgroundColor:COLORS.primary400, 
    marginTop:5,
    flexDirection:"column",
    alignItems:"center"
  },
  textWrapper:{

  },
  saveText:{
    fontSize:20,
    padding:5,
    
  }
});
