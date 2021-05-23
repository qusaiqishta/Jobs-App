'use strict'

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');

require('dotenv').config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(cors());
app.set('view engine', 'ejs');

const client = new pg.Client(DATABASE_URL);

app.get('/', homeRoute);
app.get('/search', searchJob);
app.get('/searchResult', searchResult)
app.post('/addJob', addJob);
app.get('/myJobs', myJobs)
app.get('/details/:id', jobDetails)
app.delete('/details/:id', deleteJob)
app.put('/details/:id', updateJob)


function homeRoute(req, res) {
    const url = 'https://jobs.github.com/positions.json?location=usa';
    superagent.get(url).then(result => {
        let jobsArray = result.body.map(object => new Job(object));
        res.render('index', { jobs: jobsArray })
    })
}


function searchJob(req, res) {
    
        res.render('searchJob')
    
}

function searchResult(req, res) {
    const description = req.query;
    const url = `https://jobs.github.com/positions.json?description=${description}&location=usa`;
    superagent.get(url).then(result => {
        const ResultArray = result.body.map(object => new Job(object));
        res.render('searchResults', { results: ResultArray })
    })


}


function addJob(req, res) {
    const { title, company, location, url } = req.body;
    const sql = 'INSERT INTO jobs (title,company,location,url) VALUES($1,$2,$3,$4);';
    const safeValues = [title, company, location, url];
    client.query(sql, safeValues).then(() => {
        res.redirect('/myJobs')
    })

}

function myJobs(req, res) {
    const sql = 'SELECT * FROM jobs;';
    client.query(sql).then(result => {
        res.render('myJobs', { jobs: result.rows })
    })
}




function jobDetails(req, res) {
    const jobId = req.params.id;
    const sql = 'SELECT * FROM jobs WHERE id=$1;';
    const safeValue = [jobId];
    client.query(sql, safeValue).then(result => {
        res.render('details', { details: result.rows[0] })
    })
}


function updateJob(req, res) {
    const jobId = req.params.id;
    const { title, company, location, url, description } = req.body;
    const safeValues = [title, company, location, url, description, jobId];
    client.query(sql, safeValues).then(() => {
        res.redirect(`/details/${jobId}`)
    })
}

function deleteJob(req, res) {
    const jobId = req.params.id;
    const sql = 'DELETE FROM jobs WHERE id=$1;';
    const safeValue = [jobId];
    client.query(sql, safevalue).then(() => {
        res.redirect('/myJobs')
    })
}





function Job(data) {
    this.title = data.title;
    this.company = data.company;
    this.location = data.location;
    this.url = data.url;
    this.description = data.description;
}



client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('server up on', PORT)
    })
})