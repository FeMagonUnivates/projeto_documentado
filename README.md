## 📦 Configuração Inicial

1. Crie um novo repositório no GitHub.
2. Copie a URL do repositório.
3. No terminal, clone o repositório:

```bash
git clone (url-do-repositório)
```

4. Entre na pasta do projeto clonada e crie o app Expo (exemplo `projeto`):

```bash
npx create-expo-app@latest --example blank
```

5. Escolha o nome do app (por exemplo: `projeto`). O comando criará os arquivos iniciais (`package.json`, `app.json`, `node_modules`, etc.).

---

## 🏗 Estrutura e Roteamento

1. Dentro da pasta do projeto, crie uma pasta chamada `app`.
2. Dentro de `app` crie dois arquivos principais:
   - `_layout.js` — configura o roteamento (stack por padrão);
   - `index.js` — tela inicial (rota `/`).
3. Exclua o arquivo `App.js` na raiz do projeto.

4. Instale as dependências de roteamento e safe area:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

5. `_layout.js` (pilha):

```js
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

6. `app.json` — adicione a chave `scheme` (abaixo do último colchete, adicione uma vírgula se necessário):

```json
"scheme": "your-app-scheme"
```

7. `package.json` — defina o `main` para o `expo-router` (adicionar vírgula se necessário):

```json
"main": "expo-router/entry"
```

---

## 🗄 Banco de Dados (SQLite) e Telas

1. Instale o SQLite (API Sync usada aqui):

```bash
npx expo install expo-sqlite
```

2. No `app/index.js` (tela inicial) um exemplo simples para navegar para a tela do projeto:

```js
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView>
      <Button title="Ir para tela do projeto" onPress={() => router.replace("/projetinho")} />
    </SafeAreaView>
  );
}
```

3. Crie dentro de `app/` um arquivo de rota para sua tela principal do CRUD — por exemplo `projetinho.js`.

4. **Importante:** o guia usa a API *Sync* do `expo-sqlite` (como `openDatabaseSync`, `execSync`, `getAllSync`, `runSync`) — isso evita `async/await` neste exemplo.

5. Abra o banco ao iniciar (acima da criação das funções):

```js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('treinos.db');

// Cria a tabela se não existir
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
```

---

## ⚙️ Funções do Banco de Dados (exemplos)

```js
function getTreinos() {
    return db.getAllSync('SELECT * FROM treinos ORDER BY id DESC');
}

function insertTreinos(atividade, duracaoMin, categoria, parceiroNome) {
    db.runSync('INSERT INTO treinos (atividade, duracaoMin, categoria, parceiroNome) VALUES (?, ?, ?, ?)', [atividade, duracaoMin, categoria, parceiroNome]);
}

function deletarTreinos(id) {
    db.runSync('DELETE FROM treinos WHERE id = ?', [id]);
}
```

---

## 🧩 Componente completo: `projetinho.js` (exemplo)

```js
import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, FlatList, TextInput, Keyboard } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync('treinos.db');

// Cria a tabela caso não exista
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

  useEffect(() => {
    carregarTreinos();
  }, []);

  function carregarTreinos() {
    setTreinos(getTreinos());
  }

  function salvarTreinos() {
    const ativ = atividade.trim();
    const duracao = duracaoMin.trim();
    const categ = categoria.trim();
    const parceiro = parceiroNome.trim();

    if(!ativ || !duracao || !categ) {
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
    <SafeAreaView style={estilos.container}>
      <View style={estilos.form}>
        <TextInput
          value={atividade}
          onChangeText={setAtividade}
          placeholder="Musculação, Corrida, ..."
          style={estilos.input}
        />
        <TextInput
          value={duracaoMin}
          onChangeText={setDuracaoMin}
          placeholder="45, 30, 15, ..."
          keyboardType="numeric"
          style={estilos.input}
        />
        <TextInput
          value={categoria}
          onChangeText={setCategoria}
          placeholder="Cárdio, Força, ..."
          style={estilos.input}
        />
        <TextInput
          value={parceiroNome}
          onChangeText={setParceiroNome}
          placeholder="Bruna, Gustavo, ..."
          style={estilos.input}
        />

        <View style={estilos.buttons}>
          <Button
            title="Salvar Treino"
            onPress={salvarTreinos}
          />
          <Button
            title="Voltar para início"
            onPress={() => router.replace("/")}
          />
        </View>
      </View>

      <FlatList
        data={treinos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={estilos.item}>
            <Text style={estilos.itemTitle}>{item.atividade}</Text>
            <Text>{item.duracaoMin} min</Text>
            <Text>{item.categoria}</Text>
            <Text>{item.parceiroNome}</Text>
            <Button
              title="X"
              color={"red"}
              onPress={() => excluirTreinos(item.id)}
            />
          </View>
        )}
        contentContainerStyle={estilos.list}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  form: { marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8, borderRadius: 6 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  list: { paddingBottom: 100 },
  item: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  itemTitle: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
});
```

---

## ▶️ Rodando o app no celular

No terminal da pasta do projeto, execute:

```bash
npx expo start --tunnel
```

Em seguida abra o app Expo Go no celular ou use o QR code exibido.

---

## 🎨 Estilos

No final dos arquivos de tela, adicione o `StyleSheet.create({ ... })` com os estilos que preferir. No exemplo acima uma variável `estilos` já foi fornecida.

---

## 💾 Salvando alterações no GitHub

```bash
git add .
git commit -m "(descrição)"
git push
```
