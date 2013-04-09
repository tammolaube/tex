# node-latex
Connecting node.js and LaTeX

## Dependencies
underscore

    $ npm install underscore


## Most basic usage
Just specify a file to typeset and call print to typeset.

    var node-latex = require('./node-latex');
    var job = node-latex.newJob('Text.tex');
    job.print();

If no other options are provided, pdftex is spawned in the working directory of node's process.

    $ pdftex -interaction=batchmode Text.tex
    

## API
    
### Job

### Job options

### Print callback

    job.print(function (job, success) {
      if (success) {
        console.log('Printed: \'' + job.getOutputFilePath() + '\'');  // Printed: 'Text.pdf'
      } else {
        console.log('Error printing: \'' + job.getInput() + '\'');    // Error printing: 'Text.tex'
      }
    });
