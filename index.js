const fetch = require('node-fetch');
const redis = require('redis');
const express = require('express');
const http = require('http');
const app = express()
const server = http.createServer(app)
// PORTS
const Redis_port = process.env.PORT || 6379;
const port = process.env.PORT || 3000;
// -----
const client = redis.createClient(Redis_port)

async function getRepos(req,res,next){
try {
    console.log('Fetching Data...')
    const username = req.params.username;
    const response = await fetch(`https://api.github.com/users/${username}`)
    const data =await response.json()
    const repo =data.public_repos;
    // set data to redis
    client.setex(username,3600,repo)
    res.send(`<h1>${username} has ${repo} Github repos</h1>`)
} catch (error) {
    console.log(error)
    res.status(500)
}
}
function cache(req,res,next){
    const username=req.params.username;

    client.get(username,(err,repo)=>{
        if(err) throw err;
        if(repo){
            res.send(`<h1>${username} has ${repo} Github repos</h1>`)
        }else{
            next()
        }
    })
}

app.get('/repos/:username',cache,getRepos)

server.listen(port,()=>{
    console.log(`Connect to server:${port}`)
})