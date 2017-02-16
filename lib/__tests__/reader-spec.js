import { Map } from 'immutable';
import { expect } from 'chai';
import path from 'path';

import PackageReader from '../package-reader';

describe('package.json reader', () => {
    const rootPackage = path.join(__dirname, '..', '..');
    let reader;

    beforeEach(() => reader = new PackageReader());

    it('reads the package.json file', () => {
        // Arrange

        // Act
        return reader.read(rootPackage)
            .then(() => {
                // Assert
                expect(reader.packageJSON).to.be.an('object');
            });
    });

    it('keeps all the available scripts', () => {
        // Arrange

        // Act
        return reader.read(rootPackage)
            .then(() => {
                // Assert
                expect(reader.packageJSON).to.be.an('object');
                expect(Object.keys(reader.packageJSON).includes('scripts')).to.be.true;
                expect(reader.scripts).to.be.instanceof(Map);
                expect(Object.keys(reader.scripts.toJS())).to.have.length.above(0);
            });
    });

    it('fails gracefully if no available scripts', () => {
        // Arrange
        const helpersPackage = path.join(__dirname, 'helpers-no-scripts');

        // Act
        return reader.read(helpersPackage)
            .then(() => {
                // Assert
                expect(reader.packageJSON).to.be.an('object');
                expect(reader.packageJSON).to.not.have.all.keys(['scripts']);
                expect(reader.scripts).to.be.instanceof(Map);
                expect(Object.keys(reader.scripts.toJS())).to.have.length.below(1);
            });
    });
});
