import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text>Sign In</Text>
      <Link href={"/(tabs)"} className="mt-4 rounded bg-primary text-white p-4">
        Home Page
      </Link>
    </View>
  );
};

export default SignIn;
