import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/expo";
import React from "react";

const AuthLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
