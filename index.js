import { AppRegistry } from "react-native";
import ReduxWrapper from "./src/ReduxWrapper";
import { enableScreens } from "react-native-screens";

enableScreens();

AppRegistry.registerComponent("autobeeb", () => ReduxWrapper);
