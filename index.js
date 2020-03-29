'use strict';
const request = require('request');
const logSymbols = require('log-symbols');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const sha1 = require('js-sha1');
const { join } = require('path');

const app = express();

app.use(express.json());
app.use(cors());

async function getCryptedMessage() {
    var alfa = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var result = [];
    try {
        const response = await axios.get('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=bf2757bb351cb6f8239c6d27b1f1a916862ef906');
        const encrypted = response.data.cifrado;

        var parts = encrypted.split(" ");
        parts.forEach(part => {
            var crypted = part.toLowerCase().split("");
            var new_crypted = crypted;

            var index = 0;
            crypted.forEach(c => {
                if (alfa.includes(c)) {
                    var pos = alfa.indexOf(c);

                    for(var i = 0; i<11; i++) {
                        pos = pos - 1;
                        if (pos < 0) {
                            pos = 25;
                        }
                    }

                    var new_value = alfa[pos];
                    new_crypted[index] = new_value;
                }
                index++;
            });
            result.push(new_crypted.join(''));
        });
        response.data.decifrado = result.join(' ');
        response.data.resumo_criptografico = sha1(response.data.decifrado);

        const data = JSON.stringify(response.data,null,2);
        fs.writeFileSync('answer.json', data);

        return result.join(' ');
        
    } catch (error) {
        console.error(error);
    }
}

async function submit() {

    const newAnswer = fs.createReadStream(join(__dirname, 'answer.json'));

    await request(
        {
            method: 'POST',
            url: "https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=bf2757bb351cb6f8239c6d27b1f1a916862ef906",
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            formData: {
                answer: newAnswer
            }
        },
        (err, res, body) => {
            if (err) {
            console.log(logSymbols.error, err);
            }

            console.log(logSymbols.success, body);
        }
    );
}

//getCryptedMessage().then(res => {console.log(res);});


submit().then(res => {console.log(res);});

app.listen(process.env.PORT || 3001);