/*
 * Copyright (c) 2012-2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { inject, injectable } from "inversify";
import { QuickOpenService, QuickOpenModel, QuickOpenItem } from '@theia/core/lib/browser/quick-open/';
import { SshKeyServer } from "../common/ssh-protocol";
import { QuickOpenOptions, QuickOpenMode } from "@theia/core/lib/browser";

@injectable()
export class SshQuickOpenService {

    constructor(
        @inject(QuickOpenService) protected readonly quickOpenService: QuickOpenService,
        @inject(SshKeyServer) protected readonly sshKeyServer: SshKeyServer
    ) { }

    protected createAskNameItem(): AskNameItem {
        const execute = (item: AskNameItem) => this.sshKeyServer.generate(item.getLabel(), 'test');
        const item = new AskNameItem(execute);
        return item;
    }

    generateKeyPair(): void {
        const execute = (item: SshServiceQuickOpenItem) => {
            this.open(this.createAskNameItem(), `${item.getLabel()} key pair name`, (lookFor) => { console.log(lookFor) });
            // this.quickOpenService.open({
            //     onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
            //         acceptor([new AskNameItem((item: AskNameItem) => { })]);
            //     }
            // });
        };

        this.open(
            [
                new SshServiceQuickOpenItem('VCS', execute),
                new SshServiceQuickOpenItem('machine', execute)
            ], 'Pick a Che service to generate SSH keys for');
    }

    createKeyPair(): void {
        //this.open([new SshServiceQuickOpenItem('VCS', undefined), new SshServiceQuickOpenItem('machine', undefined)], 'Choose service to create SSH key pair');
    }

    copyPublicKey(): void {
    }

    async deleteKeyPair(): Promise<void> {
        const [vcsKeys, machineKeys] = await Promise.all([this.sshKeyServer.list('vcs', undefined), this.sshKeyServer.list('machine', undefined)]);

        const execute = (item: SshKeyPairQuickOpenItem) => this.sshKeyServer.delete(item.getDescription(), item.getLabel());

        const vcsKeyItems = vcsKeys.map(keyPair => new SshKeyPairQuickOpenItem(keyPair.name, keyPair.service, execute));
        const machineKeyItems = machineKeys.map(keyPair => new SshKeyPairQuickOpenItem(keyPair.name, keyPair.service, execute));

        this.open([...vcsKeyItems, ...machineKeyItems], 'Choose key pair to delete');
    }

    private open(items: QuickOpenItem | QuickOpenItem[], placeholder: string, lookForFunc?: (lookFor: string) => void): void {
        this.quickOpenService.open(this.getModel(Array.isArray(items) ? items : [items], lookForFunc), this.getOptions(placeholder));
    }

    private getModel(items: QuickOpenItem | QuickOpenItem[], lookForFunc?: (lookFor: string) => void): QuickOpenModel {
        return {
            onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
                if (lookForFunc) {
                    lookForFunc(lookFor);
                }
                acceptor(Array.isArray(items) ? items : [items]);
            }
        };
    }

    private getOptions(placeholder: string, fuzzyMatchLabel: boolean = true): QuickOpenOptions {
        return QuickOpenOptions.resolve({
            placeholder,
            fuzzyMatchLabel,
            fuzzySort: false
        });
    }
}

/**
 * Placeholder item for choosing a Che SSH service.
 */
export class SshServiceQuickOpenItem extends QuickOpenItem {
    constructor(
        protected readonly service: string,
        protected readonly execute: (item: SshServiceQuickOpenItem) => void
    ) {
        super();
    }

    getLabel(): string {
        return this.service;
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        this.execute(this);
        //return true;
        return false;
    }
}

/**
 * Placeholder item represents SSH key pair.
 */
export class SshKeyPairQuickOpenItem extends QuickOpenItem {

    constructor(
        protected readonly keyPairName: string,
        protected readonly service: string,
        protected readonly execute: (item: SshKeyPairQuickOpenItem) => void
    ) {
        super();
    }

    getLabel(): string {
        return this.keyPairName;
    }

    getDescription(): string {
        return this.service;
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        this.execute(this);
        return true;
    }
}

export class AskNameItem extends QuickOpenItem {
    constructor(
        protected readonly execute: (item: AskNameItem) => void
    ) {
        super();
    }

    getLabel(): string {
        return 'Please provide a key pair name';
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        this.execute(this);
        return true;
    }
}
