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

import { injectable, inject } from "inversify";
import { WidgetFactory } from "@theia/core/lib/browser";
import { SshKeyPairUri } from "./ssh-key-pair-uri";
import { SshPublicKeyWidget } from "./ssh-public-key-widget";
import { SshKeyServer } from "../common/ssh-protocol";

export interface SshPublicKeyWidgetOptions {
    readonly service: string;
    readonly name: string;
}

@injectable()
export class SshPublicKeyWidgetFactory implements WidgetFactory {

    readonly id = SshKeyPairUri.scheme;

    constructor(
        @inject(SshKeyServer) protected readonly sshKeyServer: SshKeyServer
    ) { }

    async createWidget(options: SshPublicKeyWidgetOptions): Promise<SshPublicKeyWidget> {
        const sshKeyPair = await this.sshKeyServer.list(options.service, options.name);
        const widget = new SshPublicKeyWidget(sshKeyPair[0]);
        widget.id = `sshKeyPair:${options.service}-${options.name}`;
        widget.title.closable = true;
        widget.title.label = `${options.service}/${options.name}`;
        widget.title.iconClass = 'fa fa-key';
        return widget;
    }
}
