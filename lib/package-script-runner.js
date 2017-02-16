'use babel';

import PackageScriptRunnerView from './package-script-runner-view';
import { CompositeDisposable } from 'atom';
import TaskRunner from './task-runner';
import PackageReader from './package-reader';

export default {

  config: {
      manager: {
          type: 'string',
          default: 'yarn',
          title: 'Package Manager',
          description: 'The perfered JS package manager to run package.json scripts with.',
      },
  },

  packageScriptRunnerView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
      this.runner = TaskRunner();
      this.reader = new PackageReader();
    this.packageScriptRunnerView = new PackageScriptRunnerView(state.packageScriptRunnerViewState, this.reader, this.runner);
    this.modalPanel = atom.workspace.addBottomPanel({
      item: this.packageScriptRunnerView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'package-script-runner:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.packageScriptRunnerView.destroy();
    this.runner.killAll();
  },

  serialize() {
    return {
      scriptRunnerViewState: this.packageScriptRunnerView.serialize()
    };
  },

  toggle() {
    console.log('PackageScriptRunner was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
