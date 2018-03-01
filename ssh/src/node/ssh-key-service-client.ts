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

import { AxiosInstance, default as axios } from 'axios';
import { injectable } from 'inversify';
import { SshKeyPair } from '../common/ssh-protocol';

export const SshKeyServiceClient = Symbol("SshKeyServiceClient");

/**
 * SSH key service client API definition. SSH key service is currently located
 * on Che workspace master instance and available for REST requests. The one
 * actual implementation of this interface uses HTTP protocol to reach out the
 * service and perform SSH key API manipulations, however it is quite possible
 * that in future there will be a necessity in another kind of client (e.g.
 * JSON-RPC based).
 *
 * @see <a href=https://github.com/eclipse/che/blob/6.1.1/wsmaster/che-core-api-ssh/src/main/java/org/eclipse/che/api/ssh/server/SshService.java>SshService</a>
 *
 */
export interface SshKeyServiceClient {

    /**
     * Generate an SSH key pair for specified service and name
     *
     * @param {string} service the name of the service that is associated with
     * the SSH key pair
     * @param {string} name the identifier of the key pair
     *
     * @returns {Promise<Failure | Success<SshKeyPair>>}
     */
    generate(service: string, name: string): Promise<Failure | Success<SshKeyPair>>;

    /**
     * Create a specified SSH key pair
     *
     * @param {SshKeyPair} sshKeyPair the SSH key pair that is to be created
     *
     * @returns {Promise<Failure | Success<void>>}
     */
    create(sshKeyPair: SshKeyPair): Promise<Failure | Success<void>>

    /**
     * Get all SSH key pairs associated with specified service
     *
     * @param {string} service the name of the service that is associated with
     * the SSH key pair
     *
     * @returns {Promise<Failure | Success<SshKeyPair[]>>}
     */
    getAll(service: string): Promise<Failure | Success<SshKeyPair[]>>;

    /**
     * Get an SSH key pair associated with specified service and name
     *
     * @param {string} service the name of the service that is associated with
     * the SSH key pair
     * @param {string} name the identifier of the key pair
     *
     * @returns {Promise<Failure | Success<SshKeyPair>>}
     */
    get(service: string, name: string): Promise<Failure | Success<SshKeyPair>>;

    /**
     * Delete an SSH key pair with a specified service and name
     *
     * @param {string} service the name of the service that is associated with
     * the SSH key pair
     * @param {string} name the identifier of the key pair
     *
     * @returns {Promise<Failure | Success<void>>}
     */
    delete(service: string, name: string): Promise<Failure | Success<void>>;
}

/**
 * Data class for storing result of successful {@link SshKeyServiceClient}'s
 * response data.
 */
export class Success<T extends SshKeyPair | SshKeyPair[] | void> {
    constructor(private readonly _data?: T) {
    }

    get data() {
        return this._data;
    }
}

/**
 * Data class for storing result of unsuccessful {@link SshKeyServiceClient}'s
 * response message.
 */
export class Failure {
    constructor(private readonly _message?: string) {
    }

    get message() {
        return this._message;
    }
}

/**
 * HTTP based implementation of {@link SshKeyServiceClient}. In fact it is a
 * plain wrapper around {@link AxiosInstance} library that does SSH service
 * specific REST calls and process responses correspondingly (in accordance
 * to their HTTP statuses).
 *
 * @see <a href=https://github.com/axios/axios>axios</a>
 */
@injectable()
export class SshKeyServiceHttpClient implements SshKeyServiceClient {
    readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = axios.create({
            baseURL: 'http://localhost:8080/api'
        });
    }

    /**
     * @inheritDoc
     */
    generate(service: string, name: string): Promise<Failure | Success<SshKeyPair>> {
        return new Promise<Failure | Success<SshKeyPair>>((resolve, reject) => {
            this.httpClient
                .post("/ssh/generate", { service, name })
                .then(response => {
                    switch (response.status) {
                        case 201: {
                            resolve(new Success(response.data));
                            break;
                        }
                        case 400: {
                            resolve(new Failure('Missed required parameters, parameters are not valid'));
                            break
                        }
                        case 409: {
                            resolve(new Failure('Conflict error occurred during the ssh pair generation'));
                            break
                        }
                        case 500: {
                            resolve(new Failure('Internal server error occurred'));
                            break
                        }
                        default: {
                            resolve(new Failure('Some unexpected error occurred'));
                            break
                        }
                    }
                })
                .catch(reason => reject(reason));
        });
    }

    /**
     * @inheritDoc
     */
    create(sshKeyPair: SshKeyPair): Promise<Failure | Success<void>> {
        return new Promise<Failure | Success<void>>((resolve, reject) => {
            this.httpClient
                .post("/ssh", { sshKeyPair })
                .then(response => {
                    switch (response.status) {
                        case 204: {
                            resolve(new Success());
                            break;
                        }
                        case 400: {
                            resolve(new Failure('Missed required parameters, parameters are not valid'));
                            break
                        }
                        case 409: {
                            resolve(new Failure('Conflict error occurred during the ssh pair generation'));
                            break
                        }
                        case 500: {
                            resolve(new Failure('Internal server error occurred'));
                            break
                        }
                        default: {
                            resolve(new Failure('Some unexpected error occurred'));
                            break
                        }
                    }
                })
                .catch(reason => reject(reason));
        });
    }

    /**
     * @inheritDoc
     */
    getAll(service: string): Promise<Failure | Success<SshKeyPair[]>> {
        return new Promise<Failure | Success<SshKeyPair[]>>((resolve, reject) => {
            this.httpClient
                .get(`/ssh/${service}`)
                .then(response => {
                    switch (response.status) {
                        case 200: {
                            resolve(new Success(response.data));
                            break;
                        }
                        case 500: {
                            resolve(new Failure('Internal server error occurred'));
                            break
                        }
                        default: {
                            resolve(new Failure('Some unexpected error occurred'));
                            break
                        }
                    }
                })
                .catch(reason => reject(reason));
        });
    }

    /**
     * @inheritDoc
     */
    get(service: string, name: string): Promise<Failure | Success<SshKeyPair>> {
        return new Promise<Failure | Success<SshKeyPair>>((resolve, reject) => {
            this.httpClient
                .get(`/ssh/${service}/find?name=${name}`)
                .then(response => {
                    switch (response.status) {
                        case 200: {
                            resolve(new Success(response.data));
                            break;
                        }
                        case 400: {
                            resolve(new Failure('Missed required parameters, parameters are not valid'));
                            break;
                        }
                        case 500: {
                            resolve(new Failure('Internal server error occurred'));
                            break
                        }
                        default: {
                            resolve(new Failure('Some unexpected error occurred'));
                            break
                        }
                    }
                })
                .catch(reason => reject(reason));
        });
    }

    /**
     * @inheritDoc
     */
    delete(service: string, name: string): Promise<Failure | Success<void>> {
        return new Promise<Failure | Success<void>>((resolve, reject) => {
            this.httpClient.delete(`/ssh/${service}?name=${name}`)
                .then(response => {
                    switch (response.status) {
                        case 204: {
                            resolve(new Success());
                            break;
                        }
                        case 400: {
                            resolve(new Failure('Missed required parameters, parameters are not valid'));
                            break;
                        }
                        case 404: {
                            resolve(new Failure('The ssh pair doesn\'t exist'));
                            break;
                        }
                        case 500: {
                            resolve(new Failure('Internal server error occurred'));
                            break;
                        }
                        default: {
                            resolve(new Failure('Some unexpected error occurred'));
                            break
                        }
                    }
                }).catch(reason => {
                    reject(reason);
                });
        });
    }
}
