import express from 'express'

const app = express();

app.use(express.static("public"));
app.use((req,res) => {
  res.sendFile("index.html", { root: './public/html' });
})

app.listen(3000, () => console.log('Сервер запущен'))