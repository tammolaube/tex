jobs = require('../node-latex-job'),
       path = require('path'),
       mu = require('mu2');

mu.root = 'templates';
var helloJohn = mu.compileAndRender('test.tpl', {name: "Markus"});

job = jobs.newJob("tex/test.tex", { args : {'output-directory' : 'out'}});

job.print(function (job, success) {
    if (success) {
        console.log('Printed: \'' + job.getOutputFilePath() + '\'');
    } else {
        console.log('Error printing: \'' + job.getInput() + '\'');
    }
});
