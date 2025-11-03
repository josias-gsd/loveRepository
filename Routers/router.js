import express from "express";
import { createRequire } from "module";
import multer from "multer";
import stream from "stream";
import cloudinary from "../cloudinary.js"; // agora o import default funciona
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() }); // pega arquivo em memória
function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "meu_app" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url); // devolve o link da imagem
      }
    );

    bufferStream.pipe(uploadStream);
  });
}
router.post("/criar", upload.array("photos", 3), async (req, res) => {
  try {
    const { nome, data, hora, texto, link } = req.body;

    // Faz upload de cada imagem para o Cloudinary
    const uploadedImages = [];
    for (const file of req.files) {
      const imageUrl = await uploadToCloudinary(file.buffer);
      uploadedImages.push(imageUrl);
    }

    // Salva no banco
    const novoUser = await prisma.user.create({
      data: {
        name: nome,
        data,
        hora,
        texto,
        link,
        photos: uploadedImages, // salva URLs do Cloudinary
      },
    });

    res.status(200).json(novoUser);
  } catch (err) {
    console.error("❌ Erro ao criar:", err);
    res.status(500).json({ message: "Erro ao criar" });
  }
});

router.get("/ver", async (req, res) => {
  const start = Date.now();
  try {
    const notes = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        data: true,
        hora: true,
        texto: true,
        link: true,
        photos: true,
      },
      orderBy: { id: "desc" },
    });

    const formatted = notes.map((user) => ({
      ...user,
      photos: user.photos || [],
    }));
    console.log(`⏱️ Tempo total backend: ${Date.now() - start} ms`);
    console.log("📦 Dados recebidos:", formatted);
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    res.status(500).json({ message: "Erro no Servidor!" });
  }
});
/*router.get("/ver/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await prisma.note.findUnique({
      where: { id },
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Erro no Servidor!" });
  }
});*/
router.delete("/deletar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    alert("Nota deletada com sucesso!");
  } catch (erro) {
    res.status(500).json({ message: "erro no servidor" });
  }
});

/*router.put("/atualizar/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;

    await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
      },
    });
    res.status(200).json({ message: "Alteração feita com Sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro no Servidor" });
  }
});
*/
export default router;
