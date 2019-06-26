// @flow
import urljoin from 'url-join'
import axios from 'axios'
import _ from 'lodash'

import { helpers } from 'inversify-vanillajs-helpers'

import { RawDataProvider, RawDataParser } from '../../interfaces'
import SERVICE_IDENTIFIER from '../../constants/identifiers'
import type { NetworkConfig } from '../../interfaces'


class CardanoBridgeApi implements RawDataProvider {
  #networkBaseUrl: string

  #parser: any

  constructor(
    networkConfig: NetworkConfig,
    parser: RawDataParser,
  ) {
    this.#networkBaseUrl = networkConfig.networkUrl()
    this.#parser = parser
  }

  async getJson(path: string) {
    const resp = await this.get(path, {
      responseType: 'json',
    })
    return resp
  }

  async get(path: string, options?: {}) {
    const opts = options || {}
    const endpointUrl = urljoin(this.#networkBaseUrl, path)
    const resp = await axios(endpointUrl,
      {
        responseType: 'arraybuffer',
        ...opts,
      })
    return resp
  }

  async post(path: String, payload) {
    const endpointUrl = urljoin(this.#networkBaseUrl, path)
    let resp
    try {
      resp = await axios.post(endpointUrl, payload)
    } catch (e) {
      resp = e.response
    }
    return resp
  }

  async getTip() {
    const resp = await this.get('/tip')
    return resp
  }

  async postSignedTx(payload) {
    const resp = await this.post('txs/signed', payload)
    return resp
  }

  async getEpoch(id: number) {
    const resp = await this.get(`/epoch/${id}`)
    return resp.data
  }

  async getBlock(id: string): Promise<string> {
    const resp = await this.get(`/block/${id}`)
    const { data } = resp
    return data
  }

  async getGenesis(hash: string): Promise<string> {
    const resp = await this.getJson(`/genesis/${hash}`)
    const { data } = resp
    return data
  }

  async getStatus(): Promise<any> {
    const resp = await this.getJson('/status')
    const { data } = resp
    return data
  }

  async getBlockByHeight(height: number) {
    const resp = await this.get(`/height/${height}`)
    const { data } = resp
    return this.#parser.parseBlock(data)
  }

  async getParsedEpochById(id: number, omitEbb: boolean = false) {
    const resp = await this.get(`/epoch/${id}`)
    const { data } = resp
    const blocks = this.#parser.parseEpoch(data)
    if (!_.isEmpty(blocks) && omitEbb) {
      return blocks[0].isEBB ? blocks.slice(1) : blocks
    }
    return blocks
  }
}

helpers.annotate(CardanoBridgeApi, [
  SERVICE_IDENTIFIER.NETWORK_CONFIG,
  SERVICE_IDENTIFIER.RAW_DATA_PARSER,
])

export default CardanoBridgeApi
