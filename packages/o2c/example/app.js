import express from 'express'
import bodyParser from 'body-parser'
import o2c from '../src/index.js'
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.resolve(__dirname,'./public')))

app.post('/api/o2c', async function (req, res) {
  const code = req.body.code
  const resCOde = await o2c(code)
  res.send({
    code: resCOde,
  })
})

app.listen('3009', () => {
  console.log(`Example app listening on port ${3009}`)
})