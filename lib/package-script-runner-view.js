'use babel';

import { CompositeDisposable } from 'atom';

export default class PackageScriptRunnerView {

  constructor(serializedState, reader, runner) {
    this.subscriptions = new CompositeDisposable();
    this.runner = runner;

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('package-script-runner');

    // Create message element
    // const message = document.createElement('div');
    // message.textContent = 'The ScriptRunner package is Alive! It\'s ALIVE!';
    // message.classList.add('message');
    // this.element.appendChild(message);

    this.taskContainer = document.createElement('div');
    this.taskContainer.classList.add('task-list');
    Promise.all(atom.project
        .getPaths()
        .map(async path => await reader.read(path)))
        .then(() => {
            console.log(reader);
            reader.scripts.map((command, name) => {
                const callback = async () => {
                    const task = await runner.run({
                        cmd: name,
                        cwd: reader.cwd,
                    });

                    return task;
                };
                this.taskContainer.appendChild(this.createButton(command, name, callback));
            });
            this.element.appendChild(this.taskContainer);
        })
        .catch(e => atom.notifications.addError(e.message));
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.subscriptions.dispose();
    this.element.remove();
  }

  update(button, status) {
      console.log(button, status);
      if (status !== 'running')
        button.classList.remove('running');
      else
        button.classList.add(status);
  }

  getElement() {
    return this.element;
  }

  createButton(command, name, callback) {
      let _task;

      const setTask = t => _task = t;

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('task-button-container');

      const buttonStatus = document.createElement('div');
      buttonStatus.classList.add('task-status');

      const button = document.createElement('button');
      button.textContent = name;
      button.classList.add('task-button');
      button.classList.add('btn');

      button.onclick = async () => {
          if (button.classList.contains('running')) {
              console.log(`should kill ${_task.pid}`);
            return _task.kill();
          }

          const task = await callback();

          setTask(task);

          this.update(button, 'running');

          task.once('close', () => this.update(button, 'closed'));
          task.once('exit', () => this.update(button, 'exited'));
      };

      buttonContainer.appendChild(button);
      buttonContainer.appendChild(buttonStatus);

      this.subscriptions.add(atom.tooltips.add(buttonContainer, { title: command }));

      return buttonContainer;
  }
}
