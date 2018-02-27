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

import { injectable } from "inversify";
import URI from "@theia/core/lib/common/uri";
import { WidgetOpenHandler } from "@theia/core/lib/browser";
import { SshKeyPairUri } from "./ssh-key-pair-uri";
import { SshPublicKeyWidgetOptions } from "./ssh-public-key-widget-factory";
import { SshPublicKeyWidget } from "./ssh-public-key-widget";

@injectable()
export class SshPublicKeyOpenHandler extends WidgetOpenHandler<SshPublicKeyWidget> {

    readonly id = SshKeyPairUri.scheme;

    canHandle(uri: URI): number {
        if (uri.scheme === SshKeyPairUri.scheme) {
            return 500;
        } else {
            return 0;
        }
    }

    protected createWidgetOptions(uri: URI): SshPublicKeyWidgetOptions {
        return {
            service: SshKeyPairUri.toKeyPairService(uri),
            name: SshKeyPairUri.toKeyPairName(uri)
        };
    }
}
