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
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { CommandContribution } from '@theia/core/lib/common';
import { SshFrontendContribution } from './ssh-frontend-contribution';
import { SshKeyServer, sshKeyServicePath } from '../common/ssh-protocol';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bind(CommandContribution).to(SshFrontendContribution).inSingletonScope();
    bind(SshKeyServer).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<SshKeyServer>(sshKeyServicePath);
    }).inSingletonScope();
});
