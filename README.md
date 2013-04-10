# node-latex
Connecting node.js and LaTeX

### Dependencies
At first, you need a TeX system like [texlive](http://www.tug.org/texlive/).

The module also depends on [underscore](https://npmjs.org/package/underscore).

    $ npm install underscore

### Most basic usage
Just specify a file to typeset and call print to typeset.
```javascript
var node-latex = require('./node-latex');
var job = node-latex.newJob('Text.tex');
job.print(function (job, success) {
  if (success) {
    console.log('Printed: \'' + job.getOutputFilePath() + '\'');  // Printed: 'Text.pdf'
  } else {
    console.log('Error printing: \'' + job.getInput() + '\'');    // Error printing: 'Text.tex'
  }
});
```
If no other options are provided, `pdflatex` is spawned in the working directory of node's process.

    $ pdflatex -interaction=batchmode Text.tex
    
### Jobs
The job provides the following interface:
```javascript
{ getJobName: [Function],
  getFileName: [Function],
  getInput: [Function],
  getInputFileName: [Function],
  getOutputExtension: [Function],
  getOutputFileName: [Function],
  getOutputDirectory: [Function],
  getOutputFilePath: [Function],
  getLogFileName: [Function],
  getLogFilePath: [Function],
  getCommand: [Function],
  getStatus: [Function],
  getArgs: [Function],
  getOptions: [Function],
  print: [Function] }
```

###### getJobName() : String or undefined
Returns the jobname or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

###### getFileName(extension) : String or undefined
Returns the jobname concatenated with a '.' and the passed extension or undefined if `getJobName()` returns `undefined` or if the extension is `undefined`.

###### getInput() : String or {}
Returns whatever was passed as input, hopefully a string or an object of type [stream.Readable](http://nodejs.org/api/stream.html#stream_class_stream_readable).

###### getInputFileName() : String or undefined
Returns the name of the input file or `undefined` if a stream was passed as input.

###### getOutputFileName() : String or undefined
Returns the name of the output file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

###### getOutputDirectory() : String or undefined
Returns the output directory or `undefined` if it was not specified in the `options.args`.

###### getOutputFilePath() : String or undefined
Returns the path of the output file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

###### getLogFileName() : String or undefined
Returns the name of the log file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.
      
###### getLogFilePath() : String or undefined
Returns the path of the log file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

###### getCommand() : String
Returns the command/program to be executed. I.e. `pdflatex`, `pdftex`, `latex`, `tex`, `bibtex`, `mkindex`.
    
###### getStatus() : {}
Returns the status object of the job. After the job it holds a field code with the exit code of the TeX child process.

###### getArgs() : {}
Returns the args for the *TeX child process. 
Converts the args object into an array compatible for TeX programs.
* Keys with the values `{ undefined, null, '' }` are returned as '-key'.
* Keys with values are returned as '-key=value'.

See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) 

###### getOptions(): {}
Returns the options for the spawned child process.

See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)  

###### print(callback) : undefined
Starts a job by spawning a TeX child process.
The callback's parameters are the job executed and a boolean, which is true when the TeX child process finished with no errors (code 0).

See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) 
