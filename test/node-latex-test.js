jobs = require('../node-latex-job');

job = jobs.newJob('/home/tammo/workspace/node-latex/test/tex/tests.tex', { args : {'output-directory' : 'tex/out'}});

job.print(function (success, job) {
    if (success) {
        console.log('Printed: \'' + job.getOutputFilePath() + '\'');
    } else {
        console.log('Error printing: \'' + job.getInputFilePath() + '\'');
    }

    console.log(job);
});
