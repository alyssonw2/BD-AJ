import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 4002;

const SECRET_KEY = 'suptec'; // Use uma chave secreta segura em produção
const USERS_DB = path.join(__dirname, './db/users.json');

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'db/uploads')));

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        console.log('Token not provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Rota para registro de usuários
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let users = [];
    if (await fs.pathExists(USERS_DB)) {
        users = await fs.readJson(USERS_DB);
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    await fs.writeJson(USERS_DB, users);

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
});

// Rota para login de usuários
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    let users = [];
    if (await fs.pathExists(USERS_DB)) {
        users = await fs.readJson(USERS_DB);
    }

    const user = users.find(user => user.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const accessToken = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ accessToken });
});

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

// Rota para upload de arquivos (protegida)
app.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    const file = req.file;
    let metadata = req.body;
    const dataFilePath = path.join(__dirname, './db/uploads/data.json');
    const id = new Date();

    try {
        await fs.ensureFile(dataFilePath);

        let arquivoAnteriorDados = [];
        if (await fs.pathExists(dataFilePath)) {
            arquivoAnteriorDados = await fs.readJson(dataFilePath);
        }

        const newEntry = {
            ...metadata,
            filename: file.originalname,
            path: path.relative(__dirname, file.path),
            uploadDate: new Date(),
            type: file.originalname.split('.')[1],
            id
        };
        arquivoAnteriorDados.push(newEntry);

        await fs.writeJson(dataFilePath, arquivoAnteriorDados);

        res.status(201).json({ message: 'Upload e registro concluídos com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar o upload', error });
    }
});

// Rota para excluir o upload e os dados (protegida)
app.delete('/upload/:filename', authenticateToken, async (req, res) => {
    const { filename } = req.params;
    const ext = path.extname(filename).slice(1);
    const filePath = path.join(__dirname, `./db/uploads/${ext}/${filename}`);
    const dataFilePath = path.join(__dirname, './db/uploads/data.json');

    try {
        if (!(await fs.pathExists(dataFilePath))) {
            return res.status(404).json({ message: 'Arquivo de metadados não encontrado' });
        }

        let arquivoAnteriorDados = await fs.readJson(dataFilePath);
        const updatedData = arquivoAnteriorDados.filter(entry => entry.filename !== filename);

        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
        }

        await fs.writeJson(dataFilePath, updatedData);

        res.status(200).json({ message: 'Upload e dados excluídos com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir o upload e os dados', error });
    }
});

app.get('/listalluploads', authenticateToken, async (req, res) => {
    let dados = fs.readFileSync('./db/uploads/data.json', 'utf-8');
    dados = JSON.parse(dados);
    res.send(dados);
});

// Rota para criar um registro em uma pasta especificada (protegida)
app.post('/data/:folder', authenticateToken, async (req, res) => {
    const { folder } = req.params;
    let newItem = req.body;
    newItem.id = Date.now();
    const folderPath = path.join(__dirname, './db/' + folder);
    const filePath = path.join(folderPath, 'data.json');
    try {
        await fs.ensureDir(folderPath);
        let data = [];
        if (await fs.pathExists(filePath)) {
            data = await fs.readJson(filePath);
        }
        data.push(newItem);
        await fs.writeJson(filePath, data);
        res.status(201).json({ message: 'Registro criado com sucesso', data: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar registro', error });
    }
});

// Rota para atualizar um registro em uma pasta especificada (protegida)
app.put('/data/:folder/:id', authenticateToken, async (req, res) => {
    let { folder, id } = req.params;
    id = parseInt(id);
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

// Rota para filtrar registros por parâmetros complexos (protegida)
app.post('/data/:folder/filter', authenticateToken, async (req, res) => {
    const { folder } = req.params;
    const { filters } = req.body;
    const folderPath = path.join(__dirname, './db/' + folder);
    const filePath = path.join(folderPath, 'data.json');

    try {
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({ message: 'Arquivo de dados não encontrado' });
        }

        let data = await fs.readJson(filePath);

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
});

// Rota para deletar um registro por ID em uma pasta especificada (protegida)
app.delete('/data/:folder/:id', authenticateToken, async (req, res) => {
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
