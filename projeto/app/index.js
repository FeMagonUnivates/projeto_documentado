import { Button, View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Index() {
    return (

        <SafeAreaView>
            <Button title="Ir para tela do projeto" onPress={() => router.replace("/projetinho")} />
        </SafeAreaView>

    )
}