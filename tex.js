var _ = require('underscore')
  , path = require('path')
  , spawn = require('child_process').spawn
  , readline = require('readline')
  , stream = require('stream')
  , ClearStream = require('./util/clearstream').ClearStream
  , EXTENSIONS = {
        TEX : 'tex',
        LOG : 'log',
        PDF : 'pdf',
        DVI : 'dvi'
    }
  , PROGRAMS = {
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
    }
  , DEFAULTS = {
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

module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = newJob;

function newJob (input, arg1, arg2) {
    return new Job(input, arg1, arg2);
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
    this.privates = {};

    if (!input) {
        throw new Error('Illegal Argument: An input must be specified!');
    }

    if (typeof input !== 'string' && !(input instanceof stream.Stream)) {
        throw new Error('Input must be a path or a stream.Stream!');
    }

    // Initialize with privates with arguments or defaults
    {
        _.extend(this.privates, DEFAULTS, arg2);

        if (typeof arg1 === 'string') {
            this.privates.program = PROGRAMS[arg1];
        } else {
            _.extend(this.privates, arg1) 
        }

        // Deep extension of privates with support of the defaults
        {
            _.extend(this.privates.args, DEFAULTS.args, this.privates.args);
            _.extend(this.privates.options, DEFAULTS.options, this.privates.options);
        }

        this.privates.input = input;
    }

}

Job.prototype.getJobName = function () {
    var jobname = this.privates.args.jobname;
    if (!jobname) {
        jobname = this.getInputFileName();
        if (jobname) {
            jobname = path.basename(jobname, '.' + EXTENSIONS.TEX);            
        }
    }
    return jobname;
}

Job.prototype.getFileName = function (extension) {
    var jobname = this.getJobName();
    return (jobname && extension) ? addExtension(jobname, extension) : undefined;
}

Job.prototype.getInput = function () {
    return this.privates.input;
}

Job.prototype.getInputFileName = function () {
    var inputFileName;
    if (typeof this.privates.input === 'string') {
        inputFileName = path.basename(this.privates.input);
    }
    return inputFileName;
}

Job.prototype.getOutputExtension = function () {
    return this.privates.program.extension;
}

Job.prototype.getOutputFileName = function () {
    return this.getFileName(this.privates.program.extension);
}

Job.prototype.getOutputDirectory = function () {
    return this.privates.args['output-directory'];
}

Job.prototype.getOutputFilePath = function () {
    return getOutputPath.call(this, this.getOutputFileName());
}

Job.prototype.getLogFileName = function () {
    return this.getFileName(EXTENSIONS.LOG);
}

Job.prototype.getLogFilePath = function () {
    return getOutputPath,call(this, this.getLogFileName());
}

Job.prototype.getCommand = function () {
    return this.privates.program.command;
}

Job.prototype.getStatus = function () {
    return this.privates.status;
}

// Converts the args object into an array compatible for *tex programs.
// Keys with the values { undefined, null, '' } are returned as '-key'.
// Keys with values are returned as '-key=value'.
Job.prototype.getArgs = function () {
    var ret = [];    
    for (var attr in this.privates.args) {
        var arg = '-' + attr,
            val = this.privates.args[attr];
        if (val) {
            arg += '=' + val;
        }        
        ret.push(arg);
    }
    if (typeof this.privates.input === 'string') {
        ret.push(this.privates.input);
    }
    return ret;
}

Job.prototype.getOptions = function () {
    return this.privates.options;
}

Job.prototype.print = function (callback) {
    var job = this,
        printJob = startJob(this);

    printJob.on('close', function (code) {
        console.log('Print job finished with code \'' + code + '\'');
        job.privates.status.code = code;
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
    var printJob = spawn(job.getCommand(), job.getArgs(), job.getOptions())
      , cls = new ClearStream(/\r?\n|\r(?!\n)/gi);

    //printJob.stdout.pipe(process.stdout);

    if (typeof job.privates.input !== 'string') {
        job.privates.input.pipe(cls);
        cls.pipe(printJob.stdin);
    }

    return printJob; 
}
