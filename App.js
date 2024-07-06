import * as React from "react";
import { View, Text, Button, StatusBar, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AllContextComponent from "./store/context/all-context";
import { AllContext } from "./store/context/all-context";
import HomeScreen from "./screens/HomeScreen";
import ContactsScreen from "./screens/ContactsScreen";
import { init, fetchRegisteredUsers } from "./util/database";
import ManageUserScreen from "./screens/ManageUserScreen";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { COLORS } from "./constnats/colors";
import LocationPicker from "./components/LocationPicker";
import { useBearStore2 } from "./components/LocationPicker";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { useBearStore } from "./zu";


const Stack = createNativeStackNavigator();

function App() {
  const locationPickerRef = React.useRef();
  const [dbInitialized, setDbInitialized] = React.useState(false);
  const allContext = React.useContext(AllContext);
  // const [platformModel, setPlatformModel] = useState(Platform.constants.Model);
  const setZustandAcceptedLocation = useBearStore2((state) => state.setZustandAcceptedLocation);
 // Zustand hook to access the store and setter function
  const setZustandPlatformModel = useBearStore2((state) => state.setZustandPlatformModel);
  

  React.useEffect(() => {
  //console.log("useeffect in app");
  setZustandPlatformModel(Platform.constants.Model)
  // store Platform model in Zustand
  console.log('zustandPlatformModel = ' + useBearStore2.getState().zustandPlatformModel);
      
  
    init()
      .then(() => {
        setDbInitialized(true);
        //console.log("init done");
      })
      .catch((err) => {
        //console.log("error in init = " + err);
      });
    /*
    fetchRegisteredUsers()
      .then(() => {
        //allContext.setRegsiteredUsersCtx();
        setDbInitialized(true);
        console.log("fetchRegisteredUsers done");
      })
      .catch((err) => {
        console.log("error in  fetchRegisteredUsers = " + err);
      });
    */
   
  }, []);

  // target function
  //\\ temporary disable background 
  /*
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      console.log("Receiving Notification in target function");
      console.log(
        "notification.request.content.title = " +
          notification.request.content.title
      );

      //console.log(
      //  "notification.request.content.body   = " +
      //    notification.request.content.body
      //);

      // find according to body if its a sender or target function

      if (
        notification.request.content.body.slice(0, 17) === "ExponentPushToken"
      ) {
        // sender message- performed in target
        //console.log('slice1 = ' + notification.request.content.body.slice(0, 17));
        if (notification.request.content.title === "location-request") {
          // this calls the function getLocationHandler from LocationPicker.js
          // !!!!! I have still to use its return value here

          const location = await locationPickerRef.current.myLocation();
          //const location = useBearStore2((state) => state.increasePopulation);
          //const location = useBearStore
          //  .getState()
          //  .increasePopulation((state) => state.bears + 1);
          useBearStore2.getState().increasePopulation();
          // the following 2 function modify the zustand state vraiable(in LocationPicker)
          // called isFunctionCalled from true to false
          // This triggers the useEffect that relays on isFunctionCalled
          // Inside it I will put the location code and put iy in another
          // variable in Zustand. Then it will be taked by receiver notification
          // and sent back to the initiator
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
              // With location
              //body: JSON.stringify(location),
              // Zustand
              body: JSON.stringify(useBearStore2.getState().zustandProperty),
            }),
          });
        }
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
        }
        //await locationPickerRef.current.myLocation();
      }
      return {
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowAlert: true,
      };
    },
  }); //  Notifications.setNotificationHandler({
  */

  if (!dbInitialized) {
    return (
      <>
        <StatusBar />
        <View>
          <Text>Waiting for database...</Text>
          <LocationPicker ref={locationPickerRef} />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar />
      <AllContextComponent>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.primary500 },
              headerTintColor: COLORS.gray700,
              contentStyle: COLORS.gray700,
            }}
          >
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
            <Stack.Screen
              name="ManageUserScreen"
              component={ManageUserScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <LocationPicker ref={locationPickerRef} />
      </AllContextComponent>
    </>
  );
}

export default App;
