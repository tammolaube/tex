var _ = require('underscore'), 
    path = require('path'),
    spawn = require('child_process').spawn,
    EXTENSIONS = {
        TEX : 'tex',
        LOG : 'log',
        PDF : 'pdf',
        DVI : 'dvi'
    },
    PROGRAMS = {
        pdflatex : {
            command : 'pdflatex',
            extension : EXTENSIONS.PDF
        },
        pdftex : {
            command : 'pdftex',
            extension : EXTENSIONS.PDF
        },
        tex : {
            command : 'tex',
            extension : EXTENSIONS.DVI
        },
        latex : {
            command : 'latex',
            extension : EXTENSIONS.DVI
        },
        bibtex : {
            command : 'bibtex'
        },
        mkindex : {
            command : 'mkindex'
        }
    },
    DEFAULTS = {
        program : PROGRAMS['pdflatex'],
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

// Latex job
// Constructor signature: Job(input, [program], [options])
//     input: Path to the .tex file to compile or a stream.Readable.
//     program: See PROGRAMS
//     options: See DEFAULTS
//         .program: See PROGRAMS. This will be overwritten with the program argument of the constructor, if a program is specified.
//         .args: Use Job.getArgs() to get an array of tex args suitable for use with require('child_process').spawn(command, [args]).
//         .options: Gets passed to require('child_process').spawn(command, [args], [options]).
function Job(input, arg1, arg2) {
    var privates = {};

    if (!input) {
        throw new Error('Illegal Argument: An input must be specified!');
    }

    // Initialize with privates with arguments or defaults
    {
        _.extend(privates, DEFAULTS, arg2);

        if (typeof arg1 === 'string') {
            privates.program = PROGRAMS[arg1];
        } else {
            _.extend(privates, arg1) 
        }

        // Deep extension of privates with support of the defaults
        {
            _.extend(privates.args, DEFAULTS.args, privates.args);
            _.extend(privates.options, DEFAULTS.options, privates.options);
        }

        privates.input = input;
    }

    this.getJobName = function () {
        var jobname = privates.args.jobname;
        if (!jobname) {
            jobname = this.getInputFileName();
            if (jobname) {
                jobname = path.basename(jobname, '.' + EXTENSIONS.TEX);            
            }
        }
        return jobname;
    }

    this.getFileName = function (extension) {
        var jobname = this.getJobName();
        return (jobname && extension) ? addExtension(jobname, extension) : undefined;
    }

    this.getInput = function () {
        return privates.input;
    }

    this.getInputFileName = function () {
        var inputFileName;
        if (typeof privates.input === 'string') {
            inputFileName = path.basename(privates.input);
        }
        return inputFileName;
    }

    this.getOutputExtension = function () {
        return privates.program.extension;
    }

    this.getOutputFileName = function () {
        return this.getFileName(privates.program.extension);
    }

    this.getOutputDirectory = function () {
        return privates.args['output-directory'];
    }

    this.getOutputFilePath = function () {
        return getOutputPath.call(this, this.getOutputFileName());
    }

    this.getLogFileName = function () {
        return this.getFileName(EXTENSIONS.LOG);
    }

    this.getLogFilePath = function () {
        return getOutputPath,call(this, this.getLogFileName());
    }

    this.getCommand = function () {
        return privates.program.command;
    }

    this.getStatus = function () {
        return privates.status;
    }

    // Converts the args object into an array compatible for *tex programs.
    // Keys with the values { undefined, null, '' } are returned as '-key'.
    // Keys with values are returned as '-key=value'.
    this.getArgs = function () {
        var ret = [];    
        for (var attr in privates.args) {
            var arg = '-' + attr,
                val = privates.args[attr];
            if (val) {
                arg += '=' + val;
            }        
            ret.push(arg);
        }
        if (typeof privates.input === 'string') {
            ret.push(privates.input);
        }
        return ret;
    }

    this.getOptions = function () {
        return privates.options;
    }

    this.print = function (callback) {
        var job = this,
            printJob = startJob(this);

        printJob.stdout.pipe(process.stdout);

        if (typeof privates.input !== 'string' && privates.input.pipe !== 'undefined') {
            try {
                privates.input.pipe(printJob.stdin);
            } catch (e) {
                console.log('Error while piping input: \'' + e + '\'');
                console.log('Trying to kill print job: \'' + job.getJobName() + '\'');
                printJob.stdin.end();
            }
        }

        printJob.on('close', function (code) {
            console.log('Print job finished with code \'' + code + '\'');
            privates.status.code = code;
            if (typeof callback === 'function') {
                callback(job, code == 0);
            }
        });

        return undefined;
    }

    function getOutputPath(fileName) {
        return (fileName) ? path.join(this.getOutputDirectory(), fileName) : undefined;
    }

    function addExtension(name, extension) {
        var extendedName;
        if (name) {
            extendedName = name;
        }
        if (extension) {
            extendedName += '.' + extension;
        }
        return extendedName;
    }

    function startJob(job) {
        return spawn(job.getCommand(), job.getArgs(), job.getOptions());
    }

}

function newJob (input, arg1, arg2) {
    return new Job(input, arg1, arg2);
};

module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = newJob; 
