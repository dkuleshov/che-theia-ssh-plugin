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
import { Command, CommandRegistry } from '@theia/core';
import { AbstractViewContribution } from '@theia/core/lib/browser';
import { SshQuickOpenService } from './ssh-quick-open-service';
import { SshWidget, SSH_KEYS_WIDGET_FACTORY_ID } from './ssh-widget';

export const quickFileOpen: Command = {
    id: 'file-search.openFile',
    label: 'Open File ...'
};

export namespace SshCommands {
    export const SSH_GENERATE: Command = {
        id: 'ssh:generate',
        label: 'SSH: generate key pair...'
    };
    export const SSH_CREATE: Command = {
        id: 'ssh:create',
        label: 'SSH: create key pair...'
    };
    export const SSH_DELETE: Command = {
        id: 'ssh:delete',
        label: 'SSH: delete key pair...'
    };
}

@injectable()
export class SshContribution extends AbstractViewContribution<SshWidget> {

    constructor(
        @inject(SshQuickOpenService) protected readonly sshQuickOpenService: SshQuickOpenService
    ) {
        super({
            widgetId: SSH_KEYS_WIDGET_FACTORY_ID,
            widgetName: 'SSH',
            defaultWidgetOptions: {
                area: 'left'
            },
            toggleCommandId: 'sshView:toggle',
            toggleKeybinding: 'ctrlcmd+shift+s'
        });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(SshCommands.SSH_GENERATE, {
            isEnabled: () => true,
            execute: () => this.sshQuickOpenService.generateKeyPair()
        });
        commands.registerCommand(SshCommands.SSH_CREATE, {
            isEnabled: () => true,
            execute: () => this.sshQuickOpenService.createKeyPair()
        });
        commands.registerCommand(SshCommands.SSH_DELETE, {
            isEnabled: () => true,
            execute: () => this.sshQuickOpenService.deleteKeyPair()
        });
    }
}
