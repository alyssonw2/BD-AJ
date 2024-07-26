# Banco de dados relacionado a arquivos JS

Esta API permite o upload, exclusão, visualização e gerenciamento de arquivos e metadados relacionados.

## Requisitos

- Node.js
- Express
- Multer
- fs-extra
- path
- url

## Endpoints

### 1. **Upload de Arquivos**

- **URL:** `/upload`
- **Método:** `POST`
- **Descrição:** Faz o upload de um arquivo e registra seus metadados.
- **Body:**
  - `file`: Arquivo a ser enviado.
  - Metadados do arquivo (JSON).

**Exemplo de Request:**

```http
POST /upload
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="example.pdf"
Content-Type: application/pdf

(binary data)

--boundary
Content-Disposition: form-data; name="metadata"

{
    "description": "Example file",
    "author": "John Doe"
}
--boundary--
```

**Resposta de Sucesso:**

```json
{
  "message": "Upload e registro concluídos com sucesso"
}
```

### 2. **Excluir Upload e Dados**

- **URL:** `/upload/:filename`
- **Método:** `DELETE`
- **Descrição:** Remove o arquivo e seus metadados com base no nome do arquivo.
- **Parâmetros da URL:**
  - `filename`: Nome do arquivo a ser excluído.

**Exemplo de Request:**

```http
DELETE /upload/example.pdf
```

**Resposta de Sucesso:**

```json
{
  "message": "Upload e dados excluídos com sucesso"
}
```

### 3. **Listar Todos os Uploads**

- **URL:** `/listalluploads`
- **Método:** `GET`
- **Descrição:** Retorna todos os metadados dos arquivos carregados.
- **Resposta:**

```json
[
    {
        "description": "Example file",
        "author": "John Doe",
        "filename": "example.pdf",
        "path": "relative/path/to/example.pdf",
        "uploadDate": "2024-07-26T14:30:00.000Z",
        "id": 1234567890
    },
    ...
]
```

### 4. **Criar um Registro**

- **URL:** `/data/:folder`
- **Método:** `POST`
- **Descrição:** Cria um novo registro em uma pasta especificada.
- **Parâmetros da URL:**
  - `folder`: Nome da pasta onde o registro será salvo.
- **Body:**
  - Dados do novo registro (JSON).

**Exemplo de Request:**

```http
POST /data/foldername
Content-Type: application/json

{
    "name": "New Record",
    "value": "Some value"
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Registro criado com sucesso",
  "data": {
    "name": "New Record",
    "value": "Some value",
    "id": 1678901234567
  }
}
```

### 5. **Atualizar um Registro**

- **URL:** `/data/:folder/:id`
- **Método:** `PUT`
- **Descrição:** Atualiza um registro existente em uma pasta especificada.
- **Parâmetros da URL:**
  - `folder`: Nome da pasta onde o registro está localizado.
  - `id`: ID do registro a ser atualizado.
- **Body:**
  - Dados atualizados (JSON).

**Exemplo de Request:**

```http
PUT /data/foldername/1678901234567
Content-Type: application/json

{
    "name": "Updated Record",
    "value": "Updated value"
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Registro atualizado com sucesso",
  "data": {
    "name": "Updated Record",
    "value": "Updated value",
    "id": 1678901234567
  }
}
```

### 6. **Filtrar Registros**

- **URL:** `/data/:folder/filter`
- **Método:** `POST`
- **Descrição:** Filtra registros por parâmetros complexos.
- **Parâmetros da URL:**
  - `folder`: Nome da pasta onde os registros estão localizados.
- **Body:**
  - `filters`: Filtros para a busca (JSON).

**Exemplo de Request:**

```http
POST /data/foldername/filter
Content-Type: application/json

{
    "filters": [
        { "filtro": "name", "condicao": "indexOf", "valorprocurado": "Updated" }
    ]
}
```

**Resposta de Sucesso:**

```json
[
  {
    "name": "Updated Record",
    "value": "Updated value",
    "id": 1678901234567
  }
]
```

### 7. **Deletar um Registro**

- **URL:** `/data/:folder/:id`
- **Método:** `DELETE`
- **Descrição:** Deleta um registro por ID em uma pasta especificada.
- **Parâmetros da URL:**
  - `folder`: Nome da pasta onde o registro está localizado.
  - `id`: ID do registro a ser deletado.

**Exemplo de Request:**

```http
DELETE /data/foldername/1678901234567
```

**Resposta de Sucesso:**

```json
{
  "message": "Registro deletado com sucesso"
}
```

## Como Executar o Servidor

1. Clone o repositório.
2. Navegue até a pasta do projeto.
3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie o servidor:

   ```bash
   npm start
   ```

O servidor estará disponível em `http://localhost:4001`.

---

Sinta-se à vontade para ajustar qualquer informação conforme necessário. Se precisar de mais alguma coisa, é só avisar!
