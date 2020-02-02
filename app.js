const express = require('express')
const app = express()
const port = 3000
const app_name = 'Prom Push'
const client = require('prom-client')
const bodyParser = require('body-parser')
let metrics = {}

app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/push', (req, res) => {

    let type = req.body.type
    let key = req.body.key
    let value = req.body.value
    let help = req.body.help
    let labels = req.body.labels
    let percentiles = req.body.percentiles

    if(metrics[key] != undefined) {
      metrics[key].set(value)
    }
    else {
        switch (type) {
        case "histogram":
            h = new client.Histogram({
                name: key,
                help: help,
                labelNames: labels
            });
            metrics[key] = h
            h.set(value)
            break
        case "counter":
            c = new client.Counter({
                name: key,
                help: help,
                labelNames: labels
            });
            c.set(value)
            metrics[key] = c
            break
        case "gauge":
                g = new client.Gauge({
                    name: key,
                    help: help,
                    labelNames: labels
                })
                g.set(value)
                metrics[key] = g;
            break
        case "summary":
            s = new client.Summary({
                name: key,
                help: help,
                percentiles: percentiles
            });
            s.set(value)
            metrics[key] = s
            break
        }
    }
    res.send(metrics[key])
});

app.get('/metrics', (req, res) => {
	res.set('Content-Type', client.register.contentType)
	res.end(client.register.metrics())
});

app.listen(port, () => console.log(`${app_name} listening on port ${port}!`))
