import { View, Button, StyleSheet, Alert } from "react-native";
import { forwardRef, useImperativeHandle, useEffect } from "react";

import {
  getCurrentPositionAsync,
  useForegroundPermissions,
  PermissionStatus,
  reverseGeocodeAsync,
} from "expo-location";
import { COLORS } from "../constnats/colors";

//function LocationPicker() {
const LocationPicker = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => {
    return {
      myLocation: getLocationHandler,
    };
  });

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
    console.log(
      "!!!!!!!!!!!!!!!!locationPermissionInformation.status =" +
        locationPermissionInformation.status
    );
    if (
      //locationPermissionInformation.status === PermissionStatus.UNDETERMINED ||
      locationPermissionInformation.status != PermissionStatus.GRANTED
    ) {
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
