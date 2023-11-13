const cookieParser = require('cookie-parser')
const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()
const secretText = 'superSecret'
const refreshsecretText = 'supersupersuperSecret'

const posts = [
  {
    username: 'John',
    title: 'Post 1'
  },
  {
    username: 'Han',
    title: 'Post 2'
  },
]

let refreshTokens = []

app.use(express.json())
app.use(cookieParser())

app.post('/login', (req,res)=> {
  const username = req.body.username
  const user = {name: username}

  const accessToken = jwt.sign(user,secretText,{
    expiresIn: '30s'
  })

  const refreshToken = jwt.sign(user,refreshsecretText,{
    expiresIn: '1d'
  })

  refreshTokens.push(refreshToken)

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  })

  res.json({accessToken: accessToken})
})

app.get('/refresh', (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) return res.sendStatus(403);

  const refreshToken = cookie.jwt;
  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, refreshsecretText, (err, user) => {
    if (err) return res.sendStatus(403);
    
    const accessToken = jwt.sign({ name: user.name }, secretText, { expiresIn: '30s' });
    res.json({ accessToken });
  });
});


app.get('/posts',authMiddleware, (req,res) => {
  res.json(posts)
})

function authMiddleware(req, res, next){
  // 토큰을 request header에 가져오기
  const authheader = req.headers['authorization']
  // bearer fljsdlfjdslj.daskjhdkjashfks
  const token  = authheader && authheader.split(' ')[1]
  if(token == null) return res.sendStatus(401)

  jwt.verify(token, secretText, (err, user)=> {
    if (err) return res.sendStatus(403)
    req.user =user
    next()
  })

}

const port = 4000
app.listen(port, ()=> {
  console.log("listening on port " + port)
})