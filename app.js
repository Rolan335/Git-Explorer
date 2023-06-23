const express = require("express")
const request = require('request')
const ejs = require('ejs');
const urlencodedParser = express.urlencoded({ extended: false })
const fs = require('fs')
const app = express()
const filePath = __dirname + "/index.ejs";


let searchHistory = ""
let downloadHistory = ""


// Логика такая - под каждое ключевое слово создаём экземпляр класса и добавляем к нему urlы.
const urlList = []

class Url {
    url = []
    constructor(key) {
        this.key = key
        urlList.push(this)
    }
    addUrl(url) {
        this.url.push(...url)
    }
}


const algorythms = new Url("Алгоритмы и структуры данных")
algorythms.addUrl(["https://raw.githubusercontent.com/Rolan335/2.2-semester/master/Algorythms_Data_structure/kt1.js", "https://raw.githubusercontent.com/Rolan335/2.2-semester/master/Algorythms_Data_structure/kt2.js"])
const xml = new Url("Основы языка xml")
xml.addUrl(["https://raw.githubusercontent.com/Rolan335/2.2-semester/master/XML/xslKeys/xsl.xsl", "https://raw.githubusercontent.com/Rolan335/2.2-semester/master/XML/xslfinal/xsl.xsl","https://raw.githubusercontent.com/Rolan335/2.2-semester/master/XML/xslVariables/xslV.xsl"])
const dms = new Url("СУБД")
dms.addUrl(["https://raw.githubusercontent.com/Rolan335/2.2-semester/master/DMS%20(PostgreSQL%2C%20Oracle%2C%20MySQL)/functionsPostgresql.sql", "https://raw.githubusercontent.com/Rolan335/2.2-semester/master/DMS%20(PostgreSQL%2C%20Oracle%2C%20MySQL)/rolesPostgre.sql",
"https://raw.githubusercontent.com/Rolan335/2.2-semester/master/DMS%20(PostgreSQL%2C%20Oracle%2C%20MySQL)/functionsMySQL.sql"])

app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});

app.get("/", function (request, response) {
    response.render(filePath, { searchResult: searchHistory, downloadHistory: downloadHistory })
})

app.post("/", urlencodedParser, async function (request, response) {
    if (!request.body) return response.sendFile(filePath)
    for (let i = 0; i < urlList.length; i++) {
        if (request.body.inputRequest.toLowerCase() === urlList[i].key.toLowerCase()) {
            let urls = `<h1 class='search__title'>${urlList[i].key}</h1>`
            urlList[i].url.forEach(element => {
                //В href убираем https:/
                urls += `<li class='search__result'><a class=link href=${element.substring(7)}>${element}</a></li>`
            })
            let json = JSON.stringify(urls)
            searchHistory += json.substring(1, json.length - 1)
            response.render(filePath, { searchResult: searchHistory, downloadHistory: downloadHistory })
        }
        else {
            response.status(404).sendFile(__dirname + "/notFound.html")
        }
    }
})

//Реализация загрузки
app.get("/raw.githubusercontent.com/Rolan335/2.2-semester/master\*", async function (req, res) {
    let date = new Date().toLocaleString();
    //Для скачивания https:/ добавляем
    const fileUrl = `https:/${req.url}`;
    //Как название файла берём строку с конца ссылки до последнего слэша
    const regexp = /^.*\//
    const fileName = fileUrl.replace(regexp, '')
    downloadHistory += `<div><a href=${fileUrl}>${date} | ${fileName}</a></div>`
    //Да. deprecated.
    request(fileUrl).pipe(fs.createWriteStream(fileName))
        .on('close', () => {
            res.download(fileName, (err) => {
                if (err) {
                } else {
                    fs.unlink(fileName, (err) => {
                        if (err) throw err;
                    });
                }
            })
        })
        .on('error', (err) => {
            res.send('Error downloading file!');
        })
})

//Удаление истории скачивания и поиска (фича)
app.get("/del", function (req, res) {
    downloadHistory = ""
    searchHistory = ""
    if (downloadHistory !== "" && searchHistory !== "") {
        res.redirect("/").render(filePath, { searchResult: searchHistory, downloadHistory: downloadHistory })
    }
    else {
        res.redirect("/")
    }
})

app.listen(1999)
