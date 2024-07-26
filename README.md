````markdown
# File Upload API

Este projeto é uma API desenvolvida com Express.js para gerenciar uploads de arquivos e suas informações associadas. A API suporta operações CRUD para registros e manipulação de arquivos.

## Funcionalidades

- **Upload de Arquivos:** Envia arquivos para o servidor e salva metadados relacionados.
- **Exclusão de Arquivos e Metadados:** Remove arquivos e suas entradas associadas de metadados.
- **Criação de Registros:** Adiciona registros em pastas específicas.
- **Atualização de Registros:** Atualiza registros existentes em pastas específicas.
- **Filtragem de Registros:** Filtra registros com base em condições especificadas.
- **Deleção de Registros:** Remove registros específicos de uma pasta.

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/usuario/repo.git
   ```
2. Navegue para o diretório do projeto:
   ```bash
   cd repo
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

## Uso

### Iniciar o Servidor

Para iniciar o servidor, use o comando:

```bash
npm start
```
````

O servidor irá rodar na porta 4001.

### Endpoints

#### **POST** `/upload`

Faz o upload de um arquivo e salva os metadados.

**Exemplo de Requisição:**

```bash
curl -X POST http://localhost:4001/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/caminho/para/seu/arquivo.ext" \
  -F "nome=teste" \
  -F "dados=dados2"
```

**Body:** FormData com o campo `file` e metadados em JSON.

#### **DELETE** `/upload/:filename`

Remove um arquivo e seus metadados associados.

**Exemplo de Requisição:**

```bash
curl -X DELETE http://localhost:4001/upload/nomeDoArquivo.ext
```

**Params:**

- `filename`: Nome do arquivo a ser excluído.

#### **POST** `/data/:folder`

Cria um novo registro na pasta especificada.

**Exemplo de Requisição:**

```bash
curl -X POST http://localhost:4001/data/minhaPasta \
  -H "Content-Type: application/json" \
  -d '{"nome": "teste", "dados": "dados2"}'
```

**Body:** JSON com os dados do novo registro.

#### **PUT** `/data/:folder/:id`

Atualiza um registro existente na pasta especificada.

**Exemplo de Requisição:**

```bash
curl -X PUT http://localhost:4001/data/minhaPasta/123456789 \
  -H "Content-Type: application/json" \
  -d '{"nome": "teste atualizado", "dados": "dados atualizados"}'
```

**Params:**

- `folder`: Nome da pasta.
- `id`: ID do registro a ser atualizado.

**Body:** JSON com os dados atualizados.

#### **POST** `/data/:folder/filter`

Filtra registros com base em parâmetros especificados.

**Exemplo de Requisição:**

```bash
curl -X POST http://localhost:4001/data/minhaPasta/filter \
  -H "Content-Type: application/json" \
  -d '{
        "filters": [
            {"filtro": "nome", "condicao": "indexOf", "valorprocurado": "teste"}
        ]
    }'
```

**Body:**

```json
{
  "filters": [
    { "filtro": "campo", "condicao": "indexOf", "valorprocurado": "valor" }
  ]
}
```

#### **DELETE** `/data/:folder/:id`

Deleta um registro específico da pasta especificada.

**Exemplo de Requisição:**

```bash
curl -X DELETE http://localhost:4001/data/minhaPasta/123456789
```

**Params:**

- `folder`: Nome da pasta.
- `id`: ID do registro a ser deletado.

## Contribuição

1. Faça um fork do repositório.
2. Crie uma branch para suas alterações:
   ```bash
   git checkout -b minha-alteracao
   ```
3. Faça commit das suas alterações:
   ```bash
   git commit -am 'Adiciona uma nova funcionalidade'
   ```
4. Faça push para o repositório remoto:
   ```bash
   git push origin minha-alteracao
   ```
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

```

Essa versão inclui exemplos de como fazer requisições para cada uma das rotas da API. Se precisar de mais detalhes ou ajustes, me avise!
```
