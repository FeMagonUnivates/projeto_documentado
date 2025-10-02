import { View, Button, StyleSheet, Text, FlatList, TextInput, Keyboard, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync('treinos.db');

db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atividade TEXT NOT NULL,
        duracaoMin INTEGER NOT NULL,
        categoria TEXT NOT NULL,
        parceiroNome TEXT
    );
`);

function getTreinos() {
    return db.getAllSync('SELECT * FROM treinos ORDER BY id DESC');
}

function insertTreinos(atividade, duracaoMin, categoria, parceiroNome) {
    db.runSync('INSERT INTO treinos (atividade, duracaoMin, categoria, parceiroNome) VALUES (?, ?, ?, ?)', [atividade, duracaoMin, categoria, parceiroNome]);
}

function deletarTreinos(id) {
    db.runSync('DELETE FROM treinos WHERE id = ?', [id]);
}

export default function Sqlite() {

    const [atividade, setAtividade] = useState("");
    const [duracaoMin, setDuracaoMin] = useState("");
    const [categoria, setCategoria] = useState("");
    const [parceiroNome, setParceiroNome] = useState("");
    const [treinos, setTreinos] = useState([]);

    function carregarTreinos() {
        setTreinos(getTreinos());
    }

    function salvarTreinos() {

        const ativ = atividade.trim();
        const duracao = duracaoMin.trim();
        const categ = categoria.trim();
        const parceiro = parceiroNome.trim();

        if (!ativ || !duracao || !categ) {
            alert("Por favor, preencha atividade, duração ou categoria.");
            return;
        }

        insertTreinos(ativ, duracao, categ, parceiro);

        setAtividade("");
        setDuracaoMin("");
        setCategoria("");
        setParceiroNome("");

        Keyboard.dismiss();

        carregarTreinos();

    }

    function excluirTreinos(id) {
        deletarTreinos(id);
        carregarTreinos();
    }

    return (
        <SafeAreaView style={estilos.areaSegura}>
            <View style={estilos.titulo}>
                <Text style={estilos.textoTitulo}>Treinos</Text>
            </View>
            <View>
                <View style={estilos.viewInput}>
                    <TextInput
                        value={atividade}
                        onChangeText={setAtividade}
                        placeholder="Musculação, Corrida, ..."
                        style={estilos.caixaInput}
                    />

                    <TextInput
                        value={duracaoMin}
                        onChangeText={setDuracaoMin}
                        placeholder="45, 30, 15, ..."
                        keyboardType="numeric"
                        style={estilos.caixaInput}
                    />

                    <TextInput
                        value={categoria}
                        onChangeText={setCategoria}
                        placeholder="Cárdio, Força, ..."
                        style={estilos.caixaInput}
                    />

                    <TextInput
                        value={parceiroNome}
                        onChangeText={setParceiroNome}
                        placeholder="Bruna, Gustavo, ..."
                        style={estilos.caixaInput}
                    />
                </View>

                <View style={estilos.botao}>
                    <Button
                        title="Salvar Treino"
                        onPress={salvarTreinos}
                    />
                    <Button
                        title="Voltar para início"
                        onPress={() => router.replace("/")}
                    />
                </View>

                <FlatList
                    data={treinos}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <View style={estilos.itemLinha}>
                            <Text>Atividade: {item.atividade}</Text>
                            <Text>Duração(min): {item.duracaoMin}</Text>
                            <Text>Categoria: {item.categoria}</Text>
                            <Text>Parceiro de treino: {item.parceiroNome}</Text>

                            <Button
                                title="X"
                                color={"red"}
                                onPress={() => excluirTreinos(item.id)}
                            />
                        </View>
                    )}
                />

            </View>
        </SafeAreaView>
    );

}

const estilos = StyleSheet.create({
    areaSegura: {
        margin: 5
    },

    titulo: {
        width: '100%',
        alignItems: 'center',
    },  

    textoTitulo: {
        fontSize: 25,
        fontWeight: 'bold'
    },

    viewInput: {
        alignItems: 'center',
        marginTop: 10,
        height: 200,
        flexDirection: 'column',
        justifyContent: 'space-around'
    },

    caixaInput: {
        backgroundColor: '#fff',
        width: '90%',
        height: 35,
        borderColor: 'blue',
        borderWidth: 1,
        borderRadius: 4
    },  

    itemLinha: {
        flexDirection: 'column'
    },  

    botao: {
        marginVertical: 20,
    }
})