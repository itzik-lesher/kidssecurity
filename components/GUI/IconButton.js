import { Pressable, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
function IconButton({ onPress, iconText }) {
  return (
    <Pressable style={styles.headerIcon} onPress={onPress}>
      <Text style={styles.text}>{iconText}</Text>
      <Ionicons name="md-arrow-forward" size={32} color="black" />
    </Pressable>
  );
}

export default IconButton;

const styles = StyleSheet.create({
  headerIcon: {
    flexDirection: "row-reverse",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    fontSize: 14,
    minWidth: 200,
  },
});
