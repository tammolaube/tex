var _ = require('underscore'), 
    path = require('path'),    
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
            cwd: undefined,
            env: process.env
        },
        status : {
            code : undefined,
            success : undefined
        }
    };

function addExtension(name, extension) {
    return (extension) ? (name + '.' + extension) : name;
}

// Latex job constructor
function Job(inputFilePath, arg1, arg2) {
    var holder = {};    

    if (!inputFilePath) {
        throw new Error('Illegal Argument: An inputFilePath must be specified!');
    }

    _.extend(holder, DEFAULTS, arg2);

    if (typeof arg1 === 'string') {
        holder.program = PROGRAMS[arg1];
    } else {
        _.extend(holder, arg1) 
    }

    _.extend(holder.args, DEFAULTS.args, holder.args);
    _.extend(holder.options, DEFAULTS.options, holder.options);

    holder.inputFilePath = inputFilePath;

    this.getJobName = function () {
        return (holder.args.jobname) ? holder.args.jobname : path.basename(holder.inputFilePath, addExtension('', EXTENSIONS.TEX));
    }

    this.getFileName = function (extension) {
        return addExtension(this.getJobName(), extension);
    }

    this.getInputFileName = function () {
        return path.basename(holder.inputFilePath);
    }

    this.getInputFilePath = function () {
        return holder.inputFilePath;
    }

    this.getOutputExtension = function () {
        return (holder.program.extension) ? holder.program.extension : '';
    }

    this.getOutputFileName = function () {
        return (holder.program.extension) ? this.getFileName(holder.program.extension) : '';
    }

    this.getOutputDirectory = function () {
        return (holder.args['output-directory']) ? holder.args['output-directory'] : '.';
    }

    this.getOutputFilePath = function () {
        return (holder.program.extension) ? joinFilePath.call(this, holder.program.extension) : '';
    }

    this.getLogFileName = function () {
        return this.getFileName(EXTENSIONS.LOG); 
    }

    this.getLogFilePath = function () {
        return joinFilePath.call(this, EXTENSIONS.LOG); 
    }

    this.getCommand = function () {
        return holder.program.command;
    }

    this.getStatus = function () {
        return holder.status;
    }

    // Converts the args object into an array compatible for *tex programs
    this.getArgs = function () {
        var ret = [];    
        for (var attr in holder.args) {
            var arg = '-' + attr,
                val = holder.args[attr];
            if (val) {
                arg += '=' + val;
            }        
            ret.push(arg);
        }
        ret.push(holder.inputFilePath);
        return ret;
    }

    this.getOptions = function () {
        return holder.options;
    }

    function joinFilePath(extension) {
        return path.join(this.getOutputDirectory(), addExtension(this.getJobName(), extension)); 
    }

}

module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = function job (inputFilePath, arg1, arg2) {
    return new Job(inputFilePath, arg1, arg2);
};
