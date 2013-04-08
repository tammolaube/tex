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
            interaction : 'nonstopmode'
        },
        options : { 
            cwd : undefined,
            env : process.env
        },
        status : {
        }
    };

// Latex job
// Constructor signature: Job(inputFilePath, [program], [options])
//     inputFilePath: Path to the .tex file to compile.
//     program: See PROGRAMS
//     options: See DEFAULTS
//         .program: See PROGRAMS. This will be overwritten with the program argument of the constructor, if a program is specified.
//         .args: Use Job.getArgs() to get an array of tex args suitable for use with require('child_process').spawn(command, [args]).
//         .options: Gets passed to require('child_process').spawn(command, [args], [options]).
function Job(inputFilePath, arg1, arg2) {
    var privates = {};

    if (!inputFilePath) {
        throw new Error('Illegal Argument: An inputFilePath must be specified!');
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

        privates.inputFilePath = inputFilePath;
    }

    this.getJobName = function () {
        return (privates.args.jobname) ? privates.args.jobname : path.basename(privates.inputFilePath, addExtension('', EXTENSIONS.TEX));
    }

    this.getFileName = function (extension) {
        return addExtension(this.getJobName(), extension);
    }

    this.getInputFileName = function () {
        return path.basename(privates.inputFilePath);
    }

    this.getInputFilePath = function () {
        return privates.inputFilePath;
    }

    this.getOutputExtension = function () {
        return (privates.program.extension) ? privates.program.extension : '';
    }

    this.getOutputFileName = function () {
        return (privates.program.extension) ? this.getFileName(privates.program.extension) : '';
    }

    this.getOutputDirectory = function () {
        return (privates.args['output-directory']) ? privates.args['output-directory'] : '.';
    }

    this.getOutputFilePath = function () {
        return (privates.program.extension) ? joinFilePath.call(this, privates.program.extension) : '';
    }

    this.getLogFileName = function () {
        return this.getFileName(EXTENSIONS.LOG); 
    }

    this.getLogFilePath = function () {
        return joinFilePath.call(this, EXTENSIONS.LOG); 
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
        ret.push(privates.inputFilePath);
        return ret;
    }

    this.getOptions = function () {
        return privates.options;
    }

    function joinFilePath(extension) {
        return path.join(this.getOutputDirectory(), addExtension(this.getJobName(), extension)); 
    }

    function addExtension(name, extension) {
        return (extension) ? (name + '.' + extension) : name;
    }

    this.print = function (callback) {
        var job = this,
            printJob = startJob(this);

        printJob.on('close', function (code) {
            console.log('Print job finished with code \'' + code + '\'');
            privates.status.code = code;
            callback(code == 0, job);
        });

    }

    function startJob(job) {
        return spawn(job.getCommand(), job.getArgs(), job.getOptions());
    }

}

function newJob (inputFilePath, arg1, arg2) {
    return new Job(inputFilePath, arg1, arg2);
};

module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = newJob; 
