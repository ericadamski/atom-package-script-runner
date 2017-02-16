'use babel';

import EventEmitter from 'events';

const EVENTS = [
    'close', // stdio stream is closed
    /*'error', // cannont be spawned, couldn't be killed, sending a message failed*/
    'exit', // after the child ends
    /*'message', // child sent a message*/
];

const SIGTERM = 'SIGTERM';
const SIGINT = 'SIGINT';
const SIGKILL = 'SIGKILL';
const SIGHUP = 'SIGHUP';

function childFactory(child) {
    return () => child;
}

class Task extends EventEmitter {
    constructor(child) {
        super();
        this.child = childFactory(child);

        this.attachEvents();

        this.pid = child.pid;
    }

    kill() {
        try {
            process.kill(-this.pid);
        } catch (e) {
            if (e.message === 'kill ESRCH')
                this.child().kill(SIGHUP);

            console.log(e.message);
        }
    }

    killed() {
        return !!(this.isSignalKilled || this.isCodeKilled);
    }

    status() {
        return this.killed() ? 'stopped' : 'running';
    }

    close(code, signal) {
        if (signal) this.isSignalKilled = true;
        if (code) this.isCodeKilled = true;
        this.emit('close');
    }

    exit(code, signal) {
        if (signal) this.isSignalKilled = true;
        if (code) this.isCodeKilled = true;
        this.emit('exit');
    }

    attachEvents() {
        const handle = {
            close: (code, signal) => this.close(code, signal),
            exit: (code, signal) => this.exit(code, signal),
        };

        const child = this.child();

        EVENTS.forEach(event =>
            child.on(event, handle[event]));
    }
}

export default Task;
