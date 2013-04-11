jobs = require('../tex'),
       mu = require('mu2')
       readline = require('readline');

mu.root = 'templates';
var helloJohn = mu.compileAndRender('test.tpl', {name: "John"});

var Readable = require('stream').Readable;
var myReader = new Readable().wrap(helloJohn);

job = jobs.newJob(myReader, { args : {
    jobname : 'foo',
    'output-directory' : 'out',
    'halt-on-error' : ''
}});

job.print(function (job, success) {
    if (success) {
        console.log('Printed: \'' + job.getOutputFilePath() + '\''); // Printed: 'helloJohn.pdf'
    } else {
        console.log('Error printing stream: \'' + job.getJobName() + '\''); // Error printing stream: 'helloJohn'
    }
});
