var path = require('path'),    
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
    // Job default options
    DEFAULTS = {
        program : PROGRAMS['pdflatex'],
        workingDir : '.',
        arguments : {
            interaction : 'nonstopmode'
        },
        status : {
            code : 0,
            done : false,                
            message : 'Initial.',
            success : ''
        },
        getFileName : getFileName,
        getInputFileName : getInputFileName,
        getOutputFileName : getOutputFileName,
        getOutputFilePath : getOutputFilePath,
        getLogFilePath : getLogFilePath
    };

function getInputFileName () {
    return path.basename(this.inputFilePath);
}

function getOutputFileName () {
    return (this.program.extension) ? addExtension(this.arguments.jobname, this.program.extension) : '';
}

function getOutputFilePath () {
    return (this.program.extension) ? joinFilePath.call(this, this.program.extension) : '';
}

function getLogFilePath () {
    return joinFilePath.call(this, EXTENSIONS.LOG); 
}

function joinFilePath(extension) {
    return path.join(this.outputDir, addExtension(this.arguments.jobname, extension)); 
}

function getFileName(extension) {
    return addExtension(this.arguments.jobname, extension);
}

function addExtension(name, extension) {
    return (extension) ? (name + '.' + extension) : name;
}

// Safely merges the new options or the defaults into the job
function setJob (job, options) {
    for (var attr in DEFAULTS) {
        job[attr] = options[attr] || DEFAULTS[attr];
        delete options[attr];
    }
    for (var attr in options) {
        job[attr] = options[attr];
    }
    return job;
}

function getJobName(inputFilePath) {
    return path.basename(inputFilePath, addExtension('', EXTENSIONS.TEX));
}

// Merges the parameters
function mergeOptions (inputFilePath, arg1, arg2) {
    var options = arg2 || {};

    if (typeof arg1 === 'string') {
        options.program = PROGRAMS[arg1];
    } else if (arg1) {
        options = arg1;
    }
    
    options.inputFilePath = inputFilePath;

    // 'jobname' has to be set, it is used to get output file names
    if (!options.arguments || !options.arguments.jobname) {
        options.arguments = options.arguments || {};
        options.arguments.jobname = getJobName(inputFilePath);
    }

    return options;
}

// Latex job constructor
function Job(inputFilePath, arg1, arg2) {
    if (!inputFilePath) {
        throw new Error('Illegal Argument: An inputFilePath must be specified!');
    }
    setJob(this, mergeOptions(inputFilePath, arg1, arg2));
}

module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = function job (inputFilePath, arg1, arg2) {
    return new Job(inputFilePath, arg1, arg2);
};
