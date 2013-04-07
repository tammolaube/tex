var spawn = require('child_process').spawn,
    latexjob = require('./node-latex-job');


function print(job) {

    var printJob = startJob(job);

    printJob.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    printJob.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    printJob.on('close', function (code) {
      console.log('child process exited with code ' + code);
    });

}

function startJob(job) {
    console.log(job.getCommand());
    console.log(job.getArgs());
    console.log(job.getOptions());
    return spawn(job.getCommand(), job.getArgs())
}

module.exports.print = print;
