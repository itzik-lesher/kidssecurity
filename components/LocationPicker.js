import { View, Button, StyleSheet, Alert } from "react-native";
import { forwardRef, useImperativeHandle, useEffect } from "react";

import {
  getCurrentPositionAsync,
  useForegroundPermissions,
  PermissionStatus,
  reverseGeocodeAsync,
} from "expo-location";
import { COLORS } from "../constnats/colors";
//!! add zustand
import { create } from "zustand";

function getlocation2() {
  return [24, 27];
}

export const useBearStore2 = create((set) => ({
  bears: 10,
  location: [],
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  isFunctionCalled: false,

  // Define function to call component function
  callComponentFunction: () => {
    set({ isFunctionCalled: true });
  },

  // Reset function
  reset: () => {
    set({ isFunctionCalled: false });
  },

  // Define Zustand state properties
  zustandProperty: [],

  // Define function to update Zustand state using component state value
  setZustandProperty: (value) => set({ zustandProperty: value }),
  
  /////////////////  only in the sender  ///////////////////////////////
  // define function for update the accepted location in the local: Actually the sender
  zustandAcceptedLocation: [],

  // Define function to update Zustand state using component state value
  setZustandAcceptedLocation: (value) => set({ zustandAcceptedLocation: value }),

// Define Zustand state Platform Modal
zustandPlatformModel: [],

// Define function to update Zustand state using component state value
setZustandPlatformModel: (value) => set({ zustandPlatformModel: value }),

// upon startup tracking is enabled
myTrackingState: true,
//enableMyTracking: () => set ({myTrackingState: true}),
//disableMyTracking: () => set ({myTrackingState: false}),
setMyTrackingState: (value) => set({myTrackingState : value})

}));
//!!


//function LocationPicker() {
const LocationPicker = forwardRef((props, ref) => {
  //!!
  const isFunctionCalled = useBearStore2((state) => state.isFunctionCalled);
  //!!
  useImperativeHandle(ref, () => {
    return {
      myLocation: getLocationHandler,
    };
  });

  //!!

// Zustand hook to access the store and setter function
const setZustandProperty = useBearStore2((state) => state.setZustandProperty);
useEffect(() => {
  async function getLocation() {
    let loc = await getLocationHandler();
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxuseEffect - loc");
    console.log(JSON.stringify(loc, null, 2));
    setZustandProperty(loc);
  }

  let location2 = getLocation();
  // this call failed. Calling from inside getLocation worked
  //setZustandProperty(location2);

  console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLuseEffect - ENTER LocationPicker");
  console.log("useeffect bears = " + useBearStore2.getState().bears);
  console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLuseEffect - loc2");
  console.log(JSON.stringify(location2, null, 2));
}, [isFunctionCalled]);

  //!!

  const [locationPermissionInformation, requestPermission] =
    useForegroundPermissions();
  /*
  useEffect(() => {
    // Ask permission upon startup
    function askPermissionUponStartup() {
      const status = verifyPermissions();
      if (!status) {
        //return; // getout without getin location
        Alert.alert("Missing permissions for GeoLocation");
      } else {
        Alert.alert("Got permissions for GeoLocation");
        console.log("!!!!!!!!!!!!!!!Got permissions for GeoLocation");
      }
    }
    askPermissionUponStartup();
  }, []);
*/
  async function verifyPermissions() {
    /*
    console.log(
      "!!!!!!!!!!!!!!!!locationPermissionInformation.status =" +
        locationPermissionInformation.status
    );
    if (
      //locationPermissionInformation.status === PermissionStatus.UNDETERMINED ||
      locationPermissionInformation.status != PermissionStatus.GRANTED
    )
    */
    if ( locationPermissionInformation !== undefined )
    {
      const permissionResponse = await requestPermission();

      return permissionResponse.granted;
    }

    if (locationPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Insufficient Permissions!",
        "You need to grant location permissions to use this app."
      );
      return false;
    }

    return true;
  }

  // async function getLocationHandler() {
  const getLocationHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return; // getout without getin location
    }

    const location = await getCurrentPositionAsync({});
    const address = await reverseGeocodeAsync(location.coords);
    //console.log(location);
    //console.log(address);
    return address;
  };
  function pickOnMapHandlre() {}
  return (
    <View>
      <View style={styles.mapPreview}></View>
      <View style={styles.actions}>
        <Button
          title="Get Location"
          icon="location"
          onPress={getLocationHandler}
        ></Button>
        <Button
          title="Pick on Map"
          icon="map"
          onPress={pickOnMapHandlre}
        ></Button>
      </View>
    </View>
  );
});

export default LocationPicker;

const styles = StyleSheet.create({
  mapPreview: {
    width: "100%",
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary100,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});
