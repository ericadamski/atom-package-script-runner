'use babel';

import { CompositeDisposable } from 'atom';

export default class PackageScriptRunnerView {

  constructor(serializedState, reader, runner) {
    this.subscriptions = new CompositeDisposable();
    this.runner = runner;

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('package-script-runner');

    // Create Terminal Output element
    this.output = document.createElement('div');
    this.output.classList.add('terminal');

    const group = document.createElement('div');
    group.classList.add('button-group');

    const toggle = document.createElement('button');
    toggle.classList.add('btn');
    toggle.classList.add('terminal-output-toggle');
    toggle.classList.add('icon');
    toggle.classList.add('icon-terminal');

    const bottom = document.createElement('button');
    bottom.classList.add('btn');
    bottom.classList.add('terminal-output-bottom');
    bottom.classList.add('icon');
    bottom.classList.add('icon-arrow-down');

    const terminal = document.createElement('div');
    terminal.classList.add('hidden');
    terminal.classList.add('terminal-output');

    toggle.onclick = () => {
        terminal.classList.contains('hidden') ?
        terminal.classList.remove('hidden') :
        terminal.classList.add('hidden');
    };

    bottom.onclick = () => {
        terminal.scrollTop = 1000000000000000;
    };

    group.appendChild(toggle);
    group.appendChild(bottom);
    this.output.appendChild(terminal);

    this.taskContainer = document.createElement('div');
    this.taskContainer.classList.add('task-list');
    this.taskContainer.appendChild(group);
    Promise.all(atom.project
        .getPaths()
        .map(async path => await reader.read(path)))
        .then(() => {
            reader.scripts.map((command, name) => {
                const callback = async () => {
                    const task = await runner.run({
                        cmd: name,
                        cwd: reader.cwd,
                        stdout: terminal,
                    });

                    return task;
                };
                this.taskContainer.appendChild(this.createButton(command, name, callback));
            });
            this.element.appendChild(this.taskContainer);
            this.element.appendChild(this.output);
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

      this.subscriptions.add(atom.tooltips.add(buttonContainer, { title: command }));

      return buttonContainer;
  }
}
