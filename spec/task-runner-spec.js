'use babel';
import { Map } from 'immutable';
import { expect } from 'chai';

import TaskRunner from '../lib/task-runner';

describe('task runner', () => {
    let runner;

    beforeEach(() => runner = TaskRunner());

    it('can execute a task', () => {
        // Arrange
        const task = {
            cmd: 'list',
            cwd: atom.project.getPaths()[0],
        };

        async waitsForPromise => {
            // Act
            await runner.run(task);

            // Assert
            expect(runner.taskCount()).to.equal(1);
        };
    });

    it('can execute more than one task', () => {
        // Arrange
        const tasks = [
            {
                cmd: 'list',
                cwd: atom.project.getPaths()[0],
            },
            {
                cmd: 'install',
                cwd: atom.project.getPaths()[0],
            },
        ];

        async waitsForPromise => {
            // Act
            await runner.run(...tasks);

            // Assert
            expect(runner.taskCount).to.equal(2);
        };
    });

    it('can give the status of a task', () => {
        // Arrange
        const task = {
            cmd: 'install',
            cwd: atom.project.getPaths()[0],
        };

        async waitsForPromise => {
            // Act
            const pid = await runner.run(task);

            // Assert
            expect(runner.status(pid)).to.be.a('string');
        };
    });

    it('can keeps a list of tasks', () => {
        // Arrange
        const tasks = [
            {
                cmd: 'list',
                cwd: atom.project.getPaths()[0],
            },
            {
                cmd: 'install',
                cwd: atom.project.getPaths()[0],
            },
        ];

        async waitsForPromise => {
            // Act
            await runner.run(...tasks);

            // Assert
            const runningTasks = runner.getTasks();
            expect(runningTasks).to.be.instanceof(Map);
            expect(runningTasks.size).to.be.above(0);
        };
    });
});
