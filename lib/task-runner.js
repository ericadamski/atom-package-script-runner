'use babel';

import ChildProcess from 'child_process'; 
import { Map } from 'immutable';

import Task from './task';

const spawn = ChildProcess.spawn;
const exec2 = ChildProcess.exec;

function exec(task) {

    return new Promise((resolve, reject) => {
        const thread = exec2(
            (atom.config.get('package-script-runner.manager') || 'yarn')+
            ' run '+
              task.cmd,
            {
                cwd: task.cwd,
                shell: false//,
                //detached: true,
            }
        );

        thread.stdout.on('data', data => {
            task.stdout.textContent += data.toString('utf8');
            task.stdout.scrollTop = 10000000000;
        });

        thread.stderr.on('data', data => {
            console.log(data.toString('utf8'));
        });

        resolve(new Task(thread));
    });
}

function counterFactory() {
    let _maps = new Map();
    return map => {
        let list;
        if ((list = _maps.get(map.hashCode()))) return list.size;
        _maps = _maps.set(map.hashCode(), (list = map.toList()));
        return list.size;
    }
}

class TaskRunner {
    constructor() {
        this.tasks = new Map();
        this.count = counterFactory();
        this.runningCount = 0;
    }

    run(...tasks) {
        return new Promise(resolve =>
            tasks.map(exec)
                .forEach(async task => {
                    const t = await task;
                    t.emit('running');
                    this.tasks = this.tasks.set(t.pid, t);
                    this.runningCount++;

                    setTimeout(() => {
                        t.once('close', () => this.kill(t.pid));
                        t.once('exit', () => this.kill(t.pid));
                    }, 1000);

                    resolve(t);
                }));
    }

    status(pid) {
        return this.tasks.get(pid).status();
    }

    taskCount() {
        return this.count(this.tasks);
    }

    kill(pid) {
        const task = this.tasks.get(pid);
        if (task) {
            task.kill();
            this.runningCount--;
            this.tasks = this.tasks.delete(pid);
        }
    }

    killAll() {
        this.tasks.map(task => {
            task.kill();
            this.runningCount--;
        });

        this.tasks = this.tasks.clear();
    }

    getTasks() {
        return this.tasks;
    }
}

// Create Singleton
let _instance;

export default function() {
    if (!_instance) _instance = new TaskRunner();
    return _instance;
};
