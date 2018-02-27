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

import { injectable, inject } from 'inversify';
import { h, VirtualNode } from '@phosphor/virtualdom';
import { VirtualWidget, VirtualRenderer, OpenerService, open } from '@theia/core/lib/browser';
import { SshKeyServer, SshKeyPair } from '../common/ssh-protocol';
import { Message } from '@phosphor/messaging';
import { SshKeyPairUri } from './ssh-key-pair-uri';

export const SSH_KEYS_WIDGET_FACTORY_ID = 'ssh-key-pairs';

@injectable()
export class SshWidget extends VirtualWidget {

    protected vcsKeyPairs: SshKeyPair[] = [];
    protected machineKeyPairs: SshKeyPair[] = [];

    constructor(
        @inject(SshKeyServer) protected readonly sshKeyServer: SshKeyServer,
        @inject(OpenerService) protected readonly openerService: OpenerService
    ) {
        super();
        this.id = 'theia-sshContainer';
        this.title.label = 'SSH';
        this.addClass('theia-ssh');
        this.update();
    }

    protected onActivateRequest(msg: Message) {
        super.onActivateRequest(msg);
        this.fetchKeys();
    }

    protected async fetchKeys() {
        const vcsKeyPairs = await this.sshKeyServer.list('vcs', undefined);
        this.vcsKeyPairs = [...vcsKeyPairs];

        const machineKeyPairs = await this.sshKeyServer.list('machine', undefined);
        this.machineKeyPairs = [...machineKeyPairs];

        this.update();
    }

    protected render(): h.Child {
        const vcsKeys = this.renderVcsKeys();
        const machineKeys = this.renderMachineKeys();
        return h.div({ className: "keyPairsOuterContainer" }, vcsKeys, machineKeys);
    }

    protected renderVcsKeys(): VirtualNode {
        const keyPairDivs: h.Child[] = [];
        this.vcsKeyPairs.forEach(keyPair => {
            keyPairDivs.push(this.renderKeyPairItem(keyPair));
        });
        const headerDiv = this.renderHeader('vcs');
        return h.div({
            className: 'keyPairsContainer'
        }, headerDiv, VirtualRenderer.flatten(keyPairDivs));
    }

    protected renderMachineKeys(): VirtualNode {
        const keyPairDivs: h.Child[] = [];
        this.machineKeyPairs.forEach(keyPair => {
            keyPairDivs.push(this.renderKeyPairItem(keyPair));
        });
        const headerDiv = this.renderHeader('machine');
        return h.div({
            className: 'keyPairsContainer'
        }, headerDiv, VirtualRenderer.flatten(keyPairDivs));
    }

    protected renderHeader(service: string): h.Child {
        const buttonsDiv = this.renderHeaderItemButtons(service);
        const itemButtonsAndStatusDiv = h.div({ className: 'itemButtonsContainer' }, buttonsDiv);
        return h.div({ className: 'theia-header' }, `${service} keys`, itemButtonsAndStatusDiv);
    }

    protected renderHeaderItemButtons(service: string): h.Child {
        const buttons: h.Child[] = [];
        buttons.push(h.a({
            className: 'toolbar-button',
            title: 'Generate key pair',
            onclick: event => { }
        }, h.i({ className: 'fa fa-plus' })));
        return h.div({ className: 'buttons' }, VirtualRenderer.flatten(buttons));
    }

    protected renderKeyPairItem(keyPair: SshKeyPair): h.Child {
        const iconSpan = h.i({ className: 'fa fa-key' });
        const nameSpan = h.span({ className: 'name' }, keyPair.name + ' ');
        const iconAndNameDiv = h.div({
            className: 'noWrapInfo',
            onclick: () => {
                const uri = SshKeyPairUri.toUri(keyPair.service, keyPair.name);
                open(this.openerService, uri);
            }
        }, iconSpan, nameSpan);
        const buttonsDiv = this.renderKeyPairItemButtons(keyPair);
        const itemButtonsDiv = h.div({ className: 'itemButtonsContainer' }, buttonsDiv);
        return h.div({ className: 'keyPairItem noselect' }, iconAndNameDiv, itemButtonsDiv);
    }

    protected renderKeyPairItemButtons(keyPair: SshKeyPair): h.Child {
        const buttons: h.Child[] = [];
        buttons.push(h.a({
            className: 'toolbar-button',
            title: 'Delete key pair',
            onclick: event => { }
        }, h.i({ className: 'fa fa-trash', style: { color: 'red' } })));
        return h.div({ className: 'buttons' }, VirtualRenderer.flatten(buttons));
    }
}
