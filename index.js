import express from 'express'
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4001;

app.use(express.json());

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const ext = path.extname(file.originalname).slice(1);
        const uploadPath = path.join(__dirname, `./db/uploads/${ext}`);
        await fs.ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Rota para upload de arquivos
app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    let metadata = req.body;
    const dataFilePath = path.join(__dirname, './db/uploads/data.json');
    const id = new Date()
    // Log dos metadados para verificar o formato

    try {
        // Garantir que o arquivo de metadados exista
        await fs.ensureFile(dataFilePath);

        // Carregar metadados existentes, se houver
        let arquivoAnteriorDados = [];
        if (await fs.pathExists(dataFilePath)) {
            arquivoAnteriorDados = await fs.readJson(dataFilePath);
        }

        // Adicionar metadados do novo arquivo
        const newEntry = {
            ...metadata,
            filename: file.originalname,
            path: path.relative(__dirname, file.path),
            uploadDate: new Date(),
            id
        };
        arquivoAnteriorDados.push(newEntry);

        // Salvar os metadados atualizados
        await fs.writeJson(dataFilePath, arquivoAnteriorDados);

        res.status(201).json({ message: 'Upload e registro concluídos com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar o upload', error });
    }
});

// Rota para excluir o upload e os dados
app.delete('/upload/:filename', async (req, res) => {
    const { filename } = req.params;
    const ext = path.extname(filename).slice(1);
    const filePath = path.join(__dirname, `./db/uploads/${ext}/${filename}`);
    const dataFilePath = path.join(__dirname, './db/uploads/data.json');

    try {
        // Verificar se o arquivo de metadados existe
        if (!(await fs.pathExists(dataFilePath))) {
            return res.status(404).json({ message: 'Arquivo de metadados não encontrado' });
        }

        // Ler metadados existentes
        let arquivoAnteriorDados = await fs.readJson(dataFilePath);

        // Filtrar para remover a entrada do arquivo especificado
        const updatedData = arquivoAnteriorDados.filter(entry => entry.filename !== filename);

        // Verificar se o arquivo a ser excluído existe
        if (await fs.pathExists(filePath)) {
            // Excluir o arquivo
            await fs.remove(filePath);
        }

        // Atualizar o arquivo de metadados com os dados restantes
        await fs.writeJson(dataFilePath, updatedData);

        res.status(200).json({ message: 'Upload e dados excluídos com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir o upload e os dados', error });
    }
});

// Rota para criar um registro em uma pasta especificada
app.post('/data/:folder', async (req, res) => {
    const { folder } = req.params;
    let newItem = req.body;
    newItem.id = Date.now()
    const folderPath = path.join(__dirname, './db/' + folder);
    const filePath = path.join(folderPath, 'data.json');
    try {
        // Verificar se a pasta existe, caso contrário, criar
        await fs.ensureDir(folderPath);
        let data = [];
        // Verificar se o arquivo existe, caso contrário, inicializar com array vazio
        if (await fs.pathExists(filePath)) {
            data = await fs.readJson(filePath);
        }
        // Adicionar novo item aos dados e salvar no arquivo
        data.push(newItem);
        await fs.writeJson(filePath, data);
        res.status(201).json({ message: 'Registro criado com sucesso', data: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar registro', error });
    }
});

// Rota para atualizar um registro em uma pasta especificada
app.put('/data/:folder/:id', async (req, res) => {
    let { folder, id } = req.params;
    id = parseInt(id)
    const updatedItem = req.body;
    const folderPath = path.join(__dirname, './db/' + folder);
    const filePath = path.join(folderPath, 'data.json');

    try {
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({ message: 'Arquivo de dados não encontrado' });
        }

        let data = await fs.readJson(filePath);
        const index = data.findIndex(item => item.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }

        data[index] = { ...data[index], ...updatedItem };
        await fs.writeJson(filePath, data);

        res.json({ message: 'Registro atualizado com sucesso', data: data[index] });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar registro', error });
    }
});

// Rota para filtrar registros por parâmetros complexos
app.post('/data/:folder/filter', async (req, res) => {
    const { folder } = req.params;
    const { filters } = req.body; // Obter filtros do corpo da requisição
    const folderPath = path.join(__dirname, './db/' + folder);
    const filePath = path.join(folderPath, 'data.json');

    try {
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({ message: 'Arquivo de dados não encontrado' });
        }

        let data = await fs.readJson(filePath);

        // Filtrar dados de acordo com os filtros especificados
        const filteredData = data.filter(item => {
            return filters.every(({ filtro, condicao, valorprocurado }) => {
                switch (condicao) {
                    case 'indexOf':
                        return item[filtro].includes(valorprocurado);
                    case '==':
                        return item[filtro] === valorprocurado;
                    case '!=':
                        return item[filtro] !== valorprocurado;
                    default:
                        return false;
                }
            });
        });

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao filtrar registros', error });
    }


    /*
    Exemplos de como enviar para busca
    {
        "filters": [

            {"filtro": "id", "condicao": "==", "valorprocurado": 1721951931465},
            
                    {"filtro": "nome", "condicao": "indexOf", "valorprocurado": "atualizado"}
        ]
    }
    */
});

// Rota para deletar um registro por ID em uma pasta especificada
app.delete('/data/:folder/:id', async (req, res) => {
    const { folder, id } = req.params;
    const folderPath = path.join(__dirname, './db/' + folder);
    const filePath = path.join(folderPath, 'data.json');

    try {
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({ message: 'Arquivo de dados não encontrado' });
        }

        let data = await fs.readJson(filePath);
        const initialLength = data.length;
        data = data.filter(item => item.id !== parseInt(id));

        if (data.length === initialLength) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }

        await fs.writeJson(filePath, data);

        res.json({ message: 'Registro deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar registro', error });
    }
});



app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
