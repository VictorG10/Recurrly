import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Account = () => {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#081126" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  const fullName =
    user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const displayName = fullName || "Not provided";
  const email = user.primaryEmailAddress?.emailAddress ?? "Unknown email";
  const username = user.username ? `@${user.username}` : "Not provided";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-5 text-3xl font-sans-extrabold text-primary">
          Profile
        </Text>

        <View className="mt-5 rounded-4xl bg-card p-6">
          <View className="flex-row items-center gap-4">
            <Image
              source={{ uri: user.imageUrl ?? undefined }}
              className="h-24 w-24 rounded-full bg-muted"
            />
            <View className="flex-1">
              <Text className="text-2xl font-sans-bold text-primary">
                {displayName}
              </Text>
              <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
                {email}
              </Text>
              <Text className="mt-1 text-base font-sans-medium text-muted-foreground">
                {username}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-4xl bg-white border border-border p-5 space-y-4">
          <View>
            <Text className="text-sm font-sans-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Account details
            </Text>
          </View>

          <View className="rounded-3xl bg-background p-4">
            <Text className="text-base font-sans-semibold text-primary">
              Name
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {fullName || "Not provided"}
            </Text>
          </View>

          <View className="rounded-3xl bg-background p-4">
            <Text className="text-base font-sans-semibold text-primary">
              Email
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {email}
            </Text>
          </View>

          <View className="rounded-3xl bg-background p-4">
            <Text className="text-base font-sans-semibold text-primary">
              Username
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {username}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;
