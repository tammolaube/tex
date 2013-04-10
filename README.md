# node-latex
Connecting node.js and LaTeX

## Dependencies
At first, you need a TeX system like [texlive](http://www.tug.org/texlive/).

The module also depends on [underscore](https://npmjs.org/package/underscore).
```shell
$ npm install underscore
```
## Usage

### Most basic
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
```shell
$ pdflatex -interaction=batchmode Text.tex
```

### With streams
You can input objects of type [stream.Readable](http://nodejs.org/api/stream.html#stream_class_stream_readable).

>**Don't forget to specify a jobname if you typeset a stream because tex is run in interactive mode.**
>
>**Newlines inside the stream are not yet supported.**

Example usecase in connection with [mustache](https://github.com/raycmorgan/Mu).
```javascript
mu.root = 'templates';
var helloJohn = mu.compileAndRender('test.tpl', {name: "John"});

job = jobs.newJob(helloJohn, { args : {'jobname' : 'helloJohn'}});

job.print(function (job, success) {
    if (success) {
        console.log('Printed: \'' + job.getOutputFilePath() + '\''); // Printed: 'helloJohn.pdf'
    } else {
        console.log('Error printing stream: \'' + job.getJobName() + '\''); // Error printing stream: 'helloJohn'
    }
});
```

##API
    
### require('./node-latex')

##### newJob(input, [command], [options])
```javascript
require('./node-latex').newJob(input, [command], [options]) : Job
```

##### input
Either a file path or an object of type [stream.Readable](http://nodejs.org/api/stream.html#stream_class_stream_readable).
 
##### command (optional)
One of: `pdflatex`, `pdftex`, `latex`, `tex`, `bibtex`, `mkindex`.

Defaults to `pdflatex`.

##### options (optional)
The defaults are:
```javascript
{
    program : {
        command : 'pdflatex',
        extension : 'pdf'
    },
    args : {
        interaction : 'batchmode'
    },
    options : { 
        cwd : undefined,
        env : process.env
    },
    status : {
    }
};
```

###### options.args
These get passed to the TeX child process via `getArgs()`. You can pass any key value pairs. Those will be used as options for the TeX child process.

> **Example**
>
> If this args object is passed
> ```javascript
> args : {
>     jobname : 'foo',
>     output-directory : 'bar',
>     halt-on-error : '' // or undefined or null
> }
> ```
>then `getArgs()` returns
> ```javascript
> [ '-jobname=foo',
>   '-output-directory=bar',
>   '-halt-on-error',
>   '-interaction=batchmode' ]
> ```

> See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)  

###### options.options
Forwarded directly to `child_process.spawn(command, [args], [options])`.

> See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)  

###### options.status
After the `print()` it holds a field `code` with the exit code of the TeX child process.

> See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

### Job

#### print(callback)
```javascript
print(callback) : undefined
```
Starts a job by spawning a TeX child process.
The callback's parameters are the job executed and a boolean, which is true when the TeX child process finished with no errors (code 0).
 
> See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

#### getJobName()
```javascript
getJobName() : String or undefined
```
Returns the jobname or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

#### getFileName(extension)
```javascript
getFileName(extension) : String or undefined
```
Returns the jobname concatenated with a '.' and the passed extension or undefined if `getJobName()` returns `undefined` or if the extension is `undefined`.

#### getInput()
```javascript
getInput() : String or {}
```
Returns whatever was passed as input, hopefully a string or an object of type [stream.Readable](http://nodejs.org/api/stream.html#stream_class_stream_readable).

#### getInputFileName()
```javascript
getInputFileName() : String or undefined
```
Returns the name of the input file or `undefined` if a stream was passed as input.

#### getOutputFileName()
```javascript
getOutputFileName() : String or undefined
```
Returns the name of the output file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

#### getOutputDirectory()
```javascript
getOutputDirectory() : String or undefined
```
Returns the output directory or `undefined` if it was not specified in the `options.args`.

#### getOutputFilePath()
```javascript
getOutputFilePath() : String or undefined
```
Returns the path of the output file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

#### getLogFileName()
```javascript
getLogFileName() : String or undefined
```
Returns the name of the log file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

#### getLogFilePath()
```javascript
getLogFilePath() : String or undefined
```
Returns the path of the log file or `undefined` if a stream was passed as input and no jobname is specified in the `options.args`.

#### getCommand()
```javascript
getCommand() : String
```
Returns the command/program to be executed. I.e. `pdflatex`, `pdftex`, `latex`, `tex`, `bibtex`, `mkindex`.

#### getStatus()
```javascript
getStatus() : {}
```
Returns the status object of the job. After `print()` it holds a field `code` with the exit code of the TeX child process.

> See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

#### getArgs()
```javascript
getArgs() : {}
```
Returns the args for the *TeX child process. 
Converts the args object into an array compatible for TeX programs.
* Keys with the values `{ undefined, null, '' }` are returned as '-key'.
* Keys with values are returned as '-key=value'.

> See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) 

#### getOptions()
```javascript
getOptions() : {}
```
Returns the options for the spawned child process.

> See: [child_process.spawn(command, [args], [options])](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
