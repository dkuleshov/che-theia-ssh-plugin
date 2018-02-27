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

import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser';
import { SshWidget, SSH_KEYS_WIDGET_FACTORY_ID } from './ssh-widget';

@injectable()
export class SshContribution extends AbstractViewContribution<SshWidget> {

    constructor() {
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
}
