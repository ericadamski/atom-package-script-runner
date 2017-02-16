'use babel';

import { Map } from 'immutable';
import { expect } from 'chai';
import path from 'path';

import PackageReader from '../lib/package-reader';

describe('package.json reader', () => {
    const rootPackage = path.join(__dirname, '..');
    let reader;

    beforeEach(() => reader = new PackageReader());

    it('reads the package.json file', () => {
        // Arrange

        // Act
        async waitsForPromise => {
            await reader.read(rootPackage);

            // Assert
            expect(reader.packageJSON).to.be.an('object');
            expect(reader.packageJSON).to.have.all.keys(['name', 'description', 'version']);
        };
    });

    it('keeps all the available scripts', () => {
        // Arrange
        const helpersPackage = path.join(__dirname, 'helpers');

        // Act
        async waitsForPromise => {
            await reader.read(helpersPackage);

            // Assert
            expect(reader.packageJSON).to.be.an('object');
            expect(reader.packageJSON).to.have.all.keys(['scripts']);
            expect(reader.scripts).to.be.instanceof(Map);
            expect(Object.keys(reader.scripts.toJS())).to.have.length.below(1);
        };
    });

    it('fails gracefully if no available scripts', async () => {
        // Arrange

        // Act
        async waitsForPromise => {
            await reader.read(rootPackage);

            // Assert
            expect(reader.packageJSON).to.be.an('object');
            expect(reader.packageJSON).to.not.have.all.keys(['scripts']);
            expect(reader.scripts).to.be.instanceof(Map);
            expect(Object.keys(reader.scripts.toJS())).to.have.length.below(1);
        };
    });
});
