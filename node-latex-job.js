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
        outputDir : 'tmp/node-latex/out',
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
    return (this.program.extension) ? addExtension(this.jobName, this.program.extension) : '';
}

function getOutputFilePath () {
    return (this.program.extension) ? joinFilePath.call(this, this.program.extension) : '';
}

function getLogFilePath () {
    return joinFilePath.call(this, EXTENSIONS.LOG); 
}

function joinFilePath(extension) {
    return path.join(this.outputDir, addExtension(this.jobName, extension)); 
}

function getFileName(extension) {
    return addExtension(this.jobName, extension);
}

function addExtension(name, extension) {
    return (extension) ? (name + '.' + extension) : name;
}

// Safely merges the new options or the defaults into the job
function setJob (job, options) {
    options = options || {};
    for (var attr in DEFAULTS) {
        job[attr] = options[attr] || DEFAULTS[attr];
        delete options[attr];
    }
    for (var attr in options) {
        job[attr] = options[attr];
    }
    return job;
}

// Merges the possible parameters 2 and 3
function mergeOptions (arg1, arg2) {
    var options = arg2 || {};
    
    if (typeof arg1 === 'string') {
        options.program = PROGRAMS[arg1];
    } else {
        options = arg1;
    }

    return options;
}

// Latex job constructor
function Job(inputFilePath, arg1, arg2) {
    var options = mergeOptions(arg1, arg2);    

    if (!inputFilePath) {
        throw new Error('Illegal Argument: An inputFilePath must be specified!');
    }    

    this.inputFilePath = inputFilePath || '';
    this.jobName = path.basename(this.inputFilePath, addExtension('', EXTENSIONS.TEX));

    setJob(this, options);
}

module.exports.PROGRAMS = PROGRAMS;
module.exports.newJob = function job (inputFilePath, arg1, arg2) {
    return new Job(inputFilePath, arg1, arg2);
};
