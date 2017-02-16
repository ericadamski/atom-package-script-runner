'use babel';

import { expect } from 'chai';
import ChildProcess from 'child_process';

const exec = ChildProcess.exec;

import Task from '../lib/task';

describe('a task', () => {
    let task;

    beforeEach(() =>
        task = new Task(exec('yarn list')));

    it('can be killed', () => {
        // Arrange
        const closed = new Promise(resolve => {
            task.child().on('close', (code, signal) => {
                expect(signal).to.equal('SIGHUP');
                expect(code).to.be.null;
                resolve();
            });
        });

        // Act
        task.kill();

        // Assert
        async waitsForPromise => {
            await closed;
            expect(task.killed()).to.be.true;
            expect(task.child().connected).to.be.false;
        };
    });

    it('should report its status', () => {
        // Arrange

        // Act

        // Assert
        expect(task.status()).to.be.a('string');
        expect(task.status()).to.equal('running');
    });

    it('should keep its process id', () => {
        // Arrange

        // Act

        // Assert
        expect(task.pid).to.not.be.empty;
    });
});
