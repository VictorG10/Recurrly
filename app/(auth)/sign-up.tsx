import { useSignUp } from "@clerk/expo";
import clsx from "clsx";
import { Link, useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp = () => {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const resolveFieldMessage = (field?: unknown) => {
    if (!field) return undefined;
    if (typeof field === "string") return field;
    if (typeof field === "object" && field !== null && "message" in field) {
      return (field as any).message;
    }
    return undefined;
  };

  const fieldErrors = errors.fields as any;
  const codeError = resolveFieldMessage(fieldErrors.code);
  const emailAddressError = resolveFieldMessage(fieldErrors.emailAddress);
  const passwordError = resolveFieldMessage(fieldErrors.password);

  const emailIsValid = emailPattern.test(emailAddress.trim());
  const passwordIsValid = password.length >= 8;
  const verificationPending =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const handleSubmit = async () => {
    setGlobalError(null);

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setGlobalError(error.message ?? "We couldn’t create your account.");
      return;
    }

    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0
    ) {
      await signUp.verifications.sendEmailCode();
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (typeof url === "string" && url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.replace(url as Href);
          }
        },
      });
    }
  };

  const handleVerify = async () => {
    setGlobalError(null);

    const { error } = await signUp.verifications.verifyEmailCode({ code });

    if (error) {
      setGlobalError(error.message ?? "We couldn’t verify your email.");
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (typeof url === "string" && url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.replace(url as Href);
          }
        },
      });
    } else {
      setGlobalError("The verification code did not complete the sign-up.");
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen justify-center"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="auth-content">
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <Text className="auth-wordmark">Recurrly</Text>
            </View>
            <Text className="auth-wordmark-sub">
              Subscription clarity in one place
            </Text>
            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Secure access for managing subscriptions, renewals, and billing
              details.
            </Text>
          </View>

          <View className="auth-card">
            {verificationPending ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      fieldErrors.code && "auth-input-error",
                    )}
                    value={code}
                    placeholder="000000"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    onChangeText={setCode}
                  />
                  {codeError && <Text className="auth-error">{codeError}</Text>}
                </View>

                <Pressable
                  className={clsx(
                    "auth-button",
                    (fetchStatus === "fetching" || !code) &&
                      "auth-button-disabled",
                  )}
                  onPress={handleVerify}
                  disabled={fetchStatus === "fetching" || !code}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching" ? "Verifying…" : "Verify email"}
                  </Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signUp.verifications.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      fieldErrors.emailAddress && "auth-input-error",
                    )}
                    value={emailAddress}
                    placeholder="you@email.com"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    onChangeText={setEmailAddress}
                  />
                  {emailAddressError ? (
                    <Text className="auth-error">{emailAddressError}</Text>
                  ) : (
                    <Text className="auth-helper">
                      Use a work or personal email address.
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      fieldErrors.password && "auth-input-error",
                    )}
                    value={password}
                    placeholder="At least 8 characters"
                    placeholderTextColor="#666"
                    secureTextEntry
                    onChangeText={setPassword}
                  />
                  {passwordError ? (
                    <Text className="auth-error">{passwordError}</Text>
                  ) : (
                    <Text className="auth-helper">
                      Minimum 8 characters for account security.
                    </Text>
                  )}
                </View>

                <Pressable
                  className={clsx(
                    "auth-button",
                    (!emailIsValid ||
                      !passwordIsValid ||
                      fetchStatus === "fetching") &&
                      "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={
                    !emailIsValid ||
                    !passwordIsValid ||
                    fetchStatus === "fetching"
                  }
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching"
                      ? "Creating account…"
                      : "Create account"}
                  </Text>
                </Pressable>
              </View>
            )}

            {globalError && <Text className="auth-error">{globalError}</Text>}

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" className="auth-link">
                Sign in
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
