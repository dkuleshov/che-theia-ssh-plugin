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

import { ContainerModule } from 'inversify';
import { WebSocketConnectionProvider, WidgetFactory, KeybindingContribution, OpenHandler } from '@theia/core/lib/browser';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { SshContribution } from './ssh-contribution';
import { SshWidget, SSH_KEYS_WIDGET_FACTORY_ID } from './ssh-widget';
import { SshPublicKeyWidgetFactory } from './ssh-public-key-widget-factory';
import { SshPublicKeyOpenHandler } from './ssh-public-key-open-handler';
import { SshKeyServer, sshKeyServicePath } from '../common/ssh-protocol';

import '../../src/browser/style/index.css';
import { SshQuickOpenService } from './ssh-quick-open-service';

export default new ContainerModule(bind => {
    bind(SshKeyServer).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<SshKeyServer>(sshKeyServicePath);
    }).inSingletonScope();

    bind(SshContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toDynamicValue(context => context.container.get(SshContribution));
    bind(KeybindingContribution).toDynamicValue(c => c.container.get(SshContribution));
    bind(MenuContribution).toDynamicValue(c => c.container.get(SshContribution));

    bind(SshWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: SSH_KEYS_WIDGET_FACTORY_ID,
        createWidget: () => context.container.get<SshWidget>(SshWidget)
    }));

    bind(SshPublicKeyWidgetFactory).toSelf().inSingletonScope();
    bind(WidgetFactory).toDynamicValue(ctx => ctx.container.get(SshPublicKeyWidgetFactory)).inSingletonScope();

    bind(SshPublicKeyOpenHandler).toSelf().inSingletonScope();
    bind(OpenHandler).toDynamicValue(ctx => ctx.container.get(SshPublicKeyOpenHandler)).inSingletonScope();

    bind(SshQuickOpenService).toSelf().inSingletonScope();
});
