import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useAuth } from "@clerk/clerk-expo";
import { View } from "react-native";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { GameSelectionProvider } from "@/providers/GameSelectionProvider";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { signOut } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      <View style={{ marginTop: 10 }}>
        <DrawerItem
          label="Ausloggen"
          onPress={() => {
            signOut();
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <GameSelectionProvider>
      <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen
          name="(home)"
          options={{ title: "Home", headerShown: false }}
        />
        <Drawer.Screen name="about" options={{ title: "Settings" }} />
      </Drawer>
    </GameSelectionProvider>
  );
}
