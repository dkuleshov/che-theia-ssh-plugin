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

import URI from "@theia/core/lib/common/uri";

export namespace SshKeyPairUri {
    export const scheme = 'sshpublickey';

    export function toUri(sshKeyPairService: string, sshKeyPairName: string): URI {
        return new URI('').withScheme(scheme).withPath(sshKeyPairService).withFragment(sshKeyPairName);
    }
    export function toKeyPairService(uri: URI): string {
        if (uri.scheme === scheme) {
            return uri.path.name;
        }
        throw new Error('The given uri is not a SSH key pair URI, uri: ' + uri);
    }
    export function toKeyPairName(uri: URI): string {
        if (uri.scheme === scheme) {
            return uri.fragment;
        }
        throw new Error('The given uri is not a SSH key pair URI, uri: ' + uri);
    }
}
